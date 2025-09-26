from fastapi import FastAPI, UploadFile, File 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from audio_decode import decode_fsk
from audio_encode import encode_text as encode_text_fn
import numpy as np
from scipy.io import wavfile
from pydantic import BaseModel
from models import User
from data_base import SessionLocal, engine, Base

app = FastAPI()

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

@app.post("/users/")
def create_user(user: User, db: SessionLocal = Depends(get_db)): # type: ignore
    user = User(username=user.username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {id : user.id, "username": user.username}


class EncodeRequest(BaseModel):
    message: str

class DecodeResponse(BaseModel):
    audio_data: list[float]

@app.post("/encode")
async def encode_message(req : EncodeRequest):
    audio_array = encode_text_fn(req.message) 
    return {"audio_data": audio_array.tolist()}

@app.post("/decode")
async def decode_message(req : DecodeResponse):
    audio_array = np.array(req.audio_data, dtype=np.float32)
    bitstream, message = decode_fsk(audio_array, fs=48000)
    return {"bitstream": bitstream, "message": message}

