export const ENV = {
    PORT: process.env.PORT || 5004,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET,
};
