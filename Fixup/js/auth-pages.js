/* =============================================
   FIXUP — AUTH PAGES LOGIC
   ============================================= */

/* ─────────────────────────────────────────────
   LOGIN PAGE
   ───────────────────────────────────────────── */

const LoginPage = (() => {
  let selectedRole = 'user';

  function init() {
    if (!document.getElementById('login-form')) return;

    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
      redirectByRole(Auth.getSession().role);
      return;
    }

    setupRoleSelector();
    setupPasswordToggle();
    setupForgotPassword();
    setupForm();
    setupDemoFill();
  }

  function setupRoleSelector() {
    const cards = document.querySelectorAll('.role-card[data-role]');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRole = card.dataset.role;
      });
    });
  }

  function setupPasswordToggle() {
    const toggle = document.getElementById('pwd-toggle');
    const input = document.getElementById('password');
    if (!toggle || !input) return;
    toggle.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      toggle.innerHTML = isText
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
  }

  function setupForgotPassword() {
    const link = document.getElementById('forgot-pwd-link');
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      Toast.info('Password Reset', 'Please contact support to reset your password.');
    });
  }

  function setupForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mobileEl = document.getElementById('mobile');
      const passwordEl = document.getElementById('password');

      let valid = true;

      // Validate mobile
      if (!Validate.rules.mobile(mobileEl.value)) {
        Validate.showError(mobileEl, 'Enter a valid 10-digit mobile number starting with 6-9');
        valid = false;
      } else {
        Validate.clearError(mobileEl);
      }

      // Validate password
      if (!Validate.rules.required(passwordEl.value)) {
        Validate.showError(passwordEl, 'Password is required');
        valid = false;
      } else {
        Validate.clearError(passwordEl);
      }

      if (!valid) return;

      // Show loading
      const btn = document.getElementById('login-btn');
      btn.classList.add('loading');
      btn.disabled = true;

      // Simulate delay
      await new Promise(r => setTimeout(r, 600));

      const result = Auth.login(mobileEl.value.trim(), passwordEl.value, selectedRole);

      btn.classList.remove('loading');
      btn.disabled = false;

      if (result.success) {
        Toast.success('Welcome back!', `Logged in as ${result.user.name}`);
        setTimeout(() => redirectByRole(result.session.role), 800);
      } else {
        Toast.error('Login Failed', 'Invalid mobile number or password. Check your role selection.');
      }
    });
  }

  function setupDemoFill() {
    document.querySelectorAll('.demo-fill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.fillRole;
        const mobile = btn.dataset.fillMobile;

        document.getElementById('mobile').value = mobile;
        document.getElementById('password').value = 'Demo@123';

        // Select correct role card
        document.querySelectorAll('.role-card[data-role]').forEach(c => c.classList.remove('selected'));
        const roleCard = document.querySelector(`.role-card[data-role="${role}"]`);
        if (roleCard) {
          roleCard.classList.add('selected');
          selectedRole = role;
        }

        Toast.info('Credentials filled', `Ready to login as ${role}. Click Login.`);
      });
    });
  }

  function redirectByRole(role) {
    const routes = {
      user: './user/dashboard.html',
      mechanic: './mechanic/dashboard.html',
      admin: './admin/dashboard.html',
    };
    window.location.href = routes[role] || './index.html';
  }

  return { init };
})();


/* ─────────────────────────────────────────────
   SIGNUP PAGE
   ───────────────────────────────────────────── */

const SignupPage = (() => {
  let currentStep = 1;
  const TOTAL_STEPS = 4;
  let selectedRole = null;
  let verifiedMobile = null;
  let otpTimerInterval = null;

  function init() {
    if (!document.getElementById('signup-container')) return;

    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
      const role = Auth.getSession().role;
      window.location.href = role === 'mechanic'
        ? './mechanic/dashboard.html'
        : role === 'admin'
          ? './admin/dashboard.html'
          : './user/dashboard.html';
      return;
    }

    setupRoleCards();
    setupOTP();
    setupPasswordForm();
    goToStep(1);
  }

  /* ── Step Navigation ── */
  function goToStep(step) {
    currentStep = step;
    updateProgress();
    updateStepIndicators();
    showStepPanel(step);
  }

  function updateProgress() {
    const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    const bar = document.getElementById('signup-progress-bar');
    if (bar) bar.style.width = pct + '%';
  }

  function updateStepIndicators() {
    document.querySelectorAll('.signup-step-item').forEach((item, idx) => {
      const s = idx + 1;
      item.classList.remove('active', 'done');
      if (s === currentStep) item.classList.add('active');
      else if (s < currentStep) item.classList.add('done');
    });

    // Update check marks in done steps
    document.querySelectorAll('.signup-step-item.done .signup-step-num').forEach(el => {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    });

    // Restore non-done steps' numbers
    document.querySelectorAll('.signup-step-item:not(.done) .signup-step-num').forEach((el, idx) => {
      const allItems = document.querySelectorAll('.signup-step-item');
      const itemIdx = Array.from(allItems).findIndex(i => i.contains(el));
      if (itemIdx >= 0) el.textContent = itemIdx + 1;
    });
  }

  function showStepPanel(step) {
    document.querySelectorAll('.signup-step-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`step-${step}`);
    if (panel) panel.classList.add('active');
  }

  /* ── Step 1: Role Selection ── */
  function setupRoleCards() {
    const cards = document.querySelectorAll('.role-card-large[data-role]');
    const continueBtn = document.getElementById('step1-continue');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRole = card.dataset.role;

        // Update check icons
        cards.forEach(c => {
          const check = c.querySelector('.role-card-large-check');
          if (check) check.innerHTML = '';
        });
        const check = card.querySelector('.role-card-large-check');
        if (check) {
          check.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        }

        if (continueBtn) continueBtn.disabled = false;
      });
    });

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (!selectedRole) {
          Toast.warning('Select a role', 'Please choose how you want to use Fixup.');
          return;
        }
        goToStep(2);
      });
    }
  }

  /* ── Step 2: Mobile + OTP ── */
  function setupOTP() {
    const getOtpBtn = document.getElementById('get-otp-btn');
    const otpSection = document.getElementById('otp-section');
    const verifyBtn = document.getElementById('verify-otp-btn');
    const mobileInput = document.getElementById('signup-mobile');

    if (getOtpBtn) {
      getOtpBtn.addEventListener('click', () => {
        if (!Validate.rules.mobile(mobileInput.value)) {
          Validate.showError(mobileInput, 'Enter a valid 10-digit mobile number starting with 6-9');
          return;
        }
        Validate.clearError(mobileInput);

        // Check if mobile already registered
        const users = Storage.get('users', []);
        if (users.find(u => u.mobile === mobileInput.value.trim())) {
          Validate.showError(mobileInput, 'This mobile number is already registered. Please login.');
          return;
        }

        verifiedMobile = mobileInput.value.trim();
        getOtpBtn.classList.add('loading');
        getOtpBtn.disabled = true;

        setTimeout(() => {
          getOtpBtn.classList.remove('loading');
          getOtpBtn.disabled = false;
          if (otpSection) otpSection.style.display = 'block';
          Toast.info('OTP Sent', 'Demo OTP: 123456 (use this to verify)');
          startOtpTimer();
          focusFirstOtpInput();
        }, 800);
      });
    }

    // OTP digit inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val.slice(-1);
        if (val && idx < otpInputs.length - 1) {
          otpInputs[idx + 1].focus();
        }
        if (val) input.classList.add('filled');
        else input.classList.remove('filled');
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].classList.remove('filled');
        }
      });

      input.addEventListener('paste', (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasted.length === 6) {
          e.preventDefault();
          otpInputs.forEach((inp, i) => {
            inp.value = pasted[i] || '';
            if (pasted[i]) inp.classList.add('filled');
          });
        }
      });
    });

    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const otp = Array.from(otpInputs).map(i => i.value).join('');
        if (otp.length < 6) {
          otpInputs.forEach(i => i.classList.add('error'));
          Toast.error('Invalid OTP', 'Please enter all 6 digits.');
          return;
        }

        if (otp !== '123456') {
          otpInputs.forEach(i => { i.classList.add('error'); i.classList.remove('filled'); });
          Toast.error('Wrong OTP', 'The OTP you entered is incorrect. Demo OTP is 123456.');
          return;
        }

        // Valid OTP
        otpInputs.forEach(i => { i.classList.remove('error'); });
        clearOtpTimer();
        verifyBtn.classList.add('loading');
        verifyBtn.disabled = true;

        setTimeout(() => {
          verifyBtn.classList.remove('loading');
          verifyBtn.disabled = false;
          Toast.success('Mobile Verified', 'Your mobile number has been verified!');
          goToStep(3);
          updateMechanicStepUI();
        }, 600);
      });
    }

    // Resend OTP
    const resendBtn = document.getElementById('otp-resend-btn');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        resendBtn.classList.remove('visible');
        otpInputs.forEach(i => { i.value = ''; i.classList.remove('filled', 'error'); });
        Toast.info('OTP Resent', 'Demo OTP: 123456');
        startOtpTimer();
        focusFirstOtpInput();
      });
    }
  }

  function focusFirstOtpInput() {
    const first = document.querySelector('.otp-input');
    if (first) setTimeout(() => first.focus(), 100);
  }

  function startOtpTimer() {
    clearOtpTimer();
    let seconds = 30;
    const countEl = document.getElementById('otp-timer-count');
    const timerWrap = document.getElementById('otp-timer-wrap');
    const resendBtn = document.getElementById('otp-resend-btn');

    if (timerWrap) timerWrap.style.display = 'flex';
    if (resendBtn) resendBtn.classList.remove('visible');
    if (countEl) countEl.textContent = `0:30`;

    otpTimerInterval = setInterval(() => {
      seconds--;
      if (countEl) {
        countEl.textContent = `0:${seconds.toString().padStart(2, '0')}`;
      }
      if (seconds <= 0) {
        clearOtpTimer();
        if (timerWrap) timerWrap.style.display = 'none';
        if (resendBtn) resendBtn.classList.add('visible');
      }
    }, 1000);
  }

  function clearOtpTimer() {
    if (otpTimerInterval) {
      clearInterval(otpTimerInterval);
      otpTimerInterval = null;
    }
  }

  /* ── Step 3: Create Profile + Password ── */
  function updateMechanicStepUI() {
    const mechNotice = document.getElementById('mechanic-notice');
    if (mechNotice) {
      mechNotice.style.display = selectedRole === 'mechanic' ? 'flex' : 'none';
    }
    const stepTitle = document.getElementById('step3-title');
    if (stepTitle) {
      stepTitle.textContent = selectedRole === 'mechanic'
        ? 'Create Your Mechanic Profile'
        : 'Create Your Account';
    }
  }

  function setupPasswordForm() {
    const form = document.getElementById('signup-profile-form');
    if (!form) return;

    // Password toggle
    const pwdToggle = document.getElementById('signup-pwd-toggle');
    const pwdInput = document.getElementById('signup-password');
    if (pwdToggle && pwdInput) {
      pwdToggle.addEventListener('click', () => {
        const isText = pwdInput.type === 'text';
        pwdInput.type = isText ? 'password' : 'text';
        pwdToggle.innerHTML = isText
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      });
    }

    const cpwdToggle = document.getElementById('signup-cpwd-toggle');
    const cpwdInput = document.getElementById('signup-confirm-password');
    if (cpwdToggle && cpwdInput) {
      cpwdToggle.addEventListener('click', () => {
        const isText = cpwdInput.type === 'text';
        cpwdInput.type = isText ? 'password' : 'text';
        cpwdToggle.innerHTML = isText
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameEl = document.getElementById('signup-name');
      const passwordEl = document.getElementById('signup-password');
      const confirmPwdEl = document.getElementById('signup-confirm-password');

      let valid = true;

      if (!Validate.rules.required(nameEl.value)) {
        Validate.showError(nameEl, 'Full name is required');
        valid = false;
      } else {
        Validate.clearError(nameEl);
      }

      if (!Validate.rules.password(passwordEl.value)) {
        Validate.showError(passwordEl, 'Password must be at least 6 characters');
        valid = false;
      } else {
        Validate.clearError(passwordEl);
      }

      if (passwordEl.value !== confirmPwdEl.value) {
        Validate.showError(confirmPwdEl, 'Passwords do not match');
        valid = false;
      } else {
        Validate.clearError(confirmPwdEl);
      }

      if (!valid) return;

      const submitBtn = document.getElementById('signup-submit-btn');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      await new Promise(r => setTimeout(r, 700));

      const result = Auth.register({
        mobile: verifiedMobile,
        password: passwordEl.value,
        name: nameEl.value.trim(),
        role: selectedRole,
        avatar: null,
        isSubscribed: false,
        subscriptionExpiry: null,
        rating: null,
        totalRatings: 0,
        totalJobs: 0,
        location: null,
        skills: [],
        bio: '',
      });

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      if (!result.success) {
        Toast.error('Registration Failed', result.error);
        return;
      }

      // Auto login
      const loginResult = Auth.login(verifiedMobile, passwordEl.value, selectedRole);

      if (loginResult.success) {
        Toast.success('Account Created!', `Welcome to Fixup, ${nameEl.value.trim().split(' ')[0]}!`);
        goToStep(4);
        renderSuccessStep(nameEl.value.trim());
      } else {
        Toast.error('Login Failed', 'Account created but could not log in. Please try logging in manually.');
        setTimeout(() => { window.location.href = './login.html'; }, 1500);
      }
    });
  }

  function renderSuccessStep(name) {
    const nameEl = document.getElementById('success-name');
    if (nameEl) nameEl.textContent = name.split(' ')[0];

    if (selectedRole === 'mechanic') {
      const mechBtn = document.getElementById('success-mechanic-btn');
      const userBtn = document.getElementById('success-user-btn');
      if (mechBtn) mechBtn.style.display = 'flex';
      if (userBtn) userBtn.style.display = 'none';

      const successText = document.getElementById('success-text');
      if (successText) {
        successText.textContent = 'Your mechanic account is ready. Subscribe to start receiving repair requests from users.';
      }

      if (mechBtn) {
        mechBtn.addEventListener('click', () => {
          window.location.href = './mechanic/subscription.html';
        });
      }
    } else {
      const mechBtn = document.getElementById('success-mechanic-btn');
      const userBtn = document.getElementById('success-user-btn');
      if (mechBtn) mechBtn.style.display = 'none';
      if (userBtn) userBtn.style.display = 'flex';

      if (userBtn) {
        userBtn.addEventListener('click', () => {
          window.location.href = './user/dashboard.html';
        });
      }
    }
  }

  return { init };
})();


/* ─────────────────────────────────────────────
   INITIALIZE
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  LoginPage.init();
  SignupPage.init();
});
