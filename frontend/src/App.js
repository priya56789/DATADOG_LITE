import React, { useEffect, useState } from "react";
import {
  getStats,
  getPageViews,
  getSites,
  getRecentEvents,
} from "./services/api";

function App() {
  const [stats, setStats] = useState(null);
  const [pages, setPages] = useState([]);
  const [sites, setSites] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [selectedSite]);

  const loadSites = async () => {
    const data = await getSites();
    setSites(data || []);
  };

  const loadDashboard = async () => {
    const statsData = await getStats(selectedSite);
    const pageData = await getPageViews(selectedSite);
    const eventData = await getRecentEvents(selectedSite);

    setStats(statsData);
    setPages(pageData || []);
    setEvents(eventData || []);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>📊 Datadog Lite Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <label><b>Select Website: </b></label>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        >
          <option value="">All Websites</option>
          {sites.map((site, index) => (
            <option key={index} value={site.site_id}>
              {site.site_id}
            </option>
          ))}
        </select>
      </div>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div style={cardStyle}>👤 Users<br /><b>{stats.total_users}</b></div>
            <div style={cardStyle}>⚡ Events<br /><b>{stats.total_events}</b></div>
            <div style={cardStyle}>📄 Page Views<br /><b>{stats.total_page_views}</b></div>
            <div style={cardStyle}>🖱 Clicks<br /><b>{stats.total_clicks}</b></div>
          </div>

          <h2>📈 Page Views</h2>
          <ul>
            {pages.map((p, index) => (
              <li key={index}>
                {p.page} → {p.views}
              </li>
            ))}
          </ul>

          <h2>🧾 Recent Events</h2>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Site</th>
                <th>User</th>
                <th>Event</th>
                <th>Device</th>
                <th>Page</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{event.site_id}</td>
                  <td>{event.user_id}</td>
                  <td>{event.event_type}</td>
                  <td>{event.device}</td>
                  <td>{event.page}</td>
                  <td>{event.referrer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  minWidth: "160px",
};

export default App;