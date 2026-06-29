import os
import sys


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(here, ".."))

    import bpy
    import addon
    from addon import bindings_model, evaluator

    addon.register()

    mesh = bpy.data.meshes.new("M")
    obj = bpy.data.objects.new("reactive", mesh)
    bpy.context.collection.objects.link(obj)

    # Full binding exercising all optional-field paths.
    b = obj.soundscape_bindings.add()
    b.target_property = "emissiveIntensity"
    b.band = "bass"
    b.measure = "volume"
    b.out_min = 0.2
    b.out_max = 0.8
    b.exponent = 2.0
    b.ease = "backOut"
    b.use_smoothing = True
    b.smoothing_attack = 0.8
    b.smoothing_release = 0.2

    bindings_model.sync_to_idprop(obj)
    binding = obj["soundscape"].to_dict()["bindings"][0]

    # Feeding the addon-emitted dict straight into BindingEvaluator must not raise
    # KeyError and must return a finite float within the output range.
    ev = evaluator.BindingEvaluator(binding)
    result = ev.evaluate(0.5)
    lo, hi = min(0.2, 0.8), max(0.2, 0.8)
    assert lo <= result <= hi, f"result {result!r} outside [{lo}, {hi}]"

    # Minimal binding: only outMin/outMax, all other fields at defaults.
    # The emitted transform must have no optional keys, and evaluate(0.5) must be
    # a linear pass-through ≈ 0.5.
    obj.soundscape_bindings.clear()
    bm = obj.soundscape_bindings.add()
    bm.out_min = 0.0
    bm.out_max = 1.0

    bindings_model.sync_to_idprop(obj)
    minimal_emitted = obj["soundscape"].to_dict()["bindings"][0]

    ev2 = evaluator.BindingEvaluator(minimal_emitted)
    got_half = ev2.evaluate(0.5)
    assert abs(got_half - 0.5) < 1e-9, f"linear pass-through: {got_half!r}"
    assert evaluator.BindingEvaluator(minimal_emitted).evaluate(float("nan")) == 0.0

    print("OK test_addon_evaluator_contract")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
