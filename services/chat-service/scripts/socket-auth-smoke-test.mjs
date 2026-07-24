import jwt from "jsonwebtoken";
import { io } from "socket.io-client";
import "dotenv/config";

const viaGateway = process.argv.includes("--gateway");
const baseUrl = viaGateway ? "http://localhost:8000" : "http://localhost:5004";

const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
if (!secret) {
  console.error("FAIL: JWT_ACCESS_SECRET not set");
  process.exit(1);
}

const token = jwt.sign(
  { id: "smoke-test-user", email: "smoke@test.com", role: "USER" },
  secret,
  { expiresIn: "15m" },
);

const socket = io(baseUrl, {
  path: "/socket.io",
  auth: { token },
  transports: ["websocket"],
  reconnection: false,
});

const timeout = setTimeout(() => {
  console.error("FAIL: timed out");
  socket.close();
  process.exit(1);
}, 8000);

socket.on("connect", () => {
  clearTimeout(timeout);
  console.log(
    "OK: authenticated connect",
    socket.id,
    viaGateway ? "(gateway)" : "(direct)",
  );
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  clearTimeout(timeout);
  console.error("FAIL:", err.message, viaGateway ? "(gateway)" : "(direct)");
  process.exit(1);
});
