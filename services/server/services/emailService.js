import { getTransporter, getMailFrom } from "../config/email.js";

export const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env",
    );
  }
  return transporter.sendMail({
    from: getMailFrom(),
    to,
    subject,
    html,
  });
};
