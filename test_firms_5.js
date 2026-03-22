const FIRMS_API_KEY = '1a310847ec43d8be0c8a4094af9a964f';
const INDIA_BBOX = '67.0,7.0,97.0,36.0';
const sources = ['MODIS_NRT', 'VIIRS_SNPP_NRT', 'VIIRS_NOAA20_NRT'];

async function testSources() {
  for (const src of sources) {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/${src}/${INDIA_BBOX}/1`;
    console.log(`Checking ${src}...`);
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`Status: ${res.status} | Length: ${text.length} | Lines: ${text.trim().split('\n').length}`);
      if (text.includes("Invalid")) console.log("ERROR BODY:", text);
    } catch (e) {
      console.log(`FAILED ${src}:`, e.message);
    }
  }
}

testSources();
