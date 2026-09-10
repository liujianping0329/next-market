import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const symbols = {
  sp500: "^GSPC",
  qqqm: "QQQM",
  nikkei: "^N225",
  taiwan: "^TWII",
  usdjpy: "JPY=X",
  cnyjpy: "CNYJPY=X",
  twdjpy: "TWDJPY=X",
};

const places = {
  kinshicho: { lat: 35.6967, lon: 139.8142 },
  shibuya: { lat: 35.6595, lon: 139.7005 },
  kuwana: { lat: 35.0622, lon: 136.6838 },
};

async function yahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false&events=div%2Csplits`;
  const r = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`Yahoo ${symbol}: ${r.status}`);
  const j = await r.json();
  const x = j?.chart?.result?.[0];
  if (!x) throw new Error(`Yahoo ${symbol}: empty`);
  const closes = x.indicators?.quote?.[0]?.close || [];
  return {
    meta: x.meta,
    rows: (x.timestamp || []).map((ts, i) => [ts, closes[i]]).filter((v) => Number.isFinite(v[1])),
  };
}

async function weather({ lat, lon }) {
  const p = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), timezone: "Asia/Tokyo", forecast_days: "7",
    hourly: "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`OpenMeteo ${lat},${lon}: ${r.status}`);
  return r.json();
}

export async function GET() {
  try {
    const marketEntries = await Promise.all(Object.entries(symbols).map(async ([k, s]) => [k, await yahoo(s)]));
    const weatherEntries = await Promise.all(Object.entries(places).map(async ([k, p]) => [k, await weather(p)]));
    return NextResponse.json({ fetchedAt: new Date().toISOString(), market: Object.fromEntries(marketEntries), weather: Object.fromEntries(weatherEntries) });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
