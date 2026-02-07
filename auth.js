// SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      password: document.getElementById("password").value
    };

    console.log("Signup Data:", user);

    alert("Signup successful (frontend only)");
    window.location.href = "index.html";
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const loginData = {
      loginId: document.getElementById("loginId").value,
      password: document.getElementById("loginPassword").value
    };

    console.log("Login Data:", loginData);

    alert("Login successful (frontend only)");
  });
}
