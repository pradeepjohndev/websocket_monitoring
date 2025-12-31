import WebSocket from "ws";
import { system, cpu, osInfo, mem, currentLoad, networkInterfaces, time, fsSize } from "systeminformation";
import si from "systeminformation"

const SERVER_URL = "ws://localhost:8080";

const PC_ID = process.env.PC_ID || `PC-${Math.floor(Math.random() * 10000)}`;

let socket;
let metricsInterval;
let heartbeatInterval;

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";
const percent = v => v.toFixed(1) + " %";

function connect() {
  socket = new WebSocket(SERVER_URL);

  socket.onopen = async () => {
    console.log(" Agent connected:", PC_ID);

    socket.send(JSON.stringify({
      type: "REGISTER",
      pcId: PC_ID,
      payload: await getStaticInfo()
    }));

    /*  CHANGE #2: IMMEDIATE HEARTBEAT */
    sendHeartbeat();

    startFastMetrics();
    heartbeatInterval = setInterval(sendHeartbeat, 5000);
  };

  socket.onclose = () => {
    console.log(" Disconnected. Reconnecting...");

    clearInterval(metricsInterval);
    clearInterval(heartbeatInterval);

    setTimeout(connect, 3000);
  };

  socket.onerror = err => {
    console.error("WebSocket error:", err.message);
  };
}

/* ---------------- STATIC INFO (ONCE) ---------------- */

async function getStaticInfo() {
  const s = await system();
  const c = await cpu();
  const o = await osInfo();
  const m = await mem();

  return {
    system: {
      manufacturer: s.manufacturer,
      model: s.model
    },
    cpu: {
      brand: c.brand,
      cores: c.cores
    },
    os: {
      distro: o.distro,
      arch: o.arch
    },
    memory: {
      total: gb(m.total)
    }
  };
}

/* ---------------- DYNAMIC INFO (EVERY 1s) ---------------- */

function startFastMetrics() {
  metricsInterval = setInterval(async () => {
    if (socket.readyState !== WebSocket.OPEN) return;

    try {
      const load = await currentLoad();
      const memory = await mem();
      const uptime = await time();
      const disks = await fsSize();
      const nets = await networkInterfaces();
      const stats = await si.networkStats();
      const netlog = stats[0];
      const downloadKB = (netlog.rx_sec / 1024).toFixed(2);
      const uploadKB = (netlog.tx_sec / 1024).toFixed(2);
      const net = nets.find(n => !n.internal && n.ip4);


      socket.send(JSON.stringify({
        type: "SYSTEM_STATS",
        pcId: PC_ID,
        payload: {
          timestamp: Date.now(),
          uptime: uptime.uptime,
          // cpu: { load: load.currentLoad.toFixed(2) + " %" },
          cpu: { load: Number(load.currentLoad.toFixed(2)) },
          memory: {
            // used: gb(memory.used),
            // free: gb(memory.free),
            // total: gb(memory.total)
            used: memory.used,
            free: memory.free,
            total: memory.total
          },
          network: {
            ip: net?.ip4 || "N/A",
            mac: net?.mac || "N/A",
            iface: net?.iface || "N/A",
            Upload: uploadKB,
            download: downloadKB,
          },
          disks: disks.map(d => ({
            mount: d.mount,
            type: d.type || "Unknown",
            size: gb(d.size),
            used: gb(d.used),
            available: gb(d.available),
            usage: percent(d.use)
          }))
        }
      }));
    } catch (err) {
      console.error("Metric error:", err.message);
    }
  }, 1000);
}

/* ---------------- HEARTBEAT ---------------- */

function sendHeartbeat() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "HEARTBEAT",
      pcId: PC_ID
    }));
  }
}

/* ---------------- START ---------------- */

connect();

