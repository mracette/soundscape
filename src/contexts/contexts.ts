import { createContext } from "react";
import { WebAudioWrapper } from "../classes/WebAudioWrapper";

export interface LandingPageContextValue {
  [key: string]: unknown;
}

export interface LayoutContextValue {
  vw: number;
  vh: number;
  isMobile: boolean;
}

export interface TestingFlags {
  quantizeSamples: boolean;
  showVisuals: boolean;
  playAmbientTrack: boolean;
}

export interface TestingContextValue {
  flags: TestingFlags;
}

export interface ThemeContextValue {
  id: string;
  spectrumFunction: (n: number) => unknown;
  canvasFade: boolean;
  resizeType: string;
  buttonColor: string;
  openButtonColor: string;
  contentPanelColor: string;
  panelResetButton: string;
  panelRandomizeButton: string;
  panelMuteButton: string;
  groupSoloButton: string;
  groupMuteButton: string;
}

export interface CreditEntry {
  type: string;
  content: string;
}

export interface VoiceConfig {
  name: string;
  length?: string;
  quantizeLength?: string;
  [key: string]: unknown;
}

export interface GroupConfig {
  name: string;
  polyphony: number;
  voices: VoiceConfig[];
  analyser?: Record<string, unknown>;
}

export interface SongContextValue {
  id: string;
  name: string;
  bpm: number;
  timeSignature: number;
  keySignature: string;
  ambientTrack?: boolean;
  ambientTrackLength?: string;
  ambientTrackQuantize?: unknown;
  groups: GroupConfig[];
}

export interface InfoContextValue {
  id: string;
  credits: CreditEntry[];
}

export interface ApplicationContextValue {
  [key: string]: unknown;
}

export interface WebAudioContextValue {
  WAW: WebAudioWrapper;
  wawLoadStatus: boolean;
}

export const LandingPageContext = createContext<LandingPageContextValue | undefined>(undefined);
export const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);
export const TestingContext = createContext<TestingContextValue | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export const SongContext = createContext<SongContextValue | undefined>(undefined);
export const InfoContext = createContext<InfoContextValue | undefined>(undefined);
export const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined);
export const WebAudioContext = createContext<WebAudioContextValue | undefined>(undefined);
