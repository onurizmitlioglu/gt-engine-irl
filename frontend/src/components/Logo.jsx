import React from "react";

export function Logo() {
  return <img src="/Group-1.svg" style={{ width: "360px", display: "block", margin: "0 auto 32px" }} />;
}

export function LogoSmall({ width = "160px" }) {
  return <img src="/Group-1.svg" style={{ width, display: "block" }} />;
}
