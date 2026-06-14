"""Unit tests for the shared sanitize/round helpers."""
import math

import numpy as np

from utils import sanitize, safe_round, to_native


def test_sanitize_nan_inf_to_none():
    assert sanitize(float("nan")) is None
    assert sanitize(float("inf")) is None
    assert sanitize(-float("inf")) is None


def test_sanitize_numpy_scalars():
    assert to_native(np.int64(3)) == 3 and isinstance(to_native(np.int64(3)), int)
    out = sanitize({np.int64(2): np.float64(1.5), "x": [np.int64(1), float("nan")]})
    assert out == {2: 1.5, "x": [1, None]}
    # Keys are plain ints, not numpy.
    assert all(isinstance(k, (int, str)) and not isinstance(k, np.generic) for k in out)


def test_safe_round():
    assert safe_round(1.23456, 2) == 1.23
    assert safe_round(None) is None
    assert safe_round(float("nan")) is None
    assert safe_round("not a number") is None


def test_sanitize_nested():
    data = {"a": [1, 2, {"b": float("inf")}], "c": math.nan}
    assert sanitize(data) == {"a": [1, 2, {"b": None}], "c": None}
