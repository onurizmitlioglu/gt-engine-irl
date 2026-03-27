import React from "react";

function PVGauge({ value, activeInfo, setActiveInfo }) {
  const max = 5;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", color: "var(--text-primary)", letterSpacing: "0.1em", textTransform: "none" }}>
            POSITION VALUE
          </span>
          <span
            onClick={() => setActiveInfo(activeInfo === "pv" ? null : "pv")}
            style={{ fontSize: "12px", color: "#fff", cursor: "pointer", userSelect: "none" }}
          >
            ⓘ
          </span>
          {activeInfo === "pv" && (
            <div
              onClick={() => setActiveInfo(null)}
              style={{
                position: "absolute",
                marginTop: "60px",
                left: "0",
                right: "0",
                padding: "12px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                zIndex: 10,
                cursor: "pointer",
              }}
            >
              Positional Value (PV), is the ratio of utilities to costs. Above 1.5 represents strong position, below 1.5 represents weak position.
            </div>
          )}
        </div>
        <span style={{ fontSize: "16px", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
          {value.toFixed(2)}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "2px",
            background: "linear-gradient(90deg, #C17D1A, #F0B429)",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

export default PVGauge;
