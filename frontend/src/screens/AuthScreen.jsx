import React from "react";
import { Logo } from "../components/Logo";
import { API_URL } from "../api/config";

function AuthScreen({ setScreen, apiData, setUserId, setUserCode, setUserInfo, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "18px", letterSpacing: "0.2em", color: "var(--text-primary)", textTransform: "uppercase", marginBottom: "12px" }}>
            Save results
          </p>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Pick a method to save your analyze and track your progress.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => setScreen("register")}
            style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            Create an Account
          </button>

          <button
            onClick={async () => {
              const resp = await fetch(`${API_URL}/auth/anonymous`, { method: "POST" });
              const data = await resp.json();
              setUserId(data.user_id);
              setUserCode(data.code);
              if (apiData?.session_id) {
                await fetch(`${API_URL}/sessions/${apiData.session_id}/user?user_id=${data.user_id}`, { method: "PATCH" });
              }
              fetch(`${API_URL}/users/${data.user_id}`)
                .then(r => r.json())
                .then(userData => setUserInfo(userData));
              setScreen("code_display");
            }}
            style={{ width: "100%", padding: "16px", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", fontSize: "14px", letterSpacing: "0.1em", textTransform: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            CONTINUE WITHOUT AN ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;