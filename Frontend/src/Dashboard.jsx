import { useEffect, useState } from "react";
import { FaComputer, FaWifi } from "react-icons/fa6";
import { SiGooglecloudstorage } from "react-icons/si";
import { AiFillThunderbolt } from "react-icons/ai";
import { GrSystem } from "react-icons/gr";
import { MdError } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import Devices from "./Devices";
import DiskDonut from "./Diskdonut.jsx";


/* ---------- HUMAN READABLE UPTIME ---------- */
function formatUptime(seconds) {
  seconds = Number(seconds);

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export default function Dashboard() {
  const [pcs, setPcs] = useState([]);
  const [time, setTime] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ---------- WEBSOCKET ---------- */
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "DASHBOARD_UPDATE") {
        setPcs(data.payload);
      }
    };

    ws.onerror = () => console.error("WebSocket error");
    return () => ws.close();
  }, []);

  return (
    <div>
      <div className="header">
        <h1>IT Asset Monitoring</h1>
        <div className="side">
          <div className="time">Current Time: {time}</div>
          {<Devices />}
        </div>
      </div>

      {pcs.length === 0 && <p>Connecting...</p>}

      {pcs.map((pc) => {
        const lastUpdate = pc.stats?.timestamp
          ? new Date(pc.stats.timestamp).toLocaleTimeString()
          : "N/A";

        const latency = pc.stats?.timestamp
          ? `${now - pc.stats.timestamp} ms`
          : "N/A";

        return (
          <div key={pc.pcId} className={`pc ${pc.online ? "online" : "offline"}`}>
            <h3>
              <FaComputer className="icon" />{pc.online ? <GoDotFill style={{color:"green"}}/> : <GoDotFill style={{color:"red"}}/>}{pc.pcId}
            </h3>

            <p className="time"><b>Last Update:</b> {lastUpdate}</p>
            <p className="time"><b>Latency:</b> {latency}</p>

            {/* ---------- STATIC INFO ---------- */}
            <div className="section">
              <h4><GrSystem /> Static Information</h4>
              <p><b>Manufacturer:</b> {pc.staticInfo.system.manufacturer}</p>
              <p><b>Model:</b> {pc.staticInfo.system.model}</p>
              <p>
                <b>CPU:</b> {pc.staticInfo.cpu.brand} (
                {pc.staticInfo.cpu.cores} cores)
              </p>
              <p><b>OS:</b> {pc.staticInfo.os.distro} {pc.staticInfo.os.arch}</p>

              <p><b>Total RAM:</b> {pc.staticInfo.memory.total}</p>
            </div>

            {/* ---------- LIVE METRICS ---------- */}
            <div className="section">
              <h4><AiFillThunderbolt /> Live Metrics</h4>

              {pc.stats ? (
                <>
                  <p><b>CPU Load:</b> {pc.stats.cpu.load}</p>
                  <p><b>RAM Used:</b> {pc.stats.memory.used}</p>
                  <p><b>RAM Free:</b> {pc.stats.memory.free}</p>
                  <p><b>Uptime:</b> {formatUptime(pc.stats.uptime)}</p>

                  <hr></hr>
                  <h4><FaWifi /> Network</h4>
                  <p><b>IP:</b> {pc.stats.network.ip || "N/A"}</p>
                  <p><b>MAC:</b> {pc.stats.network.mac || "N/A"}</p>
                  <p><b>iface: </b>{pc.stats.network.iface || "N/A"}</p>

                  <hr></hr>
                  <h4><SiGooglecloudstorage /> Storage</h4>
                  {pc.stats.disks?.length ? (
                    /* < div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      {pc.stats.disks.map((disk, i) => (
                        <DiskDonut key={i} disk={disk} />
                      ))}
                    </div> */
                    <table className="disk-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Mount</th>
                          <th>Total</th>
                          <th>Used</th>
                          <th>Free</th>
                          <th>Usage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pc.stats.disks.map((d, i) => (
                          <tr key={i}>
                            <td>{d.type}</td>
                            <td>{d.mount}</td>
                            <td>{d.size}</td>
                            <td>{d.used}</td>
                            <td>{d.available}</td>
                            <td>{d.usage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                  <p><MdError /> No disk data</p>
                  )}
                </>
              ) : (
                <p><MdError /> No live data yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div >
  );
}




