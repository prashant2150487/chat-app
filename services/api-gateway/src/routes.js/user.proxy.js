import {
  createProxyMiddleware,
  fixRequestBody,
} from "http-proxy-middleware";
import { SERVICES } from "../config/service.js";

// Mounted at /api/v1/users on the gateway.
// Express strips that prefix, so the target must include /api/v1/users
// (same pattern as auth.proxy.js → AUTH/api/v1/auth).
export const userProxy = createProxyMiddleware({
  target: `${SERVICES.USER}/api/v1/users`,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth) {
        proxyReq.setHeader("Authorization", auth);
      }
      fixRequestBody(proxyReq, req);
    },
  },
});
