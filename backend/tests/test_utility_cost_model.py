import pytest
from backend.engine.models.base_model import Parameter
from backend.engine.models.utility_cost_model import UtilityCostModel


# --- Phase 1 parameters ---
# Scores from 1.0 to 10.0, weights add up to 1.0
UTILITY_PARAMS = [
    Parameter(name="appearance", weight=0.25, score=6.0),
    Parameter(name="confidence", weight=0.20, score=3.0),
    Parameter(name="communication", weight=0.20, score=5.0),
    Parameter(name="financial_contribution", weight=0.20, score=5.0),
    Parameter(name="attention_sincerity", weight=0.15, score=7.0),
]

COST_PARAMS = [
    Parameter(name="response_time", weight=0.15, score=2.0),
    Parameter(name="message_frequency", weight=0.20, score=2.0),
    Parameter(name="meeting_frequency", weight=0.25, score=3.0),
    Parameter(name="financial_cost", weight=0.20, score=2.0),
    Parameter(name="physical_risk", weight=0.20, score=1.0),
]


# --- Tests ---

def test_pv_calculation_is_correct():
    """PV = utility_score / cost_score should be ~2.51 for Phase 1 dating model."""
    model = UtilityCostModel(utility_params=UTILITY_PARAMS, cost_params=COST_PARAMS)
    result = model.compute()
    assert round(result.value, 2) == 2.51


def test_utility_and_cost_scores_in_metadata():
    """utility_score and cost_score should be correct in metadata."""
    model = UtilityCostModel(utility_params=UTILITY_PARAMS, cost_params=COST_PARAMS)
    result = model.compute()
    assert round(result.metadata["utility_score"], 2) == 5.15
    assert round(result.metadata["cost_score"], 2) == 2.05


def test_advance_true_when_pv_exceeds_threshold():
    """advance should be True when PV >= phase_threshold."""
    model = UtilityCostModel(
        utility_params=UTILITY_PARAMS,
        cost_params=COST_PARAMS,
        phase_threshold=2.5
    )
    result = model.compute()
    assert result.metadata["advance"] is True


def test_advance_false_when_pv_below_threshold():
    """advance should be False when PV < phase_threshold."""
    model = UtilityCostModel(
        utility_params=UTILITY_PARAMS,
        cost_params=COST_PARAMS,
        phase_threshold=3.0
    )
    result = model.compute()
    assert result.metadata["advance"] is False


def test_phase_number_in_metadata():
    """Phase number should be correctly stored in metadata."""
    model = UtilityCostModel(
        utility_params=UTILITY_PARAMS,
        cost_params=COST_PARAMS,
        phase=2
    )
    result = model.compute()
    assert result.metadata["phase"] == 2


def test_zero_cost_score_raises_value_error():
    """compute() should raise ValueError when cost_score is zero."""
    zero_cost_params = [
        Parameter(name="param_1", weight=0.50, score=0.0),
        Parameter(name="param_2", weight=0.50, score=0.0),
    ]
    model = UtilityCostModel(utility_params=UTILITY_PARAMS, cost_params=zero_cost_params)
    with pytest.raises(ValueError):
        model.compute()


def test_single_parameter_works():
    """Model should work with a single utility and cost parameter."""
    model = UtilityCostModel(
        utility_params=[Parameter(name="param_1", weight=1.0, score=8.0)],
        cost_params=[Parameter(name="param_2", weight=1.0, score=4.0)]
    )
    result = model.compute()
    assert round(result.value, 2) == 2.0


def test_many_parameters_works():
    """Model should work correctly with many parameters."""
    many_params = [
        Parameter(name=f"param_{i}", weight=0.10, score=5.0) for i in range(10)
    ]
    model = UtilityCostModel(
        utility_params=many_params,
        cost_params=many_params
    )
    result = model.compute()
    assert result.value > 0


def test_pydantic_rejects_invalid_weight():
    """Parameter weight must be > 0 and <= 1."""
    with pytest.raises(Exception):
        Parameter(name="bad_param", weight=1.5, score=5.0)


def test_pydantic_rejects_invalid_score():
    """Parameter score must be >= 0 and <= 10."""
    with pytest.raises(Exception):
        Parameter(name="bad_param", weight=0.5, score=11.0)