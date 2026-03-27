# Abstract base model which will be inherited by almost all others 
# (except Sequential, it needs a tree)
from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel as PydanticBaseModel, Field


# Parameter
class Parameter(PydanticBaseModel):
    """A single input parameter with name, weight and score"""
    name: str
    weight: float = Field(gt=0, le=1)
    score: float = Field(ge=0, le=10)

# GameResult
class GameResult(PydanticBaseModel):
    """The output of a games compute() method"""
    model_name: str
    value: float
    metadata: dict[str, Any] = {}

# BaseModel
class BaseModel(ABC):
    """Abstract base class for all game theory models.
    All models must implement their own compute() method.
    """

    @abstractmethod
    def compute(self) -> GameResult:
        """Run model, return GameResult object"""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Return name of the game theory model"""
        pass