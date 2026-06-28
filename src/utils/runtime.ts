/**
 * Identifies which native shell (if any) is hosting the web app, so platform
 * tweaks and native-plugin calls can be gated. Capacitor injects
 * `window.Capacitor`; Electron tags the UA string with "Electron".
 */
export type Host = "web" | "electron" | "capacitor";

export const detectHost = (
  ua: string,
  win: Window & typeof globalThis
): Host => {
  if ((win as unknown as { Capacitor?: unknown }).Capacitor) return "capacitor";
  if (ua.includes("Electron")) return "electron";
  return "web";
};

export const host: Host = detectHost(
  typeof navigator === "undefined" ? "" : navigator.userAgent,
  window
);

export const isElectron = host === "electron";
export const isCapacitor = host === "capacitor";
export const isWeb = host === "web";
