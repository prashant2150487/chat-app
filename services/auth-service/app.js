import express from "express";
import rootRouter from "./routes/index.js"
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFound } from "./middlewares/notFoundMiddlewre.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";




const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));


app.use("/api/v1",rootRouter);

app.use(notFound)
app.use(errorHandler)

export default app;