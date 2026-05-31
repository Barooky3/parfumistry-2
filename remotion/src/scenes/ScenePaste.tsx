import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

// Mirrors the real Rewarble.tsx page: dark theme, purple #7C3AED accent, Gift icon,
// "Order amount" panel, monospace code input, green "Confirm Payment" button.
export const ScenePaste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const code = "9YVMBH7H4CXHCX7J";
  const pasteFrame = 35;
  const typed = frame < pasteFrame ? "" : code;

  // Code input is centered ~y=460 in inner content. Confirm button ~y=720.
  const cx = interpolate(frame, [0, 30, 90, 130], [900, 700, 700, 700], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [0, 30, 90, 130], [400, 460, 720, 720], { extrapolateRight: "clamp" });
  const clickingConfirm = frame >= 95 && frame <= 112;
  const confirm = frame >= 95;
  const success = frame >= 120;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={6} label="Paste code & confirm" />
      <BrowserChrome url="parfumistry.net/rewarble">
        <div style={{ background: "hsl(0 0% 13%)", minHeight: "100%", color: "#fff", display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <div style={{ width: 560 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 56, height: 56, borderRadius: 28, background: "rgba(124,58,237,0.15)", marginBottom: 12,
              }}>
                <span style={{ fontSize: 28 }}>🎁</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>Pay with Rewarble</div>
            </div>

            {/* Order amount */}
            <div style={{
              borderRadius: 12, border: "1px solid rgba(124,58,237,0.35)",
              background: "rgba(124,58,237,0.08)", padding: 16, textAlign: "center", marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 4 }}>Order amount</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>€27.98</div>
            </div>

            {/* Enter code panel */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>Enter your code</div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#d4d4d4" }}>REWARBLE CODE</div>
                <div style={{
                  marginTop: 8, height: 48, borderRadius: 8,
                  border: frame >= pasteFrame ? "2px solid #7C3AED" : "1px solid rgba(255,255,255,0.12)",
                  background: "hsl(0 0% 13%)", display: "flex", alignItems: "center", padding: "0 14px",
                  fontFamily: "monospace", fontSize: 18, color: "#fff",
                  boxShadow: frame >= pasteFrame ? "0 0 0 4px rgba(124,58,237,0.18)" : "none",
                }}>
                  {typed || <span style={{ color: "#666" }}>Paste your Rewarble code here...</span>}
                  <span style={{ opacity: frame % 30 < 15 && frame < pasteFrame ? 1 : 0 }}>|</span>
                </div>

                <div style={{
                  marginTop: 12, height: 36, borderRadius: 8,
                  border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                }}>+ Add another code</div>

                <div style={{
                  marginTop: 12, borderRadius: 8, background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.3)", padding: "10px 14px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#fcd34d", marginBottom: 2 }}>⚠ Send the Rewarble code, not the order number</div>
                  <div style={{ fontSize: 10, color: "#fde68a", lineHeight: 1.5 }}>
                    The code looks like <b style={{ fontFamily: "monospace" }}>9YVMBH7H4CXHCX7J</b>.
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div style={{
              height: 52, borderRadius: 8,
              background: success ? "#15803d" : confirm ? "#16a34a" : "#16a34a",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
              transform: clickingConfirm ? "scale(0.98)" : "scale(1)",
              boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
              opacity: typed ? 1 : 0.4,
            }}>
              {success ? "✓ Order Confirmed" : "✓ Confirm Payment"}
            </div>

            {success && (
              <div style={{
                marginTop: 18, padding: 14, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)",
                borderRadius: 10, color: "#86efac", fontSize: 14, fontWeight: 600, textAlign: "center",
              }}>
                🎉 Your order is on its way!
              </div>
            )}
          </div>
        </div>
        <Cursor x={cx} y={cy} />
        {clickingConfirm && (
          <div style={{
            position: "absolute", left: cx - 16, top: cy - 16,
            width: 36, height: 36, borderRadius: 18,
            border: "3px solid #16a34a", opacity: 1 - (frame - 95) / 17,
            transform: `scale(${1 + (frame - 95) / 12})`,
            pointerEvents: "none",
          }} />
        )}
      </BrowserChrome>
    </AbsoluteFill>
  );
};
