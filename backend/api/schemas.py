from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    answers: list[str] = Field(
        ...,
        min_length=1,
        max_length=1,
        description="Users story",
    )
    scenario: str = Field(default="relations")
    use_llm: bool = Field(default=False)
    user_id: Optional[str] = None


class ParameterOut(BaseModel):
    name: str
    weight: float
    score: float
    display_name: Optional[str] = None


class AnalyzeResponse(BaseModel):
    hook: str
    utility_params: list[ParameterOut]
    cost_params: list[ParameterOut]
    pv: float
    session_id: str
    llm_used: bool
    suggested_goals: list[dict]
    scenario_title: str = ""
    current_stage: str = ""

class WinConditionRequest(BaseModel):
    session_id: str
    label: str

class ActionRequest(BaseModel):
    pv: float
    scenario: str = Field(default="relations")
    phase: int = Field(default=1)
    session_id: str = Field(default="")
    utility_params: list[ParameterOut]
    cost_params: list[ParameterOut]

class Action(BaseModel):
    id: Optional[int] = None
    label: str
    description: str
    risk: str  # "low" | "high"
    gt_rationale: str

class ActionsResponse(BaseModel):
    actions: list[Action]
    suggested_win_conditions: list[str] = []

class UpdateRequest(BaseModel):
    session_id: str
    update_text: str
    selected_action_label: str
    selected_action_id: Optional[int] = None
    utility_params: list[ParameterOut]
    cost_params: list[ParameterOut]

class UpdateResponse(BaseModel):
    hook: str
    utility_params: list[ParameterOut]
    cost_params: list[ParameterOut]
    pv: float
    pv_delta: float
    previous_pv: float
    phase_completed: bool = False
    current_phase: int = 1
    current_stage: str = ""
    stage_changed: bool = False
