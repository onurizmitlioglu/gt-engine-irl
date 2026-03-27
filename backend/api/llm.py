import json
import os
from fastapi import HTTPException
from groq import AsyncGroq
from api.prompts import SYSTEM_PROMPT, ACTIONS_PROMPT, UPDATE_PROMPT

GROQ_MODEL = os.getenv("GROQ_MODEL")
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


async def call_llama(answers: list[str]) -> dict:
    user_message = f"Relationship story of the user: {answers[0]}"

    response = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=f"LLM did not return valid JSON. Raw: {raw[:200]}")

    if data.get("status") == "out_of_scope":
        return data

    for p in data.get("utility_params", []):
        p["display_name"] = p["name"]
    for p in data.get("cost_params", []):
        p["display_name"] = p["name"]

    return data


async def call_llama_actions(pv: float, scenario: str, phase: int, utility_params: list, cost_params: list, story_summary: str = "", update_history: list = [], current_stage: str = "") -> dict:
    all_params = (
        "\n".join([f"  {p.name}: {p.score}/10 (utility)" for p in utility_params]) +
        "\n" +
        "\n".join([f"  {p.name}: {p.score}/10 (cost)" for p in cost_params])
    )
    weakest = min(utility_params, key=lambda p: p.score)

    context = ""
    if story_summary:
        context += f"Original story: {story_summary}\n"
    if current_stage:
        context += f"Current relationship stage: {current_stage}\n"
    if update_history:
        recent = update_history[-3:]
        context += f"Recent updates ({len(recent)} most recent):\n"
        for i, update in enumerate(recent, 1):
            context += f"  {i}. {update}\n"

    user_message = (
        f"{context}"
        f"Scenario: {scenario}\n"
        f"Phase: {phase}\n"
        f"Position Value (PV): {pv}\n"
        f"Weakest parameter: {weakest.name} (score: {weakest.score})\n"
        f"All parameters:\n{all_params}"
    )

    response = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": ACTIONS_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=f"LLM did not return valid JSON. Raw: {raw[:200]}")

    return data


async def call_llama_update(update_text: str, utility_params: list, cost_params: list, selected_action_label: str, story_summary: str = "", update_history: list = [], current_stage: str = "") -> dict:
    previous_params = (
        "\n".join([f"  {p.name}: {p.score}/10 (utility)" for p in utility_params]) +
        "\n" +
        "\n".join([f"  {p.name}: {p.score}/10 (cost)" for p in cost_params])
    )

    context = ""
    if story_summary:
        context += f"Original story: {story_summary}\n"
    if current_stage:
        context += f"Current relationship stage: {current_stage}\n"
    if update_history:
        recent = update_history[-3:]
        context += f"Previous updates ({len(recent)} most recent):\n"
        for i, update in enumerate(recent, 1):
            context += f"  {i}. {update}\n"

    user_message = (
        f"{context}"
        f"Previously selected action: {selected_action_label}\n"
        f"Previous parameter scores:\n{previous_params}\n"
        f"User update: {update_text}"
    )

    response = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": UPDATE_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=f"LLM did not return valid JSON. Raw: {raw[:200]}")

    if data.get("status") == "out_of_scope":
        return data

    for p in data.get("utility_params", []):
        p["display_name"] = p["name"]
    for p in data.get("cost_params", []):
        p["display_name"] = p["name"]

    return data