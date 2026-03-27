export function scoreToColor(score) {
  const s = Math.max(1, Math.min(10, score));
  if (s <= 5) {
    const t = (s - 1) / 4;
    const r = 220;
    const g = Math.round(50 + t * (180 - 50));
    const b = Math.round(50 + t * (41 - 50));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (s - 5) / 5;
    const r = Math.round(220 - t * (220 - 30));
    const g = Math.round(180 + t * (130 - 180));
    const b = Math.round(41 + t * (60 - 41));
    return `rgb(${r}, ${g}, ${b})`;
  }
}