const FIRMS_API_KEY = '1a310847ec43d8be0c8a4094af9a964f';
const INDIA_BBOX = '68.17,7.96,97.4,35.4'; // slightly simpler
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/${INDIA_BBOX}/1`;

console.log("Testing NASA FIRMS API...");
console.log("URL:", url);

fetch(url)
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => {
    const lines = text.trim().split('\n');
    console.log("Total Lines Returned:", lines.length);
    if (lines.length > 1) {
       console.log("First data line:", lines[1]);
    } else {
       console.log("NO DATA RETURNED.");
    }
  })
  .catch(err => {
    console.error("Fetch failed:", err);
  });
