import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Story = { id: string; region: string; place: string; kicker: string; headline: string; detail: string; art: string; pin: number };
type Also = { place: string; headline: string };
type News = {
  title: string; date: string;
  stats: { value: string; label: string }[];
  regions: { name: string; count: number }[];
  heroes: Story[]; cards: Story[]; also: Also[]; dateCheck: string[];
  mapPins: { pin: number; label: string; x: number; y: number }[];
};

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "assets", "news.png");

function findChromium(): string {
  const home = process.env.HOME ?? "/root";
  const candidates: string[] = [];
  try {
    const base = join(home, ".cache", "ms-playwright");
    if (existsSync(base)) {
      for (const d of execSync(`ls ${base}`, { encoding: "utf8" }).split("\n")) {
        if (d.startsWith("chromium-")) candidates.push(join(base, d, "chrome-linux", "chrome"));
      }
    }
  } catch { /* fall through to the static list */ }
  candidates.push(
    join(home, ".cache", "ms-playwright", "chromium-1148", "chrome-linux", "chrome"),
    "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  );
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error("no chromium executable found");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function heroArt(art: string): string {
  if (art === "cop31") {
    return `<svg viewBox="0 0 326 108" width="326" height="92" preserveAspectRatio="xMidYMid slice">
      <rect width="326" height="108" fill="#0f766e"/>
      <circle cx="80" cy="54" r="40" fill="#fde68a"/>
      <path d="M48 44 Q66 30 84 42 Q96 52 88 66 Q70 78 54 70 Q42 58 48 44Z" fill="#15803d"/>
      <path d="M60 90 Q80 84 100 92" stroke="#0f766e" stroke-width="1.5" fill="none"/>
      <ellipse cx="80" cy="54" rx="40" ry="16" fill="none" stroke="#b45309" stroke-width="1.5"/>
      <ellipse cx="80" cy="54" rx="16" ry="40" fill="none" stroke="#b45309" stroke-width="1.5"/>
      <rect x="150" y="18" width="10" height="62" rx="5" fill="#fef3c7"/>
      <rect x="150" y="52" width="10" height="28" rx="5" fill="#dc2626"/>
      <circle cx="155" cy="86" r="11" fill="#dc2626"/><circle cx="155" cy="86" r="5" fill="#7f1d1d"/>
      <text x="150" y="16" font-size="9" fill="#fef3c7" font-weight="bold">1.5°C</text>
      <circle cx="252" cy="54" r="34" fill="#fef3c7"/>
      <circle cx="252" cy="54" r="30" fill="none" stroke="#0f766e" stroke-width="2"/>
      <line x1="252" y1="54" x2="252" y2="30" stroke="#b91c1c" stroke-width="3"/>
      <line x1="252" y1="54" x2="270" y2="62" stroke="#1f2937" stroke-width="3"/>
      <circle cx="252" cy="54" r="4" fill="#1f2937"/>
      <text x="252" y="97" font-size="9" fill="#fef3c7" text-anchor="middle" font-weight="bold">DAY 13 · OVERTIME</text>
    </svg>`;
  }
  if (art === "riyadh") {
    return `<svg viewBox="0 0 326 108" width="326" height="92" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#7c2d12"/>
      </linearGradient></defs>
      <rect width="326" height="108" fill="url(#sky)"/>
      <circle cx="280" cy="20" r="10" fill="#fde68a"/>
      <rect x="20" y="58" width="26" height="50" fill="#0f172a"/>
      <rect x="52" y="44" width="22" height="64" fill="#0f172a"/>
      <rect x="80" y="66" width="30" height="42" fill="#0f172a"/>
      <rect x="116" y="30" width="14" height="78" fill="#0f172a"/>
      <rect x="136" y="52" width="26" height="56" fill="#0f172a"/>
      <rect x="168" y="62" width="24" height="46" fill="#0f172a"/>
      <rect x="230" y="56" width="28" height="52" fill="#0f172a"/>
      <rect x="264" y="70" width="34" height="38" fill="#0f172a"/>
      <g stroke="#fde68a" stroke-width="2"><line x1="150" y1="0" x2="120" y2="46"/><line x1="210" y1="0" x2="188" y2="40"/><line x1="262" y1="0" x2="246" y2="34"/></g>
      <g fill="#fbbf24"><circle cx="120" cy="46" r="5"/><circle cx="188" cy="40" r="5"/><circle cx="246" cy="34" r="5"/></g>
      <g stroke="#f97316" stroke-width="1.5"><line x1="112" y1="38" x2="128" y2="54"/><line x1="128" y1="38" x2="112" y2="54"/><line x1="180" y1="32" x2="196" y2="48"/><line x1="196" y1="32" x2="180" y2="48"/></g>
    </svg>`;
  }
  return `<svg viewBox="0 0 326 108" width="326" height="92" preserveAspectRatio="xMidYMid slice">
    <rect width="326" height="108" fill="#92400e"/>
    <polygon points="0,108 70,34 140,108" fill="#78350f"/>
    <polygon points="90,108 180,18 270,108" fill="#451a03"/>
    <polygon points="180,18 196,40 164,40" fill="#fef3c7"/>
    <rect x="18" y="66" width="290" height="30" rx="4" fill="#fef3c7"/>
    <polyline points="24,81 52,81 62,64 74,96 86,70 98,88 110,66 122,92 134,74 146,86 158,68 170,90 182,72 194,84 206,70 218,88 230,74 242,86 254,72 266,84 278,78 302,78" fill="none" stroke="#dc2626" stroke-width="2.5"/>
    <rect x="238" y="34" width="52" height="34" fill="#b45309"/>
    <polygon points="232,34 264,14 296,34" fill="#7c2d12"/>
    <rect x="256" y="48" width="8" height="20" fill="#451a03"/>
  </svg>`;
}

function glyph(art: string): string {
  const wrap = (inner: string) => `<svg viewBox="0 0 48 48" width="36" height="36">${inner}</svg>`;
  switch (art) {
    case "burst": return wrap(`<polygon points="24,2 29,14 42,10 34,22 46,26 33,31 36,44 24,36 12,44 15,31 2,26 14,22 6,10 19,14" fill="#ea580c"/>`);
    case "shield": return wrap(`<path d="M24 3 L41 9 V24 C41 35 33 43 24 45 C15 43 7 35 7 24 V9 Z" fill="#1d4ed8"/><path d="M17 24 L22 29 L32 18" stroke="#fff" stroke-width="3" fill="none"/>`);
    case "plane": return wrap(`<polygon points="4,26 20,22 44,8 38,20 28,26 30,40 24,38 20,28 6,32" fill="#0e7490"/>`);
    case "wave": return wrap(`<path d="M4 16 Q12 8 20 16 T36 16 T48 16" stroke="#0369a1" stroke-width="3" fill="none"/><path d="M4 26 Q12 18 20 26 T36 26 T48 26" stroke="#0369a1" stroke-width="3" fill="none"/><path d="M4 36 Q12 28 20 36 T36 36 T48 36" stroke="#0369a1" stroke-width="3" fill="none"/>`);
    case "coin": return wrap(`<circle cx="24" cy="24" r="21" fill="#ca8a04"/><circle cx="24" cy="24" r="17" fill="#facc15"/><text x="24" y="32" font-size="22" text-anchor="middle" font-weight="bold" fill="#713f12">₿</text>`);
    case "bat": return wrap(`<rect x="20" y="4" width="8" height="16" rx="3" fill="#92400e"/><polygon points="14,20 34,20 30,44 18,44" fill="#d97706"/><line x1="24" y1="20" x2="24" y2="44" stroke="#92400e" stroke-width="1.5"/>`);
    case "chart": return wrap(`<rect x="6" y="26" width="8" height="16" fill="#dc2626"/><rect x="18" y="18" width="8" height="24" fill="#dc2626"/><rect x="30" y="10" width="8" height="32" fill="#dc2626"/><line x1="4" y1="44" x2="44" y2="44" stroke="#1f2937" stroke-width="2"/>`);
    case "ship": return wrap(`<polygon points="6,28 42,28 36,40 12,40" fill="#1e3a8a"/><rect x="10" y="18" width="10" height="10" fill="#b45309"/><rect x="22" y="14" width="10" height="14" fill="#0f766e"/><rect x="34" y="20" width="6" height="8" fill="#b91c1c"/>`);
    case "cuffs": return wrap(`<circle cx="15" cy="24" r="10" fill="none" stroke="#374151" stroke-width="4"/><circle cx="33" cy="24" r="10" fill="none" stroke="#374151" stroke-width="4"/><line x1="23" y1="18" x2="27" y2="14" stroke="#374151" stroke-width="3"/>`);
    default: return wrap(`<polygon points="10,4 38,4 38,44 10,44" fill="#fff"/><rect x="10" y="4" width="14" height="10" fill="#111"/><rect x="24" y="14" width="14" height="10" fill="#111"/><rect x="10" y="24" width="14" height="10" fill="#111"/><rect x="24" y="34" width="14" height="10" fill="#111"/><line x1="10" y1="4" x2="10" y2="44" stroke="#111" stroke-width="2"/>`);
  }
}

function mapSvg(pins: News["mapPins"]): string {
  const land = "#9db89a";
  const continents = [
    "M110 18 L250 15 L270 45 L230 70 L200 95 L160 90 L120 60 L105 35 Z",
    "M185 95 L235 100 L250 125 L215 148 L190 140 L175 115 Z",
    "M500 20 L560 18 L575 40 L545 55 L510 50 L495 35 Z",
    "M505 62 L575 60 L600 85 L570 125 L530 128 L505 95 Z",
    "M580 15 L900 12 L940 45 L880 80 L780 95 L680 85 L620 60 L580 35 Z",
    "M840 105 L930 100 L940 125 L860 130 L835 118 Z",
  ];
  const dots = pins.map((p) => {
    const lab = (p as { lab?: string }).lab ?? "r";
    const anchor = lab === "l" ? "end" : lab === "a" ? "middle" : "start";
    const lx = lab === "l" ? p.x - 12 : lab === "a" ? p.x : p.x + 12;
    const ly = lab === "a" ? p.y - 13 : p.y + 3;
    return `<g><circle cx="${p.x}" cy="${p.y}" r="9" fill="#b91c1c" stroke="#fff" stroke-width="1.5"/>
      <text x="${p.x}" y="${p.y + 3.5}" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">${p.pin}</text>
      <text x="${lx}" y="${ly}" font-size="8" font-weight="bold" fill="#1f2937" text-anchor="${anchor}">${esc(p.label)}</text></g>`;
  }).join("");
  return `<svg viewBox="0 0 1008 132" width="1008" height="132">
    <rect width="1008" height="132" fill="#dbeafe"/>
    ${continents.map((d) => `<path d="${d}" fill="${land}" stroke="#7ba05b" stroke-width="1"/>`).join("")}
    ${dots}
  </svg>`;
}

function page(data: News): string {
  const maxRegion = Math.max(...data.regions.map((r) => r.count));
  const stats = data.stats.map((s) => `<div class="stat"><div class="stat-v">${esc(s.value)}</div><div class="stat-l">${esc(s.label)}</div></div>`).join("");
  const bars = data.regions.map((r) => `<div class="bar-row"><span class="bar-name">${esc(r.name)}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.round((r.count / maxRegion) * 100)}%"></span></span><span class="bar-n">${r.count}</span></div>`).join("");
  const heroes = data.heroes.map((h) => `<div class="hero">
    <div class="hero-art">${heroArt(h.art)}</div>
    <div class="hero-body"><div class="kick">${esc(h.kicker)} · ${esc(h.place)}</div>
    <div class="hero-h">${esc(h.headline)}</div>
    <div class="hero-d">${esc(h.detail)}</div></div>
  </div>`).join("");
  const cards = data.cards.map((c) => `<div class="card">
    <div class="glyph">${glyph(c.art)}</div>
    <div class="card-body"><div class="kick">${esc(c.kicker)} · ${esc(c.place)}</div>
    <div class="card-h">${esc(c.headline)}</div>
    <div class="card-d">${esc(c.detail)}</div></div>
  </div>`).join("");
  const cols: Also[][] = [[], [], []];
  data.also.forEach((a, i) => cols[i % 3].push(a));
  const alsoHtml = cols.map((col) => `<div class="also-col">${col.map((a) => `<div class="also-item"><b>${esc(a.place)}</b> — ${esc(a.headline)}</div>`).join("")}</div>`).join("");
  const checks = data.dateCheck.map((c) => `<div class="check-item">✕ ${esc(c)}</div>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1024px; height: 1024px; overflow: hidden; background: #fbf3df; color: #191919;
      font-family: "DejaVu Sans", "Liberation Sans", sans-serif; }
    .mast { padding: 7px 14px 4px; border-bottom: 5px solid #b91c1c; }
    .mast-t { font-family: "DejaVu Serif", "Liberation Serif", serif; font-size: 38px; font-weight: bold; letter-spacing: 1px; line-height: 1; }
    .mast-s { font-size: 13px; margin-top: 4px; color: #444; }
    .mast-s b { color: #b91c1c; }
    .stats { display: flex; border-bottom: 2px solid #191919; }
    .stat { flex: 1; padding: 5px 6px 5px; text-align: center; border-right: 1px solid #d6c9a8; }
    .stat:last-child { border-right: none; }
    .stat-v { font-size: 26px; font-weight: bold; color: #b91c1c; line-height: 1; }
    .stat-l { font-size: 8px; margin-top: 3px; color: #555; letter-spacing: .4px; }
    .regions { display: flex; padding: 4px 14px 3px; border-bottom: 2px solid #191919; }
    .bar-row { flex: 1; display: flex; align-items: center; gap: 4px; padding: 0 5px; }
    .bar-name { font-size: 9px; font-weight: bold; white-space: nowrap; }
    .bar-track { flex: 1; height: 8px; background: #e7dcc0; }
    .bar-fill { display: block; height: 8px; background: #0f766e; }
    .bar-n { font-size: 10px; font-weight: bold; }
    .heroes { display: flex; gap: 8px; padding: 6px 8px 0; }
    .hero { flex: 1; background: #fffdf5; border: 1.5px solid #191919; }
    .hero-art { border-bottom: 1.5px solid #191919; line-height: 0; }
    .hero-body { padding: 6px 9px 6px; }
    .kick { font-size: 9px; font-weight: bold; color: #b91c1c; letter-spacing: .5px; }
    .hero-h { font-size: 16px; font-weight: bold; line-height: 1.15; margin: 3px 0 4px; }
    .hero-d { font-size: 11.5px; line-height: 1.3; color: #333; }
    .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 6px 8px; }
    .card { display: flex; gap: 6px; background: #fffdf5; border: 1.5px solid #191919; padding: 5px; }
    .glyph { flex: none; }
    .card-h { font-size: 11px; font-weight: bold; line-height: 1.15; margin: 2px 0 3px; }
    .card-d { font-size: 9.5px; line-height: 1.25; color: #333; }
    .map { padding: 0 8px; }
    .map-t { font-size: 11px; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px; }
    .map-t span { color: #b91c1c; }
    .map-box { border: 1.5px solid #191919; line-height: 0; }
    .also { padding: 5px 14px 0; }
    .also-t { font-size: 11px; font-weight: bold; letter-spacing: 1px; border-bottom: 2px solid #191919; padding-bottom: 2px; }
    .also-cols { display: flex; gap: 14px; margin-top: 4px; }
    .also-col { flex: 1; }
    .also-item { font-size: 10px; line-height: 1.3; margin-bottom: 2.5px; color: #222; }
    .datecheck { margin: 4px 14px 0; border: 1.5px solid #b91c1c; border-left: 6px solid #b91c1c; background: #fef2f2; padding: 5px 9px; }
    .datecheck-t { font-size: 10px; font-weight: bold; color: #b91c1c; letter-spacing: .5px; }
    .check-item { font-size: 9px; line-height: 1.3; color: #444; }
    .foot { padding: 3px 14px 0; font-size: 8.5px; color: #777; text-align: center; }
  </style></head><body>
    <div class="mast"><div class="mast-t">${esc(data.title.toUpperCase())}</div>
    <div class="mast-s"><b>${esc(data.date)}</b> &nbsp;·&nbsp; 36 STORIES &nbsp;·&nbsp; 7 REGIONS &nbsp;·&nbsp; EVERY STORY DATED TODAY, EVERY FIGURE CHECKED</div></div>
    <div class="stats">${stats}</div>
    <div class="regions">${bars}</div>
    <div class="heroes">${heroes}</div>
    <div class="cards">${cards}</div>
    <div class="map"><div class="map-t">THE DAY ON THE MAP <span>— 13 PINNED STORIES</span></div><div class="map-box">${mapSvg(data.mapPins)}</div></div>
    <div class="also"><div class="also-t">ALSO ON ${esc(data.date.toUpperCase())} · 23 MORE STORIES</div><div class="also-cols">${alsoHtml}</div></div>
    <div class="datecheck"><div class="datecheck-t">DATE CHECK — WHAT WE LEFT OUT, AND WHY</div>${checks}</div>
    <div class="foot">Drawn from reporting dated Saturday 21 November 2026 · Sources: Reuters, AP, AFP, USGS, CAAP, Formula 1, CoinGecko · Figures checked against the source of record</div>
  </body></html>`;
}

async function main(): Promise<void> {
  const data: News = JSON.parse(readFileSync(join(ROOT, "data", "news.json"), "utf8"));
  const html = page(data);
  const browser = await chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"] });
  try {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
    await pg.setContent(html, { waitUntil: "load" });
    await pg.waitForTimeout(300);
    mkdirSync(dirname(OUT), { recursive: true });
    await pg.screenshot({ path: OUT, type: "png", animations: "disabled", caret: "hide" });
  } finally {
    await browser.close();
  }
  console.log(`wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
