import { PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient()

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Auth Service Database connected successfully");
    } catch (error) {
        console.error("Auth Service Database connection failed:", error);
        process.exit(1);
    }
};