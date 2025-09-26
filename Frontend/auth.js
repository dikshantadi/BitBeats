const API_URL = "http://127.0.0.1:8080"; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    // Detect if this is register.html or login.html
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
                alert(res.ok ? data.message : data.detail);
                if (res.ok) {
                    window.location.href = "login.html"; // Go to login after registering
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
                    alert(data.message);
                    // Redirect to main app page (e.g., bitbeat.html)
                    window.location.href = "index.html";
                } else {
                    alert(data.detail);
                }
            }
        } catch (err) {
            alert("Error connecting to server.");
        }
    });
});