"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LEAFLET_CSS_HREF = "/vendor/leaflet/leaflet.css";
const LEAFLET_JS_SRC = "/vendor/leaflet/leaflet.js";
const SUNCALC_JS_SRC = "/vendor/leaflet/suncalc.js";

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.dataset.furuvagenVendor = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Kunde inte ladda ${src}`));
    document.body.appendChild(script);
  });
}

export default function Page() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const animateBtnRef = useRef<HTMLButtonElement>(null);
  const readoutAzimuthRef = useRef<HTMLElement>(null);
  const readoutAltitudeRef = useRef<HTMLElement>(null);
  const readoutShadowRef = useRef<HTMLElement>(null);
  const readoutDaylightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_HREF;
    document.head.appendChild(link);

    let cleanupMap: (() => void) | undefined;

    Promise.resolve()
      .then(() => loadScriptOnce(LEAFLET_JS_SRC))
      .then(() => loadScriptOnce(SUNCALC_JS_SRC))
      .then(() => {
        if (cancelled) return;
        cleanupMap = initMap({
          mapEl: mapContainerRef.current!,
          statusEl: statusRef.current!,
          resetBtn: resetBtnRef.current!,
          dateInput: dateInputRef.current!,
          timeInput: timeInputRef.current!,
          timeLabel: timeLabelRef.current!,
          animateBtn: animateBtnRef.current!,
          readoutAzimuth: readoutAzimuthRef.current!,
          readoutAltitude: readoutAltitudeRef.current!,
          readoutShadow: readoutShadowRef.current!,
          readoutDaylight: readoutDaylightRef.current!,
        });
      })
      .catch((err) => {
        if (!cancelled && statusRef.current) {
          statusRef.current.textContent = "Kunde inte ladda kartan.";
        }
        console.error(err);
      });

    return () => {
      cancelled = true;
      cleanupMap?.();
      document.head.removeChild(link);
      document.querySelectorAll('script[data-furuvagen-vendor="true"]').forEach((s) => s.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        .furuvagen-page {
          --card-bg: rgba(255, 255, 255, 0.92);
          --card-fg: #1c1c1c;
          --accent: #2f6b3f;
          --sun-accent: #b8720a;
          color-scheme: light dark;
        }
        @media (prefers-color-scheme: dark) {
          .furuvagen-page {
            --card-bg: rgba(28, 28, 30, 0.9);
            --card-fg: #f2f2f2;
          }
        }

        .furuvagen-page, .furuvagen-page * { box-sizing: border-box; }

        .furuvagen-page {
          position: relative;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .furuvagen-page #map {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #ddd;
        }

        .furuvagen-page .panel {
          position: absolute;
          z-index: 1000;
          background: var(--card-bg);
          color: var(--card-fg);
          backdrop-filter: blur(6px);
          border-radius: 12px;
          padding: 14px 18px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
        }

        .furuvagen-page .info-card {
          top: 12px;
          left: 12px;
          max-width: min(300px, calc(100vw - 24px));
        }

        .furuvagen-page .info-card h1 {
          margin: 0 0 4px;
          font-size: 1.1rem;
          line-height: 1.3;
        }

        .furuvagen-page .info-card p {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.8;
          line-height: 1.4;
        }

        .furuvagen-page .info-card .status {
          margin-top: 8px;
          font-size: 0.78rem;
        }

        .furuvagen-page .info-card button {
          margin-top: 10px;
          font: inherit;
          font-size: 0.8rem;
          border: 1px solid currentColor;
          background: transparent;
          color: var(--accent);
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
        }

        .furuvagen-page .info-card button:hover {
          background: var(--accent);
          color: #fff;
        }

        .furuvagen-page .sun-panel {
          left: 12px;
          right: 12px;
          bottom: 12px;
          margin: 0 auto;
          max-width: 560px;
          font-size: 0.85rem;
        }

        .furuvagen-page .sun-panel h2 {
          margin: 0 0 8px;
          font-size: 0.95rem;
        }

        .furuvagen-page .sun-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .furuvagen-page .sun-row-scroll {
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          padding-bottom: 2px;
        }

        .furuvagen-page .sun-row-scroll input[type="date"],
        .furuvagen-page .sun-row-scroll button {
          flex: none;
        }

        @media (min-width: 640px) {
          .furuvagen-page .sun-panel { max-width: 640px; }
          .furuvagen-page .sun-row-scroll { flex-wrap: wrap; overflow-x: visible; }
        }

        .furuvagen-page .sun-row label {
          font-size: 0.78rem;
          opacity: 0.8;
          white-space: nowrap;
        }

        .furuvagen-page .sun-row input[type="date"] {
          font: inherit;
          font-size: 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(128, 128, 128, 0.5);
          padding: 3px 6px;
          background: transparent;
          color: inherit;
        }

        .furuvagen-page .sun-row input[type="range"] {
          flex: 1;
          min-width: 120px;
          accent-color: var(--sun-accent);
        }

        .furuvagen-page .preset-btn, .furuvagen-page .animate-btn {
          font: inherit;
          font-size: 0.75rem;
          border: 1px solid currentColor;
          background: transparent;
          color: var(--sun-accent);
          border-radius: 8px;
          padding: 4px 8px;
          cursor: pointer;
        }

        .furuvagen-page .preset-btn:hover, .furuvagen-page .animate-btn:hover {
          background: var(--sun-accent);
          color: #fff;
        }

        .furuvagen-page .preset-btn.active {
          background: var(--sun-accent);
          color: #fff;
        }

        .furuvagen-page .time-label {
          font-variant-numeric: tabular-nums;
          min-width: 3.4em;
          text-align: right;
          font-size: 0.8rem;
        }

        .furuvagen-page .sun-readout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 4px 14px;
          font-size: 0.78rem;
          line-height: 1.5;
          margin-top: 6px;
        }

        .furuvagen-page .sun-readout strong {
          font-variant-numeric: tabular-nums;
        }

        .furuvagen-page .details-toggle {
          margin-top: 8px;
        }

        .furuvagen-page .details-toggle summary {
          cursor: pointer;
          font-size: 0.75rem;
          opacity: 0.75;
          user-select: none;
        }

        .furuvagen-page .legend {
          margin-top: 6px;
          font-size: 0.72rem;
          opacity: 0.8;
          line-height: 1.5;
        }

        .furuvagen-page .legend span {
          display: block;
        }

        .furuvagen-page .note {
          margin-top: 6px;
          font-size: 0.7rem;
          opacity: 0.65;
          line-height: 1.4;
        }

        .furuvagen-page .house-pin {
          font-size: 28px;
          line-height: 1;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
          transform: translateY(-4px);
        }

        .furuvagen-page .sun-pin {
          font-size: 22px;
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
        }

        .furuvagen-page .compass-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #555;
          text-shadow: 0 0 3px #fff, 0 0 3px #fff;
        }
        @media (prefers-color-scheme: dark) {
          .furuvagen-page .compass-label {
            color: #ddd;
            text-shadow: 0 0 3px #000, 0 0 3px #000;
          }
        }

        .furuvagen-page .leaflet-popup-content {
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .furuvagen-page .sun-panel { font-size: 0.78rem; padding: 8px 10px; }
          .furuvagen-page .sun-panel h2 { font-size: 0.85rem; margin-bottom: 6px; }
          .furuvagen-page .info-card { max-width: calc(100vw - 24px); padding: 10px 14px; }
          .furuvagen-page .info-card h1 { font-size: 1rem; }
          .furuvagen-page .info-card p { font-size: 0.78rem; }
          .furuvagen-page .sun-readout { font-size: 0.74rem; }
        }

        @media (max-height: 600px) {
          .furuvagen-page .sun-panel {
            max-height: 42vh;
            overflow-y: auto;
          }
          .furuvagen-page .info-card {
            max-height: 32vh;
            overflow-y: auto;
          }
          .furuvagen-page .info-card p { margin-bottom: 4px; }
        }

        .furuvagen-page .back-link {
          position: absolute;
          z-index: 1000;
          top: 12px;
          right: 12px;
          font-size: 0.85rem;
        }
        .furuvagen-page .back-link a {
          color: inherit;
          background: var(--card-bg);
          padding: 4px 10px;
          border-radius: 8px;
        }
      `}</style>
      <div className="furuvagen-page">
        <div id="map" ref={mapContainerRef} />

        <p className="back-link">
          <Button variant="link" className="h-auto" render={<Link href="/">← Alla experiment</Link>} />
        </p>

        <div className="panel info-card">
          <h1>🏡 Furuvägen 23</h1>
          <p>Holmsund, Sverige — vårt hus.</p>
          <p className="status" ref={statusRef}>
            Söker adressen …
          </p>
          <Button ref={resetBtnRef} type="button" hidden className="h-auto">
            Återställ nålen
          </Button>
        </div>

        <div className="panel sun-panel">
          <h2>☀️ Solbana &amp; solceller</h2>

          <div className="sun-row sun-row-scroll">
            <Label htmlFor="date-input">Datum</Label>
            <Input ref={dateInputRef} type="date" id="date-input" className="h-auto w-auto" />
            <Button className="preset-btn h-auto" id="today-btn" type="button">
              Idag
            </Button>
            <Button className="preset-btn h-auto" data-preset="winter" type="button">
              Vintersolstånd
            </Button>
            <Button className="preset-btn h-auto" data-preset="spring" type="button">
              Vårdagjämning
            </Button>
            <Button className="preset-btn h-auto" data-preset="summer" type="button">
              Sommarsolstånd
            </Button>
            <Button className="preset-btn h-auto" data-preset="autumn" type="button">
              Höstdagjämning
            </Button>
          </div>

          <div className="sun-row">
            <Label htmlFor="time-input">Tid</Label>
            <Input
              ref={timeInputRef}
              type="range"
              id="time-input"
              min={0}
              max={1439}
              step={5}
              className="h-auto w-auto"
            />
            <span className="time-label" ref={timeLabelRef}>
              --:--
            </span>
            <Button className="animate-btn h-auto" ref={animateBtnRef} type="button">
              ▶ Animera dagen
            </Button>
          </div>

          <div className="sun-readout">
            <div>
              Solriktning: <strong ref={readoutAzimuthRef}>–</strong>
            </div>
            <div>
              Solhöjd: <strong ref={readoutAltitudeRef}>–</strong>
            </div>
            <div>
              Skuggriktning/-längd: <strong ref={readoutShadowRef}>–</strong>
            </div>
            <div>
              Soluppgång–solnedgång: <strong ref={readoutDaylightRef}>–</strong>
            </div>
          </div>

          <details className="details-toggle">
            <summary>ℹ️ Teckenförklaring &amp; om beräkningen</summary>
            <div className="legend">
              <span>☀️ nuvarande solriktning</span>
              <span>┄ solens bana under dagen</span>
              <span>🟧 bästa takriktning för solceller (SO–S–SV)</span>
              <span>⤍ skuggriktning</span>
            </div>
            <p className="note">
              Skuggan är en grov uppskattning baserad på en antagen hushöjd (6 m) och tar inte
              hänsyn till träd, grannhus eller terräng — använd som fingervisning inför en
              riktig solcellsutredning.
            </p>
          </details>
        </div>
      </div>
    </>
  );
}

interface MapRefs {
  mapEl: HTMLDivElement;
  statusEl: HTMLElement;
  resetBtn: HTMLButtonElement;
  dateInput: HTMLInputElement;
  timeInput: HTMLInputElement;
  timeLabel: HTMLElement;
  animateBtn: HTMLButtonElement;
  readoutAzimuth: HTMLElement;
  readoutAltitude: HTMLElement;
  readoutShadow: HTMLElement;
  readoutDaylight: HTMLElement;
}

// Leaflet/SunCalc laddas som globala UMD-scripts (se loadScriptOnce ovan) — inga
// typdefinitioner tillgängliga utan att lägga till @types/leaflet som ny dependency.
/* eslint-disable @typescript-eslint/no-explicit-any */
function initMap(refs: MapRefs): () => void {
  const L = (window as unknown as { L: any }).L;
  const SunCalc = (window as unknown as { SunCalc: any }).SunCalc;

  const {
    mapEl,
    statusEl,
    resetBtn,
    dateInput,
    timeInput,
    timeLabel,
    animateBtn,
    readoutAzimuth,
    readoutAltitude,
    readoutShadow,
    readoutDaylight,
  } = refs;

  // ---------- Karta & husnål ----------

  const FALLBACK_POSITION = [63.7186, 20.3805];
  const STORAGE_KEY = "furuvagen23-hus-position";
  const ADDRESS_QUERY = "Furuvägen 23, Holmsund, Sverige";

  const houseIcon = L.divIcon({
    html: '<div class="house-pin">🏡</div>',
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 24],
    popupAnchor: [0, -24],
  });

  const map = L.map(mapEl, { zoomControl: false });
  L.control.zoom({ position: "topright" }).addTo(map);

  const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap-bidragsgivare",
  });

  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Flygfoto: Esri, Maxar, Earthstar Geographics",
    },
  );

  streets.addTo(map);
  L.control.layers({ Karta: streets, Satellit: satellite }).addTo(map);

  const marker = L.marker(FALLBACK_POSITION, { icon: houseIcon, draggable: true })
    .addTo(map)
    .bindPopup("Furuvägen 23 – vårt hus<br>Dra nålen om den inte sitter rätt.");

  function savePosition(latlng: { lat: number; lng: number }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([latlng.lat, latlng.lng]));
    resetBtn.hidden = false;
  }

  marker.on("dragend", () => {
    savePosition(marker.getLatLng());
    statusEl.textContent = "Nålens position sparad i den här webbläsaren.";
    updateSun();
  });

  function placeAt(position: number[], zoom: number, message: string) {
    marker.setLatLng(position);
    map.setView(position, zoom);
    statusEl.textContent = message;
    updateSun();
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const pos = JSON.parse(saved);
    placeAt(pos, 18, "Visar din sparade nålposition.");
    resetBtn.hidden = false;
  } else {
    map.setView(FALLBACK_POSITION, 14);
    fetch(
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
        encodeURIComponent(ADDRESS_QUERY),
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((results) => {
        if (results && results.length > 0) {
          const pos = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
          placeAt(pos, 18, "Adressen hittad. Dra nålen om den behöver justeras.");
        } else {
          throw new Error("no-results");
        }
      })
      .catch(() => {
        placeAt(
          FALLBACK_POSITION,
          14,
          "Kunde inte slå upp adressen automatiskt — dra nålen till rätt plats.",
        );
      });
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    resetBtn.hidden = true;
    location.reload();
  }
  resetBtn.addEventListener("click", handleReset);

  // ---------- Solbana ----------

  const RING_RADIUS_M = 35;
  const BUILDING_HEIGHT_M = 6;
  const MAX_SHADOW_M = 60;
  const COMPASS_DIRS_SV = [
    "N", "NNÖ", "NÖ", "ONÖ", "Ö", "OSÖ", "SÖ", "SSÖ",
    "S", "SSV", "SV", "VSV", "V", "VNV", "NV", "NNV",
  ];

  const sunLayer = L.layerGroup().addTo(map);

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  function toDateInputValue(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function minutesToLabel(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad(h)}:${pad(m)}`;
  }

  function destinationPoint(latlng: { lat: number; lng: number }, bearingDeg: number, distanceM: number) {
    const R = 6378137;
    const brng = (bearingDeg * Math.PI) / 180;
    const lat1 = (latlng.lat * Math.PI) / 180;
    const lng1 = (latlng.lng * Math.PI) / 180;
    const angDist = distanceM / R;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angDist) + Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1),
        Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2),
      );

    return L.latLng((lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI);
  }

  function azimuthToBearing(azimuthRad: number) {
    const deg = (azimuthRad * 180) / Math.PI;
    return (deg + 180 + 360) % 360;
  }

  function compassWord(bearingDeg: number) {
    const idx = Math.round(bearingDeg / 22.5) % 16;
    return COMPASS_DIRS_SV[idx];
  }

  function buildDateFromInputs() {
    const [y, m, d] = dateInput.value.split("-").map(Number);
    const mins = Number(timeInput.value);
    return new Date(y, m - 1, d, Math.floor(mins / 60), mins % 60);
  }

  function drawCompassRing(center: { lat: number; lng: number }) {
    L.circle(center, {
      radius: RING_RADIUS_M,
      color: "#888",
      weight: 1,
      dashArray: "2 4",
      fill: false,
      interactive: false,
    }).addTo(sunLayer);

    [0, 90, 180, 270].forEach((bearing) => {
      const pt = destinationPoint(center, bearing, RING_RADIUS_M + 6);
      L.marker(pt, {
        icon: L.divIcon({
          html: `<div class="compass-label">${compassWord(bearing)}</div>`,
          className: "",
          iconSize: [24, 16],
          iconAnchor: [12, 8],
        }),
        interactive: false,
      }).addTo(sunLayer);
    });
  }

  function drawBestOrientationWedge(center: { lat: number; lng: number }) {
    const points = [center];
    for (let b = 135; b <= 225; b += 5) {
      points.push(destinationPoint(center, b, RING_RADIUS_M));
    }
    points.push(center);
    L.polygon(points, {
      color: "#b8720a",
      weight: 1,
      fillColor: "#f5a623",
      fillOpacity: 0.25,
      interactive: false,
    }).addTo(sunLayer);
  }

  function drawSunPath(center: { lat: number; lng: number }, date: Date, lat: number, lng: number) {
    const points = [];
    for (let mins = 0; mins < 1440; mins += 8) {
      const t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, mins);
      const pos = SunCalc.getPosition(t, lat, lng);
      if (pos.altitude > 0) {
        const bearing = azimuthToBearing(pos.azimuth);
        points.push(destinationPoint(center, bearing, RING_RADIUS_M));
      }
    }
    if (points.length > 1) {
      L.polyline(points, {
        color: "#b8720a",
        weight: 2,
        dashArray: "1 6",
        lineCap: "round",
        interactive: false,
      }).addTo(sunLayer);
    }
    return points.length > 0;
  }

  function updateSun() {
    if (!dateInput.value) return;
    const center = marker.getLatLng();
    const date = buildDateFromInputs();

    sunLayer.clearLayers();
    drawCompassRing(center);
    drawBestOrientationWedge(center);
    const hasDaylight = drawSunPath(center, date, center.lat, center.lng);

    const pos = SunCalc.getPosition(date, center.lat, center.lng);
    const bearing = azimuthToBearing(pos.azimuth);
    const altitudeDeg = (pos.altitude * 180) / Math.PI;

    timeLabel.textContent = minutesToLabel(Number(timeInput.value));

    if (pos.altitude > 0.01) {
      const sunPt = destinationPoint(center, bearing, RING_RADIUS_M);
      L.marker(sunPt, {
        icon: L.divIcon({
          html: '<div class="sun-pin">☀️</div>',
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        interactive: false,
      }).addTo(sunLayer);

      L.polyline([center, sunPt], {
        color: "#f5a623",
        weight: 2,
        interactive: false,
      }).addTo(sunLayer);

      const shadowLen = Math.min(MAX_SHADOW_M, BUILDING_HEIGHT_M / Math.tan(pos.altitude));
      const shadowPt = destinationPoint(center, (bearing + 180) % 360, shadowLen);
      L.polyline([center, shadowPt], {
        color: "#555",
        weight: 2,
        dashArray: "4 4",
        interactive: false,
      }).addTo(sunLayer);

      readoutAzimuth.textContent = `${compassWord(bearing)} (${Math.round(bearing)}°)`;
      readoutAltitude.textContent = `${altitudeDeg.toFixed(1)}°`;
      readoutShadow.textContent = `${compassWord((bearing + 180) % 360)}, ~${shadowLen.toFixed(1)} m`;
    } else {
      readoutAzimuth.textContent = "Mörkt (solen under horisonten)";
      readoutAltitude.textContent = `${altitudeDeg.toFixed(1)}°`;
      readoutShadow.textContent = "–";
    }

    const times = SunCalc.getTimes(date, center.lat, center.lng);
    if (times.sunrise && !isNaN(times.sunrise.getTime()) && !isNaN(times.sunset.getTime())) {
      const fmt = (d: Date) => d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
      const dayLenMin = Math.round((times.sunset.getTime() - times.sunrise.getTime()) / 60000);
      readoutDaylight.textContent = `${fmt(times.sunrise)}–${fmt(times.sunset)} (${Math.floor(dayLenMin / 60)} tim ${dayLenMin % 60} min)`;
    } else {
      readoutDaylight.textContent = hasDaylight ? "Hela dygnet ljust/mörkt denna dag" : "–";
    }
  }

  dateInput.value = toDateInputValue(new Date());
  timeInput.value = String(nowMinutes());

  const presetButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".furuvagen-page .preset-btn[data-preset]"),
  );

  function clearActivePresets() {
    presetButtons.forEach((b) => b.classList.remove("active"));
  }

  function handleDateInput() {
    clearActivePresets();
    updateSun();
  }
  dateInput.addEventListener("input", handleDateInput);
  timeInput.addEventListener("input", updateSun);

  const todayBtn = document.getElementById("today-btn") as HTMLButtonElement;
  function handleToday() {
    dateInput.value = toDateInputValue(new Date());
    timeInput.value = String(nowMinutes());
    clearActivePresets();
    updateSun();
  }
  todayBtn.addEventListener("click", handleToday);

  function handlePresetClick(this: HTMLButtonElement) {
    const year = new Date().getFullYear();
    const presetDates: Record<string, string> = {
      winter: `${year}-12-21`,
      spring: `${year}-03-20`,
      summer: `${year}-06-21`,
      autumn: `${year}-09-22`,
    };
    dateInput.value = presetDates[this.dataset.preset!];
    clearActivePresets();
    this.classList.add("active");
    updateSun();
  }
  presetButtons.forEach((btn) => btn.addEventListener("click", handlePresetClick));

  let animateTimer: ReturnType<typeof setInterval> | null = null;
  function handleAnimateClick() {
    if (animateTimer) {
      clearInterval(animateTimer);
      animateTimer = null;
      animateBtn.textContent = "▶ Animera dagen";
      return;
    }
    animateBtn.textContent = "⏸ Pausa";
    animateTimer = setInterval(() => {
      let mins = Number(timeInput.value) + 6;
      if (mins > 1439) mins = 0;
      timeInput.value = String(mins);
      updateSun();
    }, 80);
  }
  animateBtn.addEventListener("click", handleAnimateClick);

  updateSun();

  return () => {
    if (animateTimer) clearInterval(animateTimer);
    resetBtn.removeEventListener("click", handleReset);
    dateInput.removeEventListener("input", handleDateInput);
    timeInput.removeEventListener("input", updateSun);
    todayBtn.removeEventListener("click", handleToday);
    presetButtons.forEach((btn) => btn.removeEventListener("click", handlePresetClick));
    animateBtn.removeEventListener("click", handleAnimateClick);
    map.remove();
  };
}
