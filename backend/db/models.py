import uuid
import random
import string
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


def generate_user_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String(20), default="anonymous")  # anonymous | registered
    code = Column(String(8), nullable=True, unique=True)
    email = Column(String(255), nullable=True, unique=True)
    password_hash = Column(String(255), nullable=True)
    plan = Column(String(20), default="free")  # free | premium | b2b
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("Session", back_populates="user")


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    scenario = Column(String(50), default="relations")
    gt_model = Column(String(50), default="utility_cost")
    selected_goal_id = Column(String(36), nullable=True)
    current_phase = Column(Integer, default=1)
    total_phases = Column(Integer, default=1)
    story_summary = Column(Text, nullable=True)
    update_history = Column(JSON, nullable=True, default=list)
    scenario_title = Column(String, nullable=True)
    current_stage = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    suggested_goals = relationship("SuggestedGoal", back_populates="session")
    phase_results = relationship("PhaseResult", back_populates="session")
    win_conditions = relationship("WinCondition", back_populates="session")
    suggested_actions = relationship("SuggestedAction", back_populates="session")

class SuggestedGoal(Base):
    __tablename__ = "suggested_goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    horizon = Column(String(10), nullable=False)  # short | medium | long
    label = Column(String(500), nullable=False)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="suggested_goals")

class PhaseResult(Base):
    __tablename__ = "phase_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    phase = Column(Integer, nullable=False)
    pv = Column(Float, nullable=False)
    advance = Column(Boolean, default=False)
    parameters = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="phase_results")


class WinCondition(Base):
    __tablename__ = "win_conditions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    label = Column(String(500), nullable=False)
    achieved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="win_conditions")


class SuggestedAction(Base):
    __tablename__ = "suggested_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    phase = Column(Integer, nullable=False)
    label = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=False)
    risk = Column(String(10), nullable=False)
    gt_rationale = Column(String(1000), nullable=False)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="suggested_actions")