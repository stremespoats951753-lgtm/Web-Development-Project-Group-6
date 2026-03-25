/* ═══════════════════════════════════════
   auth.js — shared JS for login,
   signup, and password-reset pages
═══════════════════════════════════════ */

/* ── SESSION GUARD ── */
/* If a valid session exists, bounce away from auth pages to the feed */
(function () {
  const session = localStorage.getItem('gf_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed && parsed.uid) {
        window.location.replace('feed.html');
      }
    } catch (e) {
      localStorage.removeItem('gf_session');
    }
  }
})();

/* ── THEME ── */
(function () {
  const root  = document.documentElement;
  const saved = localStorage.getItem('gf_skin');
  if (saved) root.setAttribute('data-skin', saved);

  document.getElementById('tint-switcher').addEventListener('click', () => {
    const next = root.getAttribute('data-skin') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-skin', next);
    localStorage.setItem('gf_skin', next);
  });
})();

/* ── SHARED HELPERS ── */

/** Toggle an input's bad class and its sibling fault message */
function markFault(inputId, faultId, show, msg) {
  const inp  = document.getElementById(inputId);
  const flt  = document.getElementById(faultId);
  if (!inp || !flt) return;
  inp.classList.toggle('bad', show);
  flt.classList.toggle('visible', show);
  if (msg) {
    const sp = flt.querySelector('span') || flt;
    sp.textContent = msg;
  }
}

/** Show/hide a .notice or .top-alert/.top-success banner */
function toggleNotice(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('visible', show);
}

/** Validate email format */
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Toggle password visibility; swap icon on the button */
function bindReveal(btnId, inputId) {
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

/** Update password vigor bar */
function refreshVigor(value, fillId, labelId) {
  let score = 0;
  if (value.length >= 8)          score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const tiers = [
    { w:'0%',   c:'#f50057', t:'Enter a password' },
    { w:'25%',  c:'#f50057', t:'Weak' },
    { w:'50%',  c:'#f5a000', t:'Fair' },
    { w:'75%',  c:'#00c97f', t:'Good' },
    { w:'100%', c:'#00f5a0', t:'Strong ✓' },
  ];
  const pick  = value.length === 0 ? tiers[0] : tiers[score];
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (fill)  { fill.style.width = pick.w; fill.style.background = pick.c; }
  if (label) { label.textContent = pick.t; label.style.color = value.length === 0 ? 'var(--txt-muted)' : pick.c; }
}


/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
if (document.getElementById('submit-login')) {

  bindReveal('reveal-btn', 'pw-field');

  document.getElementById('submit-login').addEventListener('click', function () {
    const raw = document.getElementById('id-field').value.trim();
    const pwd = document.getElementById('pw-field').value;
    let ok = true;

    toggleNotice('top-alert', false);
    markFault('id-field', 'id-field-fault', false);
    markFault('pw-field', 'pw-field-fault', false);

    if (raw.length < 2) { markFault('id-field', 'id-field-fault', true); ok = false; }
    if (!pwd)           { markFault('pw-field', 'pw-field-fault', true); ok = false; }
    if (!ok) return;

    this.classList.add('busy');
    setTimeout(() => {
      this.classList.remove('busy');
      const identifier = raw.replace(/^@/, '');
      const roster = JSON.parse(localStorage.getItem('gf_roster') || '[]');
      const match  = roster.find(u =>
        (u.email === identifier || u.username === identifier) && u.pwHash === pwd
      );

      if (match) {
        localStorage.setItem('gf_session', JSON.stringify({ uid: match.uid }));
        const btn = document.getElementById('submit-login');
        btn.style.background = '#00f5a0';
        btn.querySelector('.cta-label').textContent = 'Redirecting…';
        setTimeout(() => { window.location.href = 'feed.html'; }, 800);
      } else {
        toggleNotice('top-alert', true);
        document.getElementById('id-field').classList.add('bad');
        document.getElementById('pw-field').classList.add('bad');
      }
    }, 900);
  });

  ['id-field', 'pw-field'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById(id).classList.remove('bad');
      const faultId = id === 'id-field' ? 'id-field-fault' : 'pw-field-fault';
      document.getElementById(faultId).classList.remove('visible');
      toggleNotice('top-alert', false);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('submit-login').click();
  });
}


/* ══════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════ */
if (document.getElementById('submit-signup')) {

  // Checkbox toggle
  window.toggleTick = function (el) {
    document.getElementById('tick-wrap').classList.toggle('ticked', el.checked);
  };

  // Password reveal & vigor
  bindReveal('reveal-btn', 'pw-field');
  document.getElementById('pw-field').addEventListener('input', function () {
    refreshVigor(this.value, 'vigor-fill', 'vigor-label');
  });

  // Handle availability check
  let probeTimer;
  document.getElementById('handle-field').addEventListener('input', function () {
    clearTimeout(probeTimer);
    const probe = document.getElementById('handle-probe');
    const val   = this.value.trim();
    probe.className = 'handle-probe';
    if (val.length < 3) return;
    probe.className = 'handle-probe scanning';
    probe.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Checking…`;
    probeTimer = setTimeout(() => {
      const roster = JSON.parse(localStorage.getItem('gf_roster') || '[]');
      const taken  = roster.some(u => u.username === val);
      if (taken) {
        probe.className = 'handle-probe occupied';
        probe.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Taken`;
        this.classList.add('bad');
      } else {
        probe.className = 'handle-probe free';
        probe.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Available`;
        this.classList.remove('bad'); this.classList.add('good');
      }
    }, 600);
  });

  // Submit
  document.getElementById('submit-signup').addEventListener('click', function () {
    const fname    = document.getElementById('fn-field').value.trim();
    const lname    = document.getElementById('ln-field').value.trim();
    const handle   = document.getElementById('handle-field').value.trim();
    const email    = document.getElementById('mail-field').value.trim();
    const password = document.getElementById('pw-field').value;
    const agreed   = document.getElementById('tos-box').checked;
    let ok = true;

    toggleNotice('top-alert', false);
    ['fn-field-fault','ln-field-fault','handle-field-fault','mail-field-fault','pw-field-fault'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });
    ['fn-field','ln-field','handle-field','mail-field','pw-field'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('bad');
    });

    if (!fname)                    { markFault('fn-field','fn-field-fault',true);                                    ok = false; }
    if (!lname)                    { markFault('ln-field','ln-field-fault',true);                                    ok = false; }
    if (!handle||handle.length<3)  { markFault('handle-field','handle-field-fault',true,'Min. 3 characters.');      ok = false; }
    if (!isValidEmail(email))      { markFault('mail-field','mail-field-fault',true,'Valid email required.');        ok = false; }
    if (password.length < 8)       { markFault('pw-field','pw-field-fault',true,'Min. 8 characters.');              ok = false; }
    if (!agreed) {
      const alertEl = document.getElementById('top-alert');
      if (alertEl) {
        const sp = alertEl.querySelector('span') || alertEl;
        sp.textContent = 'Please agree to the Terms of Service.';
      }
      toggleNotice('top-alert', true);
      ok = false;
    }
    if (!ok) return;

    const roster = JSON.parse(localStorage.getItem('gf_roster') || '[]');
    if (roster.some(u => u.email === email))   { markFault('mail-field','mail-field-fault',true,'Email already registered.');  return; }
    if (roster.some(u => u.username === handle)){ markFault('handle-field','handle-field-fault',true,'Username taken.');       return; }

    this.classList.add('busy');
    setTimeout(() => {
      this.classList.remove('busy');
      const newUid = 'u_' + Date.now();
      roster.push({
        uid: newUid, username: handle, email, pwHash: password,
        avatar: null, bio: '', joinedAt: new Date().toISOString(),
        firstName: fname, lastName: lname
      });
      localStorage.setItem('gf_roster', JSON.stringify(roster));
      // Auto-login the new user and head straight to the feed
      localStorage.setItem('gf_session', JSON.stringify({ uid: newUid }));

      const ob1 = document.getElementById('ob-1');
      if (ob1) {
        ob1.classList.remove('lit'); ob1.classList.add('done');
        const dot = ob1.querySelector('.onboard-dot');
        if (dot) dot.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        const ob2 = document.getElementById('ob-2');
        if (ob2) ob2.classList.add('lit');
      }
      toggleNotice('top-success', true);
      setTimeout(() => { window.location.href = 'feed.html'; }, 1800);
    }, 1000);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('submit-signup').click();
  });
}


/* ══════════════════════════════════════
   PASSWORD RESET PAGE
══════════════════════════════════════ */
if (document.getElementById('r1-advance')) {

  let pendingUid = null;
  const boxes = ['d0','d1','d2','d3','d4','d5'];

  function makeCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function toggleFault(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  function jumpToStage(n) {
    document.querySelectorAll('.flow-stage').forEach(s => s.classList.remove('active'));
    const tgt = document.getElementById('flow-stage-' + n);
    if (tgt) tgt.classList.add('active');
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById('tdot-' + i);
      if (!dot) continue;
      dot.classList.remove('lit', 'done');
      if (i < n)   dot.classList.add('done');
      if (i === n) dot.classList.add('lit');
    }
  }

  // Stage 1
  document.getElementById('r1-advance').addEventListener('click', function () {
    const raw = document.getElementById('r1-lookup').value.trim();
    toggleNotice('r1-notice', false);
    markFault('r1-lookup', 'r1-lookup-fault', false);

    if (!raw) { markFault('r1-lookup', 'r1-lookup-fault', true); return; }

    this.classList.add('busy');
    setTimeout(() => {
      this.classList.remove('busy');
      const identifier = raw.replace(/^@/, '');
      const roster = JSON.parse(localStorage.getItem('gf_roster') || '[]');
      const hit    = roster.find(u => u.email === identifier || u.username === identifier);

      if (!hit) {
        const txt = document.getElementById('r1-notice-copy');
        if (txt) txt.textContent = 'No account found with that email or username.';
        toggleNotice('r1-notice', true);
        document.getElementById('r1-lookup').classList.add('bad');
        return;
      }

      const code = makeCode();
      pendingUid = hit.uid;
      localStorage.setItem('gf_reset', JSON.stringify({
        code, uid: hit.uid, expiry: Date.now() + 15 * 60 * 1000
      }));

      const dbg = document.getElementById('debug-value');
      if (dbg) dbg.textContent = code;
      const tgt = document.getElementById('r2-target-id');
      if (tgt) tgt.textContent = hit.email || hit.username;

      jumpToStage(2);
      const d0 = document.getElementById('d0');
      if (d0) d0.focus();
    }, 800);
  });

  // Digit boxes
  boxes.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(-1);
      el.classList.remove('bad');
      if (el.value && i < boxes.length - 1) document.getElementById(boxes[i + 1]).focus();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !el.value && i > 0) document.getElementById(boxes[i - 1]).focus();
    });
    el.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((ch, j) => {
        const t = document.getElementById(boxes[j]);
        if (t) t.value = ch;
      });
      const last = Math.min(pasted.length, 5);
      document.getElementById(boxes[last]).focus();
    });
  });

  // Regen code
  window.regenCode = function () {
    const stored = JSON.parse(localStorage.getItem('gf_reset') || 'null');
    if (!stored) return;
    const code = makeCode();
    localStorage.setItem('gf_reset', JSON.stringify({
      code, uid: stored.uid, expiry: Date.now() + 15 * 60 * 1000
    }));
    const dbg = document.getElementById('debug-value');
    if (dbg) dbg.textContent = code;
    boxes.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('bad'); }
    });
    toggleNotice('r2-notice', false);
    const d0 = document.getElementById('d0');
    if (d0) d0.focus();
  };

  // Stage 2
  document.getElementById('r2-advance').addEventListener('click', function () {
    toggleNotice('r2-notice', false);
    boxes.forEach(id => { const el = document.getElementById(id); if(el) el.classList.remove('bad'); });

    const entered = boxes.map(id => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    }).join('');

    if (entered.length < 6) {
      boxes.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) el.classList.add('bad');
      });
      return;
    }

    this.classList.add('busy');
    setTimeout(() => {
      this.classList.remove('busy');
      const stored  = JSON.parse(localStorage.getItem('gf_reset') || 'null');
      const copyEl  = document.getElementById('r2-notice-copy');

      if (!stored) {
        if (copyEl) copyEl.textContent = 'No reset code found. Please start over.';
        toggleNotice('r2-notice', true); return;
      }
      if (Date.now() > stored.expiry) {
        if (copyEl) copyEl.textContent = 'Code expired. Please request a new one.';
        toggleNotice('r2-notice', true); return;
      }
      if (entered !== stored.code) {
        if (copyEl) copyEl.textContent = 'Invalid code. Please try again.';
        toggleNotice('r2-notice', true);
        boxes.forEach(id => { const el = document.getElementById(id); if(el) el.classList.add('bad'); });
        return;
      }

      pendingUid = stored.uid;
      jumpToStage(3);
      const r3pw = document.getElementById('r3-newpw');
      if (r3pw) r3pw.focus();
    }, 600);
  });

  // Stage 3 — vigor & reveals
  const r3pw = document.getElementById('r3-newpw');
  if (r3pw) {
    r3pw.addEventListener('input', function () {
      refreshVigor(this.value, 'vigor-fill', 'vigor-label');
    });
  }
  bindReveal('reveal-r3-newpw', 'r3-newpw');
  bindReveal('reveal-r3-repw',  'r3-repw');

  document.getElementById('r3-advance').addEventListener('click', function () {
    const pw1 = document.getElementById('r3-newpw').value;
    const pw2 = document.getElementById('r3-repw').value;
    toggleNotice('r3-notice', false);
    toggleFault('r3-newpw-fault', false);
    toggleFault('r3-repw-fault', false);
    document.getElementById('r3-newpw').classList.remove('bad');
    document.getElementById('r3-repw').classList.remove('bad');

    let ok = true;
    if (pw1.length < 8) { toggleFault('r3-newpw-fault', true); document.getElementById('r3-newpw').classList.add('bad'); ok = false; }
    if (pw1 !== pw2)    { toggleFault('r3-repw-fault', true);  document.getElementById('r3-repw').classList.add('bad');  ok = false; }
    if (!ok) return;

    this.classList.add('busy');
    setTimeout(() => {
      this.classList.remove('busy');
      if (!pendingUid) {
        const copyEl = document.getElementById('r3-notice-copy');
        if (copyEl) copyEl.textContent = 'Session expired. Please start over.';
        toggleNotice('r3-notice', true); return;
      }

      const roster = JSON.parse(localStorage.getItem('gf_roster') || '[]');
      const idx    = roster.findIndex(u => u.uid === pendingUid);
      if (idx === -1) {
        const copyEl = document.getElementById('r3-notice-copy');
        if (copyEl) copyEl.textContent = 'User not found. Please start over.';
        toggleNotice('r3-notice', true); return;
      }

      roster[idx].pwHash = pw1;
      localStorage.setItem('gf_roster', JSON.stringify(roster));
      localStorage.removeItem('gf_reset');
      pendingUid = null;
      jumpToStage(4);
    }, 800);
  });

  // Enter key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const active = document.querySelector('.flow-stage.active');
    if (!active) return;
    const sid = active.id;
    if (sid === 'flow-stage-1') document.getElementById('r1-advance').click();
    if (sid === 'flow-stage-2') document.getElementById('r2-advance').click();
    if (sid === 'flow-stage-3') document.getElementById('r3-advance').click();
  });
}