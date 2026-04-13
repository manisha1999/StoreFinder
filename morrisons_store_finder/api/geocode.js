export default async function handler(req, res) {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(req.query.postcode)}&key=${key}&components=country:GB`;
  const upstream = await fetch(url);
  const json = await upstream.json();
  return res.status(upstream.status).json(json);
}