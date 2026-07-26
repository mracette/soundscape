import { createContext } from "react";
import { WebAudioWrapper } from "../classes/WebAudioWrapper";
import appConfigJson from "../app-config.json";

export type SongId = (typeof appConfigJson)[number]["id"];

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
  spectrumFunction: (n: number) => string;
  canvasFade: boolean;
  resizeType: string;
  panelResetButton: string;
  panelRandomizeButton: string;
  panelMuteButton: string;
  groupSoloButton: string;
  groupMuteButton: string;
}

export interface CreditEntry {
  type: string;
  content: string;
  link?: string;
}

export type MusicalDuration = `${number}m` | `${number}n`;

export interface AnalyserConfig {
  power?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  split?: boolean;
  numBuckets?: number;
  minFrequency?: number;
  maxFrequency?: number;
  xEasing?: string;
  yEasing?: string;
  yExponent?: number;
  gainBoost?: number;
}

export interface VoiceConfig {
  name: string;
  length: MusicalDuration;
  quantizeLength: MusicalDuration;
  noFade?: boolean;
}

export interface GroupConfig {
  name: string;
  polyphony: number;
  voices: VoiceConfig[];
  analyser: AnalyserConfig;
}

export interface SongContextValue {
  id: string;
  name: string;
  bpm: number;
  timeSignature: number;
  keySignature: string;
  ambientTrack?: boolean;
  ambientTrackLength?: MusicalDuration;
  ambientTrackQuantize?: boolean;
  groups: GroupConfig[];
}

export interface InfoContextValue {
  id: string;
  credits: CreditEntry[];
}

export interface WebAudioContextValue {
  WAW: WebAudioWrapper;
  wawLoadStatus: boolean;
}

export interface SongThemes {
  canvasFade: boolean;
  resizeType?: string;
  contentPanelText?: string;
  panelResetButton: string;
  panelRandomizeButton: string;
  panelMuteButton: string;
  groupSoloButton: string;
  groupMuteButton: string;
}

export interface AppConfigEntry {
  id: SongId;
  audio: Omit<SongContextValue, "id">;
  themes: SongThemes;
  info: { credits: CreditEntry[] };
}

export const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);
export const TestingContext = createContext<TestingContextValue | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export const SongContext = createContext<SongContextValue | undefined>(undefined);
export const InfoContext = createContext<InfoContextValue | undefined>(undefined);
export const WebAudioContext = createContext<WebAudioContextValue | undefined>(undefined);
