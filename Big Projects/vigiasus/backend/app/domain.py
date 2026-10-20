"""Demonstration-only synthetic dengue signals and transparent scoring."""

from typing import Any

BASE_RAINFALL_MM = 48

AREAS: list[dict[str, Any]] = [
    {"id": "santo-amaro", "name": "Santo Amaro", "reports": 56, "environment": 67, "rainfall": 59},
    {"id": "boa-vista", "name": "Boa Vista", "reports": 37, "environment": 54, "rainfall": 51},
    {"id": "casa-amarela", "name": "Casa Amarela", "reports": 63, "environment": 58, "rainfall": 64},
    {"id": "varzea", "name": "Várzea", "reports": 29, "environment": 48, "rainfall": 53},
    {"id": "afogados", "name": "Afogados", "reports": 73, "environment": 72, "rainfall": 70},
    {"id": "ibura", "name": "Ibura", "reports": 44, "environment": 61, "rainfall": 57},
    {"id": "pina", "name": "Pina", "reports": 25, "environment": 41, "rainfall": 45},
    {"id": "beberibe", "name": "Beberibe", "reports": 51, "environment": 65, "rainfall": 62},
    {"id": "torroes", "name": "Torrões", "reports": 68, "environment": 73, "rainfall": 66},
    {"id": "derby", "name": "Derby", "reports": 21, "environment": 38, "rainfall": 42},
    {"id": "ilha-do-leite", "name": "Ilha do Leite", "reports": 33, "environment": 46, "rainfall": 48},
    {"id": "dois-irmaos", "name": "Dois Irmãos", "reports": 31, "environment": 52, "rainfall": 57},
]


def clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return min(maximum, max(minimum, value))


def risk_level(score: int) -> str:
    if score >= 65:
        return "elevado"
    if score >= 45:
        return "moderado"
    return "regular"


def calculate_area(area: dict[str, Any], rainfall_mm: float = BASE_RAINFALL_MM, days: int = 14) -> dict[str, Any]:
    """Build an explainable illustrative index; this is not a trained prediction."""
    rainfall_signal = round(clamp(area["rainfall"] + (rainfall_mm - BASE_RAINFALL_MM) * 0.55))
    report_signal = round(clamp(area["reports"] * (14 / days)))
    environment_signal = area["environment"]
    score = round(
        rainfall_signal * 0.35 + report_signal * 0.40 + environment_signal * 0.25
    )
    score = int(clamp(score))

    return {
        "id": area["id"],
        "name": area["name"],
        "risk_score": score,
        "risk_level": risk_level(score),
        "signals": {
            "rainfall": rainfall_signal,
            "notifications": report_signal,
            "environment": environment_signal,
        },
        "weights": {"rainfall": 0.35, "notifications": 0.40, "environment": 0.25},
        "simulated": True,
        "notice": "Sinais e índice fictícios para demonstração; não são dados oficiais nem previsão validada.",
    }


def get_area(area_id: str) -> dict[str, Any] | None:
    return next((area for area in AREAS if area["id"] == area_id), None)
