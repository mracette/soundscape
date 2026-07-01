import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import json
    import tempfile
    from addon import bake_bridge

    band = {
        "name": "bass",
        "stem_path": "/tmp/bass.wav",
        "analyser_config": {"power": 11, "smoothingTimeConstant": 0.8,
                            "minFrequency": 20, "maxFrequency": 16500},
        "num_buckets": 8,
        "fps": 30,
    }
    cmd = bake_bridge.build_bake_command("/repo/bake-audio.mjs", band, "/out/bass.json", "node")
    assert cmd[0] == "node" and cmd[1] == "/repo/bake-audio.mjs", cmd
    assert "--audio" in cmd and cmd[cmd.index("--audio") + 1] == "/tmp/bass.wav", cmd
    assert cmd[cmd.index("--out") + 1] == "/out/bass.json", cmd
    assert cmd[cmd.index("--fps") + 1] == "30", cmd
    assert cmd[cmd.index("--buckets") + 1] == "8", cmd
    assert cmd[cmd.index("--band") + 1] == "bass", cmd
    cfg = json.loads(cmd[cmd.index("--config") + 1])
    assert cfg == band["analyser_config"], cfg

    # load_bakes reads written BakeResult JSONs by band name
    tmp = tempfile.mkdtemp()
    result = {"fps": 30, "sampleRate": 44100, "durationSec": 1.0, "band": "bass",
              "frames": [{"volume": 0.5, "buckets": [0.1] * 8}]}
    with open(os.path.join(tmp, "bass.json"), "w") as fh:
        json.dump(result, fh)
    bakes = bake_bridge.load_bakes(tmp, ["bass"])
    assert bakes["bass"]["frames"][0]["volume"] == 0.5, bakes

    print("OK test_bake_bridge")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
