import React, { useState, useEffect } from "react";
import { LogoSmall } from "../components/Logo";
import PVGauge from "../components/PVGauge";
import { scoreToColor } from "../utils/scoreToColor";
import { getActions } from "../api/actions";
import { API_URL } from "../api/config";
import { track } from '../analytics';


function ModelScreen({
  apiData, selectedGoal, pvAnimated, paramsAnimated,
  activeInfo, setActiveInfo,
  actions, setActions, actionsLoading, setActionsLoading,
  selectedAction, setSelectedAction,
  showWinConditions, setShowWinConditions,
  suggestedWinConditions, setSuggestedWinConditions,
  winConditions, setWinConditions,
  newCondition, setNewCondition,
  userInfo, setUserInfo, setUserId, setApiData,
  showLogout, setShowLogout,
  isMobile,
  setRateLimitMessage, setRateLimitVisible,
  setScreen, bg, grain, card,
}) {
  const horizonToPhases = { short: 1, medium: 2, long: 3 };
  const selectedGoalObj = (apiData?.suggested_goals || []).find(g => g.id === selectedGoal);
  const totalPhases = apiData?.total_phases || horizonToPhases[selectedGoalObj?.horizon] || 1;
  const [displayedTitle, setDisplayedTitle] = useState("");

  useEffect(() => {
    const title = apiData?.scenario_title || "Story Analysis";
    if (!title) return;
    setDisplayedTitle("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedTitle(title.slice(0, i + 1));
      i++;
      if (i >= title.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [apiData?.scenario_title]);

  return (
    <div style={bg}>
      <div style={grain} />
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "10px 24px", minHeight: "80px",
      }}>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", padding: "8px 0" }}>
          <LogoSmall />
        </div>
        <div style={{ marginLeft: "auto" }}>
          {userInfo && (
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowLogout(!showLogout)} style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-hover)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{userInfo.display}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>▼</span>
              </div>
              <div onClick={() => setShowLogout(!showLogout)} style={{ display: isMobile ? "flex" : "none", flexDirection: "column", gap: "5px", cursor: "pointer", padding: "8px" }}>
                <div style={{ width: "22px", height: "2px", background: "var(--text-secondary)", borderRadius: "2px" }} />
                <div style={{ width: "22px", height: "2px", background: "var(--text-secondary)", borderRadius: "2px" }} />
                <div style={{ width: "22px", height: "2px", background: "var(--text-secondary)", borderRadius: "2px" }} />
              </div>
              {showLogout && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", zIndex: 20, minWidth: "160px" }}>
                  {isMobile && (
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
                      {userInfo.display}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem("gt_user_id");
                      setUserId(null); setUserInfo(null); setApiData(null);
                      setShowLogout(false); setScreen("intro");
                    }}
                    style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ ...card, maxWidth: "520px", paddingTop: "72px" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "16px", letterSpacing: "0.2em", color: "var(--text-primary)", textTransform: "none", marginBottom: "6px" }}>
                SCENARIO: {displayedTitle}
              </p>
              <h3 style={{ fontSize: "24px", color: "#F5F0E8", fontWeight: "400", fontStyle: "italic", marginBottom: "12px" }}>
                Phase {apiData?.current_phase || 1} / {totalPhases}
                {apiData?.current_stage ? <span style={{ fontSize: "20px", color: "var(--accent)", marginLeft: "12px", fontStyle: "normal" }}>· {apiData.current_stage}</span> : null}
              </h3>
            </div>
          </div>
          <PVGauge value={pvAnimated} activeInfo={activeInfo} setActiveInfo={setActiveInfo} />
        </div>

        {/* Strengths */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", letterSpacing: "0.1em", color: "var(--text-primary)", margin: 0 }}>STRENGTHS</p>
            <span onClick={() => setActiveInfo(activeInfo === "strengths" ? null : "strengths")} style={{ fontSize: "12px", color: "#fff", cursor: "pointer", userSelect: "none" }}>ⓘ</span>
            {activeInfo === "strengths" && (
              <div onClick={() => setActiveInfo(null)} style={{ position: "absolute", marginTop: "60px", left: "0", right: "0", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", zIndex: 10, cursor: "pointer" }}>
                Strengths highlight the positive factors in your situation. High scores indicate areas that strengthen your position.
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {(apiData?.utility_params || []).map((param) => {
              const label = param.display_name || param.name;
              const color = scoreToColor(param.score);
              return (
                <div key={param.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{label}</span>
                    <span style={{ fontSize: "14px", color, fontFamily: "var(--font-mono)" }}>{parseFloat(param.score).toFixed(1)} / 10.0</span>
                  </div>
                  <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ height: "100%", width: `${(param.score / 10) * paramsAnimated}%`, borderRadius: "2px", background: color, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weaknesses */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", letterSpacing: "0.1em", color: "var(--text-primary)", margin: 0 }}>WEAKNESSES</p>
            <span onClick={() => setActiveInfo(activeInfo === "risks" ? null : "risks")} style={{ fontSize: "12px", color: "#fff", cursor: "pointer", userSelect: "none" }}>ⓘ</span>
            {activeInfo === "risks" && (
              <div onClick={() => setActiveInfo(null)} style={{ position: "absolute", marginTop: "60px", left: "0", right: "0", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", zIndex: 10, cursor: "pointer" }}>
                Weaknesses highlight the negative factors in your situation. High scores indicate areas that weaken your position.
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(apiData?.cost_params || []).map((param) => {
              const label = param.display_name || param.name;
              const color = scoreToColor(10 - param.score);
              return (
                <div key={param.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{label}</span>
                    <span style={{ fontSize: "14px", color, fontFamily: "var(--font-mono)" }}>{parseFloat(param.score).toFixed(1)} / 10.0</span>
                  </div>
                  <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ height: "100%", width: `${(param.score / 10) * paramsAnimated}%`, borderRadius: "2px", background: color, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: "32px" }}>
          {!actions && !actionsLoading && (
            <button
              onClick={async () => {
                setActionsLoading(true);
                try {
                  const data = await getActions(apiData);
                  track('actions_viewed', { session_id: apiData.session_id });
                  setActions(data.actions);
                  setSuggestedWinConditions(data.suggested_win_conditions || []);
                } catch (err) {
                  if (err.message === "rate_limited") {
                    setRateLimitMessage(true);
                    setRateLimitVisible(true);
                    setTimeout(() => {
                      setRateLimitVisible(false);
                      setTimeout(() => setRateLimitMessage(false), 1000);
                    }, 5000);
                  }
                  console.error(err);
                } finally { setActionsLoading(false); }
              }}
              style={{ width: "100%", padding: "16px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", color: "var(--accent)", fontSize: "15px", letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
            >
              SHOW NEXT STEP
            </button>
          )}

          {actionsLoading && (
            <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px 24px", fontSize: "15px", color: "var(--text-secondary)", fontStyle: "italic", fontWeight: "600", zIndex: 100, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
              Calculating possible next moves...
            </div>
          )}

          {actions && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", letterSpacing: "0.1em", color: "var(--text-primary)", margin: 0 }}>PICK NEXT MOVE</p>
                <span onClick={() => setActiveInfo(activeInfo === "actions" ? null : "actions")} style={{ fontSize: "12px", color: "#fff", cursor: "pointer", userSelect: "none" }}>ⓘ</span>
                {activeInfo === "actions" && (
                  <div onClick={() => setActiveInfo(null)} style={{ position: "absolute", marginTop: "60px", left: "0", right: "0", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", zIndex: 10, cursor: "pointer" }}>
                    Choose your next move to advance your position within your story.
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {actions.map((action, i) => (
                  <button key={i} 
                    onClick={() => {
                      setSelectedAction(i);
                      track('action_selected', { action_label: action.label, risk: action.risk, session_id: apiData.session_id });
                    }} 
                    style={{ width: "100%", padding: "16px", background: selectedAction === i ? "var(--accent-bg)" : "var(--bg-hover)", border: `1px solid ${selectedAction === i ? "var(--accent-border)" : "var(--border)"}`, borderRadius: "6px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "15px", color: "var(--text-primary)", fontFamily: "inherit", fontWeight: "600" }}>{action.label}</span>
                      <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: action.risk === "high" ? "#E05A4A" : "#6BAF7A", textTransform: "uppercase" }}>
                        {action.risk === "high" ? "High" : "Low"} risk
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, fontFamily: "inherit", lineHeight: "1.6" }}>{action.description}</p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "8px 0 0", fontFamily: "inherit", lineHeight: "1.5", fontStyle: "italic" }}>{action.gt_rationale}</p>
                  </button>
                ))}
              </div>
              <div style={{ height: selectedAction !== null ? "0px" : "60px" }} />
            </div>
          )}
        </div>

        {selectedAction !== null && !showWinConditions && (
          <button
            onClick={() => { setShowWinConditions(true); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100); }}
            style={{ width: "100%", padding: "16px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", color: "var(--accent)", fontSize: "15px", letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            PICK WIN CONDITIONS
          </button>
        )}

        {showWinConditions && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", letterSpacing: "0.1em", color: "var(--text-primary)", margin: 0 }}>WIN CONDITIONS</p>
              <span onClick={() => setActiveInfo(activeInfo === "winconditions" ? null : "winconditions")} style={{ fontSize: "12px", color: "#fff", cursor: "pointer", userSelect: "none" }}>ⓘ</span>
              {activeInfo === "winconditions" && (
                <div onClick={() => setActiveInfo(null)} style={{ position: "absolute", marginTop: "60px", left: "0", right: "0", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", zIndex: 10, cursor: "pointer" }}>
                  Win conditions are the concrete outcomes that must happen for your chosen move to be considered successful. Mark them when they occur, then proceed to evaluate the results.                
                </div>
              )}
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "16px" }}>
              What needs to happen for your next move to be considered successful? Add at least one condition and mark it when it occurs.
            </p>

            {suggestedWinConditions.length > 0 && (
              <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px", letterSpacing: "0.05em" }}>ÖNERİLEN KOŞULLAR:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {suggestedWinConditions.map((wc, i) => (
                    <button key={i}
                      onClick={async () => {
                        const resp = await fetch(`${API_URL}/win_conditions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: apiData.session_id, label: wc }) });
                        const data = await resp.json();
                        setWinConditions([...winConditions, { id: data.id, label: data.label, achieved: false }]);
                        setSuggestedWinConditions(suggestedWinConditions.filter((_, j) => j !== i));
                      }}
                      style={{ padding: "8px 14px", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "20px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    >
                      + {wc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {winConditions.map((wc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <div
                    onClick={async () => {
                      const newAchieved = !wc.achieved;
                      if (wc.id) await fetch(`${API_URL}/win_conditions/${wc.id}?achieved=${newAchieved}`, { method: "PATCH" });
                      const updated = [...winConditions];
                      updated[i].achieved = newAchieved;
                      setWinConditions(updated);
                    }}
                    style={{ width: "16px", height: "16px", border: `1px solid ${wc.achieved ? "var(--accent)" : "var(--border)"}`, background: wc.achieved ? "var(--accent)" : "transparent", borderRadius: "6px", flexShrink: 0, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "15px", color: wc.achieved ? "var(--text-primary)" : "var(--text-muted)", lineHeight: "1.4", flex: 1 }}>{wc.label}</span>
                  <span
                    onClick={async () => {
                      if (wc.id) await fetch(`${API_URL}/win_conditions/${wc.id}`, { method: "DELETE" });
                      setWinConditions(winConditions.filter((_, j) => j !== i));
                    }}
                    style={{ fontSize: "11px", color: "#444", cursor: "pointer", flexShrink: 0 }}
                  >✕</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newCondition.trim()) {
                    const resp = await fetch(`${API_URL}/win_conditions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: apiData.session_id, label: newCondition.trim() }) });
                    const data = await resp.json();
                    setWinConditions([...winConditions, { id: data.id, label: data.label, achieved: false }]);
                    setNewCondition("");
                  }
                }}
                placeholder="Add a win condition..."
                style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "10px 12px", outline: "none", fontFamily: "inherit" }}
              />
              <button
                onClick={async () => {
                  if (newCondition.trim()) {
                    const resp = await fetch(`${API_URL}/win_conditions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: apiData.session_id, label: newCondition.trim() }) });
                    const data = await resp.json();
                    setWinConditions([...winConditions, { id: data.id, label: data.label, achieved: false }]);
                    setNewCondition("");
                  }
                }}
                style={{ padding: "10px 16px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", color: "var(--accent)", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}
              >+</button>
            </div>
          </div>
        )}

        {showWinConditions && (
          <button
            onClick={() => winConditions.some(wc => wc.achieved) ? setScreen("update") : null}
            style={{ width: "100%", padding: "16px", background: winConditions.some(wc => wc.achieved) ? "var(--accent)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: "6px", color: winConditions.some(wc => wc.achieved) ? "#0A0A0A" : "var(--text-muted)", fontSize: "15px", letterSpacing: "0.05em", cursor: winConditions.some(wc => wc.achieved) ? "pointer" : "default", fontFamily: "inherit", fontWeight: "600" }}
          >
            {winConditions.some(wc => wc.achieved) ? "EVALUATE RESULTS" : "CONFIRM CONDITION MET"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ModelScreen;
