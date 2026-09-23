import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OpenGraph share image rendered at request time: brand blue, wordmark, and
// the three-pillar tagline. No external assets required.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#101828", letterSpacing: "-0.02em" }}>
            Cognia Quest
          </div>
        </div>
        <div>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#101828", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Learn AI. Question AI.
            <br />
            Use AI Responsibly.
          </div>
          <div style={{ fontSize: 30, color: "#475467", marginTop: 24 }}>
            Interactive AI learning for high school students.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#0284c7", fontWeight: 600 }}>
          <span>Learn</span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span>Experiment</span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span>Question</span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span>Build</span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span>Master</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
