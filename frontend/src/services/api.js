// ✅ Backend base URL
const BASE_URL = "http://localhost:8000";

// 🔍 Fetch dashboard stats (DEBUG VERSION)
export async function getStats() {
  console.log("🚀 getStats() called");

  try {
    const url = `${BASE_URL}/dashboard/stats`;
    console.log("📡 Calling API:", url);

    const response = await fetch(url);

    console.log("📥 Raw response:", response);

    // Check if response is OK
    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    console.log("📊 Parsed JSON data:", data);

    // Extra validation
    if (
      data &&
      typeof data.total_users !== "undefined" &&
      typeof data.total_sessions !== "undefined" &&
      typeof data.total_events !== "undefined"
    ) {
      console.log("✅ Valid stats data received");
    } else {
      console.warn("⚠️ Unexpected data format:", data);
    }

    return data;

  } catch (error) {
    console.error("❌ Fetch failed:", error);

    if (error.message.includes("Failed to fetch")) {
      console.error("🚨 Backend might NOT be running!");
    }

    return null;
  }
}