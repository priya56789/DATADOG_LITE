import React, { useEffect, useState } from "react";
import { getStats } from "./services/api";

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
  const [pageData, setPageData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const statsData = await getStats();
    setStats(statsData);

    const res = await fetch("http://localhost:8000/dashboard/page-views");
    const data = await res.json();
    setPageData(data);
  };

  const chartData = {
    labels: pageData.map((d) => d.page),
    datasets: [
      {
        label: "Page Views",
        data: pageData.map((d) => d.views),
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
            <div>Total Users: {stats.total_users}</div>
            <div>Total Sessions: {stats.total_sessions}</div>
            <div>Total Events: {stats.total_events}</div>
          </div>

          <h2 style={{ marginTop: "30px" }}>📈 Page Views</h2>

          <Bar data={chartData} />
        </>
      )}
    </div>
  );
}

export default App;