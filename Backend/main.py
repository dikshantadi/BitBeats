from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from audio_encode import encode_text
from audio_decode import decode_fsk
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample


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
async def decode(file: UploadFile = File(...)):
    contents = await file.read()
    audio_data = np.frombuffer(contents, dtype=np.uint8)

    # Read WAV
    try:
        fs, data = wavfile.read(np.frombuffer(contents, dtype=np.uint8))
    except:
        return {"error": "Failed to read WAV. Make sure file is WAV format."}

    # Resample to 44100 Hz if needed
    target_fs = 44100
    if fs != target_fs:
        num_samples = int(len(data) * target_fs / fs)
        data = resample(data, num_samples)
        fs = target_fs

    # Normalize
    data = data.astype(float) # type: ignore
    data /= np.max(np.abs(data)) + 1e-9

    bitstream, message = decode_fsk(data, fs)
    return {"bitstream": bitstream, "message": message}