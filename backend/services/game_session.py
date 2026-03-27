from pydantic import BaseModel as PydanticBaseModel, Field
import uuid

# Boolean win condition (Event X has happened -> YES or NO)
# TODO (FEATURE): In future, add continuous and discrete conditions after MVP.
class WinCondition(PydanticBaseModel):
    label: str
    achieved: bool = False


class PhaseResult(PydanticBaseModel):
    phase: int
    pv: float
    advance: bool


class GameSession(PydanticBaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    template_id: str
    current_phase: int = 1
    phase_results: list[PhaseResult] = []
    win_conditions: list[WinCondition] = []

    def record_phase(self, result: PhaseResult) -> None:
        self.phase_results.append(result)
        if result.advance:
            self.current_phase += 1

    def is_won(self) -> bool:
        pv_ok = self.phase_results[-1].advance if self.phase_results else False
        return pv_ok and all(wc.achieved for wc in self.win_conditions)