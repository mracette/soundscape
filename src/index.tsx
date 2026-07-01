import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { hardenAppShell } from "./utils/appShell";
import { initAnalytics } from "./utils/analytics";
import { initCapacitor } from "./utils/capacitorInit";

hardenAppShell();
initAnalytics();
initCapacitor();

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
