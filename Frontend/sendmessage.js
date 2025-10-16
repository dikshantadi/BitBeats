const API_URL = "http://127.0.0.1:8000";

const receiverSelect = document.getElementById("receiverSelect");
const sendBtn = document.getElementById("sendMessageBtn");
let userMap = {};

async function loadUserMap() {
    const res = await fetch(`${API_URL}/users`);
    const users = await res.json();
    userMap = {};
    users.forEach(u => {
        userMap[u.id] = u.username;
    });
}


async function loadUsers() {
    const userId = parseInt(localStorage.getItem("user_id"));
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();

        users.forEach(user => {
            if (user.id !== userId) { 
                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = user.username;
                receiverSelect.appendChild(option);
            }
        });
    } catch (err) {
        console.error("Error fetching users:", err);
    }
}

async function sendDecodedMessage() {
    const senderId = parseInt(localStorage.getItem("user_id"));
    const receiverId = parseInt(receiverSelect.value);
    const message = output.textContent; // decoded message

    if (!receiverId) {
        alert("Please select a receiver.");
        return;
    }

    if (!message) {
        alert("No decoded message to send!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/send_message/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, message: message })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Message sent to ${receiverSelect.options[receiverSelect.selectedIndex].text}`);
        } else {
            alert(data.detail || "Failed to send message");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

sendBtn.addEventListener("click", sendDecodedMessage);

window.addEventListener("DOMContentLoaded", loadUsers);