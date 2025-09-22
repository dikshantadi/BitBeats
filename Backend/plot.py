import matplotlib.pyplot as plt
import numpy as np
from scipy.io import wavfile

fs, data = wavfile.read("output.wav")

plt.specgram(data, NFFT=1024, Fs=fs, noverlap=512, cmap="plasma")
plt.xlabel("Time (s)")
plt.ylabel("Frequency (Hz)")
plt.title("Spectrogram of FSK Signal")
plt.colorbar(label="Intensity (dB)")
plt.savefig("spectrogram.png", dpi=300, bbox_inches="tight")
plt.close()