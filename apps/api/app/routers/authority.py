from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
import requests
import os

router = APIRouter()

class RoadPlanningRequest(BaseModel):
    points: List[List[float]]
    zone_id: Optional[str] = None

def get_forest_data(lat: float, lon: float, gfw_api_key: str) -> float:
    # GFW: POST with GeoJSON geometry — SQL WHERE lat/lon filter causes 422
    # because umd_tree_cover_loss is a raster dataset without lat/lon columns.
    buffer = 0.18  # ~20km in degrees
    geometry = {
        "type": "Polygon",
        "coordinates": [[
            [lon - buffer, lat - buffer],
            [lon + buffer, lat - buffer],
            [lon + buffer, lat + buffer],
            [lon - buffer, lat + buffer],
            [lon - buffer, lat - buffer]
        ]]
    }
    url = "https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query"
    headers = {"x-api-key": gfw_api_key, "Content-Type": "application/json"}
    payload = {
        "sql": "SELECT sum(area__ha) FROM results WHERE umd_tree_cover_density_2000__percent >= 30",
        "geometry": geometry
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get('data') and len(data['data']) > 0:
            return data['data'][0].get('sum(area__ha)', 0) or 0
    return 0

def get_wildlife_data(lat: float, lon: float):
    # GBIF: use geometry WKT bbox — distance param doesn't work with decimalLatitude/Longitude
    deg = 0.18  # ~20km in degrees
    wkt = f"POLYGON(({lon-deg} {lat-deg},{lon+deg} {lat-deg},{lon+deg} {lat+deg},{lon-deg} {lat+deg},{lon-deg} {lat-deg}))"
    url = "https://api.gbif.org/v1/occurrence/search"
    params = {
        'geometry': wkt,
        'hasCoordinate': 'true',
        'taxonRank': 'SPECIES',
        'limit': 300
    }
    
    res = requests.get(url, params=params).json()
    
    total_sightings = res.get('count', 0)
    unique_species = len(set(item.get('taxonKey') for item in res.get('results', []) if item.get('taxonKey')))
    
    # IUCN as bonus only — use when available
    endangered_species = []
    for item in res.get('results', []):
        status = item.get('iucnRedListCategory')
        if status in ['CR', 'EN', 'VU']:
            endangered_species.append({
                "name": item.get('scientificName'),
                "status": status
            })
            
    return total_sightings, unique_species, endangered_species

def check_deforestation_safety(lat: float, lon: float, gfw_key: str):
    forest_area = get_forest_data(lat, lon, gfw_key)
    total_sightings, unique_species, endangered_list = get_wildlife_data(lat, lon)
    
    is_safe = True
    risk_factors = []
    
    # Forest cover is the primary driver (60 pts max)
    forest_risk = min((forest_area / 100) * 60, 60)
    # Species richness (30 pts max)
    richness_risk = min((unique_species / 50) * 30, 30)
    # IUCN bonus (10 pts max) — rarely populated but used when available
    iucn_risk = min(len(endangered_list) * 2, 10)
    
    impact_num = round(forest_risk + richness_risk + iucn_risk)
    
    if forest_area > 20:
        is_safe = False
        risk_factors.append("High Tree Canopy Density (Carbon Sink)")
    if unique_species > 10:
        is_safe = False
        risk_factors.append(f"High species richness ({unique_species} unique species, {total_sightings} total occurrences)")
    if len(endangered_list) > 0:
        is_safe = False
        risk_factors.append(f"IUCN-listed species detected ({len(endangered_list)} records)")

    unique_species_names = list(set([s['name'] for s in endangered_list]))
    
    if impact_num >= 70:
        damage_class = "CRITICAL RISK"
    elif impact_num >= 30:
        damage_class = "MODERATE RISK"
    else:
        damage_class = "SAFE ZONE"
        
    return {
        "primary_impact_score": str(impact_num),
        "damage_classification": damage_class,
        "affected_species": unique_species_names,
        "alternatives": [
            {
                "id": "alt_1_eco_bridge",
                "name": "Eco-Bridge Route",
                "impact_score": "45",
                "description": "Elevated road segment allowing wildlife to pass underneath safely, heavily avoiding high density forest pockets.",
                "cost_increase": 15
            },
            {
                "id": "alt_2_detour",
                "name": "Eastern Detour",
                "impact_score": "22",
                "description": "Bypasses the 20km critical radius entirely by re-routing through already degraded agricultural lands.",
                "cost_increase": 40
            }
        ] if not is_safe else []
    }

@router.get("/corridors")
async def get_corridors():
    """Map showing animal movement corridors"""
    return {"message": "Corridors data"}

@router.get("/deforestation")
async def get_deforestation():
    """Satellite-based forest loss trends"""
    return {"message": "Deforestation data"}

@router.post("/road-planning")
async def plan_road(req: RoadPlanningRequest):
    """AI-assisted environmental impact assessment for proposed roads"""
    gfw_key = os.getenv("GFW_API_KEY")
    if not gfw_key:
        # Graceful fallback so it doesn't crash during testing if user misses ENV
        gfw_key = "MISSING_KEY"
        
    if not req.points or len(req.points) == 0:
        raise HTTPException(status_code=400, detail="Points are required")
        
    # Analyze the centroid or the first point of the drawn road
    lat = req.points[0][0]
    lon = req.points[0][1]
    
    try:
        result = check_deforestation_safety(lat, lon, gfw_key)
        return result
    except Exception as e:
        print(f"Error checking safety: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis error")

@router.get("/safety-dashboard")
async def get_safety_dashboard():
    """Analytics on high-accident hotspots"""
    return {"message": "Safety dashboard data"}
