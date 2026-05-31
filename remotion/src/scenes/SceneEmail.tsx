import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

// Recreates the actual G2A order email visible in Gmail.
export const SceneEmail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const openEmail = frame >= 25;
  // Cursor: drift to "Get order" button by ~frame 90
  const cx = interpolate(frame, [10, 30, 90, 130], [900, 760, 820, 820], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [10, 30, 90, 130], [400, 360, 540, 540], { extrapolateRight: "clamp" });
  const clickGet = frame >= 95 && frame <= 110;
  const buttonPress = frame >= 95;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={3} label="Open the G2A email & press Get order" />
      <BrowserChrome url="mail.google.com">
        <div style={{ display: "flex", height: "100%", background: "#fff" }}>
          {/* Gmail sidebar */}
          <div style={{ width: 240, background: "#f6f8fc", padding: 18, borderRight: "1px solid #e3e6eb" }}>
            <div style={{ padding: "10px 18px", background: "#d3e3fd", borderRadius: 999, fontWeight: 700, color: "#001d35", fontSize: 14 }}>📥 Inbox</div>
            <div style={{ marginTop: 10, color: "#444", fontSize: 13, padding: "10px 18px" }}>⭐ Starred</div>
            <div style={{ color: "#444", fontSize: 13, padding: "10px 18px" }}>📤 Sent</div>
            <div style={{ color: "#444", fontSize: 13, padding: "10px 18px" }}>📋 Drafts</div>
          </div>

          <div style={{ flex: 1, padding: "20px 32px", overflow: "hidden" }}>
            {!openEmail ? (
              <div style={{ borderTop: "1px solid #e3e6eb" }}>
                {[
                  { from: "G2A.COM", subj: "You bought Revolut Gift Card 10 EUR - by Rewarble - GLOBAL from Ultimate_choices (92000153603583)", time: "10:00 PM", bold: true },
                  { from: "Newsletter", subj: "Weekly digest", time: "1h" },
                  { from: "GitHub", subj: "Security alert", time: "3h" },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: "14px 18px", borderBottom: "1px solid #e3e6eb", display: "flex", gap: 16,
                    background: m.bold ? "#fff" : "#fff",
                    fontWeight: m.bold ? 700 : 400, fontSize: 14, color: "#202124",
                  }}>
                    <div style={{ width: 180 }}>{m.from}</div>
                    <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.subj}</div>
                    <div style={{ color: "#5f6368" }}>{m.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {/* Gmail toolbar */}
                <div style={{ fontSize: 22, color: "#202124", fontWeight: 400 }}>
                  You bought Revolut Gift Card 10 EUR - by Rewarble - GLOBAL from Ultimate_choices (92000153603583)
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: "#ef6c00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>G</div>
                  <div style={{ fontSize: 14, color: "#202124" }}>
                    <b>G2A.COM</b> <span style={{ color: "#5f6368" }}>&lt;no-reply@g2a.com&gt;</span>
                    <div style={{ color: "#5f6368", fontSize: 12 }}>to me</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: "#5f6368", fontSize: 12 }}>Tue, May 19, 10:00 PM</div>
                </div>

                {/* Email body */}
                <div style={{ marginTop: 22, border: "1px solid #e3e6eb", borderRadius: 4, padding: 28, background: "#fff" }}>
                  {/* G2A masthead with orange underline */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 10, borderBottom: "4px solid #F15A22" }}>
                    <div style={{ display: "flex", alignItems: "baseline", fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>
                      <span style={{ color: "#F15A22" }}>G</span>
                      <span style={{ color: "#1E9CD7" }}>2A</span>
                      <span style={{ color: "#1E9CD7", fontSize: 10, marginLeft: 2 }}>.COM</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#111", fontWeight: 700 }}>World’s Largest Marketplace for Digital Entertainment</div>
                  </div>

                  <div style={{ marginTop: 24, fontSize: 30, fontWeight: 700, color: "#111" }}>Hello!</div>
                  <div style={{ marginTop: 8, fontSize: 15, color: "#333" }}>Here is your order from Ultimate_choices.</div>

                  {/* Product line */}
                  <div style={{ marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 6, padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
                    {/* Rewarble Revolut card */}
                    <div style={{
                      width: 120, height: 120, borderRadius: 4,
                      background: "#0e0e0e",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      color: "#fff",
                    }}>
                      <div style={{ width: 36, height: 40, background: "#fff", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0e0e0e", fontWeight: 900, fontSize: 22 }}>R</div>
                      <div style={{ fontSize: 9, marginTop: 6, opacity: 0.7 }}>Rewarble</div>
                      <div style={{ marginTop: 12, background: "#fff", color: "#0e0e0e", fontWeight: 800, padding: "2px 10px", fontSize: 14 }}>Revolut</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Revolut Gift Card 10 EUR - by Rewarble - GLOBAL</div>
                      <div style={{
                        marginTop: 12, display: "inline-block",
                        padding: "10px 28px", border: clickGet ? "2px solid #1E9CD7" : "1px solid #1E9CD7",
                        borderRadius: 4, color: "#1E9CD7", fontWeight: 600, fontSize: 14,
                        background: buttonPress && clickGet ? "#eaf6fd" : "#fff",
                      }}>Get order</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "#111" }}>1 x <b>13.33 USD</b></div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>VAT inc. if applicable</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #e5e7eb", fontSize: 14, color: "#111" }}>
                    <span>Total price</span>
                    <b>13.33 USD</b>
                  </div>

                  <div style={{ marginTop: 24, fontSize: 13, color: "#6b7280" }}>Order number</div>
                  <div style={{ fontSize: 15, color: "#111", fontWeight: 600 }}>92000153603583</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Cursor x={cx} y={cy} />
        {clickGet && (
          <div style={{
            position: "absolute", left: cx - 18, top: cy - 18,
            width: 36, height: 36, borderRadius: 18,
            border: "3px solid #1E9CD7", opacity: 1 - (frame - 95) / 15,
            transform: `scale(${1 + (frame - 95) / 12})`,
          }} />
        )}
      </BrowserChrome>
    </AbsoluteFill>
  );
};
