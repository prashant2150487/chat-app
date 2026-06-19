from pydantic import BaseModel


class UserAnalytics(BaseModel):
    total_users: int
    verified_email_users: int
    verified_phone_users: int
    new_users_last_7_days: int
    new_users_last_30_days: int


class MessageAnalytics(BaseModel):
    total_messages: int
    messages_last_7_days: int
    available: bool = False


class GroupAnalytics(BaseModel):
    total_groups: int
    active_groups: int
    available: bool = False
