import express from "express";
import rootRouter from "./routes/index.js"
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFound } from "./middlewares/notFoundMiddlewre.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";




const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/v1",rootRouter);

app.use(notFound)
app.use(errorHandler)

export default app;