import { useRef, useEffect, useContext } from "react";

import { Moonrise } from "../../viz/scenes/moonrise/Moonrise";
import { Mornings } from "../../viz/scenes/mornings/Mornings";
import { Swamp } from "../../viz/scenes/swamp/Swamp";

// scene base
import { SceneManager } from "../../viz/SceneManager";
import { RuntimeScene } from "../../viz/runtime/RuntimeScene";
import { BakedSignalSource } from "../../viz/runtime/bakedSignal";
import { createStemProvider } from "../../viz/runtime/stemProvider";
import { loadSongBakes, warnIfStale } from "../../viz/runtime/bakeLoader";
import type { BakeResult } from "../../viz/runtime/bake/bakeSignal";

import { SongContext } from "../../contexts/contexts";
import { TestingContext } from "../../contexts/contexts";
import { ThemeContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";
import { CanvasFade } from "./CanvasFade";
import {
  cinematicResize,
  addWindowListeners,
  removeWindowListeners,
} from "../../utils/jsUtils";
import { canvasVizParent, canvasViz } from "../../styles/components/CanvasViz.css";
import { cx } from "../../utils/cx";

interface Props {
  songLoadStatus: boolean;
  handleSetCanvasLoadStatus: (status: boolean) => void;
}

export const CanvasViz = (props: Props) => {
  const { songLoadStatus, handleSetCanvasLoadStatus } = props;
  const { spectrumFunction, canvasFade } = useContext(ThemeContext)!;
  const { id, groups, bpm } = useContext(SongContext)!;
  const { WAW } = useContext(WebAudioContext)!;
  const voices = useMusicPlayerStore((s) => s.voices);
  const pauseVisuals = useMusicPlayerStore((s) => s.pauseVisuals);
  const { flags } = useContext(TestingContext)!;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | RuntimeScene | null>(null);
  // Provider closes over this ref, so bakes arriving after RuntimeScene
  // construction start driving the scene without re-wiring (bands read 0 until
  // then — the same missing-bake rule).
  const preludeBakesRef = useRef<Record<string, BakeResult>>({});

  useEffect(() => {
    sceneRef.current && (sceneRef.current.pauseVisuals = pauseVisuals);
  }, [pauseVisuals]);

  // tell the scene which voices are active so it can render elements selectively
  useEffect(() => {
    if (sceneRef.current) {
      const playerState: Record<string, boolean> = {};
      groups.forEach((g) => {
        playerState[g.name] =
          voices.filter(
            (v) =>
              v.group === g.name &&
              (v.voiceState === "active" || v.voiceState === "pending-stop")
          ).length > 0;
      });
      sceneRef.current.playerState = playerState;
    }
  }, [groups, voices]);

  useEffect(() => {
    let newScene: SceneManager | RuntimeScene | undefined;
    // spectrumFunction is typed (n: number) => unknown in ThemeContext but scenes require (n: number) => string
    const specFn = spectrumFunction as (n: number) => string;

    const buildPreludeScene = () => {
      const voicesByGroup = groups.map((g) => ({
        name: g.name,
        voices: g.voices.map((v) => v.name),
      }));
      const players = WAW.getVoices(id);
      const groupNodes = WAW.getEffects(id).groupNodes;
      const provider = createStemProvider({
        now: () => WAW.audioCtx.currentTime,
        outputLatency: () => WAW.audioCtx.outputLatency ?? 0,
        groups: voicesByGroup,
        bakes: preludeBakesRef.current,
        players,
        groupGain: (g) => groupNodes[g]?.gain.value ?? 0,
        activeVoices: () => useMusicPlayerStore.getState().voices,
      });
      const scene = new RuntimeScene(canvasRef.current!, {
        url: `${import.meta.env.BASE_URL}models/prelude/scene.glb`,
        signalSource: new BakedSignalSource(provider),
        onLoaded: () => handleSetCanvasLoadStatus(true),
      });
      loadSongBakes(
        import.meta.env.BASE_URL,
        id,
        voicesByGroup.flatMap((g) => g.voices)
      ).then((bakes) => {
        // Mutate the object the provider captured (don't reassign the ref) so
        // late-arriving bakes drive the already-constructed scene.
        Object.assign(preludeBakesRef.current, bakes);
        for (const [voice, bake] of Object.entries(bakes)) {
          warnIfStale(bake, players[voice]?.loopDuration ?? null, voice);
        }
      });
      return scene;
    };

    switch (id) {
      case "moonrise":
        if (flags.showVisuals) {
          newScene = new Moonrise(
            canvasRef.current!,
            WAW.getAnalysers(id).groupAnalysers,
            () => handleSetCanvasLoadStatus(true),
            {}
          );
          sceneRef.current = newScene;
        } else {
          handleSetCanvasLoadStatus(true);
        }
        break;
      case "mornings":
        if (flags.showVisuals) {
          newScene = new Mornings(
            canvasRef.current!,
            WAW.getAnalysers(id).groupAnalysers,
            () => handleSetCanvasLoadStatus(true),
            {
              spectrumFunction: specFn,
              bpm,
            }
          );
          sceneRef.current = newScene;
        } else {
          handleSetCanvasLoadStatus(true);
        }
        break;
      case "swamp":
        if (flags.showVisuals) {
          newScene = new Swamp(
            canvasRef.current!,
            WAW.getAnalysers(id).groupAnalysers,
            () => handleSetCanvasLoadStatus(true),
            {
              spectrumFunction: specFn,
              bpm,
            }
          );
          sceneRef.current = newScene;
        } else {
          handleSetCanvasLoadStatus(true);
        }
        break;
      case "prelude":
        if (flags.showVisuals) {
          newScene = buildPreludeScene();
          sceneRef.current = newScene;
        } else {
          handleSetCanvasLoadStatus(true);
        }
        break;
      default:
        throw new Error("Song not found");
    }

    let resizeFunction: (() => void) | undefined;

    if (flags.showVisuals) {
      if (newScene!.resizeMethod === "cinematic") {
        resizeFunction = cinematicResize(canvasRef.current!);
        resizeFunction();
        addWindowListeners(resizeFunction);
      }
      addWindowListeners(sceneRef.current!.onWindowResize);
    }

    return () => {
      if (flags.showVisuals) {
        newScene!.dispose();
        if (newScene!.resizeMethod === "cinematic") {
          removeWindowListeners(resizeFunction!);
        }
        removeWindowListeners(sceneRef.current!.onWindowResize);
      }
    };
  }, [
    bpm,
    groups,
    spectrumFunction,
    flags.showVisuals,
    id,
    WAW,
    songLoadStatus,
    handleSetCanvasLoadStatus,
  ]);

  return (
    <div id="canvas-viz-parent" className={cx(canvasVizParent, "fullscreen")}>
      <canvas id="canvas-viz" className={canvasViz} ref={canvasRef}></canvas>
      {canvasFade && <CanvasFade ref={canvasRef} />}
    </div>
  );
};
