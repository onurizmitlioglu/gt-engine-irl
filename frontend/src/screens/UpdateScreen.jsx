import React from "react";
import { Logo } from "../components/Logo";
import { updateSession } from "../api/update";
import { track } from '../analytics';


function UpdateScreen({ setScreen, apiData, setApiData, currentAnswer, setCurrentAnswer, actions, selectedAction, setActions, setSelectedAction, setPreviousParams, setRateLimitMessage, setRateLimitVisible, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "16px", letterSpacing: "0.2em", color: "var(--text-primary)", marginBottom: "12px" }}>
            WHAT HAPPENED AFTER?
          </p>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            What did happpen after applying the strategic move? Briefly explains.
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="How did the other person respond? How did it make you feel?"
            rows={6}
            style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "16px", lineHeight: "1.7", padding: "16px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            disabled={!currentAnswer.trim()}
            onClick={async () => {
              setPreviousParams({ utility: apiData.utility_params, cost: apiData.cost_params });
              setScreen("loading");
              try {
                track('update_submitted', { session_id: apiData.session_id });
                const data = await updateSession({
                  session_id: apiData.session_id,
                  update_text: currentAnswer,
                  selected_action_label: actions[selectedAction]?.label || "",
                  selected_action_id: actions[selectedAction]?.id || null,
                  utility_params: apiData.utility_params,
                  cost_params: apiData.cost_params,
                });
                if (data.status === "out_of_scope") { setScreen("model"); return; }
                setApiData({ ...apiData, ...data });
                setCurrentAnswer("");
                setActions(null);
                setSelectedAction(null);
                setScreen("delta");
              } catch (err) {
                if (err.message === "rate_limited") {
                  setRateLimitMessage(true);
                  setRateLimitVisible(true);
                  setTimeout(() => {
                    setRateLimitVisible(false);
                    setTimeout(() => setRateLimitMessage(false), 1000);
                  }, 5000);
                  setScreen("model");
                } else {
                  console.error(err);
                  setScreen("update");
                }
              }
            }}
            style={{ width: "100%", padding: "16px", background: currentAnswer.trim() ? "var(--accent)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: "6px", color: currentAnswer.trim() ? "#0A0A0A" : "var(--text-muted)", fontSize: "15px", letterSpacing: "0.05em", cursor: currentAnswer.trim() ? "pointer" : "default", fontFamily: "inherit", fontWeight: "600", transition: "all 0.2s" }}
          >
            UPDATE THE MODEL
          </button>

          <button onClick={() => setScreen("model")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "14px", cursor: "pointer", letterSpacing: "0.05em", fontFamily: "inherit", textAlign: "center", padding: "8px" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateScreen;