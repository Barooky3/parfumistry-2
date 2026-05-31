import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

// G2A "Get order" page (after clicking Get order in the email).
// Shows seller info, the SafeKeys delivery panel with the code already revealed, and a Copy button.
export const SceneGetKey: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const code = "HS8UTBT272X2KR5B";
  const cx = interpolate(frame, [10, 60, 95, 130], [900, 1280, 1280, 1280], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [10, 60, 95, 130], [400, 720, 720, 720], { extrapolateRight: "clamp" });
  const copyPulse = frame >= 70 && frame <= 95;
  const copied = frame >= 80;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={4} label="Copy your code from G2A" />
      <BrowserChrome url="g2a.com/page/get-key">
        <div style={{ background: "#f5f6f8", minHeight: "100%" }}>
          {/* Mini G2A top */}
          <div style={{ height: 64, background: "#fff", display: "flex", alignItems: "center", padding: "0 32px", borderBottom: "1px solid #eef0f3" }}>
            <div style={{ display: "flex", alignItems: "baseline", fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>
              <span style={{ color: "#F15A22" }}>G</span>
              <span style={{ color: "#1E9CD7" }}>2A</span>
              <span style={{ color: "#1E9CD7", fontSize: 10, marginLeft: 2 }}>.COM</span>
            </div>
          </div>

          <div style={{ padding: "32px 80px" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#111" }}>Get order</div>

            {/* Dark hero card */}
            <div style={{
              marginTop: 20, background: "#0b1220",
              borderRadius: 14, padding: 32, color: "#fff",
              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.04) 75%, transparent 75%)",
              backgroundSize: "80px 80px",
            }}>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{
                  width: 130, height: 130, background: "#0e0e0e",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRadius: 4,
                }}>
                  <div style={{ width: 40, height: 44, background: "#fff", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0e0e0e", fontWeight: 900, fontSize: 24 }}>R</div>
                  <div style={{ fontSize: 9, marginTop: 6, opacity: 0.7 }}>Rewarble</div>
                  <div style={{ marginTop: 10, background: "#fff", color: "#0e0e0e", fontWeight: 800, padding: "2px 10px", fontSize: 14 }}>Revolut</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>Revolut Gift Card 10 EUR - by Rewarble - GLOBAL</div>
                  <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.9, color: "#cbd5e1" }}>
                    Platform: <b style={{ color: "#fff" }}>by Rewarble</b><br/>
                    Type: <b style={{ color: "#fff" }}>Key</b><br/>
                    Region: <b style={{ color: "#fff" }}>GLOBAL</b>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, fontSize: 13, color: "#cbd5e1" }}>
                Vendor: <b style={{ color: "#fff" }}>Ultimate_choices</b> · <span style={{ color: "#1E9CD7" }}>Contact seller</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#cbd5e1" }}>
                Order number: <b style={{ color: "#fff" }}>92000153603583</b>
              </div>

              {/* SafeKeys panel */}
              <div style={{ marginTop: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 14 }}>
                    <span style={{ color: "#1E9CD7" }}>⌬</span> <b>SafeKeys</b>
                  </div>
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>Secure digital item delivery platform</div>
                </div>

                <div style={{
                  marginTop: 16, background: "rgba(255,160,40,0.08)",
                  border: "1px solid #f59e0b", borderRadius: 8, padding: "14px 18px",
                }}>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13 }}>⚠ Be careful — keep your gift card safe</div>
                  <div style={{ marginTop: 4, color: "#fde68a", fontSize: 12, lineHeight: 1.5 }}>
                    Never share your gift card with anyone promising a bonus. They may try to gain unauthorized access.
                  </div>
                </div>

                <div style={{
                  marginTop: 18, background: "#fff", borderRadius: 8, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: copyPulse ? "0 0 0 4px rgba(30,156,215,0.35)" : "none",
                }}>
                  <div style={{ flex: 1, fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: 2 }}>{code}</div>
                  <div style={{
                    background: "#111", color: "#fff", padding: "10px 22px",
                    borderRadius: 8, fontSize: 14, fontWeight: 700,
                    transform: copyPulse ? "scale(0.96)" : "scale(1)",
                  }}>{copied ? "✓ Copied" : "Copy"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Cursor x={cx} y={cy} />
      </BrowserChrome>
    </AbsoluteFill>
  );
};
