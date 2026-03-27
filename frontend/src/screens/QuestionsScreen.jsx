import React from "react";
import { Logo } from "../components/Logo";
import ProgressDots from "../components/ProgressDots";

const QUESTIONS = [
  "What happened? Tell briefly how it went.",
];

function QuestionsScreen({ questionIndex, currentAnswer, setCurrentAnswer, loading, handleAnswer, bg, grain, card }) {
  return (
    <div style={bg}>
      <div style={grain} />
      <div style={card}>
        <Logo />
        <div style={{ marginBottom: "48px" }}>
          <ProgressDots total={QUESTIONS.length} current={questionIndex} />
        </div>

        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "13px", letterSpacing: "0.2em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "20px", textAlign: "center" }}>
            Question {questionIndex + 1} / {QUESTIONS.length}
          </p>
          <h2
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              color: "var(--text-primary)",
              fontWeight: "400",
              lineHeight: "1.5",
              fontStyle: "italic",
            }}
          >
            {QUESTIONS[questionIndex]}
          </h2>
        </div>

        <div style={{ position: "relative", marginBottom: "24px" }}>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Write down..."
            rows={5}
            style={{
              width: "100%",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              fontSize: "16px",
              lineHeight: "1.7",
              padding: "16px",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleAnswer();
            }}
          />
        </div>

        <button
          onClick={handleAnswer}
          disabled={!currentAnswer.trim() || loading}
          style={{
            width: "100%",
            padding: "16px",
            background: currentAnswer.trim() ? "var(--accent)" : "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "6px",
            color: currentAnswer.trim() ? "#0A0A0A" : "var(--text-muted)",
            fontSize: "14px",
            letterSpacing: "0.1em",
            textTransform: "none",
            cursor: currentAnswer.trim() ? "pointer" : "default",
            fontFamily: "inherit",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          {loading ? "ANALYZING..." : questionIndex < QUESTIONS.length - 1 ? "CONTINUE" : "ANALYZE"}
        </button>
      </div>
    </div>
  );
}

export default QuestionsScreen;