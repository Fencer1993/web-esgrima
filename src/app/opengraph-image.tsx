import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#17232b",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "45%",
            background: "#2e8f53",
            transform: "skewX(-12deg) translateX(60px)",
          }}
        />
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#1797d1" }}>
          TORREMOLINOS · MÁLAGA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#ffffff", lineHeight: 1.05 }}>
            Club de Esgrima
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#ffffff", lineHeight: 1.05 }}>
            Torremolinos
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.75)", marginTop: 28 }}>
            Clases de esgrima para niños, adultos y esgrima adaptada
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
