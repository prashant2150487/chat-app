import "dotenv/config";
import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { verifySMTP } from "./config/email.js";
import { initSocket } from "./socket/index.js";

async function start() {
  await connectDB();
  verifySMTP();

  const server = http.createServer(app);
  initSocket(server);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${ENV.PORT} is already in use. Stop the other process or set PORT in .env.`,
      );
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  server.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
    console.log(`REST: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`Socket.IO: http://localhost:${ENV.PORT}/socket.io`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
