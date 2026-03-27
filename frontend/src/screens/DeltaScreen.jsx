import React from "react";
import { Logo } from "../components/Logo";

function DeltaScreen({ apiData, previousParams, setScreen, setWinConditions, setActions, setSelectedAction, setShowWinConditions, setSuggestedWinConditions, bg, grain, card }) {
  const prevPv = apiData.previous_pv;
  const newPv = apiData.pv;
  const delta = apiData.pv_delta;
  const deltaPositive = delta >= 0;
  const phaseCompleted = apiData.phase_completed;

  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Logo />
          <p style={{ fontSize: "16px", letterSpacing: "0.2em", color: "var(--text-primary)" }}>
            POSITION HAS STRENGTHENED!
          </p>
        </div>

        <blockquote style={{ margin: "0 0 12px", padding: "24px", borderLeft: "2px solid var(--accent)", background: "var(--accent-bg)", borderRadius: "0 6px 6px 0" }}>
          <p style={{ fontSize: "17px", color: "var(--text-primary)", lineHeight: "1.8", fontStyle: "italic", margin: 0 }}>
            "{apiData.hook}"
          </p>
        </blockquote>

        <div style={{ padding: "24px", background: deltaPositive ? "rgba(107,175,122,0.06)" : "rgba(220,50,50,0.06)", border: `1px solid ${deltaPositive ? "rgba(107,175,122,0.2)" : "rgba(220,50,50,0.2)"}`, borderRadius: "6px", marginBottom: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", letterSpacing: "0.2em", marginBottom: "12px" }}>POSITION VALUE</p>
          <p style={{ fontSize: "32px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", margin: "0 0 8px" }}>
            {prevPv?.toFixed(2)} → {newPv?.toFixed(2)}
          </p>
          <p style={{ fontSize: "16px", color: deltaPositive ? "var(--success)" : "var(--danger)", margin: 0 }}>
            {deltaPositive ? "▲" : "▼"} {Math.abs(delta).toFixed(2)} {deltaPositive ? "strengthened" : "weakened"}
          </p>
        </div>

        {phaseCompleted && (
          <div style={{ padding: "20px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", marginBottom: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "15px", color: "var(--accent)", letterSpacing: "0.1em", margin: "0 0 8px", fontWeight: "600" }}>✦ PHASE COMPLETED</p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>
              The Positional Value surpassed 1.5 threshold. You are on the next phase.
            </p>
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          {(apiData.utility_params || []).map((param) => {
            const prevParam = previousParams?.utility?.find(p => p.name === param.name);
            const prevScore = prevParam?.score;
            const newScore = param.score;
            const improved = newScore > prevScore;
            const same = newScore === prevScore;
            const color = same ? "#888" : improved ? "#6BAF7A" : "#E05A4A";
            return (
              <div key={param.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "16px", color: "var(--text-primary)" }}>{param.display_name || param.name}</span>
                <span style={{ fontSize: "16px", color: color, fontFamily: "var(--font-mono)" }}>
                  {prevScore ? `${parseFloat(prevScore).toFixed(1)} → ` : ""}{parseFloat(newScore).toFixed(1)}
                  {!same && (improved ? " ▲" : " ▼")}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setWinConditions([]);
            setActions(null);
            setSelectedAction(null);
            setShowWinConditions(false);
            setSuggestedWinConditions([]);
            setScreen("model");
          }}
          style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "15px", letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
        >
          BACK TO MODEL
        </button>
      </div>
    </div>
  );
}

export default DeltaScreen;