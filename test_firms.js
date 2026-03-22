const FIRMS_API_KEY = '1a310847ec43d8be0c8a4094af9a964f';
const INDIA_BBOX = '68.1766451354,7.96553477623,97.4025614766,35.4940095078';
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/${INDIA_BBOX}/1`;

console.log("Testing NASA FIRMS API...");
console.log("URL:", url);

fetch(url)
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => {
    console.log("Response (first 500 chars):", text.slice(0, 500));
  })
  .catch(err => {
    console.error("Fetch failed:", err);
  });
