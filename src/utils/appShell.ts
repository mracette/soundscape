import { isWeb } from "./runtime";

/**
 * Applies "feels like an app, not a web page" tweaks when running inside a
 * native shell (Electron/Capacitor): no context menu, no text selection, no
 * rubber-band overscroll. No-op on the web so the public site is untouched.
 * Pinch-zoom is already disabled via the viewport meta tag in index.html.
 */
export const hardenAppShell = (): void => {
  if (isWeb) return;

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  const style = document.createElement("style");
  style.textContent = `
    html, body {
      overscroll-behavior: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
  `;
  document.head.appendChild(style);
};
