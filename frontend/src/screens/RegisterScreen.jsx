import React from "react";
import { Logo } from "../components/Logo";
import { API_URL } from "../api/config";

function RegisterScreen({ setScreen, apiData, setUserId, setUserInfo, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "13px", letterSpacing: "0.2em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "12px" }}>
            Create an Account
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <input type="email" placeholder="Email" id="register-email" style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "14px 16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          <input type="password" placeholder="Password" id="register-password" style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "15px", padding: "14px 16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={async () => {
              const email = document.getElementById("register-email").value;
              const password = document.getElementById("register-password").value;
              if (!email || !password) return;
              const resp = await fetch(`${API_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
              if (!resp.ok) { const err = await resp.json(); alert(err.detail); return; }
              const data = await resp.json();
              setUserId(data.user_id);
              if (apiData?.session_id) {
                await fetch(`${API_URL}/sessions/${apiData.session_id}/user?user_id=${data.user_id}`, { method: "PATCH" });
              }
              fetch(`${API_URL}/users/${data.user_id}`).then(r => r.json()).then(userData => setUserInfo(userData));
              setScreen("goals");
            }}
            style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "14px", letterSpacing: "0.1em", textTransform: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            REGISTER
          </button>

          <button onClick={() => setScreen("auth")} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", letterSpacing: "0.1em", fontFamily: "inherit", textAlign: "center", padding: "8px" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterScreen;