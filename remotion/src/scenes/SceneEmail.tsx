import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

export const SceneEmail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const openEmail = frame >= 40;
  const highlight = frame >= 90;
  const copyPulse = frame >= 115 && frame <= 135;
  const cx = interpolate(frame, [10, 40, 90, 115], [800, 760, 1100, 1100], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [10, 40, 90, 115], [400, 360, 620, 620], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={3} label="Get your code by email" />
      <BrowserChrome url="mail.google.com">
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ width: 260, background: "#f6f8fc", padding: 24, borderRight: "1px solid #e3e6eb" }}>
            <div style={{ padding: "12px 16px", background: "#fce8e6", borderRadius: 999, fontWeight: 700, color: "#d93025", fontSize: 16 }}>Inbox</div>
            <div style={{ marginTop: 16, color: "#666", fontSize: 14, padding: "8px 16px" }}>Starred</div>
            <div style={{ color: "#666", fontSize: 14, padding: "8px 16px" }}>Sent</div>
          </div>
          <div style={{ flex: 1, padding: 32 }}>
            {!openEmail ? (
              <div style={{ borderTop: "1px solid #e3e6eb" }}>
                {[
                  { from: "G2A.COM", subj: "Your Rewarble PayPal code is ready 🎉", time: "now", bold: true },
                  { from: "Newsletter", subj: "Weekly digest", time: "1h" },
                  { from: "GitHub", subj: "Security alert", time: "3h" },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: "16px 20px", borderBottom: "1px solid #e3e6eb", display: "flex", gap: 16,
                    background: m.bold ? "#fffbe6" : "#fff",
                    fontWeight: m.bold ? 700 : 400, fontSize: 16, color: "#111",
                  }}>
                    <div style={{ width: 180 }}>{m.from}</div>
                    <div style={{ flex: 1 }}>{m.subj}</div>
                    <div style={{ color: "#666" }}>{m.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>Your Rewarble PayPal code is ready 🎉</div>
                <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>G2A.COM &lt;noreply@g2a.com&gt; — to you</div>
                <div style={{ marginTop: 24, fontSize: 17, color: "#222", lineHeight: 1.7 }}>
                  Thanks for your purchase! Here is your Rewarble gift card code. Copy it and paste it on the merchant page to complete your order.
                </div>
                <div style={{
                  marginTop: 32, padding: 28, background: "#0f1320", borderRadius: 12,
                  border: highlight ? "3px solid #3b82f6" : "3px solid transparent",
                  boxShadow: highlight ? "0 0 40px rgba(59,130,246,0.4)" : "none",
                }}>
                  <div style={{ color: "#9aa3b2", fontSize: 13, letterSpacing: 2, fontWeight: 600 }}>YOUR REWARBLE CODE</div>
                  <div style={{
                    marginTop: 12, color: "#fff", fontFamily: "monospace", fontSize: 38, fontWeight: 700, letterSpacing: 4,
                  }}>9YVMBH7H4CXHCX7J</div>
                  {copyPulse && (
                    <div style={{ marginTop: 12, color: "#22c55e", fontSize: 16, fontWeight: 600 }}>✓ Copied to clipboard</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <Cursor x={cx} y={cy} />
      </BrowserChrome>
    </AbsoluteFill>
  );
};
