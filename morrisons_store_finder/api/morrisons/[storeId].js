export default async function handler(req, res) {
  const { storeId } = req.query;
  const key = process.env.MORRISONS_API_KEY;
  const base = `https://uat-api.morrisons.com/location/v2/stores/${encodeURIComponent(storeId)}`;
  const url = `${base}?${new URLSearchParams({ ...req.query, apikey: key })}`;
  const upstream = await fetch(url);
  const body = await upstream.text();
  try { return res.status(upstream.status).json(JSON.parse(body)); } 
  catch { return res.status(upstream.status).type('text').send(body); }
}