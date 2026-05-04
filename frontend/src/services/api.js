const BASE_URL = "https://datadog-backend.onrender.com";

export async function getStats() {
  console.log("🚀 getStats() called");
  console.log("📡 Calling API:", `${BASE_URL}/dashboard/stats`);

  try {
    const response = await fetch(`${BASE_URL}/dashboard/stats`);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("📊 Data from backend:", data);
    return data;
  } catch (error) {
    console.error("❌ Fetch failed:", error);
    return null;
  }
}

export async function getPageViews() {
  console.log("📡 Calling API:", `${BASE_URL}/dashboard/page-views`);

  try {
    const response = await fetch(`${BASE_URL}/dashboard/page-views`);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status);
      return [];
    }

    const data = await response.json();
    console.log("📈 Page views:", data);
    return data;
  } catch (error) {
    console.error("❌ Fetch failed:", error);
    return [];
  }
}