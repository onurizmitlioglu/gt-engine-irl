import { API_URL } from "./config";
const BASE_URL = API_URL;

export async function getActions(apiData) {
  const response = await fetch(`${BASE_URL}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pv: apiData.pv,
      scenario: "relations",
      phase: 1,
      session_id: apiData.session_id,
      utility_params: apiData.utility_params,
      cost_params: apiData.cost_params,
    }),
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
