import "dotenv/config";
import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { initSocket } from "./socket/index.js";

connectDB().then(() => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(ENV.PORT, () => {
    console.log(`chat-service is running on port ${ENV.PORT}`);
  });
});
