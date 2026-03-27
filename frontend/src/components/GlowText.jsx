import React from "react";

function GlowText({ children, className = "" }) {
  return (
    <span
      className={className}
      style={{ textShadow: "0 0 30px rgba(255,200,100,0.3)" }}
    >
      {children}
    </span>
  );
}

export default GlowText;