import React, { useCallback, useEffect, useState } from "react";
import {
  getStats,
  getPageViews,
  getSites,
  getRecentEvents,
  createProject,
  getProjects,
} from "./services/api";

function App() {
  const [stats, setStats] = useState(null);
  const [pages, setPages] = useState([]);
  const [sites, setSites] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");

  const [projectName, setProjectName] = useState("");
  const [createdProject, setCreatedProject] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const BACKEND_DOCS_URL = "https://datadog-backend.onrender.com/docs";

  const loadDashboard = useCallback(async () => {
    try {
      const statsData = await getStats(selectedSite);
      const pageData = await getPageViews(selectedSite);
      const eventData = await getRecentEvents(selectedSite);

      setStats(statsData || {});
      setPages(Array.isArray(pageData) ? pageData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data");
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      const data = await getSites();
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Sites load error:", err);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projects load error:", err);
    }
  };

  useEffect(() => {
    loadSites();
    loadProjects();
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 2000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleCreateProject = async () => {
    setError("");

    if (!projectName.trim()) {
      alert("Enter project name");
      return;
    }

    try {
      const data = await createProject(projectName);
      console.log("Create project response:", data);

      if (!data) {
        setError("No response from backend");
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      setCreatedProject(data);
      setProjectName("");

      await loadProjects();
      await loadSites();
      await loadDashboard();

      // ✅ Auto-open backend docs/dashboard after project creation
      window.open(BACKEND_DOCS_URL, "_blank");
    } catch (err) {
      console.error("Create project error:", err);
      setError("Error creating project. Check browser console.");
    }
  };

  const copyScript = async () => {
    if (!createdProject?.integration_script) {
      alert("No integration script available");
      return;
    }

    try {
      await navigator.clipboard.writeText(createdProject.integration_script);
      alert("Integration script copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Copy failed. Select and copy manually.");
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>📊 Datadog Lite Dashboard</h1>
      <p>🔴 Auto-refresh enabled every 2 seconds</p>
      <p>Last updated: {lastUpdated || "Loading..."}</p>

      {error && (
        <div style={errorStyle}>
          <b>Error:</b> {error}
        </div>
      )}

      <div style={sectionStyle}>
        <h2>🚀 Create Project</h2>

        <input
          type="text"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleCreateProject} style={buttonStyle}>
          Create Project
        </button>

        {createdProject && (
          <div style={resultBoxStyle}>
            <h3>✅ Project Created</h3>

            <p>
              <b>Project:</b>{" "}
              {createdProject.project_name ||
                createdProject?.project?.project_name ||
                "Not available"}
            </p>

            <p>
              <b>Site ID:</b> {createdProject.site_id || "Not available"}
            </p>

            <p>
              <b>API Key:</b> {createdProject.api_key || "Not available"}
            </p>

            <h4>Integration Script</h4>

            {createdProject.integration_script ? (
              <>
                <pre style={preStyle}>{createdProject.integration_script}</pre>
                <button onClick={copyScript} style={buttonStyle}>
                  Copy Script
                </button>
              </>
            ) : (
              <pre style={preStyle}>
                {JSON.stringify(createdProject, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2>📁 Existing Projects</h2>

        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <ul>
            {projects.map((project, index) => (
              <li key={index}>
                <b>{project.project_name || "Unnamed Project"}</b> —{" "}
                {project.site_id || "No site_id"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <b>Select Website: </b>
        </label>

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
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div style={cardStyle}>
              👤 Users
              <br />
              <b>{stats.total_users ?? 0}</b>
            </div>

            <div style={cardStyle}>
              ⚡ Events
              <br />
              <b>{stats.total_events ?? 0}</b>
            </div>

            <div style={cardStyle}>
              📄 Page Views
              <br />
              <b>{stats.total_page_views ?? 0}</b>
            </div>

            <div style={cardStyle}>
              🖱 Clicks
              <br />
              <b>{stats.total_clicks ?? 0}</b>
            </div>
          </div>

          <h2>📈 Page Views</h2>

          {pages.length === 0 ? (
            <p>No page views yet</p>
          ) : (
            <ul>
              {pages.map((p, index) => (
                <li key={index}>
                  {p.page} → {p.views}
                </li>
              ))}
            </ul>
          )}

          <h2>🧾 Recent Events</h2>

          {events.length === 0 ? (
            <p>No recent events yet</p>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
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
          )}
        </>
      )}
    </div>
  );
}

const sectionStyle = {
  background: "#f7f7f7",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "24px",
};

const inputStyle = {
  padding: "10px",
  width: "280px",
  marginRight: "10px",
};

const buttonStyle = {
  padding: "10px 16px",
  cursor: "pointer",
};

const resultBoxStyle = {
  marginTop: "20px",
  background: "#fff",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const preStyle = {
  background: "#111",
  color: "#0f0",
  padding: "12px",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  minWidth: "160px",
};

const errorStyle = {
  background: "#ffe6e6",
  color: "#b00020",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
};

export default App;