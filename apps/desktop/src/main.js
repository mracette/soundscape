import { app, BrowserWindow, protocol, net } from "electron";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, normalize } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Packaged: renderer lives in resources/app (see electron-builder extraResources).
// Dev: the live Vite server is used instead, so this path is unused.
const buildDir = app.isPackaged
  ? join(process.resourcesPath, "app")
  : join(__dirname, "..", "..", "..", "build");

// A standard, secure scheme so absolute asset paths, fetch, and XHR all resolve
// under the app:// origin exactly as they would under an https origin.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Escape") win.setFullScreen(false);
    if (input.key === "F11") win.setFullScreen(!win.isFullScreen());
  });

  if (app.isPackaged) {
    win.loadURL("app://local/index.html");
  } else {
    win.loadURL("http://localhost:3000");
  }
};

app.whenReady().then(() => {
  protocol.handle("app", (request) => {
    const { pathname } = new URL(request.url);
    const filePath = normalize(join(buildDir, decodeURIComponent(pathname)));
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
