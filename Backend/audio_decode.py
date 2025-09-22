from scipy.io import wavfile
import numpy as np
from scipy.signal import firwin, lfilter


def goertzel(chunk, target_freq, fs):    #goertzel algorithm 
    N = len(chunk)
    k = int(0.5 + (N * target_freq) / fs)
    omega = (2.0 * np.pi * k) / N
    coeff = 2.0 * np.cos(omega)

    s_prev = 0.0
    s_prev2 = 0.0

    for sample in chunk:
        s = sample + coeff * s_prev - s_prev2
        s_prev2 = s_prev
        s_prev = s

    magnitude = np.sqrt(s_prev2**2 + s_prev**2 - coeff * s_prev * s_prev2)
    return magnitude

def apply_bandpass(signal, fs, f_low, f_high, numtaps=101): #FIR bandpass 

    nyq = fs / 2
    taps = firwin(numtaps, [f_low/nyq, f_high/nyq], pass_zero=False)
    filtered_signal = lfilter(taps, 1.0, signal)
    return filtered_signal

def decode_fsk(audio_array, fs, f0=17000, f1=17500, Tb=0.15):
    data = np.array(audio_array, dtype=float)
    if data.ndim > 1:
        data = data[:,0] 

    N = int(Tb * fs)
    bitstream = ""

    for i in range(0, len(data), N):
        chunk = data[i:i+N]
        if len(chunk) < N:
            break

        mag0 = goertzel(chunk, f0, fs)
        mag1 = goertzel(chunk, f1, fs)

        bit = '0' if mag0 > mag1 else '1'
        bitstream += bit

    # Convert bits to text
    chars = []
    for i in range(0, len(bitstream), 8):
        byte = bitstream[i:i+8]
        if len(byte) == 8:
            chars.append(chr(int(byte, 2)))
    message = "".join(chars)

    return bitstream, message




