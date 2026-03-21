// Initialize Map focused on India
const indiaBounds = [
    [6.74, 68.16], // South-West
    [35.67, 97.40] // North-East
];

const map = L.map('map', {
    maxBounds: indiaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 4
}).setView([20.5937, 78.9629], 5);

// Add OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Add Leaflet Draw
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    draw: {
        polyline: false,
        polygon: false, // simpler to just use rectangle for bounding box
        circle: false,
        marker: false,
        circlemarker: false,
        rectangle: {
            shapeOptions: {
                color: '#3b82f6',
                weight: 2
            }
        }
    },
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

// UI Elements
const uiOverlay = document.getElementById('ui-overlay');
const gfwKeyInput = document.getElementById('gfw-key');
const saveKeyBtn = document.getElementById('save-key-btn');
const keyStatusMsg = document.getElementById('key-status-msg');
const resultsPanel = document.getElementById('results-panel');
const loadingOverlay = document.getElementById('loading-overlay');

const scoreText = document.getElementById('score-text');
const scoreCircle = document.getElementById('score-circle');
const statusBadge = document.getElementById('status-badge');
const reasonsList = document.getElementById('reasons-list');

let apiKey = '';

// Load Key from LocalStorage
if (localStorage.getItem('gfw_api_key')) {
    apiKey = localStorage.getItem('gfw_api_key');
    gfwKeyInput.value = apiKey;
    keyStatusMsg.textContent = 'Key loaded from storage. Ready.';
    keyStatusMsg.className = 'status-msg text-success';
}

saveKeyBtn.addEventListener('click', () => {
    const key = gfwKeyInput.value.trim();
    if (key) {
        apiKey = key;
        localStorage.setItem('gfw_api_key', key);
        keyStatusMsg.textContent = 'Key saved securely in browser.';
        keyStatusMsg.className = 'status-msg text-success';
    } else {
        apiKey = '';
        localStorage.removeItem('gfw_api_key');
        keyStatusMsg.textContent = 'API key removed. Map analysis disabled.';
        keyStatusMsg.className = 'status-msg text-fade';
    }
});

// Map Events
map.on('click', async (e) => {
    if (!apiKey) {
        alert("Please enter a Global Forest Watch API key first.");
        return;
    }
    drawnItems.clearLayers();
    
    // Add marker
    const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(drawnItems);
    
    // Draw 5km radius approximation
    const circle = L.circle([e.latlng.lat, e.latlng.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        radius: 5000 // meters
    }).addTo(drawnItems);
    
    map.fitBounds(circle.getBounds(), { padding: [50, 50] });

    await runAnalysis("point", { lat: e.latlng.lat, lon: e.latlng.lng });
});

map.on(L.Draw.Event.CREATED, async (e) => {
    if (!apiKey) {
        alert("Please enter a Global Forest Watch API key first.");
        return;
    }
    drawnItems.clearLayers();
    
    const layer = e.layer;
    drawnItems.addLayer(layer);
    
    const bounds = layer.getBounds();
    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLon = bounds.getWest();
    const maxLon = bounds.getEast();
    
    map.fitBounds(bounds, { padding: [50, 50] });

    await runAnalysis("region", { minLat, maxLat, minLon, maxLon });
});

async function runAnalysis(mode, data) {
    loadingOverlay.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    
    try {
        const result = await getSustainabilityAssessment(mode, data, apiKey);
        displayResult(result);
    } catch (err) {
        console.error(err);
        alert(`Analysis Error: ${err.message}`);
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

async function getSustainabilityAssessment(mode, data, apiKey) {
    let minLat, maxLat, minLon, maxLon;
    
    if (mode === "point") {
        const offset = 0.045; // Roughly 5km
        minLat = data.lat - offset;
        maxLat = data.lat + offset;
        minLon = data.lon - offset;
        maxLon = data.lon + offset;
    } else {
        minLat = data.minLat;
        maxLat = data.maxLat;
        minLon = data.minLon;
        maxLon = data.maxLon;
    }

    // 1. GFW Data for Forest Cover — POST with GeoJSON geometry
    // SQL WHERE lat/lon filter causes 422 on raster datasets
    const gfwGeometry = {
        type: "Polygon",
        coordinates: [[
            [minLon, minLat],
            [maxLon, minLat],
            [maxLon, maxLat],
            [minLon, maxLat],
            [minLon, minLat]
        ]]
    };
    
    const gfwResp = await fetch("https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
            sql: "SELECT sum(area__ha) FROM results WHERE umd_tree_cover_density__threshold=30",
            geometry: gfwGeometry
        })
    });
    
    if (!gfwResp.ok) {
        let errText = "Unknown error";
        try { errText = await gfwResp.text(); } catch(e){}
        if (gfwResp.status === 401 || gfwResp.status === 403) {
            throw new Error("Invalid GFW API Key or Unauthorized.");
        }
        throw new Error(`GFW Request failed: ${errText}`);
    }
    
    const gfw_res = await gfwResp.json();

    // 2. GBIF Data — WKT geometry bbox, not decimalLatitude+distance (that returns 0)
    // NOTE: iucnRedListCategory is rarely populated in occurrence records,
    // so we rely on species richness + occurrence count instead, with IUCN as a bonus.
    const gbifUrl = new URL("https://api.gbif.org/v1/occurrence/search");
    const wkt = `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
    gbifUrl.searchParams.append('geometry', wkt);
    gbifUrl.searchParams.append('hasCoordinate', 'true');
    gbifUrl.searchParams.append('taxonRank', 'SPECIES');
    gbifUrl.searchParams.append('limit', '300');

    const gbifResp = await fetch(gbifUrl.toString());
    const w_data = await gbifResp.json();

    // 3. Logic
    const forest_ha = (gfw_res.data && gfw_res.data.length > 0) ? (gfw_res.data[0]['sum(area__ha)'] || 0) : 0;
    const allResults = w_data.results || [];
    const totalOccurrences = w_data.count || 0;
    const uniqueSpecies = new Set(allResults.map(s => s.taxonKey)).size;
    // IUCN as bonus only — rarely populated but use when available
    const endangered = allResults.filter(s => ['CR', 'EN', 'VU'].includes(s.iucnRedListCategory));
    
    // Score = 100 (safe) → 0 (high risk)
    // Forest cover is the primary driver (60 pts), species richness secondary (30 pts), IUCN bonus (10 pts)
    const forestRisk = Math.min((forest_ha / 100) * 60, 60);       // 100ha = max forest risk
    const richnessRisk = Math.min((uniqueSpecies / 50) * 30, 30);  // 50 unique species = max richness risk
    const iucnRisk = Math.min(endangered.length * 2, 10);           // bonus if IUCN data available
    const totalRisk = forestRisk + richnessRisk + iucnRisk;
    
    let is_safe = true;
    let reasons = [];

    if (forest_ha > 20) {
        is_safe = false;
        reasons.push(`Significant Forest Cover (${forest_ha.toFixed(1)} ha) detected.`);
    }
    if (uniqueSpecies > 10) {
        is_safe = false;
        reasons.push(`High species richness: ${uniqueSpecies} unique species recorded (${totalOccurrences.toLocaleString()} total occurrences).`);
    }
    if (endangered.length > 0) {
        is_safe = false;
        const unique_threats = [...new Set(endangered.map(s => s.scientificName))];
        reasons.push(`IUCN-listed species: ${unique_threats.slice(0, 3).join(', ')}`);
    }

    let finalStatus = "SAFE";
    let themeClass = "safe";
    
    let score = Math.round(100 - totalRisk);
    if (score < 0) score = 0;

    if (!is_safe) {
        if (score < 40) {
            finalStatus = "UNSAFE";
            themeClass = "danger";
        } else {
            finalStatus = "WARNING";
            themeClass = "warning";
        }
    }

    if (reasons.length === 0) {
        reasons.push("Area is ecologically degraded or at low risk.");
    }

    return {
        status: finalStatus,
        themeClass: themeClass,
        score: Math.round(score),
        reasons: reasons
    };
}

function displayResult(result) {
    resultsPanel.classList.remove('hidden');
    
    // Animate score ring
    scoreCircle.style.strokeDasharray = `${result.score}, 100`;
    let colorValue = result.themeClass === 'safe' ? '#10b981' : 
                     result.themeClass === 'warning' ? '#f59e0b' : '#ef4444';
    scoreCircle.style.stroke = colorValue;
    
    // Animate score counter
    let currentScore = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const inc = result.score / steps;
    
    const interval = setInterval(() => {
        currentScore += inc;
        if (currentScore >= result.score) {
            currentScore = result.score;
            clearInterval(interval);
        }
        scoreText.textContent = Math.round(currentScore);
    }, stepTime);
    
    statusBadge.textContent = result.status;
    statusBadge.className = `badge ${result.themeClass}`;
    
    reasonsList.innerHTML = '';
    result.reasons.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        reasonsList.appendChild(li);
    });
}
