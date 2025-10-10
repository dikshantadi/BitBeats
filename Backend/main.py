from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import numpy as np
from audio_decode import decode_fsk
from audio_encode import encode_text as encode_text_fn
from models import User, DecodedAudio
from data_base import SessionLocal, engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    username: str

class DecodeRequest(BaseModel):
    user_id: int
    audio_data: list[float]

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "username": db_user.username}

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    return {"id": user.id, "username": user.username}


@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "username": db_user.username}

@app.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        return {"error": "User not found"}
    return {"user_id": db_user.id, "message": "Login successful"}

class EncodeRequest(BaseModel):
    message: str

class DecodeRequest(BaseModel):
    audio_data: list[float]

@app.post("/encode")
async def encode_message(req: EncodeRequest):
    audio_array = encode_text_fn(req.message)
    return {"audio_data": audio_array.tolist()}

@app.post("/decode")
async def decode_message(req: DecodeRequest, db: Session = Depends(get_db)):
    audio_array = np.array(req.audio_data, dtype=np.float32)
    bitstream, message = decode_fsk(audio_array, fs=48000)
    
    # Save the audio to database
    db_decoded = DecodedAudio(user_id=req.user_id, bitstream=bitstream, message=message)
    db.add(db_decoded)
    db.commit()
    db.refresh(db_decoded)
    
    return {"bitstream": bitstream, "message": message}