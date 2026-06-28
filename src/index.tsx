import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { hardenAppShell } from "./utils/appShell";

hardenAppShell();

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
