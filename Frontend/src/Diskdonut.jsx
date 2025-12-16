import { Doughnut } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function parseGB(value) {
  return Number(value.replace(/[^\d.]/g, ""));
}

const DiskDonut = ({ disk }) => {
  const used = parseGB(disk.used);
  const free = parseGB(disk.available);
  
  const data = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [used, free],
        backgroundColor: ["#ef4444", "#22c55e"],
        borderWidth: 1
      }
    ]
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw} GB`
        }
      }
    }
  };

  return (
    <div style={{ width: "220px", textAlign: "center" }}>
      <h4>{disk.type} ({disk.mount})</h4>
      <Doughnut data={data} options={options} />
      <p><b>Usage:</b> {disk.usage}</p>
    </div>
  );
};

export default DiskDonut;
