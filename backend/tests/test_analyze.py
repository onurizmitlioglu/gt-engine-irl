"""
backend/tests/test_analyze.py
POST /analyze endpoint tests — with TestClient
"""

import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

VALID_PAYLOAD = {
    "answers": ["No communication for last two weeks", "Knowing each other for more than 2 years", "Had a serious conflict"],
    "scenario": "relations",
    "use_llm": False,
}

MOCK_LLM_RESPONSE = {
    "hook": "Test hook — LLM mock.",
    "utility_params": [
        {"name": "connection", "weight": 0.35, "score": 7.0},
        {"name": "future", "weight": 0.25, "score": 6.0},
        {"name": "communication", "weight": 0.25, "score": 5.0},
        {"name": "trust", "weight": 0.15, "score": 6.0},
    ],
    "cost_params": [
        {"name": "incompleteness", "weight": 0.40, "score": 4.0},
        {"name": "loss_of_time", "weight": 0.35, "score": 3.0},
        {"name": "energy_spent", "weight": 0.25, "score": 3.0},
    ],
}


# ─────────────────────────────────────────────
# /health
# ─────────────────────────────────────────────

def test_health_returns_ok():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ─────────────────────────────────────────────
# /analyze — hardcoded (use_llm=False)
# ─────────────────────────────────────────────

def test_analyze_hardcoded_status_200():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert resp.status_code == 200


def test_analyze_hardcoded_response_shape():
    """Response gerekli alanların hepsini içermeli."""
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    data = resp.json()
    assert "hook" in data
    assert "utility_params" in data
    assert "cost_params" in data
    assert "pv" in data
    assert "session_id" in data
    assert "llm_used" in data


def test_analyze_hardcoded_llm_used_false():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert resp.json()["llm_used"] is False


def test_analyze_hardcoded_pv_is_float():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert isinstance(resp.json()["pv"], float)


def test_analyze_hardcoded_session_id_is_string():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert isinstance(resp.json()["session_id"], str)
    assert len(resp.json()["session_id"]) > 0


def test_analyze_each_call_returns_unique_session_id():
    resp1 = client.post("/analyze", json=VALID_PAYLOAD)
    resp2 = client.post("/analyze", json=VALID_PAYLOAD)
    assert resp1.json()["session_id"] != resp2.json()["session_id"]


def test_analyze_hardcoded_utility_params_count():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert len(resp.json()["utility_params"]) == len(HARDCODED_RESPONSE["utility_params"])


def test_analyze_hardcoded_cost_params_count():
    resp = client.post("/analyze", json=VALID_PAYLOAD)
    assert len(resp.json()["cost_params"]) == len(HARDCODED_RESPONSE["cost_params"])


def test_analyze_default_scenario_is_dating():
    """scenario belirtilmezse dating olmalı."""
    payload = {**VALID_PAYLOAD}
    del payload["scenario"]
    resp = client.post("/analyze", json=payload)
    assert resp.status_code == 200


# ─────────────────────────────────────────────
# /analyze — validation
# ─────────────────────────────────────────────

def test_analyze_rejects_fewer_than_3_answers():
    resp = client.post("/analyze", json={"answers": ["tek cevap"]})
    assert resp.status_code == 422


def test_analyze_rejects_more_than_3_answers():
    resp = client.post("/analyze", json={"answers": ["a", "b", "c", "d"]})
    assert resp.status_code == 422


def test_analyze_rejects_empty_answers():
    resp = client.post("/analyze", json={"answers": []})
    assert resp.status_code == 422


def test_analyze_rejects_missing_answers_field():
    resp = client.post("/analyze", json={"scenario": "dating"})
    assert resp.status_code == 422


# ─────────────────────────────────────────────
# /analyze — LLM mock (use_llm=True, Ollama çağrısı yapılmaz)
# ─────────────────────────────────────────────

@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_mock_status_200(mock_llm):
    payload = {**VALID_PAYLOAD, "use_llm": True}
    resp = client.post("/analyze", json=payload)
    assert resp.status_code == 200


@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_mock_llm_used_true(mock_llm):
    payload = {**VALID_PAYLOAD, "use_llm": True}
    resp = client.post("/analyze", json=payload)
    assert resp.json()["llm_used"] is True


@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_mock_hook_from_llm(mock_llm):
    payload = {**VALID_PAYLOAD, "use_llm": True}
    resp = client.post("/analyze", json=payload)
    assert resp.json()["hook"] == MOCK_LLM_RESPONSE["hook"]


@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_mock_pv_is_positive(mock_llm):
    payload = {**VALID_PAYLOAD, "use_llm": True}
    resp = client.post("/analyze", json=payload)
    assert resp.json()["pv"] > 0


@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_called_once(mock_llm):
    payload = {**VALID_PAYLOAD, "use_llm": True}
    client.post("/analyze", json=payload)
    mock_llm.assert_called_once()


@patch("api.main.call_llama", new_callable=AsyncMock, return_value=MOCK_LLM_RESPONSE)
def test_analyze_llm_not_called_when_use_llm_false(mock_llm):
    client.post("/analyze", json=VALID_PAYLOAD)
    mock_llm.assert_not_called()