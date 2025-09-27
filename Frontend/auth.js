const API_URL = "http://127.0.0.1:8000"; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    const isRegister = document.title.toLowerCase().includes("registration");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = form.querySelector("input[type='text']").value;

        try {
            if (isRegister) {
                // Registration request
                const res = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                const data = await res.json(); 
                if (res.ok) {
                    localStorage.setItem("user_id", data.id); 
                    alert(data.message || "Registered successfully!");
                    window.location.href = "login.html"; 
                } else {
                    alert(data.detail || "Registration failed!");
                }
            } else {
                // Login request
                const res = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("user_id", data.user_id);
                    alert(data.message || "Login successful!");
                    window.location.href = "index.html"; 
                } else {
                    alert(data.detail || "Login failed!");
                }
            }
        } catch (err) {
            alert("Error connecting to server.");
            console.error(err);
        }
    });
});