const API_URL = "http://127.0.0.1:8000";

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

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}


window.addEventListener("DOMContentLoaded", fetchUsername);
