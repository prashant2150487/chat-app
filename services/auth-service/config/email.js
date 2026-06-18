

import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: false,
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
    }
})

export const verifySMTP = async () => {
    try {
        await transporter.verify();
        console.log("SMTP Connected");
    } catch (error) {
        console.error("SMTP Error:", error);
    }
};