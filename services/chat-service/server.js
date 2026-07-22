import "dotenv/config";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/database.js";

connectDB().then(() => {
    app.listen(ENV.PORT, () => {
        console.log(`chat-service is running on port ${ENV.PORT}`);
    });
});
