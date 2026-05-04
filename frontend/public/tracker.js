(function () {
  const API_URL = "https://datadog-backend.onrender.com/track";

  const SITE_ID = window.SITE_ID || "default_site";

  function getUserId() {
    let userId = localStorage.getItem("datadog_lite_user_id");

    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem("datadog_lite_user_id", userId);
    }

    return userId;
  }

  function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  }

  function sendEvent(eventType) {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: SITE_ID,
        user_id: getUserId(),
        event_type: eventType,
        page: window.location.pathname,
        full_url: window.location.href,
        referrer: document.referrer || "direct",
        browser: navigator.userAgent,
        device: getDeviceType(),
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.log("Tracking error:", err));
  }

  window.addEventListener("load", () => {
    sendEvent("page_view");
  });

  document.addEventListener("click", () => {
    sendEvent("click");
  });
})();