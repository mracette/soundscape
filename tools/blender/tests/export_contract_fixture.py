import os
import sys

try:
    HERE = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(HERE, ".."))  # tools/blender  -> import addon
    sys.path.insert(0, HERE)  # tools/blender/tests -> import build_contract_scene

    import addon
    from addon import export
    import build_contract_scene

    def main():
        out = os.environ.get("SOUNDSCAPE_FIXTURE_OUT")
        assert out, "set SOUNDSCAPE_FIXTURE_OUT to the output .glb path"
        addon.register()
        build_contract_scene.build()
        export.export_gltf(out)
        print("WROTE", out)

    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
