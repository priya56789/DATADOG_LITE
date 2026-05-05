const BASE_URL = "https://datadog-backend.onrender.com";

export async function getStats(siteId = "") {
  const url = siteId
    ? `${BASE_URL}/dashboard/stats?site_id=${siteId}`
    : `${BASE_URL}/dashboard/stats`;

  const res = await fetch(url);
  return await res.json();
}

export async function getPageViews(siteId = "") {
  const url = siteId
    ? `${BASE_URL}/dashboard/page-views?site_id=${siteId}`
    : `${BASE_URL}/dashboard/page-views`;

  const res = await fetch(url);
  return await res.json();
}

export async function getSites() {
  const res = await fetch(`${BASE_URL}/dashboard/sites`);
  return await res.json();
}

export async function getRecentEvents(siteId = "") {
  const url = siteId
    ? `${BASE_URL}/dashboard/recent-events?site_id=${siteId}`
    : `${BASE_URL}/dashboard/recent-events`;

  const res = await fetch(url);
  return await res.json();
}

export async function createProject(projectName) {
  const res = await fetch(`${BASE_URL}/projects/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_name: projectName,
    }),
  });

  return await res.json();
}

export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects/`);
  return await res.json();
}