const API_URL = "http://192.168.1.69:8000"; // Backend URL
const encodeInput = document.getElementById('bitInput');
const output = document.getElementById('output'); // lowercase 'o'
let lastAudioArray = [];
let recorder = null;
let audioStream = null;
let chunks = [];

// Play encoded audio
function playAudio(audioArray) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, audioArray.length, 44100);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < audioArray.length; i++) {
        channelData[i] = audioArray[i] / 32767; // scale to -1..1
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
        lastAudioArray = data.audio_data;
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
        const channelData = audioBuffer.getChannelData(0);

        lastAudioArray = Array.from(channelData).map(x => Math.max(-1, Math.min(1, x)) * 32767);

        try {
            const response = await fetch(`${API_URL}/decode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio_data: lastAudioArray })
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