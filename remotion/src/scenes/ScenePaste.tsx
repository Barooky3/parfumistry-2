import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

export const ScenePaste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const code = "9YVMBH7H4CXHCX7J";
  const pasteFrame = 35;
  const typed = frame < pasteFrame ? "" : code;
  const cx = interpolate(frame, [10, 40, 90, 120], [900, 780, 900, 900], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [10, 40, 90, 120], [400, 480, 700, 700], { extrapolateRight: "clamp" });
  const confirm = frame >= 95;
  const success = frame >= 125;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={4} label="Paste code & confirm" />
      <BrowserChrome url="parfumistry.net/rewarble">
        <div style={{ padding: 56, maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 24, background: "#3b82f6",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800,
            }}>R</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>Pay with Rewarble</div>
          </div>
          <div style={{
            marginTop: 24, padding: 20, background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 12, color: "#1e3a8a", fontWeight: 600, fontSize: 18, textAlign: "center",
          }}>Order amount: €27.98</div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#374151" }}>REWARBLE CODE</div>
            <div style={{
              marginTop: 10, height: 64, borderRadius: 10,
              border: pasteFrame <= frame ? "2px solid #3b82f6" : "2px solid #d1d5db",
              background: "#fff", display: "flex", alignItems: "center", padding: "0 18px",
              fontFamily: "monospace", fontSize: 24, color: "#111",
              boxShadow: pasteFrame <= frame ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
            }}>
              {typed}
              <span style={{ opacity: frame % 30 < 15 && frame < pasteFrame ? 1 : 0 }}>|</span>
            </div>
          </div>

          <div style={{
            marginTop: 36, height: 64, borderRadius: 10,
            background: confirm ? "#1d4ed8" : "#3b82f6", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, letterSpacing: 1,
            transform: confirm ? "scale(0.98)" : "scale(1)",
            boxShadow: "0 12px 24px rgba(59,130,246,0.4)",
          }}>
            {success ? "✓ Order Confirmed" : "Confirm Payment"}
          </div>

          {success && (
            <div style={{
              marginTop: 28, padding: 20, background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: 12, color: "#166534", fontSize: 17, fontWeight: 600, textAlign: "center",
            }}>
              🎉 Your order is on its way!
            </div>
          )}
        </div>
        <Cursor x={cx} y={cy} />
      </BrowserChrome>
    </AbsoluteFill>
  );
};
