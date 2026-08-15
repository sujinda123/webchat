import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Config Redis
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

// Connect
async function initServer() {
  await Promise.all([pubClient.connect(), subClient.connect()]);

  // Attach adapter
  io.adapter(createAdapter(pubClient, subClient));

  // Regular event
  io.on("connection", (socket) => {
    console.log(`Client attached: ${socket.id}`);

    socket.on("send-message", (data) => {
      console.log("Received message:", data);
      // broadcasts
      io.emit("receive-message", data);
    });
  });

  httpServer.listen(3001, () => {
    console.log("Socket.IO backend running on port 3001");
  });
}

initServer().catch((err) => console.error("Initialization Failed:", err));
