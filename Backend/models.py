from sqlalchemy import column, Integer, String, Boolean
from sqlmodel import Field, SQLModel
from data_base import Base

class User(Base, SQLModel):
    __tablename__ = "users"
    id: int = Field(default=None, primary_key=True, idex=True) # type: ignore
    username: str = Field(index=True, unique=True)
