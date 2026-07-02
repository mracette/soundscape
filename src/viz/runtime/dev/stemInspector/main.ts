declare global {
  interface Window {
    __stemInspector?: { ready: boolean; frames: number; lastError: string | null };
  }
}

const debug = { ready: false, frames: 0, lastError: null as string | null };
window.__stemInspector = debug;

function showError(msg: string): void {
  const el = document.getElementById("error") as HTMLElement;
  el.hidden = false;
  el.textContent = msg;
  debug.lastError = msg;
}

async function main(): Promise<void> {
  const files: { song: string; name: string }[] = await (await fetch("/__stems")).json();
  if (files.length === 0) {
    showError(
      "No stems found in public/audio/wav.\nIn a worktree, public/audio is a symlink — run tools/worktree-dev.sh to set it up."
    );
  }
  const sidebar = document.getElementById("sidebar") as HTMLElement;
  for (const f of files) {
    const btn = document.createElement("button");
    btn.textContent = `${f.song}/${f.name}`;
    sidebar.appendChild(btn);
  }
  debug.ready = true;
}

main().catch((err) => showError(String(err)));

export {};
