"use client";

/** Last-resort boundary when the root layout itself fails. Must render its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#071426", color: "#fff" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ color: "#f2b705", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
            Anjaan Khabar
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, lineHeight: 1.15, margin: "8px 0 16px" }}>
            We're having trouble loading the site.
          </h1>
          <p style={{ opacity: 0.8, lineHeight: 1.6 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, background: "#d71920", color: "#fff", border: 0, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
