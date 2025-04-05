import React from "react";
import { Line, Pie } from "react-chartjs-2";
import "./Visualizer.css"; // Custom styling

export default function Visualizer({ data, chartType, title }) {
  if (!data || data.length === 0) return <p>No data to visualize.</p>;

  let chartData;

  if (chartType === "line") {
    const sorted = [...data].sort((a, b) => a.year.localeCompare(b.year));
    chartData = {
      labels: sorted.map((d) => d.year),
      datasets: [
        {
          label: title || "Value",
          data: sorted.map((d) => d.value),
          fill: false,
          borderColor: "#3b82f6",
          tension: 0.3,
        },
      ],
    };

    return (
      <div className="visualizer-container">
        <h3 className="visualizer-header">{title}</h3>
        <Line key={title} data={chartData} />
      </div>
    );
  }

  if (chartType === "table") {
    return (
      <div className="visualizer-container">
        <h3 className="visualizer-header">{title}</h3>
        <table className="visual-table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key, idx) => (
                <th key={idx}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (chartType === "pie") {
    chartData = {
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: title || "Breakdown",
          data: data.map((item) => item.value),
          backgroundColor: [
            "#3b82f6", "#22c55e", "#f97316", "#a855f7",
            "#e11d48", "#06b6d4", "#10b981", "#facc15",
            "#8b5cf6", "#ef4444"
          ],
        },
      ],
    };
  
      

    return (
      <div className="visualizer-container">
        <h3 className="visualizer-header">{title}</h3>
        <Pie key={title} data={chartData} />
      </div>
    );
  }

  return <p>Invalid chart type.</p>;
}
