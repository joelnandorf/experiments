import Link from "next/link";

export default function Page() {
  return (
    <>
      <style>{`
        .hello-world-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #14151a;
          color: #f0f0f0;
        }
        .hello-world-page main { text-align: center; }
        .hello-world-page h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .hello-world-page p { color: #9a9a9a; }
        .hello-world-page a { color: inherit; }
      `}</style>
      <div className="hello-world-page">
        <main>
          <h1>👋 Hello, experiment!</h1>
          <p>Detta är ett exempel-experiment som bevisar att pipelinen fungerar.</p>
          <p>
            <Link href="/">← Tillbaka till alla experiment</Link>
          </p>
        </main>
      </div>
    </>
  );
}
