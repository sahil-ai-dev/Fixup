/* =============================================
   FIXUP — THEME MANAGER
   ============================================= */

const Theme = (() => {
  const STORAGE_KEY = 'theme';

  function getTheme() {
    return Storage.get(STORAGE_KEY, 'light');
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.set(STORAGE_KEY, theme);
    updateToggleIcons(theme);
  }

  function toggle() {
    const current = getTheme();
    setTheme(current === 'light' ? 'dark' : 'light');
  }

  function init() {
    setTheme(getTheme());
  }

  function updateToggleIcons(theme) {
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
      if (theme === 'dark') {
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
      } else {
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
      }
    });
  }

  return { init, toggle, getTheme, setTheme };
})();


/* =============================================
   FIXUP — TOAST NOTIFICATIONS
   ============================================= */

const Toast = (() => {
  let container;

  function ensureContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
  }

  const iconSVG = {
    success: `<svg class="toast-icon" style="color:var(--color-success)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error:   `<svg class="toast-icon" style="color:var(--color-error)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" style="color:var(--color-warning)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    info:    `<svg class="toast-icon" style="color:var(--color-info)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  };

  function show(type, title, message = '', duration = 4000) {
    ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      ${iconSVG[type] || iconSVG.info}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => dismiss(toast));
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }
    return toast;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }

  return {
    success: (title, msg, d) => show('success', title, msg, d),
    error:   (title, msg, d) => show('error',   title, msg, d),
    warning: (title, msg, d) => show('warning', title, msg, d),
    info:    (title, msg, d) => show('info',    title, msg, d),
  };
})();


/* =============================================
   FIXUP — VALIDATION
   ============================================= */

const Validate = (() => {
  const rules = {
    required: (v) => v !== null && v !== undefined && String(v).trim() !== '',
    mobile:   (v) => /^[6-9]\d{9}$/.test(String(v).replace(/\D/g, '')),
    email:    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    pin:      (v) => /^\d{6}$/.test(String(v).trim()),
    password: (v) => v && v.length >= 6,
    otp:      (v) => /^\d{6}$/.test(String(v).trim()),
    price:    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    imageSize: (file) => file.size <= 5 * 1024 * 1024, // 5MB
    imageType: (file) => ['image/jpeg','image/png','image/webp','image/gif'].includes(file.type),
  };

  function field(el, rule, message) {
    const value = el.value;
    const valid = rules[rule] ? rules[rule](value) : true;

    clearError(el);
    if (!valid) {
      showError(el, message);
    }
    return valid;
  }

  function showError(el, message) {
    el.classList.add('error');
    let errEl = el.parentNode.querySelector('.form-error');
    if (!errEl) {
      errEl = el.closest('.form-group')?.querySelector('.form-error');
    }
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error';
      el.parentNode.insertBefore(errEl, el.nextSibling);
    }
    errEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> ${message}`;
  }

  function clearError(el) {
    el.classList.remove('error');
    const errEl = el.parentNode?.querySelector('.form-error') ||
                  el.closest('.form-group')?.querySelector('.form-error');
    if (errEl) errEl.remove();
  }

  function clearAll(form) {
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      clearError(el);
    });
  }

  return { rules, field, showError, clearError, clearAll };
})();


/* =============================================
   FIXUP — AUTH
   ============================================= */

const Auth = (() => {
  const SESSION_KEY = 'session';

  function login(mobile, password, role) {
    const users = Storage.get('users', []);
    const user = users.find(u =>
      u.mobile === mobile.trim() &&
      u.password === password &&
      u.role === role
    );
    if (user) {
      const session = {
        userId: user.id,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
        loggedInAt: new Date().toISOString(),
      };
      Storage.set(SESSION_KEY, session);
      return { success: true, user, session };
    }
    return { success: false, error: 'Invalid mobile number or password.' };
  }

  function logout() {
    Storage.remove(SESSION_KEY);
    sessionStorage.removeItem('fixup_session');
    window.location.href = getRoot() + 'index.html';
  }

  function getSession() {
    if (Storage.get(SESSION_KEY, null)) return Storage.get(SESSION_KEY, null);
    try {
      return JSON.parse(sessionStorage.getItem('fixup_session') || 'null');
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function getUser() {
    const session = getSession();
    if (!session) return null;
    const users = Storage.get('users', []);
    return users.find(u => u.id === session.userId) || null;
  }

  function updateUser(updates) {
    const session = getSession();
    if (!session) return false;
    const users = Storage.get('users', []);
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      Storage.set('users', users);
      return true;
    }
    return false;
  }

  function requireAuth(role = null) {
    const session = getSession();
    if (!session) {
      window.location.href = getRoot() + 'login.html';
      return false;
    }
    if (role && session.role !== role) {
      // Redirect to their proper dashboard
      const dash = {
        user: getRoot() + 'user/dashboard.html',
        mechanic: getRoot() + 'mechanic/dashboard.html',
        admin: getRoot() + 'admin/dashboard.html',
      };
      window.location.href = dash[session.role] || getRoot() + 'index.html';
      return false;
    }
    return true;
  }

  function register(userData) {
    const users = Storage.get('users', []);
    if (users.find(u => u.mobile === userData.mobile)) {
      return { success: false, error: 'Mobile number already registered.' };
    }
    const id = 'u' + Date.now();
    const newUser = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    Storage.set('users', users);
    return { success: true, user: newUser };
  }

  return { login, logout, getSession, isLoggedIn, getUser, updateUser, requireAuth, register };
})();


/* =============================================
   FIXUP — NAVIGATION HELPER
   ============================================= */

function getRoot() {
  // Determine path depth to set correct relative paths
  const depth = (window.location.pathname.match(/\//g) || []).length;
  if (depth <= 1) return './';
  return '../'.repeat(depth - 1);
}

function getAssetPath(rel) {
  return getRoot() + rel;
}

// Initialize navbar scroll effect
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile nav toggle
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.navbar-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    if (open) {
      drawer.classList.add('open');
    } else {
      drawer.classList.remove('open');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
    }
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
}

// Active nav link based on current page
function highlightActiveNav() {
  const current = window.location.pathname;
  document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const absHref = new URL(href, window.location.href).pathname;
    if (current === absHref || (absHref !== '/' && current.endsWith(absHref.split('/').pop()))) {
      link.classList.add('active');
    }
  });
}

// FAQ Accordion
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-content').style.maxHeight = '0';
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// Tabs
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabGroup = btn.closest('[data-tabs]') || btn.closest('.card') || btn.parentElement.parentElement;
      const targetId = btn.dataset.tab;

      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(targetId) || tabGroup.querySelector(`[data-tab-content="${targetId}"]`);
      if (target) target.classList.add('active');
    });
  });
}

// Dropdowns
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dd => {
    const trigger = dd.querySelector('[data-dropdown-trigger]') || dd.querySelector('button');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dd.classList.contains('open');
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) dd.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  });
}

// Modal helpers
function openModal(id) {
  const backdrop = document.getElementById(id);
  if (backdrop) {
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const backdrop = typeof id === 'string' ? document.getElementById(id) : id;
  if (backdrop) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initModals() {
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modalClose || btn.closest('.modal-backdrop')?.id;
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => closeModal(m));
    }
  });
}

// Format date
function formatDate(iso, opts = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  const defaults = { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-IN', { ...defaults, ...opts });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Stars render
function renderStars(rating, max = 5) {
  let html = '<span class="stars" aria-label="' + rating + ' out of ' + max + '">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? '' : 'star-empty'}">★</span>`;
  }
  html += '</span>';
  return html;
}

// Avatar initials
function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.substring(0, 2) || 'U').toUpperCase();
}

// Category icon
function getCategoryIcon(category) {
  const icons = {
    mobile: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    laptop: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m14 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`,
    computer: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    tablet: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    accessories: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
    other: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  };
  return icons[category] || icons.other;
}

// Page init
function initPage() {
  Theme.init();
  initNavbarScroll();
  initMobileNav();
  highlightActiveNav();
  initAccordions();
  initTabs();
  initDropdowns();
  initModals();

  // Theme toggles
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => Theme.toggle());
  });

  // Logout buttons
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  });

  // Demo banner reset button
  const resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Reset all demo data? This will clear bookings, notifications, and other demo content.')) {
        DemoData.reset();
        Toast.success('Demo Data Reset', 'All demo data has been restored to defaults.');
        setTimeout(() => window.location.reload(), 1200);
      }
    });
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
