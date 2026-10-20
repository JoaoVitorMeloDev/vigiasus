"""Local document retrieval with TF-IDF and optional local Ollama generation."""

import json
import os
from dataclasses import dataclass
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"
OLLAMA_URL = os.getenv("OLLAMA_URL", "").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "")
MIN_RELEVANCE = 0.05


@dataclass(frozen=True)
class Passage:
    source: str
    text: str


def load_passages() -> list[Passage]:
    passages: list[Passage] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        for block in path.read_text(encoding="utf-8").split("\n\n"):
            text = block.strip()
            if text and not text.startswith("#"):
                passages.append(Passage(source=path.name, text=text))
    return passages


def retrieve(question: str, limit: int = 3) -> list[dict[str, str | float]]:
    passages = load_passages()
    if not passages:
        return []

    documents = [passage.text for passage in passages]
    vectorizer = TfidfVectorizer(strip_accents="unicode", ngram_range=(1, 2))
    matrix = vectorizer.fit_transform([question, *documents])
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    ranked = scores.argsort()[::-1]

    results: list[dict[str, str | float]] = []
    for index in ranked[:limit]:
        score = float(scores[index])
        if score < MIN_RELEVANCE:
            continue
        results.append({
            "source": passages[int(index)].source,
            "text": passages[int(index)].text,
            "relevance": round(score, 4),
        })
    return results


def generate_grounded_answer(question: str, passages: list[dict[str, str | float]]) -> tuple[str, str]:
    if not passages:
        return (
            "Não encontrei conteúdo relevante na base documental deste protótipo. "
            "A base não fornece orientação clínica nem dados epidemiológicos oficiais.",
            "retrieval_only",
        )

    context = "\n\n".join(
        f"[{passage['source']}] {passage['text']}" for passage in passages
    )
    if not OLLAMA_URL or not OLLAMA_MODEL:
        excerpts = "\n".join(
            f"- {passage['text']} (fonte: {passage['source']})"
            for passage in passages
        )
        return (
            "Trechos recuperados da base documental (sem geração por LLM):\n" + excerpts,
            "retrieval_only",
        )

    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "prompt": (
            "Responda em português usando somente o contexto. Se ele não responder "
            "à pergunta, diga isso claramente. Não dê diagnóstico, tratamento ou "
            "orientação clínica. Cite os nomes dos arquivos-fonte.\n\n"
            f"CONTEXTO:\n{context}\n\nPERGUNTA:\n{question}"
        ),
    }
    request = Request(
        f"{OLLAMA_URL}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Não foi possível consultar o Ollama configurado: {error}") from error

    answer = result.get("response")
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError("O Ollama respondeu sem texto de resposta.")
    return answer.strip(), "ollama_rag"


def answer_question(question: str) -> dict[str, object]:
    passages = retrieve(question)
    answer, mode = generate_grounded_answer(question, passages)
    return {
        "question": question,
        "answer": answer,
        "mode": mode,
        "sources": [
            {"file": passage["source"], "relevance": passage["relevance"]}
            for passage in passages
        ],
        "notice": "Base educacional do protótipo; não contém dados oficiais nem orientação médica.",
    }
