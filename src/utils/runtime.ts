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
  const cap = (
    win as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
  ).Capacitor;
  // The native Capacitor bridge injects window.Capacitor before app code runs
  // and reports isNativePlatform() === true. If Capacitor core ever leaks into
  // the web bundle it also defines window.Capacitor, but isNativePlatform()
  // returns false there — so check the method, not just the object.
  if (cap?.isNativePlatform ? cap.isNativePlatform() : Boolean(cap)) {
    return "capacitor";
  }
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
