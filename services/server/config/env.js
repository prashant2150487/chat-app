import "./loadEnv.js";

function clean(value) {
  if (value == null || value === "") return undefined;
  let s = String(value).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s || undefined;
}

function smtpPassword(value) {
  const pass = clean(value);
  return pass ? pass.replace(/\s/g, "") : undefined;
}

export const ENV = {
  PORT: Number(process.env.PORT) || 8000,
  DATABASE_URL: clean(process.env.DATABASE_URL),
  JWT_ACCESS_SECRET:
    clean(process.env.JWT_ACCESS_SECRET) || clean(process.env.JWT_SECRET),
  JWT_REFRESH_SECRET: clean(process.env.JWT_REFRESH_SECRET),
  JWT_EXPIRES_IN: clean(process.env.JWT_EXPIRES_IN),
  JWT_REFRESH_EXPIRES_IN: clean(process.env.JWT_REFRESH_EXPIRES_IN),
  INTERNAL_SERVICE_SECRET: clean(process.env.INTERNAL_SERVICE_SECRET),
  SMTP_HOST: clean(process.env.SMTP_HOST),
  SMTP_PORT: Number(clean(process.env.SMTP_PORT)) || 587,
  SMTP_USER: clean(process.env.SMTP_USER),
  SMTP_PASS: smtpPassword(process.env.SMTP_PASS),
  SMTP_FROM: clean(process.env.SMTP_FROM),
  SMTP_SECURE:
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
};
