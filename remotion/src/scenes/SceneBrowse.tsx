import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

// G2A brand: orange G (#F15A22) + blue 2A (#1E9CD7), dark navy nav (#0B0B0F)
const G2ALogo: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 0, fontWeight: 900, fontSize: size, letterSpacing: -1, lineHeight: 1 }}>
    <span style={{ color: "#F15A22" }}>G</span>
    <span style={{ color: "#1E9CD7" }}>2A</span>
    <span style={{ color: "#1E9CD7", fontSize: size * 0.28, marginLeft: 2, transform: "translateY(-6px)" }}>.COM</span>
  </div>
);

const G2AHeader: React.FC<{ search: string; caret: boolean }> = ({ search, caret }) => (
  <>
    <div style={{ height: 78, background: "#fff", display: "flex", alignItems: "center", padding: "0 32px", borderBottom: "1px solid #eef0f3" }}>
      <G2ALogo />
      <div style={{
        marginLeft: 32, flex: 1, height: 48, background: "#fff", border: "2px solid #e5e7eb",
        borderRadius: 999, display: "flex", alignItems: "center", padding: "0 4px 0 22px", fontSize: 16, color: "#111",
      }}>
        <span style={{ flex: 1 }}>{search}<span style={{ opacity: caret ? 1 : 0 }}>|</span></span>
        <div style={{ padding: "0 16px", borderLeft: "1px solid #e5e7eb", color: "#6b7280", fontSize: 14, height: 28, display: "flex", alignItems: "center" }}>All categories ▾</div>
        <div style={{ marginLeft: 4, width: 44, height: 40, borderRadius: 999, background: "#1E9CD7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>🔍</div>
      </div>
      <div style={{ marginLeft: 24, display: "flex", alignItems: "center", gap: 18, color: "#111", fontSize: 13, fontWeight: 600 }}>
        <div style={{ padding: "6px 12px", background: "#111", color: "#fff", borderRadius: 8 }}>EN / USD</div>
        <div>Sign in</div>
        <div>♡</div>
        <div>🛒</div>
      </div>
    </div>
    <div style={{ height: 50, background: "#fff", borderBottom: "1px solid #eef0f3", display: "flex", alignItems: "center", padding: "0 32px", gap: 32, fontSize: 14, color: "#111", fontWeight: 600 }}>
      <span>🎮 Gaming</span>
      <span>💻 Software</span>
      <span>📺 Subscriptions</span>
      <span style={{ color: "#F15A22" }}>🎁 Gift cards</span>
      <span>🎲 Random Weekend</span>
      <span>🏷 OUTLET</span>
      <span style={{ color: "#7c3aed" }}>+ Pay less with G2A Plus</span>
    </div>
  </>
);

export const SceneBrowse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const typed = "rewarble paypal".slice(0, Math.max(0, Math.floor((frame - 15) / 2)));
  const showResults = frame >= 55;
  const cx = interpolate(frame, [60, 95], [820, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, [60, 95], [180, 540], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const highlight = frame >= 92;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={1} label="Search Rewarble on G2A" />
      <BrowserChrome url="g2a.com/search?query=rewarble+paypal">
        <div style={{ background: "#f5f6f8", minHeight: "100%" }}>
          <G2AHeader search={typed} caret={frame % 30 < 15 && frame < 55} />
          {showResults && (
            <div style={{ padding: "28px 56px" }}>
              <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 12 }}>SPONSORED</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#111" }}>‘rewarble paypal’ — search results</div>
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>288 items</div>
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { amt: "15 USD", price: "16.91" },
                  { amt: "20 USD", price: "24.40" },
                  { amt: "10 USD", price: "12.48" },
                ].map((p, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 24,
                    border: i === 0 && highlight ? "3px solid #F15A22" : "3px solid transparent",
                    transform: i === 0 && highlight ? "scale(1.01)" : "scale(1)",
                    boxShadow: i === 0 && highlight ? "0 12px 30px rgba(241,90,34,0.25)" : "0 1px 2px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{
                      width: 160, height: 160, borderRadius: 10, background: "linear-gradient(180deg,#1E9CD7,#0f7ab0)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 56, fontWeight: 900,
                    }}>P</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>PayPal Gift Card {p.amt}</div>
                      <div style={{ marginTop: 8, fontSize: 13, color: "#444", lineHeight: 1.7 }}>
                        Platform <b style={{ marginLeft: 8 }}>by Rewarble</b><br/>
                        Type <b style={{ marginLeft: 38 }}>Key</b><br/>
                        Region <b style={{ marginLeft: 26, color: "#16a34a" }}>GLOBAL</b>
                      </div>
                      <div style={{ marginTop: 8, color: "#16a34a", fontSize: 13, fontWeight: 600 }}>✓ Can activate in: United States</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>{p.price} <span style={{ fontSize: 18, color: "#6b7280" }}>USD</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Cursor x={cx} y={cy} />
        </div>
      </BrowserChrome>
    </AbsoluteFill>
  );
};
