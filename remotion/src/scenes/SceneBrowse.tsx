import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BrowserChrome, Cursor, StepBadge } from "../components/Browser";

export const SceneBrowse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  // Type "rewarble paypal" into search bar
  const typed = "rewarble paypal".slice(0, Math.max(0, Math.floor((frame - 20) / 2.2)));
  // Cursor moves from search bar to first product around frame 90
  const cx = interpolate(frame, [80, 110], [820, 480], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, [80, 110], [180, 480], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickPulse = frame >= 110 && frame <= 125 ? 1 : 0;

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <StepBadge n={1} label="Search Rewarble on G2A" />
      <BrowserChrome url="g2a.com">
        {/* G2A header */}
        <div style={{ height: 70, background: "#ff4500", display: "flex", alignItems: "center", padding: "0 32px" }}>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>G2A.COM</div>
          <div style={{
            marginLeft: 48, flex: 1, height: 44, background: "#fff", borderRadius: 8,
            display: "flex", alignItems: "center", padding: "0 16px", fontSize: 18, color: "#333",
          }}>
            🔍 {typed}<span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>|</span>
          </div>
        </div>
        {/* Product grid */}
        <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              background: "#f5f6f8", borderRadius: 12, padding: 20,
              border: i === 0 && frame >= 105 ? "3px solid #ff4500" : "3px solid transparent",
              transform: i === 0 && frame >= 105 ? "scale(1.02)" : "scale(1)",
            }}>
              <div style={{
                height: 180, background: "linear-gradient(135deg,#003087,#0070ba)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 32, fontWeight: 800,
              }}>PayPal</div>
              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: "#111" }}>
                Rewarble PayPal €{[25, 50, 100][i]}
              </div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: "#ff4500" }}>
                €{[26.49, 52.99, 105.49][i]}
              </div>
            </div>
          ))}
        </div>
        <Cursor x={cx} y={cy} />
        {clickPulse > 0 && (
          <div style={{
            position: "absolute", left: cx - 20, top: cy - 20,
            width: 40, height: 40, borderRadius: 20,
            border: "3px solid #ff4500", opacity: 1 - (frame - 110) / 15,
            transform: `scale(${1 + (frame - 110) / 10})`,
          }} />
        )}
      </BrowserChrome>
    </AbsoluteFill>
  );
};
