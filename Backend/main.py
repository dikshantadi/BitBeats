from fastapi import FastAPI, UploadFile, File 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from audio_decode import decode_fsk
from audio_encode import encode_text as encode_text_fn
import numpy as np
from scipy.io import wavfile
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

