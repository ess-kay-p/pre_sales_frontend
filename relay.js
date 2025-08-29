const express = require("express");
const { WebSocketServer } = require("ws");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Create a simple HTTP server
const server = app.listen(3000, () => {
  console.log("Relay server running on http://localhost:3000");
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Client connected, total:", clients.length);

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
    console.log("Client disconnected, total:", clients.length);
  });
});

// Endpoint for n8n to POST data
app.post("/broadcast", (req, res) => {
  const data = req.body;
  console.log("Broadcasting data:", data);

  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  res.json({ status: "ok" });
});
