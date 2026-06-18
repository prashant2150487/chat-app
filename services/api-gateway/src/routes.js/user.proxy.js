import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "../config/service";




export const userProxy = createProxyMiddleware({
  target: SERVICES.USER,
  changeOrigin: true,
});