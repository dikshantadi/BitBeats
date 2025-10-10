const API_URL = "http://127.0.0.1:8000";
const encodeInput = document.getElementById('bitInput');
const output = document.getElementById('output'); 

let recorder = null;
let audioStream = null;
let chunks = [];
const user_id = localStorage.getItem("user_id");

if (!user_id) {
    alert("You must register or login first!");
    window.location.href = "register.html";
}

async function fetchUsername() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/${user_id}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        document.getElementById("username").innerText = data.username;
    } catch (err) {
        console.error("Error fetching username:", err);
        document.getElementById("username").innerText = "Guest";
    }
}

window.addEventListener("DOMContentLoaded", fetchUsername);

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "login.html";    
}

function playAudio(audioArray) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, audioArray.length, 44100);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < audioArray.length; i++) {
        channelData[i] = audioArray[i] / 32767; 
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}


async function sendBits() {
    const message = encodeInput.value;
    if (!message) {
        alert("Enter a message first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/encode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        playAudio(data.audio_data);
        output.textContent = "Message encoded and playing...";
    } catch (err) {
        console.error(err);
        output.textContent = "Error encoding message.";
    }
}


async function listenAndDecodeToggle(button) {
    if (!recorder || recorder.state === "inactive") {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorder = new MediaRecorder(audioStream);
            chunks = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.start();

            button.textContent = "Stop Recording";
            output.textContent = "Recording...";
        } catch (err) {
            console.error(err);
            alert("Please allow microphone access!");
        }

    } else if (recorder.state === "recording") {
        recorder.stop();

        await new Promise(resolve => {
            recorder.onstop = resolve;
        });

        button.textContent = "Listen & Decode";
        output.textContent = "Processing audio...";

        const blob = new Blob(chunks, { type: "audio/webm" });

        
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const wav = new wavefile.WaveFile();
        const channelData = audioBuffer.getChannelData(0);
        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            int16Array[i] = Math.max(-1, Math.min(1, channelData[i])) * 32767;
        }
        wav.fromScratch(1, audioBuffer.sampleRate, '16', int16Array);

        const wavBlob = new Blob([wav.toBuffer()], { type: 'audio/wav' });
        const formData = new FormData();
        formData.append("file", wavBlob, "recording.wav");

        try {
            const response = await fetch(`${API_URL}/decode`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            output.textContent = `Decoded message: ${data.message}`;
        } catch (err) {
            console.error(err);
            output.textContent = "Error decoding audio.";
        }

        audioStream.getTracks().forEach(track => track.stop());
        recorder = null;
        audioStream = null;
    }
}