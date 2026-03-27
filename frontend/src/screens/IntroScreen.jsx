import React from "react";
import { Logo } from "../components/Logo";
import GlowText from "../components/GlowText";

function IntroScreen({ setScreen, outOfScopeMessage, outOfScopeVisible, rateLimitMessage, rateLimitVisible, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Logo />
          <h1
            style={{
              fontSize: "clamp(28px, 6vw, 42px)",
              color: "var(--text-primary)",
              fontWeight: "400",
              lineHeight: "1.2",
              marginBottom: "20px",
              fontStyle: "italic",
            }}
          >
            <GlowText>What to do next?</GlowText>
          </h1>
          <p style={{ fontSize: "17px", color: "var(--text-secondary)", lineHeight: "1.8", maxWidth: "320px", margin: "0 auto" }}>
            Tell your story. Pick your next strategic move, based on Game Theory.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => setScreen("questions")}
            style={{
              width: "100%",
              padding: "16px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "6px",
              color: "#0A0A0A",
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: "600",
            }}
          >
            Start
          </button>
          <button onClick={() => setScreen("login")} style={{
            width: "100%",
            padding: "16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "14px",
            letterSpacing: "0.1em",
            textTransform: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: "500",
          }}>
            ALREADY HAVE AN ACCOUNT? LOGIN
          </button>

          {outOfScopeMessage && (
            <div style={{
              position: "fixed",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "14px 24px",
              fontSize: "15px",
              color: "var(--text-dark)",
              fontStyle: "italic",
              fontWeight: "800",
              zIndex: 100,
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
              opacity: outOfScopeVisible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}>
              Sorry, I can't help you with that.
            </div>
          )}

          {rateLimitMessage && (
            <div style={{
              position: "fixed",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "14px 24px",
              fontSize: "15px",
              color: "var(--text-dark)",
              fontStyle: "italic",
              fontWeight: "800",
              zIndex: 100,
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
              opacity: rateLimitVisible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}>
              Daily rate limit exceeded, please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntroScreen;