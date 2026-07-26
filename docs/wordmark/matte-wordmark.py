#!/usr/bin/env python3
"""Mattes a white-on-black wordmark render into the app's alpha mask.

Usage: matte-wordmark.py <render.png> <out.webp>

The render is monochrome light on black, so its luminance *is* its coverage, and
the app uses the result as a CSS mask so the mark stays tintable rather than
having a colour baked in. The coverage has to live in the **alpha** channel:
`mask-image` keys on alpha, and a greyscale image — having no alpha at all —
masks in as a solid rectangle.

Encoding goes through cwebp rather than Pillow because Pillow always stores the
alpha channel losslessly, which triples the file for a soft glow that does not
need the precision. At `-alpha_q 70` the worst pixel is off by 10/255.

Requires `cwebp` (brew install webp).
"""

import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

ALPHA_QUALITY = "70"

# the renders carry a faint non-zero floor across the background; anything under
# this is lifted off so large flat areas encode as fully transparent
FLOOR = 6 / 255


def main(src_path, out_path):
    src = np.asarray(Image.open(src_path).convert("RGB"), dtype=np.float64) / 255
    lum = src.max(axis=2)

    alpha = np.clip((lum - FLOOR) / (1 - FLOOR), 0, 1)

    ys, xs = np.nonzero(alpha > 0.02)
    pad = 8
    top, bottom = max(ys.min() - pad, 0), min(ys.max() + pad + 1, alpha.shape[0])
    left, right = max(xs.min() - pad, 0), min(xs.max() + pad + 1, alpha.shape[1])
    alpha = alpha[top:bottom, left:right]

    height, width = alpha.shape
    rgba = np.dstack(
        [np.full((height, width, 3), 255, np.uint8), (alpha * 255).astype(np.uint8)]
    )

    with tempfile.NamedTemporaryFile(suffix=".png") as staging:
        Image.fromarray(rgba, "RGBA").save(staging.name)
        subprocess.run(
            ["cwebp", "-quiet", "-q", "90", "-alpha_q", ALPHA_QUALITY,
             staging.name, "-o", out_path],
            check=True,
        )
    print(f"wrote {out_path}  {width}x{height}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
