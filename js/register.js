const STORAGE_KEY = "gamerfeedData";
const registerForm = document.getElementById("registerForm");

function getAppData() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const initialData = {
      currentUserId: null,
      users: [],
      posts: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    const fallbackData = {
      currentUserId: null,
      users: [],
      posts: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    return fallbackData;
  }
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateUserId() {
  return "u" + Date.now();
}

function generateAvatar(username) {
  return username.trim().slice(0, 2).toUpperCase();
}

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorText = document.getElementById(errorId);

  input.classList.add("error");
  errorText.textContent = message;
}

function clearAllMessages() {
  document.querySelectorAll(".error-text").forEach(error => {
    error.textContent = "";
  });

  document.querySelectorAll("input").forEach(input => {
    input.classList.remove("error");
  });

  const globalMessage = document.getElementById("registerMessage");
  globalMessage.textContent = "";
  globalMessage.classList.remove("success", "error");
}

function setMessage(text, type) {
  const globalMessage = document.getElementById("registerMessage");
  globalMessage.textContent = text;
  globalMessage.classList.remove("success", "error");
  globalMessage.classList.add(type);
}

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearAllMessages();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  let isValid = true;

  if (username.length < 3) {
    setFieldError("registerUsername", "registerUsernameError", "Username must be at least 3 characters.");
    isValid = false;
  }

  if (!validateEmail(email)) {
    setFieldError("registerEmail", "registerEmailError", "Please enter a valid email address.");
    isValid = false;
  }

  if (password.length < 6) {
    setFieldError("registerPassword", "registerPasswordError", "Password must be at least 6 characters.");
    isValid = false;
  }

  if (confirmPassword !== password) {
    setFieldError("registerConfirmPassword", "registerConfirmPasswordError", "Passwords do not match.");
    isValid = false;
  }

  if (!isValid) return;

  const data = getAppData();

  const emailExists = data.users.some(user => user.email === email);
  const usernameExists = data.users.some(
    user => user.username.toLowerCase() === username.toLowerCase()
  );

  if (emailExists) {
    setFieldError("registerEmail", "registerEmailError", "This email is already registered.");
    return;
  }

  if (usernameExists) {
    setFieldError("registerUsername", "registerUsernameError", "This username is already taken.");
    return;
  }

  const newUser = {
    id: generateUserId(),
    username,
    email,
    password,
    bio: "New gamer in the arena.",
    avatar: generateAvatar(username),
    following: [],
    followers: []
  };

  data.users.push(newUser);
  saveAppData(data);

  setMessage("Account created successfully. Redirecting to login...", "success");
  registerForm.reset();

  setTimeout(() => {
    window.location.href = "../HTML/auth.html";
  }, 1200);
});