import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    loadSites();
    loadProjects();
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, [selectedSite]);

  const loadSites = async () => {
    const data = await getSites();
    setSites(data || []);
  };

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data || []);
  };

  const loadDashboard = async () => {
    const statsData = await getStats(selectedSite);
    const pageData = await getPageViews(selectedSite);
    const eventData = await getRecentEvents(selectedSite);

    setStats(statsData);
    setPages(pageData || []);
    setEvents(eventData || []);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Enter project name");
      return;
    }

    const data = await createProject(projectName);
    setCreatedProject(data);
    setProjectName("");
    loadProjects();
    loadSites();
  };

  const copyScript = () => {
    if (!createdProject?.integration_script) return;

    navigator.clipboard.writeText(createdProject.integration_script);
    alert("Integration script copied!");
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>📊 Datadog Lite Dashboard</h1>
      <p>🔴 Auto-refresh enabled every 5 seconds</p>

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
            <p><b>Project:</b> {createdProject.project_name}</p>
            <p><b>Site ID:</b> {createdProject.site_id}</p>
            <p><b>API Key:</b> {createdProject.api_key}</p>

            <h4>Integration Script</h4>
            <pre style={preStyle}>{createdProject.integration_script}</pre>

            <button onClick={copyScript} style={buttonStyle}>
              Copy Script
            </button>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2>📁 Existing Projects</h2>

        {projects.length === 0 ? (
          <p>No projects created yet</p>
        ) : (
          <ul>
            {projects.map((project, index) => (
              <li key={index}>
                <b>{project.project_name}</b> — {project.site_id}
              </li>
            ))}
          </ul>
        )}
      </div>

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
              <li key={index}>{p.page} → {p.views}</li>
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
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  minWidth: "160px",
};

export default App;