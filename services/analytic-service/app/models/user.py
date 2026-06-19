from sqlalchemy import Boolean, Column, DateTime, String

from app.core.database import Base


class User(Base):
    """Read-only mapping of the ``users`` table owned by auth-service.

    Mirrors the Prisma schema in services/auth-service/prisma/schema.prisma.
    This service only reads from it for analytics.
    """

    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    lastName = Column(String(255), nullable=True)
    firstName = Column(String(255), nullable=True)
    mobile = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False, default="USER")
    is_phone_verified = Column(Boolean, nullable=False, default=False)
    is_email_verified = Column(Boolean, nullable=False, default=False)
    createdAt = Column(DateTime, nullable=False)
    updatedAt = Column(DateTime, nullable=False)
