import React from "react";

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? "24px" : "8px",
            height: "8px",
            borderRadius: "4px",
            background: i <= current ? "#F0B429" : "rgba(255,255,255,0.15)",
            transition: "all 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

export default ProgressDots;