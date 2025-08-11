
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // must contain @ and .
    return regex.test(email);
}


document.getElementById("registerForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address (must contain '@' and '.')");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    alert("Registration successful! Please login.");
    window.location.href = "index.html";
});


document.getElementById("loginForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let savedEmail = localStorage.getItem("userEmail");
    let savedPassword = localStorage.getItem("userPassword");

    if (email === savedEmail && password === savedPassword) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid email or password");
    }
});
