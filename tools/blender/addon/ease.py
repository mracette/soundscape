import math

# d3-ease "back" overshoot constant.
_S = 1.70158


def linear(t):
    return t


def quad_in(t):
    return t * t


def quad_out(t):
    return t * (2 - t)


def quad_in_out(t):
    t = t * 2
    if t <= 1:
        return t * t / 2
    t = t - 1
    return (t * (2 - t) + 1) / 2


def cubic_in(t):
    return t * t * t


def cubic_out(t):
    t = t - 1
    return t * t * t + 1


def cubic_in_out(t):
    t = t * 2
    if t <= 1:
        return t * t * t / 2
    t = t - 2
    return (t * t * t + 2) / 2


def sin_in(t):
    if t == 1:
        return 1.0
    return 1 - math.cos(t * math.pi / 2)


def sin_out(t):
    return math.sin(t * math.pi / 2)


def sin_in_out(t):
    return (1 - math.cos(math.pi * t)) / 2


def _tpmt(x):
    # two power minus ten, scaled to [0,1] (d3-ease math.js)
    return (2 ** (-10 * x) - 0.0009765625) * 1.0009775171065494


def exp_in(t):
    return _tpmt(1 - t)


def exp_out(t):
    return 1 - _tpmt(t)


def exp_in_out(t):
    t = t * 2
    if t <= 1:
        return _tpmt(1 - t) / 2
    return (2 - _tpmt(t - 1)) / 2


def back_out(t):
    t = t - 1
    return t * t * ((_S + 1) * t + _S) + 1


EASES = {
    "linear": linear,
    "quadIn": quad_in,
    "quadOut": quad_out,
    "quadInOut": quad_in_out,
    "cubicIn": cubic_in,
    "cubicOut": cubic_out,
    "cubicInOut": cubic_in_out,
    "sinIn": sin_in,
    "sinOut": sin_out,
    "sinInOut": sin_in_out,
    "expIn": exp_in,
    "expOut": exp_out,
    "expInOut": exp_in_out,
    "backOut": back_out,
}


def resolve_ease(name):
    """Mirror resolveEase: a known name -> its curve; None/unknown -> linear."""
    return EASES.get(name, linear)
