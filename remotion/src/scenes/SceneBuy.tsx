import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

export const SceneBuy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const cx = interpolate(frame, [10, 50, 80, 110], [900, 1320, 1320, 1320], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [10, 50, 80, 110], [500, 540, 740, 740], { extrapolateRight: "clamp" });
  const pay = frame >= 70;
  const paying = frame >= 100;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={2} label="Pay on G2A" />
      <BrowserChrome url="g2a.com/checkout">
        <div style={{ background: "#f5f6f8", minHeight: "100%", padding: 56 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#111" }}>Checkout</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, marginTop: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 16 }}>Payment method</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Credit / Debit card", icon: "💳" },
                  { label: "PayPal", icon: "P", brand: true },
                  { label: "Apple Pay", icon: "" },
                  { label: "Crypto", icon: "₿" },
                ].map((o, i) => {
                  const selected = o.label === "PayPal" && pay;
                  return (
                    <div key={i} style={{
                      padding: "18px 22px", borderRadius: 10,
                      border: selected ? "2px solid #1E9CD7" : "2px solid #e5e7eb",
                      background: selected ? "#eaf6fd" : "#fff",
                      display: "flex", alignItems: "center", gap: 16,
                      fontSize: 17, fontWeight: 600, color: "#111",
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: 12, border: "2px solid #d1d5db", background: selected ? "#1E9CD7" : "#fff" }} />
                      <span style={{ flex: 1 }}>{o.label}</span>
                      {o.brand && <span style={{ color: "#003087", fontWeight: 900, fontSize: 22 }}>Pay<span style={{ color: "#0070ba" }}>Pal</span></span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, height: "fit-content" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Order summary</div>
              <div style={{ marginTop: 16, display: "flex", gap: 14 }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, background: "linear-gradient(180deg,#1E9CD7,#0f7ab0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 900 }}>P</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>PayPal Gift Card 15 USD</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>by Rewarble · GLOBAL</div>
                </div>
              </div>
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #eef0f3", display: "flex", justifyContent: "space-between", fontSize: 14, color: "#374151" }}>
                <span>Subtotal</span><span>16.91 USD</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, color: "#111" }}>
                <span>Total</span><span>16.91 USD</span>
              </div>
              <div style={{
                marginTop: 22, height: 56, borderRadius: 10,
                background: paying ? "#003087" : "#1E9CD7",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800,
                transform: paying ? "scale(0.98)" : "scale(1)",
              }}>
                {paying ? "Processing…" : "Pay 16.91 USD"}
              </div>
            </div>
          </div>
        </div>
        <Cursor x={cx} y={cy} />
      </BrowserChrome>
    </AbsoluteFill>
  );
};
