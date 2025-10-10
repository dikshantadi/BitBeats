const API_URL = "http://127.0.0.1:8000"; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    const isRegister = document.title.toLowerCase().includes("registration");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = form.querySelector("input[type='text']").value.trim();
        if (!username) {
            alert("Username is required");
            return;
        }

        try {
            if (isRegister) {
                // 👇 Register user
                const res = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                const data = await res.json(); 

                if (res.ok) {
                    localStorage.setItem("user_id", data.id);  //  save id
                    alert("Registered successfully!");
                    window.location.href = "index.html";       //  go straight to app
                } else {
                    alert(data.error || "Registration failed!");
                }

            } else {
                //  Login user
                const res = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("user_id", data.user_id);  //  save id
                    alert("Login successful!");
                    window.location.href = "index.html"; 
                } else {
                    alert(data.error || "Login failed!");
                }
            }
        } catch (err) {
            alert("Error connecting to server.");
            console.error(err);
        }
    });
});