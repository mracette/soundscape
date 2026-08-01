import os
import struct
import sys
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "addon"))
import bake_bridge  # noqa: E402


def write_wav(path, sample_rate=44100, dur=1.0, tone=0.5):
    n = int(dur * sample_rate)
    active = int(tone * sample_rate)
    s = 1
    frames = bytearray()
    for i in range(n):
        if i < active:
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
            v = int(((s / 0xFFFFFFFF) * 2 - 1) * 32767)
        else:
            v = 0
        frames += struct.pack("<h", v)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(bytes(frames))


def main():
    out_dir = os.path.join(HERE, "__generated__")
    wav = os.path.join(out_dir, "bridge-tone.wav")
    os.makedirs(out_dir, exist_ok=True)
    write_wav(wav)

    band = {
        "name": "test",
        "stem_path": wav,
        "analyser_config": {"power": 11, "smoothingTimeConstant": 0,
                            "minFrequency": 20, "maxFrequency": 16500},
        "num_buckets": 8,
        "fps": 30,
    }
    result = bake_bridge.bake_band(band, out_dir)
    frames = result["frames"]
    assert result["fps"] == 30 and abs(len(frames) - 30) <= 1, len(frames)
    tone = sum(f["volume"] for f in frames[:14]) / 14
    silence = sum(f["volume"] for f in frames[-8:]) / 8
    assert tone > silence + 0.05, f"tone {tone:.3f} !> silence {silence:.3f}"
    print(f"OK test-bake-bridge (tone={tone:.3f} > silence={silence:.3f})")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
