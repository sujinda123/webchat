import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const httpServer = createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Config Redis Subscriber
// const pubClient = new Redis(REDIS_URL);
const subClient = new Redis(REDIS_URL);

// Connect & Init Server
async function initServer() {
  await subClient.psubscribe("line:chat:*");

  // Broadcast Message to Room
  subClient.on("pmessage", (pattern, channel, message) => {
    const userId = channel.replace("line:chat:", "");
    const parsedData = JSON.parse(message);

    // Chat Activity Broadcast
    io.to("admin-list-room").emit("new-chat-activity", {
      user: userId,
      timestamp: parsedData.timestamp || Date.now(),
    });

    io.to(userId).emit("receive-message", parsedData);
  });

  // connection
  io.on("connection", (socket) => {
    console.log(`Client attached: ${socket.id}`);

    // Join Room
    socket.on("join-room", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room: ${userId}`);
    });

    // Leave Room
    socket.on("leave-room", (userId) => {
      socket.leave(userId);
      console.log(`Socket ${socket.id} left room: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(3001, () => {
    console.log("Socket.IO backend running on port 3001");
  });
}

initServer().catch((err) => console.error("Initialization Failed:", err));
