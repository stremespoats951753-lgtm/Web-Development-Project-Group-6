// public/scripts/login.js

document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
  initPasswordToggle('password', 'pwd-toggle');
  setupInputListeners(['identifier', 'password']);
  enableEnterSubmit('login-btn');
  setupLoginForm();
});

function setupLoginForm() {
  const loginBtn = document.getElementById('login-btn');

  loginBtn.addEventListener('click', async () => {
    const identifier = document.getElementById('identifier').value.trim();
    const password   = document.getElementById('password').value;

    clearAllErrors();

    let isValid = true;

    if (!identifier || identifier.length < 2) {
      setFieldError('identifier', 'identifier-error', true);
      isValid = false;
    }
    if (!password) {
      setFieldError('password', 'pwd-error', true);
      isValid = false;
    }
    if (!isValid) return;

    setButtonLoading('login-btn', true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.replace(/^@/, ''),
          password,
        }),
      });

      const data = await response.json();
      setButtonLoading('login-btn', false);

      if (data.success) {
        const btn    = document.getElementById('login-btn');
        const textEl = btn?.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Redirecting...';
        if (btn)    btn.style.background = 'var(--success)';

        setTimeout(() => { window.location.href = '/posts.html'; }, 800);
      } else {
        showGlobalError(data.error || 'Invalid credentials');
        document.getElementById('identifier').classList.add('error');
        document.getElementById('password').classList.add('error');
      }
    } catch (err) {
      console.error('[login]', err);
      setButtonLoading('login-btn', false);
      showGlobalError('An error occurred. Please try again.');
    }
  });
}