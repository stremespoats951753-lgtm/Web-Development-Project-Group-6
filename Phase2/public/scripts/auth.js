// public/scripts/auth.js
// Shared authentication utilities — no external dependencies

// ── Theme ─────────────────────────────────────────────────────────────────────

function initTheme() {
  const html  = document.documentElement;
  const saved = localStorage.getItem('gamerfeed_theme') || 'dark';
  html.setAttribute('data-theme', saved);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('gamerfeed_theme', next);
    });
  }
}

// ── Auth guard ────────────────────────────────────────────────────────────────
// If the user is already logged in, redirect away from login / signup pages.

async function checkAuth() {
  try {
    const res  = await fetch('/api/auth/session');
    const data = await res.json();
    if (data.authenticated) {
      window.location.href = '/posts.html';
      return true;
    }
    return false;
  } catch (err) {
    console.error('[checkAuth]', err);
    return false;
  }
}

// ── Password toggle ───────────────────────────────────────────────────────────

function initPasswordToggle(passwordInputId, toggleBtnId) {
  const pwdInput  = document.getElementById(passwordInputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  if (!pwdInput || !toggleBtn) return;

  toggleBtn.addEventListener('click', function () {
    const isPassword = pwdInput.type === 'password';
    pwdInput.type = isPassword ? 'text' : 'password';

    this.innerHTML = isPassword
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
                    M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
                    m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
           <line x1="1" y1="1" x2="23" y2="23"/>
         </svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>
         </svg>`;
  });
}

// ── Field errors ──────────────────────────────────────────────────────────────

function setFieldError(inputId, errorId, show, customMessage) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;

  input.classList.toggle('error', show);
  if (show) input.classList.remove('valid');
  error.classList.toggle('show', show);

  if (customMessage && show) {
    const span = error.querySelector('span');
    if (span) span.textContent = customMessage;
  }
}

function clearAllErrors() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.global-error').forEach(el => el.classList.remove('show'));
}

function showGlobalError(message) {
  const el   = document.getElementById('global-error');
  const text = document.getElementById('global-error-text');
  if (el && text) { text.textContent = message; el.classList.add('show'); }
}

function showGlobalSuccess(message) {
  const el   = document.getElementById('global-success');
  const text = document.getElementById('global-success-text');
  if (el && text) { text.textContent = message; el.classList.add('show'); }
}

// ── Input listeners ───────────────────────────────────────────────────────────
// Clears field error + global error banner when the user starts typing again.

function setupInputListeners(inputIds) {
  inputIds.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = document.getElementById(id + '-error');
      if (errorEl) errorEl.classList.remove('show');
      const globalError = document.getElementById('global-error');
      if (globalError) globalError.classList.remove('show');
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function enableEnterSubmit(btnId) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const btn = document.getElementById(btnId);
      if (btn) btn.click();
    }
  });
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initAuthPage() {
  initTheme();
  checkAuth(); // redirect to /posts.html if already logged in
}