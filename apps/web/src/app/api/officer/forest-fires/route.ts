import { NextResponse } from 'next/server';

const FIRMS_API_KEY = '1a310847ec43d8be0c8a4094af9a964f';

// India bounding box
const INDIA_BBOX = '68.1766451354,7.96553477623,97.4025614766,35.4940095078';

export async function GET() {
    try {
        // FIRMS VIIRS S-NPP — last 24h, India bbox
        const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/${INDIA_BBOX}/1`;

        const res = await fetch(url, { cache: 'no-store' }); // always fresh for real-time polling
        if (!res.ok) {
            console.error(`[FIRMS] ${res.status}: ${await res.text()}`);
            return NextResponse.json({ fires: [], error: `FIRMS API error ${res.status}` });
        }

        const csv = await res.text();
        const lines = csv.trim().split('\n');
        if (lines.length < 2) return NextResponse.json({ fires: [] });

        // Parse CSV — headers: latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
        const headers = lines[0].split(',').map(h => h.trim());
        const latIdx  = headers.indexOf('latitude');
        const lonIdx  = headers.indexOf('longitude');
        const confIdx = headers.indexOf('confidence');
        const frpIdx  = headers.indexOf('frp');
        const dateIdx = headers.indexOf('acq_date');
        const timeIdx = headers.indexOf('acq_time');
        const brightIdx = headers.indexOf('bright_ti4');

        // Only keep detections from the last 2 hours, high confidence only, top 50 by FRP
        const nowUtc = Date.now();
        const WINDOW_MS = 24 * 60 * 60 * 1000;

        const fires = lines.slice(1)
            .map(line => {
                const cols = line.split(',');
                const conf = cols[confIdx]?.trim();
                // High confidence only
                if (!['high', 'h'].includes(conf?.toLowerCase())) return null;
                const lat = parseFloat(cols[latIdx]);
                const lon = parseFloat(cols[lonIdx]);
                if (isNaN(lat) || isNaN(lon)) return null;

                // Parse acquisition datetime and filter to last 3 hours
                const acqDate = cols[dateIdx]?.trim(); // e.g. "2026-03-22"
                const acqTime = cols[timeIdx]?.trim().padStart(4, '0') || '0000'; // e.g. "1435"
                const acqDateTimeStr = `${acqDate}T${acqTime.slice(0, 2)}:${acqTime.slice(2)}:00Z`;
                const acqMs = new Date(acqDateTimeStr).getTime();
                if (isNaN(acqMs) || nowUtc - acqMs > WINDOW_MS) return null;

                const frp = parseFloat(cols[frpIdx]) || 0;
                const timeStr = `${acqTime.slice(0, 2)}:${acqTime.slice(2)} UTC`;
                return {
                    lat,
                    lon,
                    confidence: conf,
                    frp,
                    date: acqDate,
                    time: timeStr,
                    brightness: parseFloat(cols[brightIdx]) || 0,
                    severity: frp > 100 ? 'CRITICAL' : frp > 30 ? 'HIGH' : 'MODERATE',
                };
            })
            .filter(Boolean);

        // Sort by FRP descending, cap at 50 most intense
        fires.sort((a: any, b: any) => b.frp - a.frp);
        const topFires = fires.slice(0, 50);

        return NextResponse.json({ fires: topFires, fetchedAt: new Date().toISOString(), total: topFires.length });
    } catch (e: any) {
        console.error('[FIRMS] fetch failed:', e);
        return NextResponse.json({ fires: [], error: e.message }, { status: 500 });
    }
}
