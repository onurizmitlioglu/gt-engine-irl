import { API_URL } from "./config";
const BASE_URL = API_URL;

export async function analyzeAnswers(answers, options = {}) {
  const { scenario = "relations", useLlm = false, userId = null } = options;

  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers,
      scenario,
      use_llm: useLlm,
      user_id: userId,
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