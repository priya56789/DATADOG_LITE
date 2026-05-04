(function () {
  const API_URL = "https://datadog-backend.onrender.com/track";

  const SITE_ID = window.SITE_ID || "client_website_1";
  const API_KEY = window.DATADOG_LITE_API_KEY || "demo_api_key";

  function getUserId() {
    let userId = localStorage.getItem("datadog_lite_user_id");

    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2) + "_" + Date.now();
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
        "X-API-KEY": API_KEY
      },
      body: JSON.stringify({
        site_id: SITE_ID,
        user_id: getUserId(),
        event_type: eventType,
        page: window.location.pathname,
        full_url: window.location.href,
        referrer: document.referrer || "direct",
        browser: navigator.userAgent,
        device: getDeviceType()
      }),
    })
      .then(res => console.log("Tracking response:", res.status))
      .catch(err => console.log("Tracking error:", err));
  }

  window.addEventListener("load", function () {
    sendEvent("page_view");
  });

  document.addEventListener("click", function () {
    sendEvent("click");
  });
})();