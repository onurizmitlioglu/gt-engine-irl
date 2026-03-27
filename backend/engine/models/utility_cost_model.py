from .base_model import BaseModel, Parameter, GameResult

class UtilityCostModel(BaseModel):
    
    def __init__(
            self,
            utility_params: list[Parameter],
            cost_params: list[Parameter],
            phase: int = 1,
            phase_threshold: float = 2.5
    ):
        self.utility_params = utility_params
        self.cost_params = cost_params
        self.phase = phase
        self.phase_threshold = phase_threshold

    @property
    def model_name(self) -> str:
        return "utility_cost_model"
    
    def compute(self) -> GameResult:
        utility_score = sum(p.weight * p.score for p in self.utility_params)
        cost_score = sum(p.weight * p.score for p in self.cost_params)

        if cost_score == 0:
            raise ValueError("cost_score cannot be zero — check cost_params weights and scores.")
    
        perceived_value = utility_score / cost_score

        return GameResult(
            model_name = self.model_name,
            value = perceived_value,
            metadata = {
                "phase": self.phase,
                "utility_score": utility_score,
                "cost_score": cost_score,
                "phase_threshold": self.phase_threshold,
                "advance": perceived_value >= self.phase_threshold
            }
        )