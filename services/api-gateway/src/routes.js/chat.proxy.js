import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "../config/service";




export const chatProxy = createProxyMiddleware({
  target: SERVICES.CHAT,
  changeOrigin: true,
});