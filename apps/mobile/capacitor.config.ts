import type { CapacitorConfig } from "@capacitor/cli";

// Opt-in live reload: point the native shell at a dev server on the LAN
// instead of the bundled files, e.g.
//   CAP_SERVER_URL=http://192.168.1.20:3000 pnpm --filter @soundscape/mobile exec cap copy ios
// then run from Xcode once; edits hot-reload on the device. Unset (every
// normal build), the shell serves the bundled webDir as usual.
const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "world.soundscape.mobile",
  appName: "Soundscape",
  // The shared Vite output. Capacitor copies this into the native projects.
  webDir: "../../build",
  ...(devServerUrl && {
    server: { url: devServerUrl, cleartext: true },
  }),
  plugins: {
    SplashScreen: {
      // We hide the splash from JS once the app shell is up (capacitorInit.ts),
      // so disable the auto-hide timer and let code own the transition.
      launchAutoHide: false,
      backgroundColor: "#000000",
    },
  },
};

export default config;
