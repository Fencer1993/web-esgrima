import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17232b",
          borderRadius: 14,
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#1797d1" }}>E</div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#2e8f53" }}>T</div>
      </div>
    ),
    { ...size }
  );
}
