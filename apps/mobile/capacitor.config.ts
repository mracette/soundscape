import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "world.soundscape.mobile",
  appName: "Soundscape",
  // The shared Vite output. Capacitor copies this into the native projects.
  webDir: "../../build",
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
