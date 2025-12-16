import { useEffect, useState } from "react";

export default function Devices({ ws }) {
  const [dashboardCount, setDashboardCount] = useState(1);
  const [dashboardId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    if (!ws) return;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "DASHBOARD_REGISTER",
        dashboardId
      }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "DASHBOARD_COUNT") {
        setDashboardCount(data.count+1);
      }
    };
  }, [ws, dashboardId]);
  


  return (
    <div className="devices" style={{color:"white"}}>Devices connected: {dashboardCount}</div>
  );
}
