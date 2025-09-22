const API_URL = "http://192.168.1.69:8000"; // Backend URL
const encodeInput = document.getElementById('bitInput');
const output = document.getElementById('output'); // note lowercase 'o'

let lastAudioArray = [];

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

async function sendAudio() {
    if (!lastAudioArray.length) {
        alert("No audio available to decode. Encode first!");
        return;
    }

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
}

async function listenAndDecode() {
    output.textContent = "Listening...";
    try {
        const audioData = await captureAudio(15);
        lastAudioArray = Array.from(audioData).map(x => x * 32767); // scale to int16 range

        const response = await fetch(`${API_URL}/decode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_data: lastAudioArray })
        });

        const data = await response.json();
        output.textContent = `Decoded message: ${data.message}`;
    } catch (err) {
        console.error(err);
        output.textContent = "Error recording or decoding audio.";
    }
}
async function captureAudio(duration = 3) {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    const recordedData = [];

    processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        recordedData.push(new Float32Array(inputData));
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);


    await new Promise(resolve => setTimeout(resolve, duration * 1000));

    // Stop capturing
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach(track => track.stop());

    // Flatten recordedData
    let flatData = new Float32Array(recordedData.reduce((acc, val) => acc + val.length, 0));
    let offset = 0;
    for (let chunk of recordedData) {
        flatData.set(chunk, offset);
        offset += chunk.length;
    }

    return flatData;
}
