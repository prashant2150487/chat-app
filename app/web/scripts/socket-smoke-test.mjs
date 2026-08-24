/**
 * Smoke test: node scripts/socket-smoke-test.mjs [jwt] [--gateway]
 */
import { io } from "socket.io-client";

const token = process.argv[2]?.startsWith("--") ? undefined : process.argv[2];
const viaGateway = process.argv.includes("--gateway");
const baseUrl = viaGateway ? "http://localhost:8000" : "http://localhost:5004";

const socket = io(baseUrl, {
  path: "/socket.io",
  auth: token ? { token } : {},
  transports: ["websocket"],
  autoConnect: true,
  reconnection: false,
});

const timeout = setTimeout(() => {
  console.error("FAIL: timed out");
  socket.close();
  process.exit(1);
}, 8000);

socket.on("connect", () => {
  clearTimeout(timeout);
  console.log("OK: connected", socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  clearTimeout(timeout);
  if (!token) {
    console.log("OK: rejected without token:", err.message);
    process.exit(0);
  }
  console.error("FAIL: connect_error", err.message);
  process.exit(1);
});
