import React, { useEffect, useState } from "react";
import { getStats, getPageViews } from "./services/api";

function App() {
  const [stats, setStats] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    async function loadData() {
      const statsData = await getStats();
      const pageData = await getPageViews();

      setStats(statsData);
      setPages(pageData);
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>📊 Datadog Lite Dashboard</h1>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Total Users: {stats.total_users}</p>
          <p>Total Sessions: {stats.total_sessions}</p>
          <p>Total Events: {stats.total_events}</p>

          <h2>Page Views</h2>
          <ul>
            {pages.map((p, i) => (
              <li key={i}>
                {p.page} → {p.views}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;