import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export function isSmtpConfigured() {
  return Boolean(ENV.SMTP_USER && ENV.SMTP_PASS);
}

function isGmail() {
  const host = (ENV.SMTP_HOST || "").toLowerCase();
  const user = (ENV.SMTP_USER || "").toLowerCase();
  return host.includes("gmail") || user.endsWith("@gmail.com");
}

function createTransporter() {
  const auth = {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  };

  if (isGmail()) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth,
      tls: {
        minVersion: "TLSv1.2",
        servername: "smtp.gmail.com",
      },
    });
  }

  const port = ENV.SMTP_PORT || 587;
  const secure = ENV.SMTP_SECURE || port === 465;

  return nodemailer.createTransport({
    host: ENV.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    requireTLS: !secure,
    auth,
    tls: {
      minVersion: "TLSv1.2",
      servername: ENV.SMTP_HOST || "smtp.gmail.com",
    },
  });
}

/** @type {import("nodemailer").Transporter | null} */
let transporter = null;

export function resetTransporter() {
  transporter = null;
}

export function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export function getMailFrom() {
  if (ENV.SMTP_FROM) {
    return ENV.SMTP_FROM;
  }
  return ENV.SMTP_USER;
}

export const verifySMTP = async () => {
  if (!isSmtpConfigured()) {
    console.log(
      "SMTP not configured — set SMTP_USER and SMTP_PASS in services/server/.env",
    );
    return;
  }

  resetTransporter();

  try {
    await getTransporter().verify();
    console.log("SMTP connected");
  } catch (error) {
    console.error("SMTP Error:", error.message || error);
    if (String(error.message).includes("535")) {
      console.error(
        "Hint: use a Google App Password (16 chars), not your normal Gmail password. SMTP_USER must match that account.",
      );
    }
  }
};
