import pytest
from backend.engine.models.base_model import BaseModel, GameResult

# Concrete class to test
class ConcreteModel(BaseModel):
    @property
    def model_name(self):
        return "concrete_model"
    
    def compute(self) -> GameResult:
        return GameResult(model_name=self.model_name, value=1.0)

# Incomplete class to test    
class IncompleteModel(BaseModel):
    pass

# Tests
def test_base_model_cannot_be_instantiated():
    """BaseModel is abstract and cannot be instantiated directly"""
    with pytest.raises(TypeError):
        BaseModel()

def test_incomplete_class_cannot_be_instantiated():
    """A subclass that does not implement compute() cannot be instantiated."""
    with pytest.raises(TypeError):
        IncompleteModel()

def test_concrete_subclass_returns_game_result():
    """A complete subclass can be instantiated and compute() returns GameResult"""
    model = ConcreteModel()
    result = model.compute()
    assert isinstance(result, GameResult)
    assert result.model_name == "concrete_model"
    assert result.value == 1.0