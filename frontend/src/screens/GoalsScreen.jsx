import React from "react";
import { Logo } from "../components/Logo";
import { API_URL } from "../api/config";

function GoalsScreen({ setScreen, apiData, selectedGoal, setSelectedGoal, setActions, setSelectedAction, setShowWinConditions, setSuggestedWinConditions, setWinConditions, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "18px", letterSpacing: "0.2em", color: "var(--text-primary)", marginBottom: "12px" }}>
            What is your end goal?
          </p>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Pick a goal. Your strategy and respective model will shape according to this.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {(apiData?.suggested_goals || []).map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                style={{
                  width: "100%", padding: "16px",
                  background: isSelected ? "var(--accent-bg)" : "var(--bg-hover)",
                  border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                  borderRadius: "6px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: "1.5", fontFamily: "inherit" }}>
                    {goal.label}
                  </span>
                  <span style={{ fontSize: "12px", letterSpacing: "0.1em", color: goal.horizon === "short" ? "#6BAF7A" : goal.horizon === "medium" ? "#F0B429" : "#E93521", textTransform: "uppercase", flexShrink: 0 }}>
                    {goal.horizon === "short" ? "SHORT TERM" : goal.horizon === "medium" ? "MEDIUM TERM" : "LONG TERM"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={async () => {
            if (apiData?.session_id && selectedGoal) {
              await fetch(`${API_URL}/sessions/${apiData.session_id}/goal?goal_id=${selectedGoal}`, { method: "PATCH" });
            }
            setActions(null);
            setSelectedAction(null);
            setShowWinConditions(false);
            setSuggestedWinConditions([]);
            setWinConditions([]);
            setScreen("model");
          }}
          disabled={!selectedGoal}
          style={{
            width: "100%", padding: "16px",
            background: selectedGoal ? "var(--accent)" : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: "2px",
            color: selectedGoal ? "#0A0A0A" : "var(--text-muted)",
            fontSize: "13px", letterSpacing: "0.15em", textTransform: "none",
            cursor: selectedGoal ? "pointer" : "default",
            fontFamily: "inherit", fontWeight: "600", transition: "all 0.2s",
          }}
        >
          {selectedGoal ? "INSPECT THE MODEL" : "PICK A GOAL FIRST"}
        </button>
      </div>
    </div>
  );
}

export default GoalsScreen;