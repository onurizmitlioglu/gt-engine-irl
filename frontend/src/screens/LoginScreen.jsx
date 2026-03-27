import React, { useState } from "react";
import { Logo } from "../components/Logo";
import { API_URL } from "../api/config";

function LoginScreen({ setScreen, setUserId, setApiData, setUserInfo, setWinConditions, setActions, setSelectedAction, bg, grain, card }) {
  const [loginTab, setLoginTab] = useState("email");

  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "15px", letterSpacing: "0.2em", color: "var(--text-primary)", textTransform: "none", marginBottom: "24px" }}>
            LOGIN
          </p>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "32px" }}>
            {["email", "code"].map((tab) => (
              <button
                key={tab}
                onClick={() => setLoginTab(tab)}
                style={{
                  flex: 1, padding: "10px", background: "none", border: "none",
                  borderBottom: `2px solid ${loginTab === tab ? "var(--accent)" : "transparent"}`,
                  color: loginTab === tab ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                }}
              >
                {tab === "email" ? "E-Mail" : "Code"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {loginTab === "email" ? (
            <>
              <input type="email" placeholder="E-mail" id="login-email" style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "14px 16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <input type="password" placeholder="Password" id="login-password" style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "14px 16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </>
          ) : (
            <input type="text" placeholder="Your 8 digit code" id="login-code" style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "14px 16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={async () => {
              let data;
              if (loginTab === "email") {
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;
                if (!email || !password) return;
                const resp = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
                if (!resp.ok) { alert("Wrong e-mail or password."); return; }
                data = await resp.json();
              } else {
                const code = document.getElementById("login-code").value.trim();
                if (!code) return;
                const resp = await fetch(`${API_URL}/auth/login/code`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
                if (!resp.ok) { alert("Kod bulunamadı."); return; }
                data = await resp.json();
              }

              setUserId(data.user_id);
              localStorage.setItem("gt_user_id", data.user_id);

              const sessionResp = await fetch(`${API_URL}/users/${data.user_id}/last_session`);
              const sessionData = await sessionResp.json();

              if (sessionData.session && sessionData.session.pv !== null) {
                const params = sessionData.session.parameters;
                setApiData({
                  session_id: sessionData.session.session_id,
                  pv: sessionData.session.pv,
                  current_phase: sessionData.session.current_phase,
                  total_phases: sessionData.session.total_phases,
                  utility_params: params?.utility?.map(p => ({...p, display_name: p.display_name || p.name})) || [],
                  cost_params: params?.cost?.map(p => ({...p, display_name: p.display_name || p.name})) || [],
                  hook: "",
                  scenario_title: sessionData.session.scenario_title || "",
                  current_stage: sessionData.session.current_stage || "",
                });
                fetch(`${API_URL}/users/${data.user_id}`).then(r => r.json()).then(userData => setUserInfo(userData));
                if (sessionData.session.win_conditions) setWinConditions(sessionData.session.win_conditions);
                if (sessionData.session.actions && sessionData.session.actions.length > 0) {
                  const selectedActionData = sessionData.session.actions.find(a => a.is_selected);
                  setActions(sessionData.session.actions);
                  if (selectedActionData) setSelectedAction(sessionData.session.actions.indexOf(selectedActionData));
                }
                setScreen("model");
              } else {
                setScreen("intro");
              }
            }}
            style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "14px", letterSpacing: "0.1em", textTransform: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            LOGIN
          </button>

          <button onClick={() => setScreen("intro")} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", letterSpacing: "0.1em", fontFamily: "inherit", textAlign: "center", padding: "8px" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
