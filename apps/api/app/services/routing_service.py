import osmnx as ox
import networkx as nx
from typing import List, Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Singleton or cached graph to avoid downloading OSM data per request
_GRAPH_CACHE = {}

def get_road_graph(lat: float, lon: float, radius: int = 5000):
    """
    Downloads and caches the OSM road network for the given center and radius.
    Using a simplified string key for demo caching purposes.
    """
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}_{radius}"
    if cache_key not in _GRAPH_CACHE:
        logger.info(f"Downloading road network graph for {lat}, {lon} with radius {radius}...")
        try:
            # Download drive network
            G = ox.graph_from_point((lat, lon), dist=radius, network_type='drive')
            # Add edge travel times and speeds
            G = ox.add_edge_speeds(G)
            G = ox.add_edge_travel_times(G)
            _GRAPH_CACHE[cache_key] = G
        except Exception as e:
            logger.error(f"Failed to download graph: {e}")
            raise e
    return _GRAPH_CACHE[cache_key]

def calculate_edge_risk(u: int, v: int, data: dict, vehicle_type: str = "car") -> float:
    """
    Calculates the edge weight based on distance + (risk * vehicle_multiplier).
    """
    distance = data.get('length', 1.0)
    speed = data.get('speed_kph', 50)
    
    # Base risk score based on speed and typical wildlife corridors
    base_risk = 5.0 if speed > 60 else 1.0
    
    # Vehicle Multiplier
    # Trucks are louder and more dangerous; Bikes are quieter but more vulnerable
    vehicle_multiplier = 1.0
    if vehicle_type == "truck":
        vehicle_multiplier = 3.0
    elif vehicle_type == "bike":
        vehicle_multiplier = 0.8
    
    # Total Penalty
    penalty = base_risk * 200.0 * vehicle_multiplier
    
    return distance + penalty

def augment_graph_with_eco_costs(G: nx.MultiDiGraph, vehicle_type: str = "car"):
    """
    Assigns the `eco_cost` attribute based on vehicle type.
    """
    for u, v, key, data in G.edges(keys=True, data=True):
        data['eco_cost'] = calculate_edge_risk(u, v, data, vehicle_type)
    return G

import math

ox.settings.use_cache = True
ox.settings.log_console = False

from app.services.ml_routing_connector import call_ml_routing_model

async def get_eco_safe_route(source_lat: float, source_lng: float, target_lat: float, target_lng: float, vehicle_type: str = "car") -> Dict[str, Any]:
    """
    Finds the shortest path, preferring your friend's AI model results.
    """
    print(f"API Debug: AI Model Handover for ({source_lat}, {source_lng})")
    
    # 1. ATTEMPT CUSTOM AI MODEL CALL (Friend's Model)
    ai_route = await call_ml_routing_model(source_lat, source_lng, target_lat, target_lng)
    
    if ai_route.get("status") == "success" and "geojson" in ai_route:
        logger.info("Using Friend's Custom AI Model for Routing")
        return ai_route
        
    # 2. FALLBACK TO NATIVE ECO-SAFE LOGIC (NetworkX + OSMnx)
    logger.info("AI Model Offline or No GeoJSON: Falling back to OSMnx graph engine")
    
    d_lat = abs(target_lat - source_lat)
    d_lng = abs(target_lng - source_lng)
    distance_deg = math.sqrt(d_lat**2 + d_lng**2)
    
    # Minimum 10km radius for all trips to ensure the graph is fully connected
    radius = max(min(int(distance_deg * 111000 * 1.5) + 5000, 50000), 10000)
    
    mid_lat = (source_lat + target_lat) / 2
    mid_lng = (source_lng + target_lng) / 2
    
    try:
        # High-precision search Buffer
        cache_key = f"{round(mid_lat, 2)}_{round(mid_lng, 2)}_{radius}"
        if cache_key not in _GRAPH_CACHE:
             _GRAPH_CACHE[cache_key] = ox.graph_from_point((mid_lat, mid_lng), dist=radius, network_type='all')
        
        G = _GRAPH_CACHE[cache_key]
        G = augment_graph_with_eco_costs(G, vehicle_type)
        
        source_node = ox.distance.nearest_nodes(G, X=source_lng, Y=source_lat)
        target_node = ox.distance.nearest_nodes(G, X=target_lng, Y=target_lat)
        
        route = nx.shortest_path(G, source=source_node, target=target_node, weight='eco_cost')
        route_coords = [[G.nodes[n]['x'], G.nodes[n]['y']] for n in route]
        
        return {
            "status": "success",
            "geojson": {
                "type": "Feature",
                "geometry": { "type": "LineString", "coordinates": route_coords },
                "properties": { "description": "Eco-Safe Optimized Route" }
            }
        }
    except Exception as e:
        logger.error(f"Routing logic fail: {e}")
        return {"status": "error", "message": f"Mapping error: {str(e)}"}
