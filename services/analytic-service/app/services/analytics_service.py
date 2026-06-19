from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.analytics import (
    GroupAnalytics,
    MessageAnalytics,
    UserAnalytics,
)


def get_user_analytics(db: Session) -> UserAnalytics:
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    verified_email_users = (
        db.query(func.count(User.id))
        .filter(User.is_email_verified.is_(True))
        .scalar()
        or 0
    )
    verified_phone_users = (
        db.query(func.count(User.id))
        .filter(User.is_phone_verified.is_(True))
        .scalar()
        or 0
    )
    new_users_last_7_days = (
        db.query(func.count(User.id))
        .filter(User.createdAt >= seven_days_ago)
        .scalar()
        or 0
    )
    new_users_last_30_days = (
        db.query(func.count(User.id))
        .filter(User.createdAt >= thirty_days_ago)
        .scalar()
        or 0
    )

    return UserAnalytics(
        total_users=total_users,
        verified_email_users=verified_email_users,
        verified_phone_users=verified_phone_users,
        new_users_last_7_days=new_users_last_7_days,
        new_users_last_30_days=new_users_last_30_days,
    )


def get_message_analytics(db: Session) -> MessageAnalytics:
    """Placeholder until a messages table exists in chat_db."""
    return MessageAnalytics(
        total_messages=0,
        messages_last_7_days=0,
        available=False,
    )


def get_group_analytics(db: Session) -> GroupAnalytics:
    """Placeholder until a groups table exists in chat_db."""
    return GroupAnalytics(
        total_groups=0,
        active_groups=0,
        available=False,
    )
