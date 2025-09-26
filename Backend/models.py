from sqlalchemy import column, Integer, String, Boolean
from sqlmodel import Field, SQLModel
from data_base import Base
from datetime import datetime

class User(Base, SQLModel):
    __tablename__ = "users"
    id: int = Field(default=None, primary_key=True, idex=True)
    username: str = Field(index=True, unique=True)

class decoded_audio(Base, SQLModel):
    __tablename__ = "decoded_audios"
    id: int = Field(default=None, primary_key=True, idex=True) 
    user_id: int = Field(foreign_key="users.id")
    bitstream: str
    message: str
    timestamp: datetime = Field(default=datetime.utcnow) 

