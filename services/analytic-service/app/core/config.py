from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Analytics Service"
    PORT: int = 5002
    DATABASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def sqlalchemy_url(self) -> str:
        """Normalize the URL to use the PyMySQL driver.

        Other services (e.g. auth-service via Prisma) use the bare
        ``mysql://`` scheme. SQLAlchemy needs an explicit driver, so we
        upgrade it to ``mysql+pymysql://`` when necessary.
        """
        url = self.DATABASE_URL
        if url.startswith("mysql://"):
            return url.replace("mysql://", "mysql+pymysql://", 1)
        return url


settings = Settings()
