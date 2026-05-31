import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

export const SceneBuy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const cx = interpolate(frame, [30, 70, 90, 130], [900, 1380, 1380, 1380], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [30, 70, 90, 130], [500, 500, 720, 720], { extrapolateRight: "clamp" });
  const showCheckout = frame >= 75;
  const pay = frame >= 125;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={2} label="Pay with PayPal on G2A" />
      <BrowserChrome url="g2a.com/checkout">
        {!showCheckout ? (
          <div style={{ padding: 48, display: "flex", gap: 40 }}>
            <div style={{
              width: 360, height: 360, background: "linear-gradient(135deg,#003087,#0070ba)",
              borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 56, fontWeight: 800,
            }}>PayPal</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#111" }}>Rewarble PayPal €25</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#ff4500", marginTop: 12 }}>€26.49</div>
              <div style={{ marginTop: 20, color: "#555", fontSize: 18, lineHeight: 1.6 }}>
                Instant email delivery • Global voucher<br/>Top up your Rewarble balance and pay anywhere.
              </div>
              <div style={{
                marginTop: 40, padding: "20px 32px", background: "#ff4500", color: "#fff",
                borderRadius: 8, fontSize: 22, fontWeight: 700, display: "inline-block",
                transform: frame >= 60 ? "scale(1.04)" : "scale(1)",
                boxShadow: frame >= 60 ? "0 8px 20px rgba(255,69,0,0.5)" : "none",
              }}>Buy now</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 48 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>Choose payment method</div>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Credit / Debit card", bg: "#f5f6f8" },
                { label: "PayPal", bg: pay ? "#e6f2fb" : "#f5f6f8", border: pay ? "3px solid #0070ba" : "3px solid transparent" },
                { label: "Crypto", bg: "#f5f6f8" },
              ].map((o, i) => (
                <div key={i} style={{
                  padding: "20px 24px", background: o.bg, border: o.border || "3px solid transparent",
                  borderRadius: 12, fontSize: 20, fontWeight: 600, color: "#111",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{o.label}</span>
                  {o.label === "PayPal" && (
                    <span style={{ color: "#0070ba", fontWeight: 800, fontSize: 22 }}>PayPal</span>
                  )}
                </div>
              ))}
            </div>
            {pay && (
              <div style={{
                marginTop: 40, padding: "20px 40px", background: "#0070ba", color: "#fff",
                borderRadius: 10, fontSize: 22, fontWeight: 700, display: "inline-block",
              }}>Pay €26.49 with PayPal</div>
            )}
          </div>
        )}
        <Cursor x={cx} y={cy} />
      </BrowserChrome>
    </AbsoluteFill>
  );
};
