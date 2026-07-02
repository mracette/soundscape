import json
import os
import subprocess

# addon dir is tools/blender/addon; the CLI is tools/blender/bake/bake-audio.mjs
_ADDON_DIR = os.path.dirname(os.path.realpath(__file__))
_DEFAULT_CLI = os.path.normpath(os.path.join(_ADDON_DIR, "..", "bake", "bake-audio.mjs"))


def build_bake_command(cli_path, band, out_path, node_bin, snappy=None, onset=None):
    cmd = [
        node_bin, cli_path,
        "--audio", band["stem_path"],
        "--out", out_path,
        "--fps", str(band["fps"]),
        "--buckets", str(band["num_buckets"]),
        "--band", band["name"],
        "--config", json.dumps(band["analyser_config"]),
    ]
    if snappy is not None:
        cmd += ["--snappy-coef", str(snappy["coef"]), "--snappy-lead", str(snappy["lead"])]
    if onset is not None:
        cmd += ["--onset-window", str(onset["window"]), "--onset-decay", str(onset["decay"])]
    return cmd


def bake_band(band, out_dir, cli_path=None, node_bin=None, snappy=None, onset=None, out_name=None):
    """Bake one band to <out_dir>/<name>.json via the CLI; return the parsed BakeResult.
    `out_name` overrides the output basename. `snappy` (dict {"coef", "lead"}) enables
    the snappy zero-phase/lead variant. `onset` (dict {"window", "decay"}) sets the
    onset detector's window/decay. Raises RuntimeError with the CLI's stderr on
    failure."""
    cli_path = cli_path or _DEFAULT_CLI
    node_bin = node_bin or os.environ.get("SOUNDSCAPE_NODE_BIN", "node")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{out_name or band['name']}.json")
    cmd = build_bake_command(cli_path, band, out_path, node_bin, snappy, onset)
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not os.path.exists(out_path):
        raise RuntimeError(f"bake failed for {band['name']}: {proc.stderr or proc.stdout}")
    with open(out_path) as fh:
        return json.load(fh)


def load_bakes(out_dir, names, suffix=""):
    bakes = {}
    for name in names:
        path = os.path.join(out_dir, f"{name}{suffix}.json")
        if os.path.exists(path):
            with open(path) as fh:
                bakes[name] = json.load(fh)
    return bakes
