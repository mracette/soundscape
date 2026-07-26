#!/usr/bin/env python3
"""Builds the SOUNDSCAPE rune wordmark as an SVG of hand-authored polygons.

Every glyph is assembled from `stroke()` quads that overlap at the joints; a
non-zero fill unions them, so counters (the O's diamond, the D's bowl) fall out
of the gaps between strokes rather than needing boolean geometry.

Glyph space: x runs left to right from the glyph's own origin, y=0 is the cap
line and y=CAP the baseline. Letters deliberately over- and undershoot both.
"""

import math
import random

CAP = 200.0
W = 30.0
WEIGHT = 0.72  # global stroke-weight trim

# ---------------------------------------------------------------- primitives


def _area(pts):
    return sum(
        x0 * y1 - x1 * y0
        for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1])
    )


def solid(pts):
    """Orient a contour so non-zero fill unions it with every other solid."""
    return pts if _area(pts) < 0 else pts[::-1]


def hole(pts):
    return pts if _area(pts) > 0 else pts[::-1]


def stroke(p0, p1, w=W, w1=None, cut0=0.0, cut1=0.0, tip0=0.0, tip1=0.0, bias0=0.0, bias1=0.0):
    """A chisel-cut bar from p0 to p1.

    `w`/`w1` are the widths at each end, `cut` skews a terminal edge into a
    slanted chisel, and `tip` pulls a terminal out into a spike (`bias` slides
    that spike sideways off the spine). Keeping the body at full width and
    spending the taper only in `tip` is what separates a carved rune from the
    needle-thin blackletter the traced version drifted into.
    """
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    ux, uy = dx / length, dy / length
    nx, ny = -uy, ux
    h0, h1 = w * WEIGHT / 2, (w if w1 is None else w1) * WEIGHT / 2

    pts = [
        (x0 + nx * h0 + ux * cut0, y0 + ny * h0 + uy * cut0),
        (x1 + nx * h1 + ux * cut1, y1 + ny * h1 + uy * cut1),
    ]
    if tip1:
        pts.append((x1 + ux * tip1 + nx * bias1, y1 + uy * tip1 + ny * bias1))
    pts.append((x1 - nx * h1 - ux * cut1, y1 - ny * h1 - uy * cut1))
    pts.append((x0 - nx * h0 - ux * cut0, y0 - ny * h0 - uy * cut0))
    if tip0:
        pts.append((x0 - ux * tip0 + nx * bias0, y0 - uy * tip0 + ny * bias0))
    return solid(pts)


def mitre(a, c, b, w_a, w_b, side):
    """Fill the notch two strokes leave where they turn a corner at `c`.

    `a` and `b` are the far ends of the incoming and outgoing strokes; `side`
    (+1/-1) picks which flank of the corner is the outer one. Without this the
    silhouette steps at every vertex instead of coming to a point.
    """

    def offset(p, q, w):
        dx, dy = q[0] - p[0], q[1] - p[1]
        length = math.hypot(dx, dy)
        ux, uy = dx / length, dy / length
        nx, ny = -uy * side, ux * side
        h = w * WEIGHT / 2
        return (c[0] + nx * h, c[1] + ny * h), (ux, uy)

    (p1, d1), (p2, d2) = offset(a, c, w_a), offset(c, b, w_b)
    det = d1[0] * -d2[1] - d1[1] * -d2[0]
    t = ((p2[0] - p1[0]) * -d2[1] - (p2[1] - p1[1]) * -d2[0]) / det
    x = (p1[0] + d1[0] * t, p1[1] + d1[1] * t)
    return solid([p1, x, p2, c])


def ring(outer, inner):
    """A closed band: outer contour plus an inner contour that cuts a hole."""
    return [solid(outer), hole(inner)]


# -------------------------------------------------------------------- glyphs


def glyph_s():
    return [
        stroke((10, 40), (92, 12), w=30, w1=26, tip1=24, bias1=-4),
        stroke((98, 18), (94, 56), w=26, w1=6, tip1=16),
        stroke((12, 36), (106, 104), w=31, tip0=18, bias0=-3),
        stroke((108, 108), (36, 190), w=32, w1=20, tip1=28, bias1=3),
    ]


def glyph_o():
    return ring(
        [(61, -6), (123, 95), (59, 196), (-1, 91)],
        [(61, 33), (100, 95), (59, 158), (22, 95)],
    )


def glyph_u():
    return [
        stroke((16, 16), (31, 166), w=28, tip0=18, bias0=-3),
        stroke((24, 178), (82, 140), w=27, w1=24, tip0=20, bias0=4),
        stroke((84, 14), (77, 150), w=26, tip0=18, bias0=2),
    ]


def glyph_n():
    return [
        stroke((16, 10), (25, 188), w=26, tip0=16, tip1=12),
        stroke((19, 18), (97, 186), w=29, tip1=20),
        stroke((103, 54), (95, 166), w=26, tip0=18),
    ]


def glyph_d():
    return [
        stroke((14, 8), (23, 190), w=31, tip0=16, tip1=14),
        stroke((17, 16), (108, 98), w=31, tip1=16),
        stroke((110, 102), (28, 188), w=31, tip0=16, tip1=14),
    ]


def glyph_c():
    return [
        stroke((102, 14), (13, 89), w=25, w1=30, tip0=24, bias0=-5),
        stroke((15, 95), (100, 174), w=30, w1=24, tip1=26, bias1=-3),
        stroke((76, 48), (70, 80), w=20, w1=4, tip1=12),
        stroke((90, 150), (84, 116), w=20, w1=4, tip1=12),
    ]


def glyph_a():
    return [
        stroke((45, 12), (10, 186), w=23, w1=16, tip0=16, tip1=24),
        stroke((47, 14), (108, 182), w=25, w1=17, tip1=26),
        solid([(2, 112), (98, 128), (80, 148), (53, 156), (29, 142), (14, 126)]),
    ]


def glyph_p():
    return [
        stroke((16, 6), (27, 190), w=28, tip0=16, tip1=28),
        stroke((19, 14), (86, 56), w=26, tip1=14),
        stroke((88, 60), (32, 106), w=26, tip0=14, tip1=12),
    ]


def glyph_e():
    return [
        stroke((15, 14), (27, 176), w=28, tip0=18, tip1=14),
        stroke((18, 22), (102, 58), w=27, w1=16, tip1=24),
        stroke((30, 96), (88, 102), w=26, w1=12, tip1=22),
        stroke((25, 164), (100, 186), w=29, w1=18, tip1=24),
    ]


def glyph_sigil():
    """The second S: a tall lozenge over a pointed bowl, joined by a crossing spine."""
    shoulder = (103, -192)
    upper_left = (1, -30)
    upper_right = (198, -52)
    spur = (146, 28)
    spine_turn = (178, 150)
    bulge = (25, 217)
    waist = (103, 332)
    return [
        stroke(shoulder, (103, -276), w=24, w1=3, tip1=10),
        stroke(shoulder, upper_left, w=28, w1=44),
        stroke(shoulder, upper_right, w=28, w1=44),
        stroke(upper_right, spur, w=44, w1=8, tip1=16),
        stroke(upper_left, spine_turn, w=44),
        stroke(spine_turn, waist, w=44, w1=26),
        stroke((42, 132), bulge, w=22, w1=44, tip0=30),
        stroke(bulge, waist, w=44, w1=26),
        stroke((103, 326), (103, 388), w=24, w1=3, tip1=12),
        mitre(shoulder, upper_left, spine_turn, 44, 44, 1),
        mitre(shoulder, upper_right, spur, 44, 44, -1),
        mitre(upper_left, spine_turn, waist, 44, 44, -1),
        mitre((42, 132), bulge, waist, 44, 44, 1),
        solid([(98, -119), (135, -75), (98, -31), (61, -75)]),
    ]


# -------------------------------------------------------------------- layout

# ---------------------------------------------------------------- faceting
#
# The crystal read comes from breaking every bar into flat-shaded facets with a
# bright crack along each seam. Facets are generated from the finished polygons
# rather than from the glyph definitions, so they need no knowledge of how a
# shape was built, and they are drawn generously oversized inside a clip path of
# the wordmark — the clip does the trimming, so nothing has to be intersected.


def long_axis(poly):
    """The polygon's longest diagonal, used as the bar's spine."""
    best = (0.0, poly[0], poly[1])
    for i, a in enumerate(poly):
        for b in poly[i + 1 :]:
            d = math.hypot(b[0] - a[0], b[1] - a[1])
            if d > best[0]:
                best = (d, a, b)
    return best


def cross_extent(poly, p0, p1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    length = math.hypot(dx, dy)
    nx, ny = -dy / length, dx / length
    spread = [(p[0] - p0[0]) * nx + (p[1] - p0[1]) * ny for p in poly]
    return max(spread) - min(spread)


def facets(poly, rng):
    """Split one polygon into facet strips plus the crack segments between them."""
    length, p0, p1 = long_axis(poly)
    if length < 46:
        return [], []

    width = max(cross_extent(poly, p0, p1), 16) * 1.7
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    ux, uy = dx / length, dy / length
    nx, ny = -uy, ux
    half = width / 2

    cuts = max(1, min(6, round(length / 62)))
    seams = []
    for i in range(cuts + 1):
        t = i / cuts
        if 0 < i < cuts:
            t += rng.uniform(-0.34, 0.34) / cuts
        # tilting each seam keeps the facets from reading as a ladder
        tilt = rng.uniform(-0.55, 0.55)
        ca, sa = math.cos(tilt), math.sin(tilt)
        ex, ey = nx * ca + ux * sa, ny * ca + uy * sa
        cx, cy = p0[0] + dx * t, p0[1] + dy * t
        seams.append(((cx - ex * half, cy - ey * half), (cx + ex * half, cy + ey * half)))

    strips, splits = [], []
    for (a0, a1), (b0, b1) in zip(seams, seams[1:]):
        # splitting some strips lengthwise turns the run of bands into a mosaic
        if rng.random() < 0.55:
            f = rng.uniform(0.3, 0.7)
            ma = (a0[0] + (a1[0] - a0[0]) * f, a0[1] + (a1[1] - a0[1]) * f)
            mb = (b0[0] + (b1[0] - b0[0]) * f, b0[1] + (b1[1] - b0[1]) * f)
            strips += [solid([a0, ma, mb, b0]), solid([ma, a1, b1, mb])]
            splits.append((ma, mb))
        else:
            strips.append(solid([a0, a1, b1, b0]))
    return strips, seams[1:-1] + splits


# Two lit tones and two shadowed ones: enough variation to read as cut stone
# without the wordmark dissolving into noise at hero size.
FACET_TONES = [
    ("#ffffff", 0.26),
    ("#ffffff", 0.11),
    ("#00394a", 0.30),
    ("#00394a", 0.14),
]

# (glyph, x offset, tilt in degrees, scale) — the tilt keeps the row from
# reading as type set on a rule, which is what makes the letters look carved one
# at a time. The sigil is scaled down from its full height: at 1.0 it towers far
# enough over the letters to stop reading as a letter at all.
WORD = [
    (glyph_s, 0, -1.5, 1.0),
    (glyph_o, 128, 1.0, 1.0),
    (glyph_u, 261, -1.0, 1.0),
    (glyph_n, 371, 1.5, 1.0),
    (glyph_d, 500, -1.0, 1.0),
    (glyph_sigil, 578, 0.0, 0.68),
    (glyph_c, 754, 1.0, 1.0),
    (glyph_a, 885, -1.5, 1.0),
    (glyph_p, 1023, 1.0, 1.0),
    (glyph_e, 1131, -1.0, 1.0),
]

PAD = 16


def build():
    polys = []
    for glyph, x, tilt, scale in WORD:
        shapes = glyph()
        a = math.radians(tilt)
        cx = sum(p[0] for s in shapes for p in s) / sum(len(s) for s in shapes)
        cy = CAP / 2
        for poly in shapes:
            polys.append(
                [
                    (
                        x + cx + dx * math.cos(a) - dy * math.sin(a),
                        cy + dx * math.sin(a) + dy * math.cos(a),
                    )
                    for dx, dy in (
                        ((px - cx) * scale, (py - cy) * scale) for px, py in poly
                    )
                ]
            )

    xs = [p[0] for poly in polys for p in poly]
    ys = [p[1] for poly in polys for p in poly]
    ox, oy = min(xs) - PAD, min(ys) - PAD
    width = max(xs) - min(xs) + PAD * 2
    height = max(ys) - min(ys) + PAD * 2

    def draw(shapes):
        return " ".join(
            "M" + " ".join(f"{px - ox:.1f},{py - oy:.1f}" for px, py in s) + "Z"
            for s in shapes
        )

    def lines(segs):
        return " ".join(
            f"M{a[0] - ox:.1f},{a[1] - oy:.1f}L{b[0] - ox:.1f},{b[1] - oy:.1f}"
            for a, b in segs
        )

    outline = draw(polys)

    rng = random.Random(20260726)
    tones = [[] for _ in FACET_TONES]
    cracks = []
    for poly in polys:
        # holes wind the other way; faceting them would light up the counters
        if _area(poly) > 0:
            continue
        strips, seams = facets(poly, rng)
        for strip in strips:
            tones[rng.randrange(len(FACET_TONES))].append(strip)
        cracks.extend(seams)

    facet_layers = "\n".join(
        f'<path fill="{color}" opacity="{opacity}" d="{draw(shapes)}"/>'
        for (color, opacity), shapes in zip(FACET_TONES, tones)
        if shapes
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}" role="img" aria-label="Soundscape">
<title>Soundscape</title>
<defs>
<linearGradient id="ws-crystal" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#e2fdff"/>
<stop offset="0.3" stop-color="#8eeaf8"/>
<stop offset="0.58" stop-color="#41d8f2"/>
<stop offset="0.84" stop-color="#12bade"/>
<stop offset="1" stop-color="#00a4c9"/>
</linearGradient>
<clipPath id="ws-clip"><path d="{outline}"/></clipPath>
</defs>
<path fill="url(#ws-crystal)" d="{outline}"/>
<g clip-path="url(#ws-clip)">
{facet_layers}
<path fill="none" stroke="#dffdff" stroke-width="2" opacity="0.5" d="{lines(cracks)}"/>
<path fill="none" stroke="#eafeff" stroke-width="5" opacity="0.38" d="{outline}"/>
</g>
</svg>
"""


if __name__ == "__main__":
    import sys

    out = sys.argv[1] if len(sys.argv) > 1 else "soundscape.svg"
    with open(out, "w") as fh:
        fh.write(build())
    print(f"wrote {out}")
