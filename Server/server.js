import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const pcs = new Map();        
const dashboards = new Set(); 

app.get("/", (_, res) => {
  res.send(" Server running");
});

wss.on("connection", (ws) => {
  ws.isDashboard = false;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    /* ---------- DASHBOARD ---------- */
    if (data.type === "DASHBOARD_REGISTER") {
      ws.isDashboard = true;
      dashboards.add(ws);

      console.log(" Dashboard connected");

      sendCounts();
      sendDashboardData();
      return;
    }

    /* --- DEVICE REGISTER ---- */
    if (data.type === "REGISTER") {
      console.log(" Device registered:", data.pcId);

      pcs.set(data.pcId, {
        pcId: data.pcId,
        online: true,
        lastSeen: Date.now(),
        staticInfo: data.payload,
        stats: null
      });

      sendCounts();
      sendDashboardData();
      return;
    }

    /* ---------- STATS ---------- */
    if (data.type === "SYSTEM_STATS") {
      const pc = pcs.get(data.pcId);
      if (!pc) return;

      pc.stats = data.payload;
      pc.lastSeen = Date.now();
      pc.online = true;

      sendCounts();
      sendDashboardData();
      return;
    }

    /* ---------- HEARTBEAT ---------- */
    if (data.type === "HEARTBEAT") {
      const pc = pcs.get(data.pcId);
      if (pc) {
        pc.lastSeen = Date.now();
        pc.online = true;
      }
    }
  });

  ws.on("close", () => {
    if (ws.isDashboard) {
      dashboards.delete(ws);
      console.log("Dashboard disconnected");
    }
  });
});

/* ---------------- OFFLINE CHECK ---------------- */
setInterval(() => {
  const now = Date.now();
  let changed = false;

  pcs.forEach(pc => {
    if (pc.online && now - pc.lastSeen > 6000) {
      pc.online = false;
      changed = true;
    }
  });

  if (changed) {
    sendCounts();
    sendDashboardData();
  }
}, 5000);

/* ---------------- SEND COUNTS ---------------- */
function sendCounts() {
  const totalDevices = pcs.size;
  const onlineDevices = [...pcs.values()].filter(p => p.online).length;
  const offlineDevices = totalDevices - onlineDevices;

  const msg = JSON.stringify({
    type: "COUNTS_UPDATE",
    payload: {
      totalDevices,
      onlineDevices,
      offlineDevices
    }
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

/* ---------------- SEND DEVICE DATA ---------------- */
function sendDashboardData() {
  const payload = [...pcs.values()];

  const msg = JSON.stringify({
    type: "DASHBOARD_UPDATE",
    payload
  });

  dashboards.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

/* ---------------- START ---------------- */
server.listen(8080, () => {
  console.log(" WebSocket server running on port 8080");
});