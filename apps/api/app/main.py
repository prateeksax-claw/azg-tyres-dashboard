from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel

REPO_ROOT = Path(__file__).resolve().parents[3]
MOCK_DATA_PATH = REPO_ROOT / "mock-data" / "dashboard_sample_redacted.json"

app = FastAPI(title="AZG Tyres Dashboard API", version="0.1.0")

class Health(BaseModel):
    status: str
    service: str


def load_mock_data() -> dict[str, Any]:
    with MOCK_DATA_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="azg-tyres-dashboard-api")


@app.get("/api/dashboard/command-center")
def command_center() -> dict[str, Any]:
    data = load_mock_data()
    return {
        "generated_at": data["generated_at"],
        "context": data["context"],
        "command_center": data["command_center"],
        "salesman_leaderboard": data["salesman_leaderboard"][:12],
        "region_current": data["region_current"],
        "product_mix_top": data["product_mix_top"][:20],
        "action_center_top": data["action_center_top"][:50],
    }


@app.get("/api/dashboard/kpi-dictionary")
def kpi_dictionary() -> dict[str, Any]:
    dictionary = REPO_ROOT / "semantic" / "kpi_dictionary.md"
    return {"markdown": dictionary.read_text(encoding="utf-8")}
