import React, { useEffect, useState } from "react";
import { getStats, getPageViews } from "./services/api";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale);

function App() {
  const [stats, setStats] = useState(null);
  const [pages, setPages] = useState([]);

  // 🔴 auto refresh every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const statsData = await getStats();
    const pageData = await getPageViews();

    setStats(statsData);
    setPages(pageData);
  };

  const chartData = {
    labels: pages.map((p) => p.page),
    datasets: [
      {
        label: "Page Views",
        data: pages.map((p) => p.views),
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Datadog Lite Dashboard</h1>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "20px" }}>
            <div>👤 Users: {stats.total_users}</div>
            <div>📱 Sessions: {stats.total_sessions}</div>
            <div>⚡ Events: {stats.total_events}</div>
          </div>

          <h2 style={{ marginTop: "30px" }}>📈 Page Views</h2>
          <Bar data={chartData} />
        </>
      )}
    </div>
  );
}

export default App;