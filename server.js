import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

/* ---------------- SETUP ---------------- */

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const pcs = new Map(); // pcId -> state

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.send("🟢 IT Asset Monitoring Server Running");
});

/* ---------------- WEBSOCKET ---------------- */

wss.on("connection", (ws) => {
  ws.isDashboard = true; // default

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch {
      return;
    }

    /* -------- REGISTER AGENT -------- */
    if (data.type === "REGISTER") {
      ws.isDashboard = false;
      ws.pcId = data.pcId;

      pcs.set(data.pcId, {
        ws,
        pcId: data.pcId,
        online: true,
        lastSeen: Date.now(),
        staticInfo: data.payload,
        stats: null
      });

      broadcastDashboard();
      return;
    }

    /* -------- SYSTEM STATS -------- */
    if (data.type === "SYSTEM_STATS") {
      const pc = pcs.get(data.pcId);
      if (!pc) return;

      pc.stats = data.payload;
      pc.lastSeen = Date.now();
      pc.online = true;

      broadcastDashboard();
      return;
    }

    /* -------- HEARTBEAT -------- */
    if (data.type === "HEARTBEAT") {
      const pc = pcs.get(data.pcId);
      if (pc) {
        pc.lastSeen = Date.now();
        pc.online = true;
      }
    }
  });

  /* -------- DISCONNECT -------- */
  ws.on("close", () => {
    if (!ws.isDashboard && ws.pcId) {
      const pc = pcs.get(ws.pcId);
      if (pc) {
        pc.online = false;   // ⚠️ don't delete, mark offline
        pc.ws = null;
        broadcastDashboard();
      }
    }
  });
});

/* ---------------- OFFLINE CHECK ---------------- */

setInterval(() => {
  const now = Date.now();

  pcs.forEach(pc => {
    if (now - pc.lastSeen > 6000) {
      pc.online = false;
    }
  });

  broadcastDashboard();
}, 1000);

/* ---------------- BROADCAST ---------------- */

function broadcastDashboard() {
  const payload = [...pcs.values()].map(pc => ({
    pcId: pc.pcId,
    online: pc.online,
    staticInfo: pc.staticInfo,
    stats: pc.stats
  }));

  const msg = JSON.stringify({
    type: "DASHBOARD_UPDATE",
    payload
  });

  wss.clients.forEach(client => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.isDashboard
    ) {
      client.send(msg);
    }
  });
}

/* ---------------- START ---------------- */

server.listen(8080, () => {
  console.log("🟢 WebSocket server running on port 8080");
});
