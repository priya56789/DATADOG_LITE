const BASE_URL = "https://datadog-backend.onrender.com";

export async function getStats() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

export async function getPageViews() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard/page-views`);
    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    return [];
  }
}