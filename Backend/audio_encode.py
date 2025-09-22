#This file is Encoding Data into Audio File and Using Frequency Shift Keying Modulation Technique

import scipy
from scipy.io.wavfile import write
import matplotlib.pyplot as plt 
import wave
import numpy as np 
from math import pi
from enkode import take_message

#defining
fs = 44100 # Sampling frequency
Tb = 0.15    # bit duration in seconds
f0 = 17000   # Frequency for bit 0 in Hz
f1 = 17500   # Frequency for bit 1 in Hz 

signal = np.array([])
bitstream = take_message()

for bit in bitstream :
    f = f1 if bit == '1' else f0
    t = np.linspace(0, Tb, int(fs*Tb), endpoint=False)
    sine_wave = np.sin(2 * pi * f * t)
    signal = np.concatenate((signal, sine_wave))

signal_int16 = np.int16(signal * 32767)

write("fsk_message.wav", fs, signal_int16)
print("WAV file saved")

"""
for noise 
sigma = 1
noise = np.random.normal(0, sigma, size=len(signal))
noisy_signal = signal+ noise
noisy_signal = np.clip(noisy_signal, -1, 1)
signal_int16 = np.int16(noisy_signal * 32767)

write("fsk_message_noisy.wav", fs, signal_int16)
print("Noisy WAV file saved")

"""
plt.plot(signal[:1000])
plt.title("FSK waveform (first few samples)")
plt.xlabel("Sample")
plt.ylabel("Amplitude")
plt.savefig("fsk_waveform.png")




