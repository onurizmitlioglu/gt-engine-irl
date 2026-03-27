import { API_URL } from "./config";
const BASE_URL = API_URL;

export async function updateSession(data) {
  const response = await fetch(`${BASE_URL}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.status === 429) {
    throw new Error("rate_limited");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}