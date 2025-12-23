import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useRef, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const MAX_POINTS = 20;

const toMbps = (kbps = 0) => ((kbps * 8) / 1024).toFixed(2);

export default function NetworkSpeedChart({ upload = 0, download = 0 }) {
  const bufferRef = useRef({
    labels: [],
    upload: [],
    download: []
  });

  const [chartData, setChartData] = useState({
    labels: [],
    upload: [],
    download: []
  });

  useEffect(() => {
    const time = new Date().toLocaleTimeString();

    const buffer = bufferRef.current;

    buffer.labels.push(time);
    buffer.upload.push(Number(toMbps(upload)));
    buffer.download.push(Number(toMbps(download)));

    if (buffer.labels.length > MAX_POINTS) {
      buffer.labels.shift();
      buffer.upload.shift();
      buffer.download.shift();
    }

    setChartData({
      labels: [...buffer.labels],
      upload: [...buffer.upload],
      download: [...buffer.download]
    });
  }, [upload, download]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Upload (Mbps)",
        data: chartData.upload,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        yAxisID: "yUpload",
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: "Download (Mbps)",
        data: chartData.download,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        yAxisID: "yDownload",
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { boxWidth: 10 }
      }
    },
    scales: {
      yUpload: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Upload (Mbps)"
        }
      },
      yDownload: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Download (Mbps)"
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}
