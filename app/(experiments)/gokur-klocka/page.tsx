"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MARKERS = Array.from({ length: 60 }, (_, i) => ({
  major: i % 5 === 0,
  deg: i * 6,
}));

function twoDigits(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default function Page() {
  const [hourDeg, setHourDeg] = useState(0);
  const [minuteDeg, setMinuteDeg] = useState(0);
  const [secondDeg, setSecondDeg] = useState(0);
  const [digitalTime, setDigitalTime] = useState("--:--:--");
  const [isCuckooing, setIsCuckooing] = useState(false);
  const [birdSinging, setBirdSinging] = useState(false);
  const [chirpKey, setChirpKey] = useState(0);
  const [status, setStatus] = useState("");

  const cuckooRef = useRef<(times: number) => void>(() => {});

  useEffect(() => {
    let isCuckooingNow = false;
    let lastCuckooHour: number | null = null;
    let audioCtx: AudioContext | null = null;

    function playCuckooSound() {
      try {
        const AudioCtxCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtx = audioCtx || new AudioCtxCtor();
        const ctx = audioCtx;
        const now = ctx.currentTime;
        [
          { freq: 784, start: 0, dur: 0.16 },
          { freq: 659, start: 0.16, dur: 0.2 },
        ].forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = note.freq;
          gain.gain.setValueAtTime(0.0001, now + note.start);
          gain.gain.exponentialRampToValueAtTime(0.28, now + note.start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + note.start);
          osc.stop(now + note.start + note.dur + 0.02);
        });
      } catch {
        // Web Audio otillgängligt (t.ex. innan användarinteraktion) — animationen körs ändå.
      }
    }

    function cuckoo(times: number) {
      if (isCuckooingNow) return;
      isCuckooingNow = true;
      setIsCuckooing(true);
      setStatus("Kuku!");

      let count = 0;
      const total = times || 1;

      function callOnce() {
        count++;
        playCuckooSound();
        setBirdSinging(false);
        setChirpKey((k) => k + 1);
        setBirdSinging(true);

        if (count < total) {
          setTimeout(callOnce, 550);
        } else {
          setTimeout(() => {
            isCuckooingNow = false;
            setIsCuckooing(false);
            setBirdSinging(false);
            setStatus("");
          }, 500);
        }
      }

      callOnce();
    }

    cuckooRef.current = cuckoo;

    function updateClock() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      setHourDeg(((h % 12) + m / 60) * 30);
      setMinuteDeg((m + s / 60) * 6);
      setSecondDeg(s * 6);
      setDigitalTime(`${twoDigits(h)}:${twoDigits(m)}:${twoDigits(s)}`);

      if (m === 0 && s === 0 && lastCuckooHour !== h) {
        lastCuckooHour = h;
        cuckoo(h % 12 === 0 ? 12 : h % 12);
      }
    }

    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  function handleTrigger() {
    const now = new Date();
    const h = now.getHours();
    cuckooRef.current(h % 12 === 0 ? 12 : h % 12);
  }

  return (
    <>
      <style>{`
        .gokur-page, .gokur-page * {
          box-sizing: border-box;
        }

        .gokur-page {
          color-scheme: light dark;
          --wood-dark: #6b3f24;
          --wood: #8a5a34;
          --wood-light: #a9754a;
          --wood-trim: #5a3016;
          --face: #f4ecd8;
          --face-edge: #d8c7a0;

          margin: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: radial-gradient(circle at 50% 20%, #efe3cf, #cbb894 70%, #a99566);
        }

        @media (prefers-color-scheme: dark) {
          .gokur-page { background: radial-gradient(circle at 50% 20%, #3a2c1d, #241a10 70%, #140f0a); }
        }

        .gokur-page h1 { margin: 0; font-size: 1.3rem; color: #3d2a17; }
        @media (prefers-color-scheme: dark) { .gokur-page h1 { color: #e9dcc4; } }

        .gokur-page .scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        /* ---------- Huset ---------- */
        .gokur-page .clock-house {
          position: relative;
          width: 300px;
          filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.35));
        }

        .gokur-page .roof {
          position: relative;
          width: 0;
          height: 0;
          margin: 0 auto;
          border-left: 170px solid transparent;
          border-right: 170px solid transparent;
          border-bottom: 90px solid var(--wood-trim);
          filter: drop-shadow(0 4px 0 rgba(0,0,0,0.15));
        }
        .gokur-page .roof::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -14px;
          transform: translateX(-50%);
          width: 26px;
          height: 26px;
          background: var(--wood-dark);
          border-radius: 50%;
          box-shadow: 0 0 0 4px var(--wood-trim);
        }

        .gokur-page .body {
          position: relative;
          margin-top: -4px;
          background: linear-gradient(180deg, var(--wood-light), var(--wood) 40%, var(--wood-dark));
          border: 6px solid var(--wood-trim);
          border-top: none;
          border-radius: 0 0 18px 18px;
          padding: 78px 22px 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gokur-page .body::before,
        .gokur-page .body::after {
          content: "";
          position: absolute;
          top: 10px;
          width: 10px;
          height: calc(100% - 20px);
          background: rgba(0, 0, 0, 0.15);
          border-radius: 6px;
        }
        .gokur-page .body::before { left: 12px; }
        .gokur-page .body::after { right: 12px; }

        .gokur-page .decor-leaf {
          position: absolute;
          bottom: -6px;
          width: 34px;
          height: 34px;
          background: #5c7a3a;
          border-radius: 50% 10% 50% 10%;
          box-shadow: inset 0 0 0 2px #3f5726;
        }
        .gokur-page .decor-leaf.left { left: -8px; transform: rotate(-20deg); }
        .gokur-page .decor-leaf.right { right: -8px; transform: rotate(110deg); }

        /* ---------- Dörren där göken bor ---------- */
        .gokur-page .door-frame {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: 74px;
          height: 58px;
        }

        .gokur-page .door-hole {
          position: absolute;
          inset: 0;
          background: #241505;
          border-radius: 12px 12px 4px 4px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }

        .gokur-page .door {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          background: linear-gradient(180deg, var(--wood-light), var(--wood-dark));
          border: 2px solid var(--wood-trim);
          transition: transform 0.35s ease;
          transform-origin: top;
        }
        .gokur-page .door.left { left: 0; border-radius: 12px 0 0 4px; transform-origin: left top; }
        .gokur-page .door.right { right: 0; border-radius: 0 12px 4px 0; transform-origin: right top; }

        .gokur-page .clock-house.cuckooing .door.left { transform: rotateY(78deg); }
        .gokur-page .clock-house.cuckooing .door.right { transform: rotateY(-78deg); }

        .gokur-page .bird {
          position: absolute;
          left: 50%;
          bottom: 6px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          line-height: 1;
          transform: translate(-50%, 60%) scale(0.3);
          opacity: 0;
          transition: transform 0.25s ease, opacity 0.25s ease;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));
        }

        .gokur-page .clock-house.cuckooing .bird {
          opacity: 1;
          transform: translate(-50%, -6px) scale(1);
        }

        .gokur-page .clock-house.cuckooing .bird.singing {
          animation: gokur-chirp 0.22s ease-in-out;
        }

        @keyframes gokur-chirp {
          0%, 100% { transform: translate(-50%, -6px) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -10px) scale(1.08) rotate(-8deg); }
        }

        /* ---------- Urtavlan ---------- */
        .gokur-page .clock-face {
          position: relative;
          width: 168px;
          height: 168px;
          border-radius: 50%;
          background: var(--face);
          border: 6px solid var(--face-edge);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4) inset, 0 2px 6px rgba(0,0,0,0.3);
        }

        .gokur-page .marker {
          position: absolute;
          left: 50%;
          top: 4px;
          width: 2px;
          height: 10px;
          background: #4a3520;
          transform-origin: 1px 80px;
        }
        .gokur-page .marker.major { width: 3px; height: 14px; background: #241505; }

        .gokur-page .hand {
          position: absolute;
          left: 50%;
          bottom: 50%;
          transform-origin: 50% 100%;
          border-radius: 4px;
          background: #241505;
        }
        .gokur-page .hand.hour { width: 6px; height: 46px; margin-left: -3px; }
        .gokur-page .hand.minute { width: 4px; height: 66px; margin-left: -2px; background: #3a2510; }
        .gokur-page .hand.second { width: 2px; height: 74px; margin-left: -1px; background: #a3241a; }

        .gokur-page .center-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 12px;
          margin: -6px 0 0 -6px;
          background: #241505;
          border-radius: 50%;
          box-shadow: 0 0 0 2px var(--face);
        }

        .gokur-page .digital-time {
          margin-top: 14px;
          font-family: "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.85rem;
          color: #f4ecd8;
          letter-spacing: 0.05em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        /* ---------- Pendel ---------- */
        .gokur-page .pendulum-box {
          margin-top: 8px;
          width: 30px;
          height: 60px;
          overflow: hidden;
          display: flex;
          justify-content: center;
        }
        .gokur-page .pendulum {
          width: 4px;
          height: 60px;
          background: linear-gradient(180deg, transparent, #d9b366 70%);
          transform-origin: top center;
          animation: gokur-swing 1.4s ease-in-out infinite;
        }
        .gokur-page .pendulum::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 20px;
          height: 20px;
          margin-left: -10px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #f2d48a, #b98a2d);
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        @keyframes gokur-swing {
          0%, 100% { transform: rotate(-14deg); }
          50% { transform: rotate(14deg); }
        }

        /* ---------- Kontroller ---------- */
        .gokur-page .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .gokur-page button {
          font-size: 1rem;
          font-family: inherit;
          padding: 0.6rem 1.3rem;
          border-radius: 999px;
          border: none;
          background: #8a5a34;
          color: #fff8ec;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          transition: transform 0.1s ease, background 0.2s ease;
        }
        .gokur-page button:hover { background: #a9754a; }
        .gokur-page button:active { transform: scale(0.96); }
        .gokur-page button:disabled { opacity: 0.5; cursor: default; }

        .gokur-page .status {
          min-height: 1.2em;
          font-size: 0.85rem;
          color: #4a3520;
        }
        @media (prefers-color-scheme: dark) { .gokur-page .status { color: #d9c69f; } }

        .gokur-page .back-link {
          font-size: 0.85rem;
        }
        .gokur-page .back-link a {
          color: inherit;
        }
      `}</style>
      <div className="gokur-page">
        <h1>🐦 Gökur</h1>

        <div className="scene">
          <div className={`clock-house${isCuckooing ? " cuckooing" : ""}`}>
            <div className="roof" />

            <div className="door-frame">
              <div className="door-hole" />
              <div className="door left" />
              <div className="door right" />
              <div key={chirpKey} className={`bird${birdSinging ? " singing" : ""}`}>
                🐦
              </div>
            </div>

            <div className="body">
              <div className="decor-leaf left" />
              <div className="decor-leaf right" />

              <div className="clock-face">
                {MARKERS.map((marker, i) => (
                  <div
                    key={i}
                    className={`marker${marker.major ? " major" : ""}`}
                    style={{ transform: `rotate(${marker.deg}deg)` }}
                  />
                ))}
                <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
                <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
                <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
                <div className="center-dot" />
              </div>

              <div className="digital-time">{digitalTime}</div>

              <div className="pendulum-box">
                <div className="pendulum" />
              </div>
            </div>
          </div>

          <div className="controls">
            <button type="button" disabled={isCuckooing} onClick={handleTrigger}>
              Väck göken 🐦
            </button>
            <div className="status">{status}</div>
          </div>
        </div>

        <p className="back-link">
          <Link href="/">← Tillbaka till alla experiment</Link>
        </p>
      </div>
    </>
  );
}
