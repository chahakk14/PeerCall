require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// In-memory room store: { roomId -> Map<socketId, { displayName, socketId }> }
const rooms = new Map();

function getRoomInfo(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
}

io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ─── Join Room ──────────────────────────────────────────────
  socket.on("join-room", ({ roomId, displayName }) => {
    if (!roomId || !displayName) return;

    // Leave any previous room
    for (const [rid, members] of rooms.entries()) {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        socket.leave(rid);
        socket.to(rid).emit("peer-left", { socketId: socket.id });
        if (members.size === 0) rooms.delete(rid);
      }
    }

    // Join new room
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    rooms.get(roomId).set(socket.id, { socketId: socket.id, displayName });

    // Send current peers to the joiner
    const peers = getRoomInfo(roomId).filter((p) => p.socketId !== socket.id);
    socket.emit("room-joined", { roomId, peers });

    // Notify existing peers
    socket.to(roomId).emit("peer-joined", { socketId: socket.id, displayName });

    console.log(`[join] ${displayName} (${socket.id}) → room "${roomId}" | peers: ${rooms.get(roomId).size}`);
  });

  // ─── WebRTC Signaling ────────────────────────────────────────
  socket.on("offer", ({ to, sdp }) => {
    io.to(to).emit("offer", { from: socket.id, sdp });
  });

  socket.on("answer", ({ to, sdp }) => {
    io.to(to).emit("answer", { from: socket.id, sdp });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // ─── Media state (mute / video off) ─────────────────────────
  socket.on("media-state", ({ roomId, audio, video }) => {
    socket.to(roomId).emit("peer-media-state", {
      socketId: socket.id,
      audio,
      video,
    });
  });

  // ─── Chat (fallback via server; DataChannel used P2P when available) ─
  socket.on("chat-message", ({ roomId, message, displayName }) => {
    io.to(roomId).emit("chat-message", {
      from: socket.id,
      displayName,
      message,
      timestamp: Date.now(),
    });
  });

  // ─── Disconnect ──────────────────────────────────────────────
  socket.on("disconnect", () => {
    for (const [roomId, members] of rooms.entries()) {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        socket.to(roomId).emit("peer-left", { socketId: socket.id });
        console.log(`[leave] ${socket.id} left room "${roomId}"`);
        if (members.size === 0) rooms.delete(roomId);
      }
    }
    console.log(`[disconnect] ${socket.id}`);
  });
});

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", rooms: rooms.size }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
