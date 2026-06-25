import { useRef, useEffect, useContext } from "react";

import { Moonrise } from "../../viz/scenes/moonrise/Moonrise";
import { Mornings } from "../../viz/scenes/mornings/Mornings";
import { Swamp } from "../../viz/scenes/swamp/Swamp";

// scene base
import { SceneManager } from "../../viz/SceneManager";

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
import "../../styles/components/CanvasViz.css";

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
  const sceneRef = useRef<SceneManager | null>(null);

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
    let newScene: SceneManager | undefined;
    // spectrumFunction is typed (n: number) => unknown in ThemeContext but scenes require (n: number) => string
    const specFn = spectrumFunction as (n: number) => string;
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
    <div id="canvas-viz-parent" className="fullscreen">
      <canvas id="canvas-viz" ref={canvasRef}></canvas>
      {canvasFade && <CanvasFade ref={canvasRef} />}
    </div>
  );
};
