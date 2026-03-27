import uuid
import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select

from db.database import AsyncSessionLocal
from db import models
from engine.models.base_model import Parameter
from engine.models.utility_cost_model import UtilityCostModel
from services.game_session import GameSession, PhaseResult
from api.limiter import limiter
from api.schemas import (
    AnalyzeRequest, AnalyzeResponse, ParameterOut,
    WinConditionRequest, ActionRequest, ActionsResponse, Action,
    UpdateRequest, UpdateResponse,
)
from api.llm import call_llama, call_llama_actions, call_llama_update

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@router.post("/analyze")
@limiter.limit("2/day")
async def analyze(request: Request, body: AnalyzeRequest):
    if body.use_llm:
        llm_data = await call_llama(body.answers)

    if llm_data.get("status") == "out_of_scope":
        return JSONResponse(content={"status": "out_of_scope"})

    try:
        utility_params = [
            Parameter(name=p["name"], weight=p["weight"], score=max(0.0, float(p["score"])))
            for p in llm_data["utility_params"]
        ]
        cost_params = [
            Parameter(name=p["name"], weight=p["weight"], score=max(0.0, float(p["score"])))
            for p in llm_data["cost_params"]
        ]
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=422, detail=f"Parametre parse hatası: {e}")

    model = UtilityCostModel(utility_params=utility_params, cost_params=cost_params)
    result = model.compute()

    session = GameSession(template_id=body.scenario)
    session.record_phase(PhaseResult(phase=1, pv=result.value, advance=result.value >= 1.0))

    goals = llm_data.get("suggested_goals", [])
    horizon_defaults = ["short", "medium", "long"]
    for i, goal in enumerate(goals):
        if not goal.get("horizon") or goal["horizon"] not in ["short", "medium", "long"]:
            goal["horizon"] = horizon_defaults[i] if i < 3 else "long"

    async with AsyncSessionLocal() as db:
        db_session = models.Session(
            session_id=str(session.session_id),
            scenario=body.scenario,
            gt_model="utility_cost",
            current_phase=1,
            total_phases=1,
            user_id=body.user_id,
            story_summary=" ".join(body.answers),
            update_history=[],
            scenario_title=llm_data.get("scenario_title", ""),
            current_stage=llm_data.get("initial_stage", ""),
        )
        db.add(db_session)

        db_phase = models.PhaseResult(
            session_id=str(session.session_id),
            phase=1,
            pv=round(result.value, 4),
            advance=result.value >= 1.0,
            parameters={
                "utility": [{"name": p.name, "weight": p.weight, "score": p.score, "display_name": next((x.get("display_name") for x in llm_data["utility_params"] if x["name"] == p.name), p.name)} for p in utility_params],
                "cost": [{"name": p.name, "weight": p.weight, "score": p.score, "display_name": next((x.get("display_name") for x in llm_data["cost_params"] if x["name"] == p.name), p.name)} for p in cost_params],
            }
        )
        db.add(db_phase)

        for goal in goals:
            new_id = str(uuid.uuid4())
            goal["id"] = new_id
            db_goal = models.SuggestedGoal(
                id=new_id,
                session_id=str(session.session_id),
                horizon=goal.get("horizon", "short"),
                label=goal.get("label", ""),
                is_selected=False,
            )
            db.add(db_goal)
        await db.commit()

    return AnalyzeResponse(
        hook=llm_data["hook"],
        utility_params=[ParameterOut(**p) for p in llm_data["utility_params"]],
        cost_params=[ParameterOut(**p) for p in llm_data["cost_params"]],
        pv=round(result.value, 4),
        session_id=str(session.session_id),
        llm_used=body.use_llm,
        suggested_goals=goals,
        scenario_title=llm_data.get("scenario_title", ""),
        current_stage=llm_data.get("initial_stage", ""),
    )


@router.post("/win_conditions", response_model=dict)
async def add_win_condition(request: WinConditionRequest):
    async with AsyncSessionLocal() as db:
        wc = models.WinCondition(session_id=request.session_id, label=request.label, achieved=False)
        db.add(wc)
        await db.commit()
        await db.refresh(wc)
    return {"id": wc.id, "label": wc.label, "achieved": wc.achieved}


@router.patch("/win_conditions/{win_condition_id}")
async def update_win_condition(win_condition_id: int, achieved: bool):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.WinCondition).where(models.WinCondition.id == win_condition_id))
        wc = result.scalar_one_or_none()
        if not wc:
            raise HTTPException(status_code=404, detail="Win condition bulunamadı.")
        wc.achieved = achieved
        await db.commit()
    return {"status": "ok"}


@router.delete("/win_conditions/{win_condition_id}")
async def delete_win_condition(win_condition_id: int):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.WinCondition).where(models.WinCondition.id == win_condition_id))
        wc = result.scalar_one_or_none()
        if not wc:
            raise HTTPException(status_code=404, detail="Win condition bulunamadı.")
        await db.delete(wc)
        await db.commit()
    return {"status": "ok"}


@router.post("/actions", response_model=ActionsResponse)
@limiter.limit("2/day")
async def get_actions(request: Request, body: ActionRequest):
    story_summary = ""
    update_history = []
    current_stage = ""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Session).where(models.Session.session_id == body.session_id))
        session = result.scalar_one_or_none()
        if session:
            story_summary = session.story_summary or ""
            update_history = session.update_history or []
            current_stage = session.current_stage or ""

    llm_data = await call_llama_actions(
        pv=body.pv, scenario=body.scenario, phase=body.phase,
        utility_params=body.utility_params, cost_params=body.cost_params,
        story_summary=story_summary, update_history=update_history, current_stage=current_stage,
    )

    try:
        actions = [Action(**a) for a in llm_data["actions"]]
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=422, detail=f"Aksiyon parse hatası: {e}")

    action_ids = []
    async with AsyncSessionLocal() as db:
        for action in actions:
            db_action = models.SuggestedAction(
                session_id=body.session_id, phase=body.phase,
                label=action.label, description=action.description,
                risk=action.risk, gt_rationale=action.gt_rationale, is_selected=False,
            )
            db.add(db_action)
            await db.flush()
            action_ids.append(db_action.id)
        await db.commit()

    for i, action in enumerate(actions):
        action.id = action_ids[i]

    return ActionsResponse(actions=actions, suggested_win_conditions=llm_data.get("suggested_win_conditions", []))


@router.patch("/sessions/{session_id}/user")
async def update_session_user(session_id: str, user_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Session).where(models.Session.session_id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session bulunamadı.")
        session.user_id = user_id
        await db.commit()
    return {"status": "ok"}


@router.patch("/sessions/{session_id}/goal")
async def update_session_goal(session_id: str, goal_id: str):
    horizon_to_phases = {"short": 1, "medium": 2, "long": 3}
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Session).where(models.Session.session_id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session bulunamadı.")
        session.selected_goal_id = goal_id

        goal_result = await db.execute(
            select(models.SuggestedGoal).where(
                models.SuggestedGoal.session_id == session_id,
                models.SuggestedGoal.id == goal_id
            )
        )
        db_goal = goal_result.scalar_one_or_none()
        if db_goal:
            db_goal.is_selected = True
            if db_goal.horizon in horizon_to_phases:
                session.total_phases = horizon_to_phases[db_goal.horizon]
        await db.commit()
    return {"status": "ok"}


@router.post("/update", response_model=UpdateResponse)
@limiter.limit("2/day")
async def update_session(request: Request, body: UpdateRequest):
    story_summary = ""
    update_history = []
    current_stage = ""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Session).where(models.Session.session_id == body.session_id))
        session_data = result.scalar_one_or_none()
        if session_data:
            story_summary = session_data.story_summary or ""
            update_history = session_data.update_history or []
            current_stage = session_data.current_stage or ""

    llm_data = await call_llama_update(
        update_text=body.update_text, utility_params=body.utility_params,
        cost_params=body.cost_params, selected_action_label=body.selected_action_label,
        story_summary=story_summary, update_history=update_history, current_stage=current_stage,
    )

    if llm_data.get("status") == "out_of_scope":
        return JSONResponse(content={"status": "out_of_scope"})

    try:
        new_utility_params = [
            Parameter(
                name=p.name,
                weight=p.weight,
                score=max(0.01, float(next(
                    (x["score"] for x in llm_data["utility_params"] if x["name"] == p.name),
                    p.score
                )))
            )
            for p in body.utility_params
        ]
        new_cost_params = [
            Parameter(
                name=p.name,
                weight=p.weight,
                score=max(0.01, float(next(
                    (x["score"] for x in llm_data["cost_params"] if x["name"] == p.name),
                    p.score
                )))
            )
            for p in body.cost_params
        ]
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=422, detail=f"Parametre parse hatası: {e}")

    model = UtilityCostModel(utility_params=new_utility_params, cost_params=new_cost_params)
    result = model.compute()
    old_model = UtilityCostModel(utility_params=body.utility_params, cost_params=body.cost_params)
    old_result = old_model.compute()
    previous_pv = round(old_result.value, 4)
    new_pv = round(result.value, 4)

    new_phase = 1
    session = None
    async with AsyncSessionLocal() as db:
        result_query = await db.execute(select(models.Session).where(models.Session.session_id == body.session_id))
        session = result_query.scalar_one_or_none()
        if session:
            session.current_phase += 1
            new_phase = session.current_phase
            history = session.update_history or []
            history.append(body.update_text)
            session.update_history = history
            if llm_data.get("stage_changed") and llm_data.get("stage"):
                session.current_stage = llm_data["stage"]

            db_phase = models.PhaseResult(
                session_id=body.session_id, phase=new_phase, pv=new_pv, advance=new_pv >= 1.0,
                parameters={
                    "utility": [{"name": p.name, "weight": p.weight, "score": p.score, "display_name": next((x.display_name for x in body.utility_params if x.name == p.name), p.name)} for p in new_utility_params],
                    "cost": [{"name": p.name, "weight": p.weight, "score": p.score, "display_name": next((x.display_name for x in body.cost_params if x.name == p.name), p.name)} for p in new_cost_params],
                }
            )
            db.add(db_phase)

            if body.selected_action_id:
                action_result = await db.execute(select(models.SuggestedAction).where(models.SuggestedAction.id == body.selected_action_id))
                selected_action = action_result.scalar_one_or_none()
                if selected_action:
                    selected_action.is_selected = True
            await db.commit()

    phase_completed = new_pv >= 1.5 and previous_pv < 1.5

    return UpdateResponse(
        hook=llm_data["hook"],
        utility_params=[ParameterOut(**p) for p in llm_data["utility_params"]],
        cost_params=[ParameterOut(**p) for p in llm_data["cost_params"]],
        pv=new_pv, pv_delta=round(new_pv - previous_pv, 4), previous_pv=previous_pv,
        phase_completed=phase_completed, current_phase=new_phase,
        current_stage=llm_data.get("stage", ""), stage_changed=llm_data.get("stage_changed", False),
    )


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.User).where(models.User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        return {"user_id": user.id, "type": user.type, "display": user.email if user.type == "registered" else user.code}


@router.get("/users/{user_id}/last_session")
async def get_last_session(user_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(models.Session).where(models.Session.user_id == user_id)
            .order_by(models.Session.created_at.desc()).limit(1)
        )
        session = result.scalar_one_or_none()
        if not session:
            return {"session": None}

        phase_result = await db.execute(
            select(models.PhaseResult).where(models.PhaseResult.session_id == session.session_id)
            .order_by(models.PhaseResult.phase.desc()).limit(1)
        )
        last_phase = phase_result.scalar_one_or_none()

        wc_result = await db.execute(select(models.WinCondition).where(models.WinCondition.session_id == session.session_id))
        win_conditions = wc_result.scalars().all()

        actions_result = await db.execute(
            select(models.SuggestedAction).where(models.SuggestedAction.session_id == session.session_id)
            .order_by(models.SuggestedAction.phase.desc()).limit(2)
        )
        actions = actions_result.scalars().all()

        return {
            "session": {
                "session_id": session.session_id,
                "scenario": session.scenario,
                "current_phase": session.current_phase,
                "total_phases": session.total_phases,
                "selected_goal_id": session.selected_goal_id,
                "pv": last_phase.pv if last_phase else None,
                "parameters": last_phase.parameters if last_phase else None,
                "scenario_title": session.scenario_title or "",
                "current_stage": session.current_stage or "",
                "win_conditions": [{"id": wc.id, "label": wc.label, "achieved": wc.achieved} for wc in win_conditions],
                "actions": [{"id": a.id, "label": a.label, "description": a.description, "risk": a.risk, "gt_rationale": a.gt_rationale, "is_selected": a.is_selected} for a in actions],
            }
        }