const STORAGE_KEY = "gamerfeedData";

const form = document.getElementById("loginForm");

function getAppData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearErrors() {
  document.querySelectorAll("small").forEach(e => e.textContent = "");
}

function setMessage(text, type) {
  const msg = document.getElementById("loginMessage");
  msg.textContent = text;
  msg.style.color = type === "error" ? "#ff5f73" : "#00f5a0";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let valid = true;

  if (!email.includes("@")) {
    setError("emailError", "Invalid email");
    valid = false;
  }

  if (password.length === 0) {
    setError("passwordError", "Enter password");
    valid = false;
  }

  if (!valid) return;

  const data = getAppData();

  if (!data || !data.users) {
    setMessage("No users found. Register first.", "error");
    return;
  }

  const user = data.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    setMessage("Invalid credentials", "error");
    return;
  }

  // ✅ Save session
  data.currentUserId = user.id;
  saveAppData(data);

  setMessage("Login successful...", "success");

  setTimeout(() => {
    window.location.href = "../HTML/index.html";
  }, 800);
});