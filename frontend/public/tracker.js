(function () {
  const API_URL = "https://datadog-backend.onrender.com/track";

  const SITE_ID = window.SITE_ID || "default_site";

  function sendEvent(eventType, page) {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: SITE_ID,
        event_type: eventType,
        page: page,
      }),
    }).catch(err => console.log("Tracking error:", err));
  }

  // Track page load
  window.addEventListener("load", () => {
    sendEvent("page_view", window.location.pathname);
  });

  // Track clicks
  document.addEventListener("click", () => {
    sendEvent("click", window.location.pathname);
  });
})();