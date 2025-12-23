import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

export default function CpuUsageChart({ cpuLoad }) {
    const [labels, setLabels] = React.useState([]);
    const [dataPoints, setDataPoints] = React.useState([]);

    React.useEffect(() => {
        if (cpuLoad == null) return;

        const timeLabel = new Date().toLocaleTimeString();

        setLabels(prev => {
            const updated = [...prev, timeLabel];
            return updated.length > 12 ? updated.slice(-12) : updated;
        });

        setDataPoints(prev => {
            const value = Number(
                typeof cpuLoad === "string" ? cpuLoad.replace("%", "") : cpuLoad
            );

            const updated = [...prev, value];
            return updated.length > 12 ? updated.slice(-12) : updated;
        });
    }, [cpuLoad]);

    return (
        <div style={{ height: "300px", width: "100%" }}>
            <Line
                data={{
                    labels,
                    datasets: [
                        {
                            label: "CPU Usage (%)",
                            data: dataPoints,
                            borderColor: "#4f46e5",
                            backgroundColor: "rgba(79,70,229,0.2)",

                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            fill: false,
                            tension: 0.4
                        }
                    ]
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                callback: value => value + "%"
                            }
                        }
                    },
                    plugins: {
                        legend: { display: true }
                    }
                }}
            />
        </div>
    );
}
