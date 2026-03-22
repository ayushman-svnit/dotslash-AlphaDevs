import { NextResponse } from 'next/server';

const FIRMS_API_KEY = 'e8990c74c935ee522fc2d9d15e219fb0'; // Another key fallback or use current

// India bounding box
const INDIA_BBOX = '67.0,7.0,97.0,36.0';

export async function GET() {
    try {
        const key = process.env.FIRMS_API_KEY || '1a310847ec43d8be0c8a4094af9a964f';
        
        // Sources: MODIS (Terra/Aqua) + VIIRS SNPP + VIIRS NOAA-20
        const sources = ['MODIS_NRT', 'VIIRS_SNPP_NRT', 'VIIRS_NOAA20_NRT'];
        
        const allFires = await Promise.all(sources.map(async (src) => {
            // Fetch last 2 days to ensure we have data to display
            const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${src}/${INDIA_BBOX}/2`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return [];
            
            const csv = await res.text();
            const lines = csv.trim().split('\n');
            if (lines.length < 2) return [];

            const headers = lines[0].split(',').map(h => h.trim());
            const latIdx  = headers.indexOf('latitude');
            const lonIdx  = headers.indexOf('longitude');
            const confIdx = headers.indexOf('confidence');
            const frpIdx  = headers.indexOf('frp');
            const dateIdx = headers.indexOf('acq_date');
            const timeIdx = headers.indexOf('acq_time');
            const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');

            return lines.slice(1).map(line => {
                const cols = line.split(',');
                const conf = cols[confIdx]?.trim()?.toLowerCase();
                
                // Keep High and Moderate (don't keep 'low' to avoid noise)
                const isHigh = ['high', 'h', '100'].includes(conf);
                const isNominal = ['nominal', 'n', 'moderate', '70', '80', '90'].includes(conf) || (parseInt(conf) > 50);
                
                if (!isHigh && !isNominal) return null;

                const lat = parseFloat(cols[latIdx]);
                const lon = parseFloat(cols[lonIdx]);
                if (isNaN(lat) || isNaN(lon)) return null;

                const acqDate = cols[dateIdx]?.trim();
                const acqTime = cols[timeIdx]?.trim().padStart(4, '0') || '0000';
                const frp = parseFloat(cols[frpIdx]) || 0;

                return {
                    lat,
                    lon,
                    confidence: conf,
                    frp,
                    source: src,
                    date: acqDate,
                    time: `${acqTime.slice(0, 2)}:${acqTime.slice(2)} UTC`,
                    brightness: parseFloat(cols[brightIdx]) || 0,
                    severity: frp > 100 ? 'CRITICAL' : frp > 30 ? 'HIGH' : 'MODERATE',
                };
            }).filter(Boolean);
        }));

        const combinedFires = allFires.flat().sort((a: any, b: any) => b.frp - a.frp).slice(0, 100);

        return NextResponse.json({ 
            fires: combinedFires, 
            fetchedAt: new Date().toISOString(), 
            total: combinedFires.length,
            sources: sources.length
        });
    } catch (e: any) {
        return NextResponse.json({ fires: [], error: e.message }, { status: 500 });
    }
}
