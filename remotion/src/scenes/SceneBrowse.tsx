import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

const G2ALogo: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 0, fontWeight: 900, fontSize: size, letterSpacing: -1, lineHeight: 1 }}>
    <span style={{ color: "#F15A22" }}>G</span>
    <span style={{ color: "#1E9CD7" }}>2A</span>
    <span style={{ color: "#1E9CD7", fontSize: size * 0.28, marginLeft: 2, transform: "translateY(-6px)" }}>.COM</span>
  </div>
);

const G2AHeader: React.FC<{ search: string; caret: boolean }> = ({ search, caret }) => (
  <>
    <div style={{ height: 70, background: "#fff", display: "flex", alignItems: "center", padding: "0 32px", borderBottom: "1px solid #eef0f3" }}>
      <G2ALogo />
      <div style={{
        marginLeft: 32, flex: 1, height: 44, background: "#fff", border: "2px solid #e5e7eb",
        borderRadius: 999, display: "flex", alignItems: "center", padding: "0 4px 0 22px", fontSize: 15, color: "#111",
      }}>
        <span style={{ flex: 1 }}>{search}<span style={{ opacity: caret ? 1 : 0 }}>|</span></span>
        <div style={{ padding: "0 16px", borderLeft: "1px solid #e5e7eb", color: "#6b7280", fontSize: 13, height: 26, display: "flex", alignItems: "center" }}>All categories ▾</div>
        <div style={{ marginLeft: 4, width: 40, height: 36, borderRadius: 999, background: "#1E9CD7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>🔍</div>
      </div>
      <div style={{ marginLeft: 24, display: "flex", alignItems: "center", gap: 18, color: "#111", fontSize: 13, fontWeight: 600 }}>
        <div style={{ padding: "6px 12px", background: "#111", color: "#fff", borderRadius: 8 }}>EN / EUR</div>
        <div>Sign in</div>
        <div>♡</div>
        <div>🛒</div>
      </div>
    </div>
    <div style={{ height: 46, background: "#fff", borderBottom: "1px solid #eef0f3", display: "flex", alignItems: "center", padding: "0 32px", gap: 32, fontSize: 13, color: "#111", fontWeight: 600 }}>
      <span>🎮 Gaming</span>
      <span>💻 Software</span>
      <span>📺 Subscriptions</span>
      <span style={{ color: "#F15A22" }}>🎁 Gift cards</span>
      <span>🏷 OUTLET</span>
      <span style={{ color: "#7c3aed" }}>+ Pay less with G2A Plus</span>
    </div>
  </>
);

export const SceneBrowse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const typed = "paypal rewarble 30 eur".slice(0, Math.max(0, Math.floor((frame - 10) / 2)));
  const showResults = frame >= 55;

  // Cursor: at f60 sits near right; drifts to the FIRST product card body (title area), clicks at f100.
  // Card top ~ y=186, card padding 16, title at ~y=212. Click on title around (520, 220).
  const targetX = 520;
  const targetY = 220;
  const cx = interpolate(frame, [55, 95, 105, 130], [1200, targetX - 2, targetX - 2, targetX - 2], { extrapolateRight: "clamp" });
  const cy = interpolate(frame, [55, 95, 105, 130], [320, targetY - 2, targetY - 2, targetY - 2], { extrapolateRight: "clamp" });
  const clicking = frame >= 100 && frame <= 112;
  const highlight = frame >= 92;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={2} label="Search PayPal Rewarble on G2A" />
      <BrowserChrome url="g2a.com/search?query=paypal+rewarble+30+eur">
        <div style={{ background: "#f5f6f8", minHeight: "100%" }}>
          <G2AHeader search={typed} caret={frame % 30 < 15 && frame < 55} />
          {showResults && (
            <div style={{ padding: "22px 56px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>‘paypal rewarble 30 eur’ — search results</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>128 items</div>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { amt: "30 EUR", price: "30.00" },
                  { amt: "25 EUR", price: "26.50" },
                  { amt: "20 EUR", price: "21.20" },
                ].map((p, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 22,
                    border: i === 0 && highlight ? "3px solid #F15A22" : "3px solid transparent",
                    transform: i === 0 && highlight ? "scale(1.01)" : "scale(1)",
                    boxShadow: i === 0 && highlight ? "0 12px 30px rgba(241,90,34,0.25)" : "0 1px 2px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{
                      width: 140, height: 140, borderRadius: 10, background: "linear-gradient(180deg,#003087,#0070ba)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 900,
                    }}>
                      <div style={{ fontSize: 32, lineHeight: 1 }}>Pay<span style={{ color: "#00bcd4" }}>Pal</span></div>
                      <div style={{ marginTop: 8, background: "#fff", color: "#003087", fontWeight: 800, padding: "2px 10px", fontSize: 13, borderRadius: 3 }}>Rewarble</div>
                      <div style={{ marginTop: 8, fontSize: 16, opacity: 0.9 }}>{p.amt}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>PayPal Gift Card {p.amt} - by Rewarble - GLOBAL</div>
                      <div style={{ marginTop: 8, fontSize: 13, color: "#444", lineHeight: 1.8 }}>
                        Platform <b style={{ marginLeft: 8 }}>by Rewarble</b><br/>
                        Type <b style={{ marginLeft: 38 }}>Key</b><br/>
                        Region <b style={{ marginLeft: 26, color: "#16a34a" }}>GLOBAL</b>
                      </div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#111" }}>{p.price} <span style={{ fontSize: 16, color: "#6b7280" }}>EUR</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Cursor x={cx} y={cy} />
          {clicking && (
            <div style={{
              position: "absolute", left: cx - 16, top: cy - 16,
              width: 36, height: 36, borderRadius: 18,
              border: "3px solid #F15A22", opacity: Math.max(0, 1 - (frame - 100) / 12),
              transform: `scale(${1 + (frame - 100) / 10})`,
              pointerEvents: "none",
            }} />
          )}
        </div>
      </BrowserChrome>
    </AbsoluteFill>
  );
};
