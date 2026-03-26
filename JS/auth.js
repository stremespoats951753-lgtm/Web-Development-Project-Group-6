/**
 * ============================================================
 * auth.js — Login Page Logic for GamerFeed
 * ============================================================
 * 
 * This script handles the login form submission:
 *   1. Validates that the email contains "@" and the password
 *      is not empty.
 *   2. Looks up the user in localStorage data.
 *   3. If found, sets currentUserId and redirects to the feed.
 *   4. If not found, shows an error message.
 * 
 * DEPENDENCIES:
 *   - config.js must be loaded first (provides STORAGE_KEY, etc.)
 * ============================================================
 */

/* ── References to DOM elements ──────────────────────────── */
const form = document.getElementById("loginForm");

/* ── Data Access Helpers ─────────────────────────────────── */

/**
 * Retrieves the entire app data object from localStorage.
 * Uses the STORAGE_KEY constant defined in config.js.
 * @returns {Object|null} Parsed app data or null if not found.
 */
function getAppData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

/**
 * Saves the entire app data object back to localStorage.
 * @param {Object} data — The complete app data to persist.
 */
function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── UI Feedback Helpers ─────────────────────────────────── */

/**
 * Sets an inline error message on a specific field.
 * @param {string} id — The id of the <small> element.
 * @param {string} message — The error text to display.
 */
function setError(id, message) {
  document.getElementById(id).textContent = message;
}

/**
 * Clears all inline error messages on the page.
 */
function clearErrors() {
  document.querySelectorAll("small").forEach(e => e.textContent = "");
}

/**
 * Displays a general login message (success or error).
 * @param {string} text — The message to show.
 * @param {"error"|"success"} type — Determines the text colour.
 */
function setMessage(text, type) {
  const msg = document.getElementById("loginMessage");
  msg.textContent = text;
  msg.className = "global-message";
  if (type) msg.classList.add(type);
}

/* ── Form Submission Handler ─────────────────────────────── */

form.addEventListener("submit", function (e) {
  /* Prevent the default browser form submission (page reload) */
  e.preventDefault();
  clearErrors();

  /* Read and normalise inputs */
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let valid = true;

  /* Basic email validation — just checks for "@" */
  if (!email.includes("@")) {
    setError("emailError", "Invalid email");
    valid = false;
  }

  /* Password must not be empty */
  if (password.length === 0) {
    setError("passwordError", "Enter password");
    valid = false;
  }

  /* Stop here if validation failed */
  if (!valid) return;

  /* Retrieve stored data */
  const data = getAppData();

  /* If no data exists at all, prompt the user to register */
  if (!data || !data.users) {
    setMessage("No users found. Register first.", "error");
    return;
  }

  /* Find a user whose email AND password both match */
  const user = data.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    setMessage("Invalid credentials", "error");
    return;
  }

  /* Login successful — save the session (currentUserId) */
  data.currentUserId = user.id;
  saveAppData(data);

  setMessage("Login successful...", "success");

  /* Redirect to the main feed after a short delay */
  setTimeout(() => {
    window.location.href = "../HTML/index.html";
  }, REDIRECT_DELAY_MS);
});

// chooses background at random
// const bgTarget = document.getElementById("random-bg");

// if (bgTarget && window.BACKGROUNDS?.length) {
//   const randomBg =
//     window.BACKGROUNDS[Math.floor(Math.random() * window.BACKGROUNDS.length)];
//   bgTarget.style.backgroundImage = `url("${randomBg}")`;
// }