import React from "react";
import { Logo } from "../components/Logo";

const MOCK_HOOK = "This is the mock text shown to user.";

function HookScreen({ hookVisible, apiData, setScreen, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div
          style={{
            opacity: hookVisible ? 1 : 0,
            transform: hookVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease",
          }}
        >
          <div style={{ marginBottom: "48px", textAlign: "center" }}>
            <Logo />
            <div style={{ width: "40px", height: "1px", background: "#F0B429", margin: "0 auto 32px" }} />
            <p style={{ fontSize: "13px", letterSpacing: "0.2em", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              ANALYSIS COMPLETED
            </p>
          </div>

          <blockquote style={{ margin: "0 0 48px", padding: "32px", borderLeft: "2px solid var(--accent)", background: "var(--accent-bg)", borderRadius: "0 6px 6px 0" }}>
            <p style={{ fontSize: "clamp(18px, 3.5vw, 22px)", color: "var(--text-primary)", lineHeight: "1.8", fontStyle: "italic", margin: 0 }}>
              "{apiData?.hook || MOCK_HOOK}"
            </p>
          </blockquote>

          <div style={{ padding: "20px", background: "var(--bg-hover)", borderRadius: "6px", marginBottom: "32px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
              This analysis is crafted for your story. The model is currently at <strong style={{ color: "var(--accent)", fontStyle: "underline" }}>Phase 1</strong>.
            </p>
          </div>

          <button
            onClick={() => setScreen("auth")}
            style={{ width: "100%", padding: "16px", background: "var(--accent)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "14px", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            CHECK THE MODEL
          </button>
        </div>
      </div>
    </div>
  );
}

export default HookScreen;