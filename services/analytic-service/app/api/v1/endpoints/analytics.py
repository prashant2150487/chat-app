from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import (
    GroupAnalytics,
    MessageAnalytics,
    UserAnalytics,
)
from app.services import analytics_service

router = APIRouter()


@router.get("/users", response_model=UserAnalytics)
def users_analytics(db: Session = Depends(get_db)):
    return analytics_service.get_user_analytics(db)


@router.get("/messages", response_model=MessageAnalytics)
def messages_analytics(db: Session = Depends(get_db)):
    return analytics_service.get_message_analytics(db)


@router.get("/groups", response_model=GroupAnalytics)
def groups_analytics(db: Session = Depends(get_db)):
    return analytics_service.get_group_analytics(db)
