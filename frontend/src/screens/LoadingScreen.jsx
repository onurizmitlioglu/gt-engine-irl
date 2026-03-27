import React from "react";
import { Logo } from "../components/Logo";

const loadingMessages = [
  "Processing the story",
  "Analyzing dynamics",
  "Defining goals",
  "Setting up strength and risk parameters",
  "Calculating positional value",
];

function LoadingScreen({ loadingStep, loadingDots, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={{ ...card, textAlign: "center" }}>
        <Logo />
        <div style={{
          fontSize: "48px",
          marginBottom: "48px",
          animation: "pulse 1.2s ease-in-out infinite",
          display: "inline-block",
          color: "#F0B429",
        }}>
          ♥
        </div>
        <p style={{
          fontSize: "17px",
          color: "var(--text-secondary)",
          letterSpacing: "0.05em",
          fontStyle: "italic",
          minHeight: "24px",
          transition: "opacity 0.3s ease",
        }}>
          {loadingMessages[loadingStep % loadingMessages.length]}
          {".".repeat(loadingDots)}
        </p>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;