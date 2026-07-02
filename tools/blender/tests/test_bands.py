import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import bpy
    import addon
    from addon import bands_model

    addon.register()

    for name in ("SOUNDSCAPE_PT_bands", "SOUNDSCAPE_UL_bands",
                 "SOUNDSCAPE_OT_band_add", "SOUNDSCAPE_OT_band_remove"):
        assert hasattr(bpy.types, name), f"{name} not registered"

    scene = bpy.context.scene
    band = scene.soundscape_bands.add()
    band.name = "bass"
    band.stem_path = "/tmp/bass.wav"
    band.power = 11
    band.smoothing_time_constant = 0.8
    band.min_frequency = 20
    band.max_frequency = 16500
    band.num_buckets = 8
    band.fps = 30

    cfg = bands_model.band_analyser_config(band)
    assert cfg["power"] == 11, cfg
    assert abs(cfg["smoothingTimeConstant"] - 0.8) < 1e-6, cfg
    assert cfg["minFrequency"] == 20, cfg
    assert cfg["maxFrequency"] == 16500, cfg
    assert set(cfg) == {"power", "smoothingTimeConstant", "minFrequency", "maxFrequency"}, cfg

    assert scene.soundscape_snappy is True, scene.soundscape_snappy
    assert scene.soundscape_onset_window == 9, scene.soundscape_onset_window
    assert abs(scene.soundscape_onset_decay - 0.8) < 1e-6, scene.soundscape_onset_decay

    addon.unregister()
    assert not hasattr(bpy.types, "SOUNDSCAPE_PT_bands"), "bands panel still registered"
    assert not hasattr(bpy.types.Scene, "soundscape_snappy"), "soundscape_snappy still registered"
    assert not hasattr(bpy.types.Scene, "soundscape_onset_window"), "soundscape_onset_window still registered"
    assert not hasattr(bpy.types.Scene, "soundscape_onset_decay"), "soundscape_onset_decay still registered"

    print("OK test_bands")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
