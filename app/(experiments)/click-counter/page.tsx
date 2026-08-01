"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <>
      <style>{`
        .click-counter-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          gap: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #14151a;
          color: #f0f0f0;
        }
        .click-counter-page button {
          font-size: 1.1rem;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          border: 1px solid #2a2b31;
          background: #1c1d23;
          color: #f0f0f0;
          cursor: pointer;
        }
        .click-counter-page button:hover { border-color: #9a9a9a; }
        .click-counter-page #count { font-size: 3rem; font-weight: 700; }
        .click-counter-page a { color: #9a9a9a; font-size: 0.9rem; }
      `}</style>
      <div className="click-counter-page">
        <div id="count">{count}</div>
        <button type="button" onClick={() => setCount((n) => n + 1)}>
          Klicka mig
        </button>
        <p>
          <Link href="/">← Tillbaka till alla experiment</Link>
        </p>
      </div>
    </>
  );
}
