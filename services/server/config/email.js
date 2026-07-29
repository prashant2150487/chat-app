import nodemailer from "nodemailer";
import { ENV } from "./env.js";

/** @type {import("nodemailer").Transporter | null} */
let transporter = null;

export function getConfigError() {
  if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
    return "Set SMTP_USER and SMTP_PASS in services/server/.env";
  }
  if (
    ENV.SMTP_USER.includes("@gmail.com") &&
    ENV.MAIL_PROVIDER === "smtp" &&
    !ENV.SMTP_HOST &&
    ENV.SMTP_PASS.length !== 16
  ) {
    return `Gmail App Password must be exactly 16 characters (yours is ${ENV.SMTP_PASS.length}).`;
  }
  if (ENV.MAIL_PROVIDER === "smtp" && !ENV.SMTP_HOST && !ENV.SMTP_USER.includes("@gmail.com")) {
    return "Set SMTP_HOST for SMTP mail (e.g. smtp.office365.com).";
  }
  return null;
}

function buildTransporter() {
  const auth = {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  };

  if (ENV.SMTP_USER.includes("@gmail.com") && !ENV.SMTP_HOST) {
    return nodemailer.createTransport({
      service: "gmail",
      auth,
    });
  }

  const host = ENV.SMTP_HOST || "smtp.office365.com";
  const port = ENV.SMTP_PORT || 587;
  const secure = ENV.SMTP_SECURE || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth,
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
  });
}

export function resetTransporter() {
  transporter = null;
}

function getTransporter() {
  const configError = getConfigError();
  if (configError) {
    return { configError, transporter: null };
  }
  if (!transporter) {
    transporter = buildTransporter();
  }
  return { configError: null, transporter };
}

export function getMailFrom() {
  if (ENV.SMTP_FROM) {
    return ENV.SMTP_FROM.includes("<")
      ? ENV.SMTP_FROM
      : ENV.SMTP_FROM;
  }
  return ENV.SMTP_USER;
}

export async function sendEmail(to, subject, html, text = "") {
  const { configError, transporter: mailer } = getTransporter();
  if (configError) {
    throw new Error(configError);
  }

  return mailer.sendMail({
    from: getMailFrom(),
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ""),
    html,
  });
}

export async function verifySMTP() {
  resetTransporter();
  const { configError, transporter: mailer } = getTransporter();

  if (configError) {
    console.error("❌", configError);
    return false;
  }

  try {
    await mailer.verify();
    console.log("✅ SMTP connected", ENV.SMTP_HOST || "gmail");
    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    const msg = String(error.message);
    if (msg.includes("535") || msg.includes("534")) {
      console.error(
        "→ SMTP login rejected. Check SMTP_USER/SMTP_PASS. For Microsoft 365, enable SMTP AUTH for the mailbox and use the correct password or app password.",
      );
    }
    return false;
  }
}
