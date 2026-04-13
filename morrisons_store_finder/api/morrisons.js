const { toQueryString } = require('./_utils');

const MORRISONS_API_KEY = process.env.MORRISONS_API_KEY;

module.exports = async function handler(req, res) {
  try {
    const params = { ...req.query, apikey: MORRISONS_API_KEY };
    const url = 'https://uat-api.morrisons.com/location/v2/stores' + toQueryString(params);
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Morrisons store list API error:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};
