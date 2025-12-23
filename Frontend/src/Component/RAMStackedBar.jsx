import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const toGB = (bytes = 0) =>
  Number((bytes / (1024 ** 3)).toFixed(2));

export default function RAMStackedBar({ used, free }) {
  const usedGB = toGB(used);
  const freeGB = toGB(free);

  const computedTotal = (usedGB + freeGB).toFixed(2);

  const maxGB = Math.max(computedTotal);

  const data = {
    labels: ["ram"],
    datasets: [
      {
        label: "Used (GB)",
        data: [usedGB],
        backgroundColor: "rgba(255, 99, 132, 0.85)",
        stack: "ram"
      },
      {
        label: "Free (GB)",
        data: [freeGB],
        backgroundColor: "rgba(75, 192, 192, 0.85)",
        stack: "ram"
      }
    ]
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          footer: () => `Total: ${maxGB} GB`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        min: 0,
        max: maxGB, 
        title: {
          display: true,
          text: "GB"
        }
      },
      y: {
        stacked: true
      }
    }
  };

  return (
    <div style={{ height: "120px", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
