from backend.services.game_session import GameSession, PhaseResult, WinCondition


# --- Helpers ---

def make_phase_result(phase: int, pv: float, advance: bool) -> PhaseResult:
    return PhaseResult(phase=phase, pv=pv, advance=advance)


def make_win_condition(label: str, achieved: bool) -> WinCondition:
    return WinCondition(label=label, achieved=achieved)


# --- Tests ---

# Basic

def test_session_id_is_auto_generated():
    """session_id should be automatically generated on creation."""
    session = GameSession(template_id="relations")
    assert session.session_id is not None
    assert len(session.session_id) > 0


def test_session_id_is_unique():
    """Each GameSession should have a unique session_id."""
    session1 = GameSession(template_id="relations")
    session2 = GameSession(template_id="relations")
    assert session1.session_id != session2.session_id


def test_initial_phase_is_one():
    """current_phase should start at 1."""
    session = GameSession(template_id="relations")
    assert session.current_phase == 1


# record_phase

def test_record_phase_appends_result():
    """record_phase() should append PhaseResult to phase_results."""
    session = GameSession(template_id="relations")
    result = make_phase_result(phase=1, pv=2.51, advance=True)
    session.record_phase(result)
    assert len(session.phase_results) == 1
    assert session.phase_results[0].pv == 2.51


def test_record_phase_advances_when_true():
    """current_phase should increment when advance=True."""
    session = GameSession(template_id="relations")
    result = make_phase_result(phase=1, pv=2.51, advance=True)
    session.record_phase(result)
    assert session.current_phase == 2


def test_record_phase_does_not_advance_when_false():
    """current_phase should not increment when advance=False."""
    session = GameSession(template_id="relations")
    result = make_phase_result(phase=1, pv=1.2, advance=False)
    session.record_phase(result)
    assert session.current_phase == 1


def test_record_multiple_phases_in_order():
    """Multiple phase results should be recorded in order."""
    session = GameSession(template_id="relations")
    session.record_phase(make_phase_result(phase=1, pv=2.51, advance=True))
    session.record_phase(make_phase_result(phase=2, pv=1.50, advance=True))
    session.record_phase(make_phase_result(phase=3, pv=1.17, advance=True))
    assert len(session.phase_results) == 3
    assert session.phase_results[0].phase == 1
    assert session.phase_results[1].phase == 2
    assert session.phase_results[2].phase == 3


# is_won

def test_is_won_no_win_conditions_pv_ok():
    """is_won() should return True when no win conditions and PV advance=True."""
    session = GameSession(template_id="relations")
    session.record_phase(make_phase_result(phase=1, pv=2.51, advance=True))
    assert session.is_won() is True


def test_is_won_all_conditions_met_pv_ok():
    """is_won() should return True when all win conditions achieved and PV advance=True."""
    session = GameSession(
        template_id="relations",
        win_conditions=[
            make_win_condition("w1_completed", achieved=True),
            make_win_condition("w2_completed", achieved=True),
        ]
    )
    session.record_phase(make_phase_result(phase=3, pv=1.17, advance=True))
    assert session.is_won() is True


def test_is_won_false_when_pv_not_advance():
    """is_won() should return False when PV advance=False even if win conditions met."""
    session = GameSession(
        template_id="relations",
        win_conditions=[make_win_condition("w1_completed", achieved=True)]
    )
    session.record_phase(make_phase_result(phase=1, pv=0.8, advance=False))
    assert session.is_won() is False


def test_is_won_false_when_win_condition_not_met():
    """is_won() should return False when a win condition is not achieved."""
    session = GameSession(
        template_id="relations",
        win_conditions=[make_win_condition("w1_completed", achieved=False)]
    )
    session.record_phase(make_phase_result(phase=1, pv=2.51, advance=True))
    assert session.is_won() is False


def test_is_won_false_when_no_phase_results():
    """is_won() should return False when no phase results recorded."""
    session = GameSession(template_id="relations")
    assert session.is_won() is False