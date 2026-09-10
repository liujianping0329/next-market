import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const symbols = {
  sp500: ["^GSPC", "S&P 500"],
  qqqm: ["QQQM", "QQQM"],
  nikkei: ["^N225", "日經 225"],
  taiwan: ["^TWII", "台灣加權"],
  usdjpy: ["JPY=X", "USD/JPY"],
  cnyjpy: ["CNYJPY=X", "CNY/JPY"],
  twdjpy: ["TWDJPY=X", "TWD/JPY"],
};
const places = {
  kinshicho: ["錦糸町（墨田區）", 35.6967, 139.8142],
  shibuya: ["澀谷", 35.6595, 139.7005],
  kuwana: ["桑名（三重縣桑名市）", 35.0622, 136.6838],
};
const pad2=n=>String(n).padStart(2,"0");
const md=ts=>{const d=new Date(ts*1000);return `${pad2(d.getUTCMonth()+1)}/${pad2(d.getUTCDate())}`};
const my=ts=>{const d=new Date(ts*1000);return `${pad2(d.getUTCMonth()+1)}/${String(d.getUTCFullYear()).slice(2)}`};
const dateKey=ts=>new Date(ts*1000).toISOString().slice(0,10);
const isoWeekKey=ts=>{const d=new Date(ts*1000);const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));const w=Math.ceil((((x-y)/86400000)+1)/7);return `${x.getUTCFullYear()}-${pad2(w)}`};
function dense(rows){const clean=rows.filter(x=>Number.isFinite(x[1]));const last=clean.at(-1),prev=clean.at(-2);const cutoff=(last?.[0]||0)-35*86400;const m=clean.filter(x=>x[0]>=cutoff).map(x=>[md(x[0]),+x[1].toFixed(4)]);const wm=new Map();for(const x of clean)wm.set(isoWeekKey(x[0]),x);const y=[...wm.values()].map(x=>[my(x[0]),+x[1].toFixed(4)]);return {last:+last[1].toFixed(4),prev:+prev[1].toFixed(4),asof:md(last[0]),m,y,counts:{m:m.length,y:y.length}}}
async function yahoo(symbol){const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false&events=div%2Csplits`;const r=await fetch(u,{cache:"no-store",headers:{"User-Agent":"Mozilla/5.0"}});if(!r.ok)throw new Error(`Yahoo ${symbol}: ${r.status}`);const j=await r.json();const x=j?.chart?.result?.[0];if(!x)throw new Error(`Yahoo ${symbol}: empty`);const c=x.indicators?.quote?.[0]?.close||[];return dense((x.timestamp||[]).map((ts,i)=>[ts,c[i]]).filter(v=>Number.isFinite(v[1])))}
async function weather(lat,lon){const p=new URLSearchParams({latitude:String(lat),longitude:String(lon),timezone:"Asia/Tokyo",forecast_days:"7",hourly:"temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,uv_index",daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max"});const r=await fetch(`https://api.open-meteo.com/v1/forecast?${p}`,{cache:"no-store"});if(!r.ok)throw new Error(`OpenMeteo ${lat},${lon}: ${r.status}`);return r.json()}
function label(c){if(c===0)return"晴";if(c<=2)return"晴時々曇";if(c===3)return"曇";if(c>=95)return"雷雨";if(c>=71&&c<=77)return"雪";if(c>=80&&c<=82)return"驟雨";if(c>=65)return"強雨";if(c>=61)return"雨";if(c>=51)return"小雨";return"曇"}
function packWeather(j){const h=j.hourly,d=j.daily;const today=d.time[0];const idx=h.time.map((t,i)=>[t,i]).filter(([t])=>t.startsWith(today));const hourly=idx.map(([,i])=>[+h.time[i].slice(11,13),h.temperature_2m[i],h.precipitation[i],h.wind_speed_10m[i],label(h.weather_code[i]),h.uv_index[i]]);const daily=d.time.map((dt,i)=>{const ids=h.time.map((t,k)=>t.startsWith(dt)?k:-1).filter(k=>k>=0);const hum=ids.length?Math.round(ids.reduce((s,k)=>s+h.relative_humidity_2m[k],0)/ids.length):null;const wd=new Date(`${dt}T00:00:00+09:00`);const w="日一二三四五六"[wd.getDay()];return [dt.slice(5).replace("-","/"),w,label(d.weather_code[i]),d.temperature_2m_max[i],d.temperature_2m_min[i],d.precipitation_probability_max[i],`最高${d.precipitation_probability_max[i]}%`,d.wind_speed_10m_max[i],hum,d.uv_index_max[i],null]});return {hourly,daily}}
export async function GET(){try{const mk=Object.entries(symbols);const mr=await Promise.all(mk.map(async([k,[s,n]])=>[k,{name:n,...await yahoo(s)}]));const wr=await Promise.all(Object.entries(places).map(async([k,[name,lat,lon]])=>[name,packWeather(await weather(lat,lon))]));return NextResponse.json({fetchedAt:new Date().toISOString(),date:new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()),w:Object.fromEntries(wr),s:["sp500","qqqm","nikkei","taiwan"].map(k=>Object.fromEntries(mr)[k]),f:["usdjpy","cnyjpy","twdjpy"].map(k=>Object.fromEntries(mr)[k])})}catch(e){return NextResponse.json({error:String(e?.message||e)},{status:500})}}
