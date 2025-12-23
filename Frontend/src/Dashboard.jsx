import { useEffect, useState } from "react";
import { FaArrowDown, FaComputer, FaWifi } from "react-icons/fa6";
import { SiGooglecloudstorage } from "react-icons/si";
import { AiFillThunderbolt } from "react-icons/ai";
import { GrSystem } from "react-icons/gr";
import { MdError } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { FaArrowUp } from "react-icons/fa";
import Devices from "./Devices";
import DiskDonut from "./Diskdonut.jsx";
import Netlog from "./Component/Netlog.jsx";
import Cpuload from "./Component/Cpuload.jsx";
import RAMStackedBar from "./Component/RAMStackedBar.jsx"
import { Collapse } from "react-collapse";

/* ---------- HUMAN READABLE UPTIME ---------- */
function formatUptime(totalSeconds) {
  totalSeconds = Number(totalSeconds);

  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, "0");

  const parts = [];
  if (days) parts.push(`${days}d`);
  parts.push(`${pad(hours)}h`);
  parts.push(`${pad(minutes)}m`);
  parts.push(`${pad(seconds)}s`);

  return parts.join(" ");
}

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";


export default function Dashboard() {
  const [pcs, setPcs] = useState([]);
  const [time, setTime] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);
  // const [dark, setDark] = useState(false);

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

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "DASHBOARD_REGISTER",
          dashboardId: crypto.randomUUID()
        })
      );

      setWs(ws);
      setReady(true);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "DASHBOARD_UPDATE") {
        setPcs(data.payload);
      }
    };

    ws.onerror = () => console.error("WebSocket error");

    return () => ws.close();
  }, []);

  const [Open, setOpen] = useState(false);
  const [Expand,setExpand] = useState(false);

  return (
    <div>
      <div className="header">
        <div className="side_left">
          <h1>IT Asset Monitoring</h1>
          <div className="time">Current Time: {time}</div>
        </div>
        <div className="side">
          {ready && ws && <Devices ws={ws} />}
          {/* <button onClick={() => setDark(!dark)}>Toggle Theme</button> */}
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

        const cpuColor =
          pc.stats.cpu.load > 80 ? "#dc2626" : pc.stats.cpu.load > 50 ? "#f59e0b" : "#22c55e";

        /* const themeStyles = {
          backgroundColor: dark ? "black" : "white",
          color: dark ? "white" : "black"
        } */

        return (
          <div /* style={themeStyles} */ key={pc.pcId} className={`pc ${pc.online ? "online" : "offline"}`} onClick={() => { setOpen(!Open) }}>
            <h3>
              <FaComputer className="icon" />{pc.online ? <GoDotFill style={{ color: "green" }} /> : <GoDotFill style={{ color: "red" }} />}{pc.pcId}
            </h3>

            <p className="time"><b>Last Update:</b> {lastUpdate}</p>
            <p className="time"><b>Latency:</b> {latency}</p>
            <p><b>Uptime:</b> {formatUptime(pc.stats.uptime)}</p>

            {/* ---------- STATIC INFO ---------- */}
            <div className="section" style={{ cursor: "pointer" }}>
              <h4><GrSystem /> Static Information</h4>
              <Collapse isOpened={Open} theme={{ collapse: "react-collapse", content: "react-collapse-content" }}>
                <p><b>Manufacturer:</b> {pc.staticInfo.system.manufacturer}</p>
                <p><b>Model:</b> {pc.staticInfo.system.model}</p>
                <p>
                  <b>CPU:</b> {pc.staticInfo.cpu.brand} (
                  {pc.staticInfo.cpu.cores} cores)
                </p>
                <p><b>OS:</b> {pc.staticInfo.os.distro} {pc.staticInfo.os.arch}</p>
              </Collapse>
            </div>


            <div className="section" style={{ cursor: "pointer" }} onClick={() => { setExpand(!Expand) }}>
              <h4><AiFillThunderbolt /> Live Metrics</h4>
              <Collapse isOpened={Expand} theme={{ collapse: "react-collapse", content: "react-collapse-content" }}>
              {pc.stats ? (
                <>
                  <RAMStackedBar
                    used={pc.stats.memory.used}
                    free={pc.stats.memory.free}
                    total={pc.staticInfo.memory.total}
                  />
                  <div className="Ram_info">
                    <p><b>RAM Used:</b> {gb(pc.stats.memory.used)}</p>
                    <p><b>RAM Free:</b> {gb(pc.stats.memory.free)}</p>
                    <p><b>Total RAM:</b> {pc.staticInfo.memory.total}</p>
                  </div>

                  <Cpuload
                    label="CPU Load"
                    value={pc.stats.cpu.load}
                    color={cpuColor}
                  />
                  <p className="Ram_info"><b>CPU Load: {pc.stats.cpu.load} %</b></p>

                  <hr></hr>
                  <h4><FaWifi /> Network</h4>
                  <p><b>IP:</b> {pc.stats.network.ip || "N/A"}</p>
                  <p><b>MAC:</b> {pc.stats.network.mac || "N/A"}</p>
                  <p><b>iface: </b>{pc.stats.network.iface || "N/A"}</p>

                  <p><b>Network check: </b></p>
                  <p>Evaluate your network speed and check for network issues to ensure your pc can smoothly access the internet</p>
                  <div className="Network_stats">
                    <div className="network_left" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                      <p>Upload: {pc.stats.network.Upload}<FaArrowUp style={{ color: "red" }} /> Kb/sec </p>
                      <p>Download:{pc.stats.network.download} <FaArrowDown style={{ color: "blue" }} />Kb/sec</p>

                    </div>
                    <div className="network_right">
                      <Netlog
                        upload={pc.stats.network.Upload}
                        download={pc.stats.network.download}
                      /></div>
                  </div>
                  {/* <p><b>upload: </b>{pc.stats.network.Upload}kb/sec</p>
                  <p><b>download: </b>{pc.stats.network.download}kb/sec</p> */}

                  <hr></hr>
                  <h4><SiGooglecloudstorage /> Storage</h4>
                  {pc.stats.disks?.length ? (
                    <div style={{ display: "flex", justifyContent: "space-evenly", flexWrap: "wrap" }}>
                      {pc.stats.disks.map((disk, i) => (
                        <DiskDonut key={i} disk={disk} />
                      ))}
                    </div>
                    /* <table className="disk-table">
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
                    </table> */
                  ) : (
                    <p><MdError /> No disk data</p>
                  )}
                </>
              ) : (
                <p><MdError /> No live data yet</p>
              )}
              </Collapse>
            </div>
          </div>
        );
      })}
    </div >
  );
}




