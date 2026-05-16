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


def sales_focused_actions(data: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in sorted(data["salesman_leaderboard"], key=lambda r: float(r.get("budget_shortfall") or 0), reverse=True)[:4]:
        rows.append({
            "issue_type": "Budget shortfall",
            "severity": 5 if float(row.get("budget_shortfall") or 0) > 500000 else 4,
            "owner": row["salesman"],
            "subject": "Sales run-rate",
            "impact_aed": row.get("budget_shortfall"),
            "recommended_action": "Increase daily billing pace to close the budget gap",
        })
    for row in sorted(data["customer_top"], key=lambda r: float(r.get("expectation_amount") or 0), reverse=True)[:4]:
        rows.append({
            "issue_type": "Projection gap",
            "severity": 5 if float(row.get("expectation_amount") or 0) > 100000 else 4,
            "owner": row["salesman"],
            "subject": row["customer_name"],
            "impact_aed": row.get("expectation_amount"),
            "recommended_action": "Lock LPO / confirmed billing date",
        })
    for row in data["gp_alerts_top"][:4]:
        rows.append({
            "issue_type": row.get("alert_type"),
            "severity": row.get("severity"),
            "owner": row.get("salesman"),
            "subject": f"{row.get('customer_name')} · {row.get('product_group')}",
            "impact_aed": abs(float(row.get("gross_profit") or row.get("costed_revenue") or 0)),
            "recommended_action": "Review pricing and GP leakage",
        })
    return rows[:12]


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="azg-tyres-dashboard-api")


@app.get("/api/dashboard/command-center")
def command_center() -> dict[str, Any]:
    data = load_mock_data()
    return {
        "generated_at": data["generated_at"],
        "context": data["context"],
        "sales_command_center": {
            "shortfall_bridge": data["command_center"]["shortfall_bridge"],
            "gp_mtd": data["command_center"]["gp_mtd"],
        },
        "salesman_leaderboard": data["salesman_leaderboard"][:12],
        "region_current": data["region_current"],
        "product_mix_top": data["product_mix_top"][:20],
        "customer_watch": data["customer_top"][:30],
        "gp_alerts_top": data["gp_alerts_top"][:20],
        "sales_action_center": sales_focused_actions(data),
    }


@app.get("/api/dashboard/kpi-dictionary")
def kpi_dictionary() -> dict[str, Any]:
    dictionary = REPO_ROOT / "semantic" / "kpi_dictionary.md"
    return {"markdown": dictionary.read_text(encoding="utf-8")}
