// public/scripts/signup.js

document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();                  // checks session → redirects to posts.html if logged in
  initPasswordToggle('password', 'pwd-toggle');
  setupInputListeners(['first-name', 'last-name', 'username', 'email', 'password']);
  enableEnterSubmit('signup-btn');
  setupPasswordStrength();
  setupUsernameCheck();
  setupEmailCheck();
  setupTermsCheckbox();
  setupSignupForm();
});

// ── Password strength meter ───────────────────────────────────────────────────

function setupPasswordStrength() {
  const pwdInput      = document.getElementById('password');
  const strengthFill  = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  pwdInput.addEventListener('input', function () {
    const v = this.value;
    let score = 0;
    if (v.length >= 8)            score++;
    if (/[A-Z]/.test(v))          score++;
    if (/[0-9]/.test(v))          score++;
    if (/[^A-Za-z0-9]/.test(v))   score++;

    const cfg = [
      { width: '0%',   color: '#E5534B', text: 'Enter a password' },
      { width: '25%',  color: '#E5534B', text: 'Weak' },
      { width: '50%',  color: '#F5A623', text: 'Fair' },
      { width: '75%',  color: '#5B4FE8', text: 'Good' },
      { width: '100%', color: '#3DD68C', text: 'Strong ✓' },
    ];
    const current = v.length === 0 ? cfg[0] : cfg[score];

    strengthFill.style.width      = current.width;
    strengthFill.style.background = current.color;
    strengthLabel.textContent     = current.text;
    strengthLabel.style.color     = v.length === 0 ? 'var(--text-muted)' : current.color;
  });
}

// ── Real-time username availability ──────────────────────────────────────────

function setupUsernameCheck() {
  const input     = document.getElementById('username');
  const statusDiv = document.getElementById('username-status');
  let timer;

  input.addEventListener('input', function () {
    clearTimeout(timer);
    const value = this.value.trim();

    // Reset
    statusDiv.className = 'username-status';
    statusDiv.innerHTML = '';
    input.classList.remove('valid', 'error');
    setFieldError('username', 'username-error', false);

    if (value.length < 3) return;

    statusDiv.className = 'username-status checking';
    statusDiv.innerHTML = checkingIcon() + ' Checking…';

    // Debounce 500 ms
    timer = setTimeout(() => checkAvailability('username', value, input, statusDiv), 500);
  });
}

// ── Real-time email availability ──────────────────────────────────────────────

function setupEmailCheck() {
  const input     = document.getElementById('email');
  const statusDiv = document.getElementById('email-status');
  let timer;

  input.addEventListener('input', function () {
    clearTimeout(timer);
    const value = this.value.trim();

    // Reset
    statusDiv.className = 'username-status';
    statusDiv.innerHTML = '';
    input.classList.remove('valid', 'error');
    setFieldError('email', 'email-error', false);

    if (!validateEmail(value)) return;

    statusDiv.className = 'username-status checking';
    statusDiv.innerHTML = checkingIcon() + ' Checking…';

    // Debounce 600 ms
    timer = setTimeout(() => checkAvailability('email', value, input, statusDiv), 600);
  });
}

// ── Shared availability checker ───────────────────────────────────────────────
// Calls GET /api/auth/isavailable?username=x  OR  ?email=x

async function checkAvailability(type, value, inputEl, statusEl) {
  try {
    const url = `/api/auth/isavailable?${encodeURIComponent(type)}=${encodeURIComponent(value)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.available) {
      statusEl.className = 'username-status available';
      statusEl.innerHTML = checkIcon() + ' Available';
      inputEl.classList.remove('error');
      inputEl.classList.add('valid');
      setFieldError(inputEl.id, inputEl.id + '-error', false);
    } else {
      statusEl.className = 'username-status taken';
      statusEl.innerHTML = crossIcon() + ' Already taken';
      inputEl.classList.remove('valid');
      inputEl.classList.add('error');
      const msg = type === 'username' ? 'Username already taken.' : 'Email already registered.';
      setFieldError(inputEl.id, inputEl.id + '-error', true, msg);
    }
  } catch {
    // Network error — silently clear; server validates on submit
    statusEl.className = 'username-status';
    statusEl.innerHTML = '';
  }
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function checkingIcon() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>`;
}

function checkIcon() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;
}

function crossIcon() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
}

// ── Terms checkbox ────────────────────────────────────────────────────────────

function setupTermsCheckbox() {
  const checkbox   = document.getElementById('terms');
  const checkLabel = document.getElementById('terms-check');

  checkbox.addEventListener('change', function () {
    checkLabel.classList.toggle('checked', this.checked);
  });
}

// ── Signup form submission ────────────────────────────────────────────────────

function setupSignupForm() {
  document.getElementById('signup-btn').addEventListener('click', async () => {
    const firstName    = document.getElementById('first-name').value.trim();
    const lastName     = document.getElementById('last-name').value.trim();
    const username     = document.getElementById('username').value.trim();
    const email        = document.getElementById('email').value.trim();
    const password     = document.getElementById('password').value;
    const termsAccepted = document.getElementById('terms').checked;

    clearAllErrors();
    let isValid = true;

    if (!firstName) {
      setFieldError('first-name', 'fname-error', true, 'Required');
      isValid = false;
    }
    if (!lastName) {
      setFieldError('last-name', 'lname-error', true, 'Required');
      isValid = false;
    }
    if (!username || username.length < 3) {
      setFieldError('username', 'username-error', true, 'Min. 3 characters.');
      isValid = false;
    }
    if (!validateEmail(email)) {
      setFieldError('email', 'email-error', true, 'Valid email required.');
      isValid = false;
    }
    if (password.length < 8) {
      setFieldError('password', 'pwd-error', true, 'Min. 8 characters.');
      isValid = false;
    }
    if (!termsAccepted) {
      showGlobalError('Please agree to the Terms of Service.');
      isValid = false;
    }

    // Block submit if username or email is already marked taken
    const usernameTaken = document.getElementById('username-status')?.classList.contains('taken');
    const emailTaken    = document.getElementById('email-status')?.classList.contains('taken');
    if (usernameTaken || emailTaken) {
      showGlobalError('Please fix the availability errors above.');
      isValid = false;
    }

    if (!isValid) return;

    setButtonLoading('signup-btn', true);

    try {
      const response = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const data = await response.json();
      setButtonLoading('signup-btn', false);

      if (data.success) {
        // Advance step indicator
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');
        if (step1 && step2) {
          step1.classList.remove('active');
          step1.classList.add('done');
          step1.querySelector('.step-dot').innerHTML = checkIcon();
          step2.classList.add('active');
        }

        showGlobalSuccess('Account created! Redirecting…');
        setTimeout(() => { window.location.href = '/posts.html'; }, 1800);

      } else {
        // Server-side field errors
        if (data.error?.includes('username')) setFieldError('username', 'username-error', true, data.error);
        else if (data.error?.includes('email')) setFieldError('email', 'email-error', true, data.error);
        else showGlobalError(data.error ?? 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('[signup]', err);
      setButtonLoading('signup-btn', false);
      showGlobalError('An error occurred. Please try again.');
    }
  });
}