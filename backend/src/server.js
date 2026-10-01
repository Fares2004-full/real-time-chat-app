require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const createApp = require("./app");
const attachSocketHandlers = require("./sockets");

async function main() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN },
  });

  const { joinUserToConversationRoom } = attachSocketHandlers(io);

  app.set("io", io);
  app.set("joinUserToConversationRoom", joinUserToConversationRoom);

  const port = process.env.PORT || 4000;

  server.listen(port, () =>
    console.log(`[server] listening on http://localhost:${port}`),
  );
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
