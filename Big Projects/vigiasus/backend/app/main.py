"""HTTP API for the VigiaSUS demonstration."""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .domain import AREAS, calculate_area, get_area
from .rag import answer_question

app = FastAPI(
    title="VigiaSUS API",
    description="API demonstrativa de vigilância territorial e recuperação documental.",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "project": "VigiaSUS", "data": "synthetic_demo"}


@app.get("/api/areas")
def list_areas(
    rainfall_mm: float = Query(default=48, ge=0, le=120),
    days: int = Query(default=14, ge=1, le=90),
) -> dict[str, object]:
    results = [calculate_area(area, rainfall_mm, days) for area in AREAS]
    scores = [area["risk_score"] for area in results]
    return {
        "areas": results,
        "summary": {
            "monitored_areas": len(results),
            "attention_areas": sum(score >= 45 for score in scores),
            "average_risk": round(sum(scores) / len(scores)),
            "rainfall_mm": rainfall_mm,
            "days": days,
        },
        "simulated": True,
    }


@app.get("/api/areas/{area_id}")
def area_detail(
    area_id: str,
    rainfall_mm: float = Query(default=48, ge=0, le=120),
    days: int = Query(default=14, ge=1, le=90),
) -> dict[str, object]:
    area = get_area(area_id)
    if area is None:
        raise HTTPException(status_code=404, detail="Área demonstrativa não encontrada.")
    return calculate_area(area, rainfall_mm, days)


@app.post("/api/ask")
def ask_question(request: QuestionRequest) -> dict[str, object]:
    try:
        return answer_question(request.question)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
