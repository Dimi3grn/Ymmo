"""Shared helpers for the data-service routers."""
from __future__ import annotations

import math
from typing import Any

import numpy as np


def to_native(value: Any) -> Any:
    """Convert numpy/pandas scalars to plain Python types.

    numpy.float64 is a subclass of float (so it usually serializes), but
    numpy.int64 / numpy.bool_ are not subclasses of int/bool and can break
    JSON dict keys. Normalising everything keeps responses predictable.
    """
    if isinstance(value, np.generic):
        value = value.item()
    return value


def sanitize(value: Any) -> Any:
    """Recursively make a structure JSON-safe.

    - numpy scalars -> Python scalars
    - NaN / +-inf floats -> None (FastAPI would otherwise emit the invalid
      JSON tokens ``NaN`` / ``Infinity`` which ``JSON.parse`` rejects)
    - dict keys -> native (so numpy int keys don't raise)
    """
    value = to_native(value)

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, dict):
        return {to_native(k): sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [sanitize(v) for v in value]
    return value


def safe_round(value: Any, ndigits: int = 2) -> float | None:
    """Round a possibly-NaN/None numeric to a float, or None when not finite."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return round(f, ndigits)
