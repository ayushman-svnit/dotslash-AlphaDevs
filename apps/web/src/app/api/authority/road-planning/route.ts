import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const points: [number, number][] = body.points;

        if (!points || points.length === 0) {
            return NextResponse.json({ error: "Points are required" }, { status: 400 });
        }

        // Compute bounding box across all points
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        for (const [lat, lon] of points) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
        }
        const buffer = 0.045; // ~5km in degrees
        const bMinLat = minLat - buffer, bMaxLat = maxLat + buffer;
        const bMinLon = minLon - buffer, bMaxLon = maxLon + buffer;

        console.log(`[route] ${points.length} points | bbox lat(${bMinLat.toFixed(4)},${bMaxLat.toFixed(4)}) lon(${bMinLon.toFixed(4)},${bMaxLon.toFixed(4)})`);

        // 1. GFW — POST with GeoJSON geometry (GET with SQL WHERE lat/lon causes 422)
        const gfwKey = process.env.GFW_API_KEY || process.env.NEXT_PUBLIC_GFW_API_KEY || "";
        let forestArea = 0;
        if (gfwKey) {
            try {
                const gfwGeometry = {
                    type: "Polygon",
                    coordinates: [[
                        [bMinLon, bMinLat], [bMaxLon, bMinLat],
                        [bMaxLon, bMaxLat], [bMinLon, bMaxLat],
                        [bMinLon, bMinLat]
                    ]]
                };
                const gfwRes = await fetch(
                    "https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query",
                    {
                        method: "POST",
                        headers: { "x-api-key": gfwKey, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sql: "SELECT sum(area__ha) FROM results WHERE umd_tree_cover_density_2000__percent >= 30",
                            geometry: gfwGeometry
                        })
                    }
                );
                if (gfwRes.ok) {
                    const gfwData = await gfwRes.json();
                    forestArea = gfwData?.data?.[0]?.['sum(area__ha)'] || 0;
                } else {
                    const t = await gfwRes.text().catch(() => "");
                    console.warn(`[GFW] ${gfwRes.status}: ${t}`);
                }
            } catch (e) {
                console.warn("[GFW] fetch failed:", e);
            }
        }
        console.log(`[GFW] forestArea=${forestArea}ha`);

        // 2. GBIF — WKT geometry bbox per point (server-side, no CORS issues)
        // decimalLatitude+distance doesn't work in browser; geometry param works server-side
        const gbifResults = await Promise.all(
            points.map(async ([lat, lon]) => {
                const wkt = `POLYGON((${lon - buffer} ${lat - buffer},${lon + buffer} ${lat - buffer},${lon + buffer} ${lat + buffer},${lon - buffer} ${lat + buffer},${lon - buffer} ${lat - buffer}))`;
                const url = new URL("https://api.gbif.org/v1/occurrence/search");
                url.searchParams.set('geometry', wkt);
                url.searchParams.set('hasCoordinate', 'true');
                url.searchParams.set('taxonRank', 'SPECIES');
                url.searchParams.set('limit', '300');
                try {
                    const res = await fetch(url.toString());
                    const data = await res.json();
                    const results = data.results || [];
                    console.log(`[GBIF] (${lat.toFixed(4)},${lon.toFixed(4)}) count=${data.count} returned=${results.length}`);
                    return { results, count: data.count || 0 };
                } catch (e) {
                    console.warn(`[GBIF] fetch failed for (${lat},${lon}):`, e);
                    return { results: [], count: 0 };
                }
            })
        );

        const allResults = gbifResults.flatMap(r => r.results);
        const maxCount = Math.max(...gbifResults.map(r => r.count), 0);
        const uniqueSpecies = new Set(allResults.map((r: any) => r.taxonKey)).size;

        const endangeredList: Array<{ name: string; status: string }> = [];
        for (const item of allResults) {
            if (['CR', 'EN', 'VU'].includes(item.iucnRedListCategory)) {
                endangeredList.push({ name: item.scientificName || "Unknown", status: item.iucnRedListCategory });
            }
        }
        const uniqueEndangered = Array.from(new Set(endangeredList.map(s => s.name)));

        // Scoring: forest (40pts) + richness (35pts) + occurrence density (15pts) + IUCN bonus (10pts)
        const forestScore    = Math.min(Math.round((forestArea / 150) * 40), 40);
        const richnessScore  = Math.min(Math.round((uniqueSpecies / 40) * 35), 35);
        const occurrenceScore = Math.min(Math.round((maxCount / 1000) * 15), 15);
        const iucnScore      = Math.min(uniqueEndangered.length * 2, 10);
        const impactNum      = forestScore + richnessScore + occurrenceScore + iucnScore;

        console.log(`[Scoring] forest=${forestScore} richness=${richnessScore} occurrence=${occurrenceScore} iucn=${iucnScore} TOTAL=${impactNum}`);

        const isSafe = impactNum < 30;
        const damageClass = impactNum >= 70 ? "CRITICAL RISK" : impactNum >= 30 ? "MODERATE RISK" : "SAFE ZONE";

        return NextResponse.json({
            primary_impact_score: impactNum.toString(),
            damage_classification: damageClass,
            affected_species: uniqueEndangered,
            debug: { forestArea, uniqueSpecies, maxCount, iucnCount: uniqueEndangered.length },
            alternatives: !isSafe ? [
                {
                    id: "alt_1_eco_bridge",
                    name: "Eco-Bridge Route",
                    impact_score: "45",
                    description: "Elevated road segment allowing wildlife to pass underneath safely, avoiding high density forest pockets.",
                    cost_increase: 15
                },
                {
                    id: "alt_2_detour",
                    name: "Eastern Detour",
                    impact_score: "22",
                    description: "Bypasses the critical radius by re-routing through already degraded agricultural lands.",
                    cost_increase: 40
                }
            ] : []
        });

    } catch (e: any) {
        console.error("[route] error:", e);
        return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
    }
}
