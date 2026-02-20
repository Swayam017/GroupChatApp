document.addEventListener("DOMContentLoaded", () => {

  // ================= SIGNUP =================
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value.trim()
      };

      try {
        const res = await fetch("http://localhost:3000/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          alert("Signup successful");
          window.location.href = "index.html";
        } else {
          alert(result.message || "Signup failed");
        }
      } catch (err) {
       console.error("SIGNUP ERROR FULL:", err);

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({ message: "Email or phone already registered" });
  }

  res.status(500).json({ message: "Server error" });
      }
    });
  }

  // ================= LOGIN =================
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        loginId: document.getElementById("loginId").value.trim(),
        password: document.getElementById("loginPassword").value.trim()
      };

      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          localStorage.setItem("token", result.token);
           window.location.href = "chat.html";
        } else {
          alert(result.message || "Invalid credentials");
        }
      } catch (err) {
        alert("Server error");
      }
    });
  }

});
