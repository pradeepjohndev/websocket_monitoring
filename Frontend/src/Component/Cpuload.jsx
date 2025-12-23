import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

import { Bar } from "react-chartjs-2";
export default function Cpuload({ label, value, color }) {
    
  const data = {
    labels: [label],
    datasets: [
      {
        data: [Math.min(value, 100)],
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y", 
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: {
          callback: (v) => `${v}%`,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div style={{ height: "50px", marginBottom: "12px" }}>
      <Bar data={data} options={options} />
    </div>
  );
}

