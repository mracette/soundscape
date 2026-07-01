import { isCapacitor } from "./runtime";

/**
 * Native-only Capacitor setup. Runs only inside the real iOS/Android shell and
 * loads the plugin code lazily, so the web and Electron bundles never include
 * Capacitor. Every call is guarded individually: a plugin that is unavailable
 * or throws must not take down the app shell.
 */
export const initCapacitor = async (): Promise<void> => {
  if (!isCapacitor) return;

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* splash already hidden or plugin unavailable */
  }

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // Keep the status bar out of the WebView so app UI clears the notch/status
    // bar without fragile per-element safe-area CSS (the app is full-viewport).
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    /* status bar not controllable (e.g., some Android states) */
  }

  try {
    const { App } = await import("@capacitor/app");
    // Android hardware back: step through in-app history; exit at the root.
    // (iOS has no hardware back — the in-app "← Back" on /info covers it.)
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    /* App plugin unavailable */
  }
};
