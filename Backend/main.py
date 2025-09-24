from fastapi import FastAPI, UploadFile, File 
from fastapi.middleware.cors import CORSMiddleware
from audio_decode import decode_fsk
import numpy as np
import io
from scipy.io import wavfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/decode")
async def decode_audio(file: UploadFile = File(...)):
    contents = await file.read()
    wav_bytes = io.BytesIO(contents)
    fs, signal = wavfile.read(wav_bytes)

    if signal.ndim > 1:
        signal = signal[:,0]

    bitstream, message = decode_fsk(signal, fs = fs)
    return {"bitstream": bitstream, "message": message}

