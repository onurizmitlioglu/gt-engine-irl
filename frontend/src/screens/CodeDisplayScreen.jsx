import React from "react";
import { Logo } from "../components/Logo";

function CodeDisplayScreen({ setScreen, userCode, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Logo />
          <div style={{ width: "40px", height: "1px", background: "var(--accent)", margin: "0 auto 32px" }} />
          <p style={{ fontSize: "18px", letterSpacing: "0.2em", color: "var(--text-primary)", textTransform: "uppercase", marginBottom: "24px" }}>
            Your Code
          </p>
          <div style={{ padding: "24px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", marginBottom: "24px" }}>
            <p style={{ fontSize: "32px", color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", margin: 0 }}>
              {userCode}
            </p>
          </div>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Save this code. You will use it to log back in.
          </p>
        </div>

        <button
          onClick={() => setScreen("goals")}
          style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default CodeDisplayScreen;