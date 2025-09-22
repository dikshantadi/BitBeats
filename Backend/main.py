from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from audio_encode import encode_text
from audio_decode import decode_fsk
import numpy as np


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DecodeRequest(BaseModel):
    audio_data: list[float]

class EncodeRequest(BaseModel):
    message: str


@app.post("/encode")
def encode(request: EncodeRequest):
    audio_array = encode_text(request.message)
    return {"audio_data": audio_array.tolist()}

@app.post("/decode")
def decode(request: DecodeRequest):
    
    audio_array = np.array(request.audio_data, dtype=np.float32)
    bitstream, message = decode_fsk(audio_array, fs=44100, f0=17000, f1=17500, Tb=0.15)
    return {"bitstream": bitstream, "message": message}