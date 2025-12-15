import WebSocket from "ws";
import {
  system,
  cpu,
  osInfo,
  mem,
  currentLoad,
  networkInterfaces,
  time,
  fsSize
} from "systeminformation";

/* ---------------- CONFIG ---------------- */

const SERVER_URL = "ws://localhost:8080";
const PC_ID = "PC-01"; // 🔁 Make unique per PC
let socket;

/* ---------------- HELPERS ---------------- */

const gb = bytes => (bytes / 1024 ** 3).toFixed(2) + " GB";
const percent = v => v.toFixed(1) + " %";

/* ---------------- CONNECT ---------------- */

function connect() {
  socket = new WebSocket(SERVER_URL);

  socket.onopen = async () => {
    console.log("✅ Agent connected to server");

    // Send STATIC info once
    socket.send(JSON.stringify({
      type: "REGISTER",
      pcId: PC_ID,
      payload: await getStaticInfo()
    }));

    // Start live metrics
    startFastMetrics();

    // Heartbeat
    setInterval(sendHeartbeat, 5000);
  };

  socket.onclose = () => {
    console.log("❌ Disconnected. Reconnecting...");
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
  setInterval(async () => {
    if (socket.readyState !== WebSocket.OPEN) return;

    try {
      const load = await currentLoad();
      const memory = await mem();
      const net = await networkInterfaces();
      const uptime = await time();
      const disks = await fsSize();

      socket.send(JSON.stringify({
        type: "SYSTEM_STATS",
        pcId: PC_ID,
        payload: {
          timestamp: Date.now(),
          uptime: uptime.uptime,

          cpu: {
            load: load.currentLoad.toFixed(2) + " %"
          },

          memory: {
            used: gb(memory.used),
            free: gb(memory.free)
          },

          network: {
            ip: net.find(n => !n.internal)?.ip4 || "N/A"
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
