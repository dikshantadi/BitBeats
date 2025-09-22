const backendUrl = "http://127.0.0.1:8000";

async function sendbits() {
    const bitsInput = document.getElementById('bitsInput').value;
    const responseDiv = document.getElementById('response');