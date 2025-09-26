from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from fastapi import Depends, HTTPException, Query
from typing import Annotated
from sqlmodel import Field, SQLModel, Session, create_engine, select

SQLALCHEMY_DATABASE_URL = "sqlite:///./bitbeat.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
