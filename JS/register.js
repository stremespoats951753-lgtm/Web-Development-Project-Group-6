/**
 * ============================================================
 * register.js — Registration Page Logic for GamerFeed
 * ============================================================
 * 
 * Handles the registration form:
 *   1. Validates username length, email format, password length,
 *      and password confirmation.
 *   2. Checks for duplicate emails and usernames.
 *   3. Creates a new user object and saves it to localStorage.
 *   4. Redirects to the login page on success.
 * 
 * DEPENDENCIES:
 *   - config.js (STORAGE_KEY, MIN_USERNAME_LENGTH, MIN_PASSWORD_LENGTH,
 *     DEFAULT_BIO, REDIRECT_DELAY_MS)
 * ============================================================
 */

const registerForm = document.getElementById("registerForm");

/* ── Data Access ─────────────────────────────────────────── */

/**
 * Retrieves app data from localStorage, or creates initial
 * empty structure if nothing exists yet.
 */
function getAppData() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const initialData = getInitialAppData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    /* If data is corrupted, reset to a clean state */
    console.error("Failed to parse localStorage data:", error);
    const fallbackData = getInitialAppData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    return fallbackData;
  }
}

/**
 * Persists the full app data object to localStorage.
 */
function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Validation Helpers ──────────────────────────────────── */

/**
 * Simple email format check using regex.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generates a unique user ID based on the current timestamp.
 * Prefixed with "u" to distinguish from demo user IDs.
 */
function generateUserId() {
  return "u" + Date.now();
}

/**
 * Creates a 2-letter avatar from the username.
 * @param {string} username
 * @returns {string} e.g. "JO" for "john"
 */
function generateAvatar(username) {
  return username.trim().slice(0, 2).toUpperCase();
}

/* ── Error Display ───────────────────────────────────────── */

/**
 * Shows a validation error on a specific input field.
 */
function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorText = document.getElementById(errorId);

  input.classList.add("error");
  errorText.textContent = message;
}

/**
 * Clears all error messages and error styling from inputs.
 */
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

/**
 * Shows a general message (success or error) below the form.
 */
function setMessage(text, type) {
  const globalMessage = document.getElementById("registerMessage");
  globalMessage.textContent = text;
  globalMessage.classList.remove("success", "error");
  globalMessage.classList.add(type);
}

/* ── Form Submission ─────────────────────────────────────── */

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearAllMessages();

  /* Read form values */
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  let isValid = true;

  /* Validate username length (uses config constant) and checks whether usernam has illegal characters */
  const usernamePattern = /^[A-Za-z0-9_]+$/;

  if (username.length < MIN_USERNAME_LENGTH) {
    setFieldError("registerUsername", "registerUsernameError", `Username must be at least ${MIN_USERNAME_LENGTH} characters.`);
    isValid = false;
  } else if (!usernamePattern.test(username)) {
    setFieldError("registerUsername", "registerUsernameError", `Username can only contain letters, numbers, and underscores.`);
    isValid = false;
  }

  /* Validate email format */
  if (!validateEmail(email)) {
    setFieldError("registerEmail", "registerEmailError",
      "Please enter a valid email address.");
    isValid = false;
  }

  /* Validate password length (uses config constant) */
  if (password.length < MIN_PASSWORD_LENGTH) {
    setFieldError("registerPassword", "registerPasswordError",
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    isValid = false;
  }

  /* Passwords must match */
  if (confirmPassword !== password) {
    setFieldError("registerConfirmPassword", "registerConfirmPasswordError",
      "Passwords do not match.");
    isValid = false;
  }

  if (!isValid) return;

  /* Check for duplicate email or username in existing data */
  const data = getAppData();

  const emailExists = data.users.some(user => user.email === email);
  const usernameExists = data.users.some(
    user => user.username.toLowerCase() === username.toLowerCase()
  );

  if (emailExists) {
    setFieldError("registerEmail", "registerEmailError",
      "This email is already registered.");
    return;
  }

  if (usernameExists) {
    setFieldError("registerUsername", "registerUsernameError",
      "This username is already taken.");
    return;
  }

  /* ── Create the new user object ────────────────────────── */
  const newUser = {
    id: generateUserId(),
    username,
    email,
    password,                       /* Stored as plain text (no backend) */
    bio: DEFAULT_BIO,               /* Default from config.js */
    avatar: generateAvatar(username),
    following: [],                  /* Users this person follows */
    followers: []                   /* Not actively managed (computed from other users' following lists) */
  };

  /* Add the user to the array and persist */
  data.users.push(newUser);
  saveAppData(data);

  /* Show success and redirect to login */
  setMessage("Account created successfully. Redirecting to login...", "success");
  registerForm.reset();

  setTimeout(() => {
    window.location.href = "../HTML/auth.html";
  }, REDIRECT_DELAY_MS + 400);
});
