import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TeleBotHost Explore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "64px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 55%, #0d1117 100%)",
          color: "#e6edf3",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#8b949e",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: "1px solid #30363d",
              background: "#21262d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#58a6ff",
            }}
          >
            TB
          </div>
          TeleBotHost
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05 }}>
            Explore
          </div>
          <div style={{ fontSize: 30, color: "#9198a1", maxWidth: 820, lineHeight: 1.35 }}>
            Public developers, bot templates, and community store listings.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#58a6ff" }}>
          teledevs.me
        </div>
      </div>
    ),
    { ...size }
  );
}
