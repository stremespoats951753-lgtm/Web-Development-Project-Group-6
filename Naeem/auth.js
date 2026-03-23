/* ═══════════════════════════════════════
   auth.js — shared JS for login,
   signup, and password-reset pages
═══════════════════════════════════════ */

/* ── THEME ── */
(function () {
  const html  = document.documentElement;
  const saved = localStorage.getItem('sm_theme');
  if (saved) html.setAttribute('data-theme', saved);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('sm_theme', next);
  });
})();

/* ── SHARED HELPERS ── */

/** Toggle an input's error class and its sibling error message */
function setErr(inputId, errorId, show, msg) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errorId);
  if (!input || !errEl) return;
  input.classList.toggle('error', show);
  errEl.classList.toggle('show', show);
  if (msg) {
    const sp = errEl.querySelector('span') || errEl;
    sp.textContent = msg;
  }
}

/** Show/hide a .msg or .global-error/.global-success banner */
function showMsg(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', show);
}

/** Validate email format */
function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Toggle password visibility; swap icon on the button */
function makePwdToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', function () {
    const inp  = document.getElementById(inputId);
    const show = inp.type === 'password';
    inp.type   = show ? 'text' : 'password';
    this.innerHTML = show
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
}

/** Update password strength bar */
function updateStrength(value, fillId, labelId) {
  let s = 0;
  if (value.length >= 8)          s++;
  if (/[A-Z]/.test(value))        s++;
  if (/[0-9]/.test(value))        s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  const cfg = [
    { w:'0%',   c:'#f50057', t:'Enter a password' },
    { w:'25%',  c:'#f50057', t:'Weak' },
    { w:'50%',  c:'#f5a000', t:'Fair' },
    { w:'75%',  c:'#00c97f', t:'Good' },
    { w:'100%', c:'#00f5a0', t:'Strong ✓' },
  ];
  const pick  = value.length === 0 ? cfg[0] : cfg[s];
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (fill)  { fill.style.width = pick.w; fill.style.background = pick.c; }
  if (label) { label.textContent = pick.t; label.style.color = value.length === 0 ? 'var(--text-muted)' : pick.c; }
}


/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
if (document.getElementById('login-btn')) {

  makePwdToggle('pwd-toggle', 'password');

  document.getElementById('login-btn').addEventListener('click', function () {
    const raw = document.getElementById('identifier').value.trim();
    const pwd = document.getElementById('password').value;
    let ok = true;

    showMsg('global-error', false);
    setErr('identifier', 'identifier-error', false);
    setErr('password',   'pwd-error',        false);

    if (raw.length < 2) { setErr('identifier', 'identifier-error', true); ok = false; }
    if (!pwd)           { setErr('password',   'pwd-error',        true); ok = false; }
    if (!ok) return;

    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      const identifier = raw.replace(/^@/, '');
      const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
      const user  = users.find(u =>
        (u.email === identifier || u.username === identifier) && u.passwordHash === pwd
      );

      if (user) {
        localStorage.setItem('sm_session', JSON.stringify({ userId: user.userId }));
        const btn = document.getElementById('login-btn');
        btn.style.background = '#00f5a0';
        btn.querySelector('.btn-text').textContent = 'Redirecting…';
        setTimeout(() => { window.location.href = 'index.html'; }, 800);
      } else {
        showMsg('global-error', true);
        document.getElementById('identifier').classList.add('error');
        document.getElementById('password').classList.add('error');
      }
    }, 900);
  });

  ['identifier', 'password'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById(id).classList.remove('error');
      const errId = id === 'identifier' ? 'identifier-error' : 'pwd-error';
      document.getElementById(errId).classList.remove('show');
      showMsg('global-error', false);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
}


/* ══════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════ */
if (document.getElementById('signup-btn')) {

  // Checkbox toggle
  window.toggleCheck = function (el) {
    document.getElementById('terms-check').classList.toggle('checked', el.checked);
  };

  // Password toggle & strength
  makePwdToggle('pwd-toggle', 'password');
  document.getElementById('password').addEventListener('input', function () {
    updateStrength(this.value, 'strength-fill', 'strength-label');
  });

  // Username availability check
  let uTimer;
  document.getElementById('username').addEventListener('input', function () {
    clearTimeout(uTimer);
    const s = document.getElementById('username-status');
    const v = this.value.trim();
    s.className = 'username-status';
    if (v.length < 3) return;
    s.className = 'username-status checking';
    s.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Checking…`;
    uTimer = setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
      const taken = users.some(u => u.username === v);
      if (taken) {
        s.className = 'username-status taken';
        s.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Taken`;
        this.classList.add('error');
      } else {
        s.className = 'username-status available';
        s.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Available`;
        this.classList.remove('error'); this.classList.add('valid');
      }
    }, 600);
  });

  // Submit
  document.getElementById('signup-btn').addEventListener('click', function () {
    const fname    = document.getElementById('first-name').value.trim();
    const lname    = document.getElementById('last-name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const terms    = document.getElementById('terms').checked;
    let ok = true;

    showMsg('global-error', false);
    ['fname-error','lname-error','username-error','email-error','pwd-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });
    ['first-name','last-name','username','email','password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });

    if (!fname)                    { setErr('first-name','fname-error',true);                          ok = false; }
    if (!lname)                    { setErr('last-name','lname-error',true);                           ok = false; }
    if (!username||username.length<3){ setErr('username','username-error',true,'Min. 3 characters.'); ok = false; }
    if (!validateEmail(email))     { setErr('email','email-error',true,'Valid email required.');       ok = false; }
    if (password.length < 8)       { setErr('password','pwd-error',true,'Min. 8 characters.');        ok = false; }
    if (!terms) {
      const errEl = document.getElementById('global-error');
      if (errEl) {
        const sp = errEl.querySelector('span') || errEl;
        sp.textContent = 'Please agree to the Terms of Service.';
      }
      showMsg('global-error', true);
      ok = false;
    }
    if (!ok) return;

    const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
    if (users.some(u => u.email === email))    { setErr('email','email-error',true,'Email already registered.');   return; }
    if (users.some(u => u.username === username)){ setErr('username','username-error',true,'Username taken.'); return; }

    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      users.push({
        userId: 'u_' + Date.now(), username, email, passwordHash: password,
        profilePicture: null, bio: '', createdAt: new Date().toISOString(),
        firstName: fname, lastName: lname
      });
      localStorage.setItem('sm_users', JSON.stringify(users));

      const s1 = document.getElementById('step-1');
      if (s1) {
        s1.classList.remove('active'); s1.classList.add('done');
        const dot = s1.querySelector('.step-dot');
        if (dot) dot.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        const s2 = document.getElementById('step-2');
        if (s2) s2.classList.add('active');
      }
      showMsg('global-success', true);
      setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    }, 1000);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('signup-btn').click();
  });
}


/* ══════════════════════════════════════
   PASSWORD RESET PAGE
══════════════════════════════════════ */
if (document.getElementById('s1-btn')) {

  let targetUserId = null;
  const digits = ['c0','c1','c2','c3','c4','c5'];

  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function setFieldErr(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  }

  function goToStep(n) {
    document.querySelectorAll('.reset-step').forEach(s => s.classList.remove('active'));
    const step = document.getElementById('reset-step-' + n);
    if (step) step.classList.add('active');
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById('dot-' + i);
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < n)   dot.classList.add('done');
      if (i === n) dot.classList.add('active');
    }
  }

  // Step 1
  document.getElementById('s1-btn').addEventListener('click', function () {
    const raw = document.getElementById('s1-identifier').value.trim();
    showMsg('s1-error', false);
    setErr('s1-identifier', 's1-identifier-error', false);

    if (!raw) { setErr('s1-identifier', 's1-identifier-error', true); return; }

    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      const identifier = raw.replace(/^@/, '');
      const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
      const user  = users.find(u => u.email === identifier || u.username === identifier);

      if (!user) {
        const errEl = document.getElementById('s1-error-text');
        if (errEl) errEl.textContent = 'No account found with that email or username.';
        showMsg('s1-error', true);
        document.getElementById('s1-identifier').classList.add('error');
        return;
      }

      const code = generateCode();
      targetUserId = user.userId;
      localStorage.setItem('sm_reset_code', JSON.stringify({
        code, userId: user.userId, expires: Date.now() + 15 * 60 * 1000
      }));

      const devDisplay = document.getElementById('dev-code-display');
      if (devDisplay) devDisplay.textContent = code;
      const s2email = document.getElementById('s2-email');
      if (s2email) s2email.textContent = user.email || user.username;

      goToStep(2);
      const c0 = document.getElementById('c0');
      if (c0) c0.focus();
    }, 800);
  });

  // Code digit inputs
  digits.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(-1);
      el.classList.remove('error');
      if (el.value && i < digits.length - 1) document.getElementById(digits[i + 1]).focus();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !el.value && i > 0) document.getElementById(digits[i - 1]).focus();
    });
    el.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((ch, j) => {
        const t = document.getElementById(digits[j]);
        if (t) t.value = ch;
      });
      const last = Math.min(pasted.length, 5);
      document.getElementById(digits[last]).focus();
    });
  });

  // Resend code
  window.resendCode = function () {
    const stored = JSON.parse(localStorage.getItem('sm_reset_code') || 'null');
    if (!stored) return;
    const code = generateCode();
    localStorage.setItem('sm_reset_code', JSON.stringify({
      code, userId: stored.userId, expires: Date.now() + 15 * 60 * 1000
    }));
    const devDisplay = document.getElementById('dev-code-display');
    if (devDisplay) devDisplay.textContent = code;
    digits.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    showMsg('s2-error', false);
    const c0 = document.getElementById('c0');
    if (c0) c0.focus();
  };

  // Step 2
  document.getElementById('s2-btn').addEventListener('click', function () {
    showMsg('s2-error', false);
    digits.forEach(id => { const el = document.getElementById(id); if(el) el.classList.remove('error'); });

    const entered = digits.map(id => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    }).join('');

    if (entered.length < 6) {
      digits.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) el.classList.add('error');
      });
      return;
    }

    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      const stored = JSON.parse(localStorage.getItem('sm_reset_code') || 'null');
      const errText = document.getElementById('s2-error-text');

      if (!stored) {
        if (errText) errText.textContent = 'No reset code found. Please start over.';
        showMsg('s2-error', true); return;
      }
      if (Date.now() > stored.expires) {
        if (errText) errText.textContent = 'Code expired. Please request a new one.';
        showMsg('s2-error', true); return;
      }
      if (entered !== stored.code) {
        if (errText) errText.textContent = 'Invalid code. Please try again.';
        showMsg('s2-error', true);
        digits.forEach(id => { const el = document.getElementById(id); if(el) el.classList.add('error'); });
        return;
      }

      targetUserId = stored.userId;
      goToStep(3);
      const s3pwd = document.getElementById('s3-pwd');
      if (s3pwd) s3pwd.focus();
    }, 600);
  });

  // Step 3 — password strength & toggles
  const s3pwd = document.getElementById('s3-pwd');
  if (s3pwd) {
    s3pwd.addEventListener('input', function () {
      updateStrength(this.value, 'strength-fill', 'strength-label');
    });
  }
  makePwdToggle('pwd-toggle-1', 's3-pwd');
  makePwdToggle('pwd-toggle-2', 's3-confirm');

  document.getElementById('s3-btn').addEventListener('click', function () {
    const pwd     = document.getElementById('s3-pwd').value;
    const confirm = document.getElementById('s3-confirm').value;
    showMsg('s3-error', false);
    setFieldErr('s3-pwd-error', false);
    setFieldErr('s3-confirm-error', false);
    document.getElementById('s3-pwd').classList.remove('error');
    document.getElementById('s3-confirm').classList.remove('error');

    let ok = true;
    if (pwd.length < 8) { setFieldErr('s3-pwd-error', true); document.getElementById('s3-pwd').classList.add('error'); ok = false; }
    if (pwd !== confirm) { setFieldErr('s3-confirm-error', true); document.getElementById('s3-confirm').classList.add('error'); ok = false; }
    if (!ok) return;

    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      if (!targetUserId) {
        const errText = document.getElementById('s3-error-text');
        if (errText) errText.textContent = 'Session expired. Please start over.';
        showMsg('s3-error', true); return;
      }

      const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
      const idx   = users.findIndex(u => u.userId === targetUserId);
      if (idx === -1) {
        const errText = document.getElementById('s3-error-text');
        if (errText) errText.textContent = 'User not found. Please start over.';
        showMsg('s3-error', true); return;
      }

      users[idx].passwordHash = pwd;
      localStorage.setItem('sm_users', JSON.stringify(users));
      localStorage.removeItem('sm_reset_code');
      targetUserId = null;
      goToStep(4);
    }, 800);
  });

  // Enter key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const active = document.querySelector('.reset-step.active');
    if (!active) return;
    const id = active.id;
    if (id === 'reset-step-1') document.getElementById('s1-btn').click();
    if (id === 'reset-step-2') document.getElementById('s2-btn').click();
    if (id === 'reset-step-3') document.getElementById('s3-btn').click();
  });
}
