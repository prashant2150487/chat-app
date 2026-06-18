import { authProxy } from "./src/routes.js/auth.proxy.js"
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import { userProxy } from "./src/routes.js/user.proxy.js";
// import { chatProxy } from "./src/routes.js/chat.proxy.js";




const app = express()
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());



app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    service: "api-gateway",
  });
});
app.use("/api/v1/auth", authProxy)
// app.use("/api/v1/user", userProxy)
// app.use("/api/v1/chat", chatProxy)

export default app;