import {
    createProxyMiddleware,
    fixRequestBody
} from "http-proxy-middleware";
import { SERVICES } from "../config/service.js";

export const authProxy = createProxyMiddleware({
    target: `${SERVICES.AUTH}/api/v1/auth`,
    changeOrigin: true,
    on: {
        proxyReq: fixRequestBody,
    },
});