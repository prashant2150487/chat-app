import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        // Don't crash the service if the DB isn't provisioned yet.
        console.warn("Database connection failed (continuing):", error.message);
    }
};
