(function () {
  const API_URL = "http://localhost:8000/track";

  function sendEvent(eventType, page) {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        page: page,
      }),
    }).catch((err) => console.error("Tracking error:", err));
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