import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "../config/service.js";

export const chatProxy = createProxyMiddleware({
  target: `${SERVICES.CHAT}/api/v1`,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth) {
        proxyReq.setHeader("Authorization", auth);
      }
    },
    proxyRes: (proxyRes) => {
      const headers = proxyRes.headers;
      delete headers["access-control-allow-origin"];
      delete headers["access-control-allow-credentials"];
      delete headers["access-control-allow-methods"];
      delete headers["access-control-allow-headers"];
      delete headers["access-control-expose-headers"];
    },
  },
});
