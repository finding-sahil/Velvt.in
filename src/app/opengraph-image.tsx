import { ImageResponse } from "next/og";

export const alt = "VELVT — Official Organization & Event Infrastructure";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200, 16, 46, 0.25) 0%, rgba(0, 0, 0, 0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Outer Border Frame */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "24px",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            padding: "8px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(200, 16, 46, 0.4)",
            background: "rgba(200, 16, 46, 0.1)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#c8102e",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.25em",
              color: "#c8102e",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Official Production &amp; Event Platform
          </span>
        </div>

        {/* Main Logo */}
        <div
          style={{
            fontSize: "88px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#ffffff",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "baseline",
            marginBottom: "16px",
          }}
        >
          VELVT
          <span style={{ color: "#c8102e" }}>.in</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#a3a3a3",
            fontStyle: "italic",
            marginBottom: "40px",
            letterSpacing: "0.04em",
          }}
        >
          &quot;It starts as a thought, ends as a memory.&quot;
        </div>

        {/* Event / Experience Badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            VELVT CURSE 2.O
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            EXPERIENTIAL NIGHTLIFE
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            SILCHAR, ASSAM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
