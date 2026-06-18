import "dotenv/config";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { verifySMTP } from "./config/email.js";

connectDB().then(() => {
    verifySMTP();
    app.listen(ENV.PORT, () => {
        console.log(`server is running on port ${ENV.PORT}`);
    });
});
