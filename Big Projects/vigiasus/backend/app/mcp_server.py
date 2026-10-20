"""MCP tools exposing the same synthetic area index and local RAG."""

from mcp.server.fastmcp import FastMCP

from .domain import AREAS, calculate_area, get_area
from .rag import answer_question

mcp = FastMCP("VigiaSUS")


@mcp.tool()
def list_area_risks(rainfall_mm: float = 48, days: int = 14) -> list[dict[str, object]]:
    """List synthetic demonstration risk indices. Never use as official surveillance data."""
    if not 0 <= rainfall_mm <= 120 or not 1 <= days <= 90:
        raise ValueError("rainfall_mm deve estar entre 0 e 120; days entre 1 e 90.")
    return [calculate_area(area, rainfall_mm, days) for area in AREAS]


@mcp.tool()
def get_area_risk(area_id: str, rainfall_mm: float = 48, days: int = 14) -> dict[str, object]:
    """Explain a synthetic area index and its component signals."""
    if not 0 <= rainfall_mm <= 120 or not 1 <= days <= 90:
        raise ValueError("rainfall_mm deve estar entre 0 e 120; days entre 1 e 90.")
    area = get_area(area_id)
    if area is None:
        raise ValueError("Área não encontrada. Consulte list_area_risks para IDs disponíveis.")
    return calculate_area(area, rainfall_mm, days)


@mcp.tool()
def search_vigiasus_knowledge(question: str) -> dict[str, object]:
    """Retrieve repository documentation; not a source of clinical guidance."""
    if not 3 <= len(question.strip()) <= 1000:
        raise ValueError("A pergunta deve ter entre 3 e 1000 caracteres.")
    return answer_question(question)


if __name__ == "__main__":
    mcp.run()
