require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const app = express();

const MORRISONS_API_KEY = process.env.MORRISONS_API_KEY;
console.log('Loaded API key:', MORRISONS_API_KEY); 
function toQueryString(params) {
  return (
    '?' +
    Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
  );
}

app.get('/api/morrisons', async (req, res) => {
  try {
    // Add apikey to query params
    const params = { ...req.query, apikey: MORRISONS_API_KEY };
    const url = 'https://uat-api.morrisons.com/location/v2/stores' + toQueryString(params);
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'API error', details: err.message });
  }
});

app.get('/api/morrisons/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const params = { ...req.query, apikey: MORRISONS_API_KEY };
    const url = `https://uat-api.morrisons.com/location/v2/stores/${encodeURIComponent(storeId)}` + toQueryString(params);
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'API error', details: err.message });
  }
});


 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));

