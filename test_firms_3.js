const FIRMS_API_KEY = '1a310847ec43d8be0c8a4094af9a964f';
const INDIA_BBOX = '67.0,7.0,97.0,36.0';
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/MODIS_NRT/${INDIA_BBOX}/10`;

console.log("Testing NASA FIRMS API (MODIS, 10 Days)...");
console.log("URL:", url);

fetch(url)
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => {
    const lines = text.trim().split('\n');
    console.log("Total Lines Returned (including header):", lines.length);
    if (lines.length > 1) {
       console.log("First data line:", lines[1]);
    }
  })
  .catch(err => {
    console.error("Fetch failed:", err);
  });
