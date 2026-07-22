import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import rootRouter from "./routes/index.js";
import { notFound } from "./middlewares/notFoundMiddleware.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];

app.use(
    cors({
        origin: allowedOrigins,
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
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", rootRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
