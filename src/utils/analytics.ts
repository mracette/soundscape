import { isWeb } from "./runtime";

const GA_ID = "UA-73084223-4";

/**
 * Loads Google Analytics — but only on the public web build. Native shells
 * (Electron, Capacitor) ship fully offline and must not phone home: this keeps
 * the App Store "data not collected" declaration honest and avoids a failed
 * network request inside the app. No-op on every non-web host.
 */
export const initAnalytics = (): void => {
  if (!isWeb) return;

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(tag);

  const w = window as unknown as {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
};
