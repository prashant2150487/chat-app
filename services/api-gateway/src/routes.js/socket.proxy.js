import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "../config/service.js";

export const socketProxy = createProxyMiddleware({
  target: SERVICES.CHAT,
  changeOrigin: true,
  ws: true,
});
