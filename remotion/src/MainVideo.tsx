import { AbsoluteFill, Series } from "remotion";
import { SceneBrowse } from "./scenes/SceneBrowse";
import { SceneBuy } from "./scenes/SceneBuy";
import { SceneEmail } from "./scenes/SceneEmail";
import { ScenePaste } from "./scenes/ScenePaste";
import { loadFont } from "@remotion/google-fonts/Inter";

loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f17", fontFamily: "Inter, sans-serif" }}>
      <Series>
        <Series.Sequence durationInFrames={150}>
          <SceneBrowse />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <SceneBuy />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <SceneEmail />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <ScenePaste />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
