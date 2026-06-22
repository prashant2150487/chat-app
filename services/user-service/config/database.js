import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        // Don't crash the service if the DB isn't provisioned yet; the
        // scaffold/demo endpoints should still boot. Swap to process.exit(1)
        // once Postgres is required.
        console.warn("Database connection failed (continuing):", error.message);
    }
};
