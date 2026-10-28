/* Fixup static demo application. All services are simulated in this browser. */
(() => {
  'use strict';

  DemoData.seed();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const page = document.body.dataset.page || 'home';
  const root = ['home', 'login', 'signup', 'about', 'services', 'mechanic-subscription'].includes(page) ? './' : '../';
  const store = (key, fallback) => Storage.get(key, fallback);
  const save = (key, value) => Storage.set(key, value);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const when = value => value ? new Date(value).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
  const currentPath = location.pathname;
  const session = () => store('session', null) || (() => {
    try { return JSON.parse(sessionStorage.getItem('fixup_session') || 'null'); }
    catch { return null; }
  })();
  const users = () => store('users', []);
  const getCurrentUser = () => {
    const active = session();
    return users().find(user => user.id === active?.userId) || null;
  };
  const getDemoUser = role => users().find(user => user.role === role) || users()[0];

  function toast(message) {
    let node = $('#site-toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'site-toast';
      node.className = 'toast';
      node.setAttribute('role', 'status');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.add('hidden'), 3200);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    save('theme', theme);
    $$('[data-theme-toggle]').forEach(button => button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
  }
  setTheme(store('theme', 'light'));

  function brand() {
    const name = FixupConfig.brand.name || 'Fixup';
    const splitAt = Math.max(1, name.length - 2);
    return `<a class="brand" href="${root}index.html" aria-label="${esc(name)} home"><span class="brand-mark" aria-hidden="true">⌁</span><span>${esc(name.slice(0, splitAt))}<em>${esc(name.slice(splitAt))}</em></span></a>`;
  }
  function header() {
    return `<header class="site-nav"><div class="site-container site-nav-inner">
      ${brand()}
      <nav class="site-links" id="site-links" aria-label="Main navigation">
        <a href="${root}index.html">Home</a><a href="${root}services.html">Services</a><a href="${root}index.html#how-it-works">How it works</a><a href="${root}about.html">About</a><a href="${root}index.html#contact">Contact</a>
      </nav>
      <div class="nav-actions"><button class="theme-button" data-theme-toggle aria-label="Switch theme">◐</button><a class="btn btn-outline btn-sm" href="${root}login.html">Log in</a><a class="btn btn-primary btn-sm" href="${root}signup.html">Get started</a><button class="nav-toggle" aria-expanded="false" aria-controls="site-links">Menu</button></div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site-footer" id="contact"><div class="site-container"><div class="footer-grid">
      <div>${brand()}<p style="margin-top:12px;max-width:290px">Repairs Made Simple. A frontend demo connecting people with local repair professionals.</p><span class="demo-tag">Frontend demo</span></div>
      <div><b>Explore</b><div class="footer-links"><a href="${root}services.html">Services</a><a href="${root}about.html">About Fixup</a><a href="${root}signup.html">Join as a mechanic</a></div></div>
      <div><b>Get started</b><div class="footer-links"><a href="${root}login.html">Log in</a><a href="${root}signup.html">Create account</a><a href="${root}user/ask-us.html">Help & support</a></div></div>
      <div><b>Information</b><div class="footer-links"><a href="${root}about.html#privacy">Privacy (demo)</a><a href="${root}about.html#terms">Terms (demo)</a><a href="mailto:support@fixup.in">support@fixup.in</a></div></div>
    </div><div class="copyright"><span>© ${new Date().getFullYear()} Fixup. Demo experience — no real services or payments.</span><span>Made for simpler repairs.</span></div></div></footer>`;
  }
  function publicLayout(content) {
    $('#app').innerHTML = `<div class="site-shell">${header()}${content}${footer()}</div>`;
    wireCommon();
  }
  function initMotion() {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = $$('#app .hero-grid > *, #app .repair-search, #app .section-heading, #app .card-grid > .card, #app .steps-grid > *, #app .trust-panel, #app .page-head, #app .page-content > .card, #app .page-content > .content-grid, #app .page-content > .card-grid, #app .auth-aside, #app .auth-card, #app .metric-grid > .metric, #app .app-content > h1, #app .app-content > p, #app .app-content > .toolbar, #app .app-content > .form-actions, #app .app-content > .content-grid > *, #app .app-content > .card');
    if (!targets.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.motion = 'visible';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((element, index) => {
      element.style.setProperty('--motion-delay', `${Math.min(index % 6, 4) * 55}ms`);
      element.dataset.motion = 'pending';
      observer.observe(element);
    });
  }
  function wireCommon() {
    $$('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')));
    const toggle = $('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const links = $('#site-links');
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('#site-links a').forEach(link => link.addEventListener('click', () => {
        $('#site-links').classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }));
    }
    $$('[data-reset-demo]').forEach(button => button.addEventListener('click', () => {
      if (confirm('Reset Fixup demo data in this browser?')) {
        Storage.resetDemo();
        sessionStorage.removeItem('fixup_session');
        location.href = `${root}index.html`;
      }
    }));
    initMotion();
  }
  function categoryLabel(id) {
    const category = FixupConfig.serviceCategories.find(item => item.id === id);
    return category?.label || 'Other device';
  }
  function categoryOptions(selected = '') {
    return FixupConfig.serviceCategories.map(item => `<option value="${esc(item.id)}" ${item.id === selected ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
  }
  const categoryIcons = { mobile:'▯', laptop:'▱', computer:'▣', tablet:'▯', accessories:'◉', other:'⌁' };
  function mechanics() {
    return users().filter(user => user.role === 'mechanic').map(user => ({
      ...user,
      mechanic: user.mechanic || {},
      distanceKm: user.id === 'u002' ? 2.3 : user.id === 'u003' ? 3.6 : 4.7,
      price: user.mechanic?.startPrice || 299,
    }));
  }
  function mechanicCard(person) {
    const specialty = (person.mechanic.categories || []).map(categoryLabel).slice(0, 3).join(' · ');
    return `<article class="card mechanic-card"><div class="mechanic-card-head"><div class="mechanic-avatar">${esc((person.name || 'M').split(' ').map(part => part[0]).join('').slice(0,2))}</div><div><h3 style="margin:0">${esc(person.name)}</h3><div class="card-meta"><span class="stars">★ ${Number(person.mechanic.rating || 4.6).toFixed(1)}</span><span>Sample profile</span></div></div></div><p>${esc(specialty || 'Device repair')} · ${Number(person.mechanic.experience || 3)} years experience</p><div class="card-meta"><span>⌖ ${person.distanceKm} km (sample)</span><span>From ${money(person.price)}</span></div><button class="btn btn-outline btn-sm" data-select-mechanic="${esc(person.id)}">View / select</button></article>`;
  }
  function homePage() {
    const cats = FixupConfig.serviceCategories;
    publicLayout(`<main>
      <section class="hero"><div class="site-container hero-grid"><div><span class="eyebrow">YOUR LOCAL REPAIR PARTNER</span><h1>Repairs made <strong>simple.</strong></h1><p class="hero-copy">Tell us what needs fixing. Compare sample mechanic profiles and estimates, then manage your repair from one easy place.</p><div class="hero-actions"><a class="btn btn-primary" href="${root}user/repair-request.html">Repair now <span aria-hidden="true">→</span></a><a class="btn btn-outline" href="${root}services.html">Explore services</a></div><div class="trust-row"><span>Compare estimates</span><span>Choose your mechanic</span><span>Demo payment only</span></div></div>
      <div class="hero-art" aria-label="Illustration of repair service cards"><div class="hero-device" aria-hidden="true">⌁</div><div class="float-card profile"><span class="avatar">VS</span><b style="display:inline">Vikram Singh</b><small>★ 4.8 · Sample mechanic</small></div><div class="float-card booking"><b>Repair request</b><small><span class="status success">Ready to compare</span></small><small>Estimates from ₹299</small></div></div></div></section>
      <section class="site-container repair-search"><form class="search-box" id="quick-repair"><div class="field"><label for="quick-category">Device category</label><select id="quick-category" required>${categoryOptions()}</select></div><div class="field"><label for="quick-model">Model</label><input id="quick-model" placeholder="e.g. Pixel 8"></div><div class="field"><label for="quick-fault">What needs fixing?</label><input id="quick-fault" placeholder="Describe the issue"></div><button class="btn btn-primary" type="submit">Find help <span aria-hidden="true">→</span></button></form></section>
      <section class="section-pad"><div class="site-container"><div class="section-heading"><span class="eyebrow">SERVICES</span><h2>Repair help for the devices you use every day</h2><p>Choose a category to start a sample repair request.</p></div><div class="card-grid">${cats.map(cat=>`<article class="card"><div class="category-icon">${categoryIcons[cat.id] || '⌁'}</div><h3>${esc(cat.label)} repair</h3><p>Describe the issue and review nearby sample repair professionals.</p><a class="text-link" href="${root}user/repair-request.html?category=${encodeURIComponent(cat.id)}">Request a repair →</a></article>`).join('')}</div></div></section>
      <section class="section-pad section-soft" id="how-it-works"><div class="site-container"><div class="section-heading"><span class="eyebrow">HOW IT WORKS</span><h2>A clearer way to get things fixed</h2><p>You're in control at every step. Estimates and profiles shown here are sample demo data.</p></div><div class="steps-grid">${[['01','Describe your problem','Share the device details and what has gone wrong.'],['02','Compare nearby profiles','Review sample specialties, ratings and estimates.'],['03','Choose a mechanic','Pick the professional that suits your repair.'],['04','Confirm your booking','Review the estimate and confirm a simulated booking.']].map(([n,title,copy])=>`<article class="card step-card"><div class="step-num">${n}</div><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></div></section>
      <section class="section-pad"><div class="site-container"><div class="section-heading"><span class="eyebrow">SAMPLE PROFILES</span><h2>Meet local repair professionals</h2><p>These are fictional demonstration profiles, not verified or currently available providers.</p></div><div class="card-grid">${mechanics().slice(0,3).map(mechanicCard).join('')}</div><div style="text-align:center;margin-top:24px"><a class="btn btn-outline" href="${root}user/mechanics.html">Browse sample mechanics</a></div></div></section>
      <section class="section-pad section-soft"><div class="site-container"><div class="trust-panel"><div><span class="eyebrow">A MORE INFORMED REPAIR</span><h2 style="margin:16px 0">Know what to expect before work begins.</h2><p>Review a mechanic's sample profile, confirm the proposed estimate before booking, and follow demo booking updates in your dashboard. Need help? You can submit a local demo support request.</p><a href="${root}about.html" class="text-link">How Fixup works →</a></div><div class="card"><h3>Before you confirm</h3><p>• Ask questions about the estimate and parts.</p><p>• Agree on final scope and price after inspection.</p><p>• Demo payments do not process money.</p><p>• No live tracking or real provider notification is connected.</p></div></div></div></section>
      <section class="section-pad"><div class="site-container"><div class="section-heading"><span class="eyebrow">SAMPLE STORIES</span><h2>Designed around less repair stress</h2><p>Illustrative placeholder quotes — these are not genuine customer testimonials.</p></div><div class="card-grid"><article class="card"><div class="stars">★★★★★</div><p>“A helpful example of how comparing repair estimates could feel.”</p><b>Sample customer · fictional</b></article><article class="card"><div class="stars">★★★★★</div><p>“The booking steps make it easy to understand what happens next.”</p><b>Sample customer · fictional</b></article><article class="card"><div class="stars">★★★★☆</div><p>“I like being able to review a mechanic profile before choosing.”</p><b>Sample customer · fictional</b></article></div></div></section>
      <section class="section-pad section-soft"><div class="site-container"><div class="section-heading"><span class="eyebrow">FAQ</span><h2>Questions, answered</h2></div><div class="faq">${[['How does Fixup work?','Describe the device issue, compare sample mechanic profiles, review an estimate and confirm a demo booking.'],['How do I request a repair?','Use Repair now, provide device details and a manual service area, then choose a mechanic. Location is optional and requested only if you choose to use it.'],['How are mechanics selected?','You can compare the sample profile details and choose one. No live matching or provider availability is connected in this demo.'],['How are prices confirmed?','The displayed figure is an estimate. Discuss the final scope and price with a provider before work begins.'],['How does payment work?','Payment is only simulated in this frontend. No card or bank details are collected and no money is moved.'],['How are cancellations handled?','For this demo, you can cancel an unstarted booking from its details page. No real provider is notified.']].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>
    </main>`);
    const form = $('#quick-repair');
    form?.addEventListener('submit', event => {
      event.preventDefault();
      const draft = { category:$('#quick-category').value, model:$('#quick-model').value.trim(), fault:$('#quick-fault').value.trim() };
      save('booking_draft', draft);
      location.href = `${root}user/repair-request.html`;
    });
    $$('[data-select-mechanic]').forEach(button => button.addEventListener('click', () => {
      save('booking_draft', { ...store('booking_draft', {}), preferredMechanicId:button.dataset.selectMechanic });
      location.href = `${root}user/repair-request.html`;
    }));
  }
  function aboutPage() {
    publicLayout(`<main class="site-container"><div class="page-head"><span class="eyebrow">ABOUT FIXUP</span><h1>Repair help, made easier to navigate.</h1><p>Fixup is a concept for a location-based repair marketplace that helps customers compare repair professionals and organize a booking.</p></div><div class="page-content"><div class="content-grid"><article class="card"><h2>Our mission</h2><p>Make it easier for people to understand repair options and connect with nearby independent professionals.</p></article><article class="card"><h2>Our vision</h2><p>A practical repair experience built around clear information, choice and convenient service coordination.</p></article></div><div class="card" style="margin-top:18px"><h2>How the concept works</h2><p>Customers describe their device issue, review mechanic profiles and estimates, and confirm a booking. Mechanics can manage sample requests and profile information. This version runs entirely in your browser and does not connect to real providers.</p></div><div class="card-grid" style="margin-top:18px"><article class="card"><h3>For customers</h3><p>Compare sample profiles, track demo bookings and keep request details together.</p></article><article class="card"><h3>For mechanics</h3><p>Explore a simulated request dashboard, profile controls and membership checkout.</p></article><article class="card"><h3>Contact</h3><p>Placeholder contact: <a href="mailto:support@fixup.in">support@fixup.in</a>. No staffed support team is connected.</p></article></div><div class="card" id="privacy" style="margin-top:18px"><h3>Privacy & terms (demo)</h3><p>This static frontend stores demo state in localStorage on this device. Do not enter real personal or payment information. A production service needs published privacy and service terms.</p><p id="terms">No company registration, physical address, or real provider network is represented by this concept.</p></div></div></main>`);
  }
  function servicesPage() {
    publicLayout(`<main class="site-container"><div class="page-head"><span class="eyebrow">REPAIR CATEGORIES</span><h1>What needs fixing?</h1><p>Start a demo request for common device categories. Profiles and prices are sample data only.</p></div><div class="page-content"><div class="card-grid">${FixupConfig.serviceCategories.map(item=>`<article class="card"><div class="category-icon">${categoryIcons[item.id]||'⌁'}</div><h3>${esc(item.label)} repair</h3><p>Share a few details to see matching sample mechanics and estimates.</p><a class="btn btn-outline btn-sm" style="margin-top:14px" href="${root}user/repair-request.html?category=${encodeURIComponent(item.id)}">Start a request</a></article>`).join('')}</div></div></main>`);
  }

  function loginPage() {
    const accounts = FixupConfig.demoAccounts.filter(account => account.role !== 'admin');
    $('#app').innerHTML = `<main class="auth-wrap"><aside class="auth-aside">${brand()}<div><span class="eyebrow" style="background:rgba(255,255,255,.16);color:#fff">REPAIRS MADE SIMPLE</span><h1>Good to see you again.</h1><p>Manage repair requests and demo bookings from one place.</p></div><p class="auth-aside-foot">Demo experience only · No real authentication</p></aside><section class="auth-main"><div class="auth-card"><a class="text-link" href="./index.html">← Back to Fixup</a><h2>Welcome back</h2><p>Sign in to your demo account.</p><div class="role-options"><button class="role-choice selected" data-role="user">Customer</button><button class="role-choice" data-role="mechanic">Mechanic</button></div><form class="auth-form" id="login-form"><div class="field"><label for="login-mobile">Mobile number</label><input id="login-mobile" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" required></div><div class="field"><label for="login-password">Password</label><div style="display:flex;gap:8px"><input id="login-password" type="password" autocomplete="current-password" required><button class="btn btn-outline btn-sm" type="button" id="toggle-login-password" aria-label="Show password">Show</button></div></div><div style="display:flex;justify-content:space-between;align-items:center"><label style="display:flex;gap:8px;align-items:center;font-size:13px;color:var(--color-text-secondary)"><input type="checkbox" id="remember-me"> Remember on this device</label><button type="button" class="text-link" id="forgot-password" style="border:0;background:none;cursor:pointer">Forgot password?</button></div><button class="btn btn-primary" type="submit">Log in</button></form><p style="margin-top:16px;font-size:13px">New to Fixup? <a href="./signup.html">Create an account</a></p><div class="notice"><b>Demo accounts</b>${accounts.map(account=>`<div style="margin-top:7px">${esc(account.role)}: ${esc(account.mobile)} / Demo@123 <button class="text-link" type="button" data-fill="${esc(account.role)}" style="margin:0 0 0 6px">Use</button></div>`).join('')}<small style="display:block;margin-top:7px">Demo credentials only. Never reuse a real password.</small></div><button class="btn btn-outline btn-sm" data-reset-demo style="margin-top:12px">Reset demo data</button><p><button class="text-link" id="admin-demo" style="border:0;background:none;cursor:pointer">Open admin demo dashboard</button></p></div></section></main>`;
    let role = 'user';
    $$('[data-role]').forEach(button=>button.addEventListener('click',()=>{$$('[data-role]').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');role=button.dataset.role;}));
    $('#toggle-login-password').addEventListener('click',event=>{const input=$('#login-password'),show=input.type==='password';input.type=show?'text':'password';event.currentTarget.textContent=show?'Hide':'Show';event.currentTarget.setAttribute('aria-label',`${show?'Hide':'Show'} password`);});
    $('#forgot-password').addEventListener('click',()=>toast('Password reset is not connected in this frontend demo.'));
    $$('[data-fill]').forEach(button=>button.addEventListener('click',()=>{const account=FixupConfig.demoAccounts.find(item=>item.role===button.dataset.fill);$('#login-mobile').value=account.mobile;$('#login-password').value=account.password;role=account.role;$$('[data-role]').forEach(item=>item.classList.toggle('selected',item.dataset.role===role));}));
    $('#admin-demo').addEventListener('click',()=>{
      const admin=users().find(item=>item.role==='admin');
      if(!admin){toast('Admin demo account is unavailable. Reset demo data and try again.');return;}
      save('session',{userId:admin.id,role:'admin',name:admin.name,mobile:admin.mobile,loggedInAt:new Date().toISOString(),demo:true});
      location.href='./admin/dashboard.html';
    });
    $('#login-form').addEventListener('submit',event=>{
      event.preventDefault();
      const mobile=$('#login-mobile').value.replace(/\D/g,''); const password=$('#login-password').value;
      if(!/^[6-9]\d{9}$/.test(mobile)){toast('Enter a valid 10-digit Indian mobile number.');return;}
      const user=users().find(item=>item.mobile===mobile&&(item.password===password||(!item.password&&password==='Demo@123'))&&item.role===role);
      if(!user){toast('Those demo credentials do not match the selected role.');return;}
      const signedIn={userId:user.id,role:user.role,name:user.name,mobile:user.mobile,loggedInAt:new Date().toISOString()};
      if($('#remember-me').checked){sessionStorage.removeItem('fixup_session');save('session',signedIn);}
      else {Storage.remove('session');sessionStorage.setItem('fixup_session',JSON.stringify(signedIn));}
      location.href=user.role==='mechanic'?'./mechanic/dashboard.html':'./user/dashboard.html';
    });
    wireCommon();
  }
  function signupPage() {
    $('#app').innerHTML=`<main class="auth-wrap"><aside class="auth-aside">${brand()}<div><span class="eyebrow" style="background:rgba(255,255,255,.16);color:#fff">GET STARTED</span><h1>Make repair days a little easier.</h1><p>Create a demo account in a few steps.</p></div><p class="auth-aside-foot">OTP and payment steps are simulated in this browser.</p></aside><section class="auth-main"><div class="auth-card"><a class="text-link" href="./index.html">← Back to Fixup</a><h2>Create your account</h2><p>Choose how you would like to use Fixup.</p><form class="auth-form" id="signup-form"><div class="role-options"><button type="button" class="role-choice selected" data-signup-role="user">Customer</button><button type="button" class="role-choice" data-signup-role="mechanic">Mechanic</button></div><div class="field"><label for="signup-name">Full name</label><input id="signup-name" autocomplete="name" required></div><div class="field"><label for="signup-mobile">Mobile number</label><input id="signup-mobile" inputmode="numeric" maxlength="10" required><button class="btn btn-outline btn-sm" type="button" id="send-otp">Send demo OTP</button></div><div class="field hidden" id="otp-field"><label for="signup-otp">Demo OTP</label><input id="signup-otp" inputmode="numeric" maxlength="6" placeholder="123456"><small>Simulated only — use demo OTP 123456.</small></div><div class="field"><label for="signup-password">Create password</label><input id="signup-password" type="password" minlength="6" autocomplete="new-password" required></div><div class="field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" minlength="6" autocomplete="new-password" required></div><label style="display:flex;gap:8px;align-items:flex-start;font-size:12px"><input type="checkbox" required> I understand this is a local demo and not a real account service.</label><button class="btn btn-primary" id="create-account">Create demo account</button></form><p class="notice">The password you enter here is checked in this form, then discarded. For future demo logins use the demo password <b>Demo@123</b>. Never enter a real password.</p><div class="notice hidden" id="mechanic-plan"><h3>Mechanic membership · ₹299 / 30 days</h3><p>Request management, profile visibility and earnings overview. Demo checkout only; no payment is processed.</p><button class="btn btn-primary btn-sm" id="activate-plan">Simulate membership payment</button></div><p style="margin-top:15px;font-size:13px">Already registered? <a href="./login.html">Log in</a></p></div></section></main>`;
    let role='user'; let otpSent=false;
    $$('[data-signup-role]').forEach(button=>button.addEventListener('click',()=>{$$('[data-signup-role]').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');role=button.dataset.signupRole;}));
    $('#send-otp').addEventListener('click',()=>{
      const mobile=$('#signup-mobile').value.trim();
      if(!/^[6-9]\d{9}$/.test(mobile)){toast('Enter a valid 10-digit Indian mobile number first.');return;}
      if(users().some(user=>user.mobile===mobile)){toast('That number already has a demo account. Please log in.');return;}
      otpSent=true;$('#otp-field').classList.remove('hidden');toast('Demo OTP is 123456. No SMS was sent.');
    });
    $('#signup-form').addEventListener('submit',event=>{
      event.preventDefault();
      const mobile=$('#signup-mobile').value.trim(), password=$('#signup-password').value;
      if(!otpSent||$('#signup-otp').value!=='123456'){toast('Send and enter the simulated OTP 123456.');return;}
      if(password.length<6||password!==$('#signup-confirm').value){toast('Use at least 6 characters and make both passwords match.');return;}
      const id=`u${Date.now()}`;
      const user={id,mobile,role,name:$('#signup-name').value.trim(),email:'',gender:'',address:{house:'',street:'',landmark:'',city:'',state:'',pin:''},prefs:{notifications:true,theme:store('theme','light')},createdAt:new Date().toISOString()};
      if(role==='mechanic')user.mechanic={categories:['mobile'],experience:0,radius:5,rating:0,reviewCount:0,available:false,startPrice:299,workingHours:'9 AM – 6 PM',subscription:{active:false}};
      const all=users();all.push(user);save('users',all);
      if(role==='mechanic'){save('pending_signup_session',{userId:id,role,name:user.name,mobile});$('#signup-form').classList.add('hidden');$('#mechanic-plan').classList.remove('hidden');}
      else {save('session',{userId:id,role,name:user.name,mobile});location.href='./user/dashboard.html';}
    });
    $('#activate-plan').addEventListener('click',()=>{
      const pending=store('pending_signup_session',null);if(!pending)return;
      const all=users();const user=all.find(item=>item.id===pending.userId);if(user){const now=new Date();user.mechanic.subscription={active:true,startDate:now.toISOString(),expiryDate:new Date(now.getTime()+30*86400000).toISOString(),plan:'monthly'};save('users',all);}
      save('session',pending);Storage.remove('pending_signup_session');location.href='./mechanic/dashboard.html';
    });
    wireCommon();
  }

  const userNav=[['user/dashboard.html','Overview','⌂'],['user/repair-status.html','Repair status','◷'],['user/payment-history.html','Payments','₹'],['user/personal-details.html','Personal details','○'],['user/ask-us.html','Help & support','?']];
  const mechNav=[['mechanic/dashboard.html','Overview','⌂'],['mechanic/requests.html','New requests','＋'],['mechanic/active-repairs.html','Active repairs','◷'],['mechanic/completed-repairs.html','Completed','✓'],['mechanic/earnings.html','Earnings','₹'],['mechanic/payment-history.html','Payment history','▤'],['mechanic/reviews.html','Ratings & reviews','★'],['mechanic/personal-details.html','Profile','○'],['mechanic/subscription.html','Membership','◇'],['mechanic/help.html','Help & support','?']];
  function enterDemoRole(role) {
    if(session()?.role===role) return getCurrentUser();
    const user=getDemoUser(role);
    if(!user)return null;
    save('session',{userId:user.id,role:user.role,name:user.name,mobile:user.mobile,loggedInAt:new Date().toISOString(),demo:true});
    return user;
  }
  function appShell(role, activePage, title, content) {
    const user=enterDemoRole(role);
    if(!user){$('#app').innerHTML=`<main class="site-container page-head"><h1>Demo account unavailable</h1><a href="../login.html">Log in</a></main>`;return;}
    const nav=role==='mechanic'?mechNav:userNav;
    $('#app').innerHTML=`<div class="app-layout"><aside class="app-sidebar" id="app-sidebar"><div class="sidebar-brand">${brand()}</div><div class="sidebar-label">${role==='mechanic'?'Mechanic workspace':'Customer space'} · Demo</div><nav class="sidebar-links" aria-label="Dashboard navigation">${nav.map(([href,label,icon])=>`<a href="${root}${href}" class="${currentPath.endsWith(href.split('/').pop())?'active':''}"><span aria-hidden="true">${icon}</span>${label}</a>`).join('')}</nav><div class="sidebar-bottom"><div style="font-weight:700;font-size:14px">${esc(user.name)}</div><small style="color:var(--color-text-muted)">${role==='mechanic'?'Sample mechanic':'Demo customer'} account</small><button class="text-link" data-logout style="border:0;background:none;cursor:pointer">Log out</button><button class="text-link" data-reset-demo style="border:0;background:none;cursor:pointer;margin-left:10px">Reset demo</button></div></aside><main class="app-main"><header class="app-topbar"><div class="topbar-actions"><button class="icon-button" id="sidebar-toggle" aria-label="Open navigation">☰</button><b>${esc(title)}</b></div><div class="topbar-actions"><span class="demo-tag">DEMO MODE</span><div style="position:relative"><button class="icon-button" id="notifications-toggle" aria-expanded="false" aria-label="Notifications">♧ <span id="unread-count"></span></button><div class="card hidden" id="notification-panel" style="position:absolute;right:0;top:48px;width:min(340px,88vw);z-index:220;box-shadow:var(--site-shadow)"></div></div><button class="theme-button" data-theme-toggle aria-label="Switch theme">◐</button><span class="avatar">${esc((user.name||'U').split(' ').map(part=>part[0]).join('').slice(0,2))}</span></div></header><section class="app-content"><div class="notice" role="note">Frontend demonstration only. Profiles, availability, requests and financial amounts are sample data; nothing is sent to real providers.</div>${content}</section></main></div>`;
    wireCommon();
    $('#sidebar-toggle')?.addEventListener('click',()=>$('#app-sidebar').classList.toggle('open'));
    $('[data-logout]')?.addEventListener('click',()=>{Storage.remove('session');sessionStorage.removeItem('fixup_session');location.href=`${root}login.html`;});
    const notificationButton=$('#notifications-toggle'),panel=$('#notification-panel');
    const renderNotifications=()=>{
      const notifications=store('notifications',[]).filter(item=>!item.userId||item.userId===user.id);
      const unread=notifications.filter(item=>!item.read).length;
      $('#unread-count').textContent=unread?` ${unread}`:'';
      panel.innerHTML=`<h3 style="font-size:16px">Notifications <button class="text-link" id="mark-all-read" style="float:right;border:0;background:none;cursor:pointer">Mark all read</button></h3>${notifications.length?notifications.slice(0,6).map(item=>`<div class="list-row"><div><b style="font-size:13px">${esc(item.title)}</b><p style="font-size:12px">${esc(item.desc)}</p></div>${item.read?'':`<button class="btn btn-outline btn-sm" data-read="${esc(item.id)}">Read</button>`}</div>`).join(''):'<p style="margin-top:12px">No demo notifications.</p>'}`;
      $$('[data-read]',panel).forEach(button=>button.addEventListener('click',()=>{const all=store('notifications',[]),item=all.find(value=>value.id===button.dataset.read);if(item)item.read=true;save('notifications',all);renderNotifications();}));
      $('#mark-all-read',panel)?.addEventListener('click',()=>{const all=store('notifications',[]);all.filter(item=>!item.userId||item.userId===user.id).forEach(item=>item.read=true);save('notifications',all);renderNotifications();});
    };
    renderNotifications();
    notificationButton?.addEventListener('click',()=>{const open=panel.classList.toggle('hidden')===false;notificationButton.setAttribute('aria-expanded',String(open));});
    return user;
  }
  function userDashboard() {
    const user=enterDemoRole('user');const bookings=store('bookings',[]).filter(booking=>booking.userId===user?.id);
    const active=bookings.find(booking=>!['completed','cancelled'].includes(booking.status));
    const recent=bookings.slice(0,4);
    const content=`<h1>Welcome, ${esc((user?.name||'there').split(' ')[0])}</h1><p>Keep your repair plans and updates in one place.</p><div class="metric-grid"><div class="metric"><span>Total demo bookings</span><strong>${bookings.length}</strong></div><div class="metric"><span>In progress</span><strong>${bookings.filter(item=>item.status==='active').length}</strong></div><div class="metric"><span>Completed</span><strong>${bookings.filter(item=>item.status==='completed').length}</strong></div><div class="metric"><span>Demo account</span><strong>Active</strong></div></div><div class="form-actions"><a class="btn btn-primary" href="../user/repair-request.html">＋ Request a repair</a><a class="btn btn-outline" href="../user/mechanics.html">Browse mechanics</a></div><div class="content-grid" style="margin-top:22px"><article class="card"><h2 style="font-size:19px">Current repair</h2>${active?bookingRow(active):`<div class="empty-state"><div class="category-icon">⌁</div><h3>No active booking</h3><p>Start a repair request to compare sample mechanics.</p></div>`}</article><article class="card"><h2 style="font-size:19px">Quick actions</h2><div class="footer-links"><a href="../user/repair-status.html">Review repair status →</a><a href="../user/payment-history.html">See payment history →</a><a href="../user/ask-us.html">Contact demo support →</a><a href="../user/personal-details.html">Update profile →</a></div></article></div><article class="card" style="margin-top:18px"><div class="list-row"><h2 style="font-size:19px">Recent demo repairs</h2><a href="../user/repair-status.html">View all →</a></div>${recent.length?recent.map(bookingRow).join(''):'<p>No repair records yet.</p>'}</article>`;
    appShell('user','user-dashboard','Your dashboard',content);
  }
  function bookingRow(booking) {
    return `<div class="list-row"><div><h3>${esc(booking.device?.model||categoryLabel(booking.device?.category))}</h3><p>${esc(booking.id)} · ${when(booking.createdAt)} · ${esc(booking.mechanicName||'Mechanic pending')}</p></div><div><span class="status ${booking.status==='completed'?'success':'warning'}">${esc(booking.status)}</span><div style="margin-top:7px;font-weight:700">${money(booking.total||booking.estimate)}</div></div><a class="text-link" href="../user/booking-details.html?id=${encodeURIComponent(booking.id)}">Details</a></div>`;
  }
  function repairRequestPage() {
    const draft=store('booking_draft',{});
    const selected=new URLSearchParams(location.search).get('category')||draft.category||'';
    const content=`<h1>Request a repair</h1><p>Share device details and a service area. Sample profile matching uses fictional distances, not live location.</p><div class="stepper"><span class="active">1 · Device</span><span>2 · Location</span><span>3 · Compare</span><span>4 · Confirm</span></div><form id="request-form" class="card"><div class="form-grid"><div class="field"><label for="request-category">Device category *</label><select id="request-category" required><option value="">Choose category</option>${categoryOptions(selected)}</select></div><div class="field"><label for="request-model">Device model</label><input id="request-model" value="${esc(draft.model||'')}" placeholder="e.g. Samsung Galaxy S23"></div><div class="field" style="grid-column:1/-1"><label for="request-fault">Describe the issue</label><textarea id="request-fault" placeholder="What is happening with your device?">${esc(draft.fault||'')}</textarea></div><div class="field"><label for="request-photo">Optional photo (image up to 5 MB)</label><input type="file" id="request-photo" accept="image/png,image/jpeg,image/webp"><div id="photo-preview"></div></div><div class="field"><label>Service location</label><p>Share an approximate area so you can compare sample options. This demo does not perform real geographic matching.</p><button class="btn btn-outline btn-sm" type="button" id="use-location">Use my current location</button><small id="location-result"></small></div><div class="field"><label for="request-address">Address / area *</label><input id="request-address" value="${esc(draft.address||'')}" placeholder="Street or neighborhood" required></div><div class="field"><label for="request-city">City *</label><input id="request-city" value="${esc(draft.city||'Bengaluru')}" required></div><div class="field"><label for="request-pin">PIN code *</label><input id="request-pin" value="${esc(draft.pin||'')}" inputmode="numeric" maxlength="6" required></div></div><p class="notice">You can enter a general service area. Avoid sharing sensitive address details in this frontend demo.</p><div class="form-actions"><button class="btn btn-primary" type="submit">Find sample mechanics →</button><a class="btn btn-outline" href="../user/dashboard.html">Cancel</a></div></form>`;
    appShell('user','repair-request','Repair request',content);
    $('#use-location')?.addEventListener('click',()=>{
      const output=$('#location-result');
      if(!navigator.geolocation){output.textContent='Location is not supported here. Please enter the area manually.';return;}
      output.textContent='Waiting for your browser permission…';
      navigator.geolocation.getCurrentPosition(position=>{output.textContent=`Location permission granted (approx. ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}). Demo matching still uses sample distances.`;},()=>{output.textContent='Location was not shared. Please enter your area manually.';},{timeout:8000});
    });
    $('#request-photo')?.addEventListener('change',event=>{
      const file=event.target.files?.[0];const preview=$('#photo-preview');if(!file)return;
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){event.target.value='';preview.textContent='Choose PNG, JPG or WebP under 5 MB.';return;}
      const image=document.createElement('img');image.alt='Selected device preview';image.style='max-width:150px;max-height:120px;border-radius:8px;margin-top:8px';image.src=URL.createObjectURL(file);preview.replaceChildren(image);
    });
    $('#request-form')?.addEventListener('submit',event=>{
      event.preventDefault();
      const draftData={...store('booking_draft',{}),category:$('#request-category').value,model:$('#request-model').value.trim(),fault:$('#request-fault').value.trim(),address:$('#request-address').value.trim(),city:$('#request-city').value.trim(),pin:$('#request-pin').value.trim()};
      if(!draftData.category||!draftData.address||!draftData.city||!/^\d{6}$/.test(draftData.pin)){toast('Choose a category and enter your area, city and valid 6-digit PIN.');return;}
      save('booking_draft',draftData);location.href='../user/mechanics.html';
    });
  }
  function mechanicsPage() {
    const draft=store('booking_draft',{});
    const content=`<h1>Compare sample mechanics</h1><p>These demonstration profiles are not verified providers. Distances are illustrative and do not use your location.</p><div class="toolbar"><input id="mechanic-search" placeholder="Search name or specialty" aria-label="Search mechanics"><select id="mechanic-category" aria-label="Filter by category"><option value="">All services</option>${categoryOptions()}</select><select id="mechanic-sort" aria-label="Sort mechanics"><option value="distance">Nearest sample distance</option><option value="rating">Highest rating</option><option value="price">Lowest estimate</option></select></div><div class="notice">Request: ${esc(draft.model||categoryLabel(draft.category)||'Device')} · ${esc(draft.fault||'Issue details to be discussed')} · ${esc(draft.city||'Bengaluru')} (sample matching within 5 km)</div><div id="mechanic-list" class="card-grid"></div><a class="text-link" href="../user/repair-request.html">← Edit request details</a>`;
    appShell('user','mechanics','Nearby sample mechanics',content);
    const render=()=>{
      const term=$('#mechanic-search').value.toLowerCase(),category=$('#mechanic-category').value,sort=$('#mechanic-sort').value;
      let list=mechanics().filter(person=>(person.mechanic.available!==false)&&person.distanceKm<=5&&(!category||(person.mechanic.categories||[]).includes(category))&&(`${person.name} ${(person.mechanic.categories||[]).map(categoryLabel).join(' ')}`.toLowerCase().includes(term)));
      list.sort((a,b)=>sort==='rating'?(b.mechanic.rating||0)-(a.mechanic.rating||0):sort==='price'?a.price-b.price:a.distanceKm-b.distanceKm);
      if(store('booking_draft',{}).preferredMechanicId){list.sort((a,b)=>a.id===store('booking_draft',{}).preferredMechanicId?-1:b.id===store('booking_draft',{}).preferredMechanicId?1:0);}
      const target=$('#mechanic-list');
      target.innerHTML=list.length?list.map(mechanicCard).join(''):`<div class="card empty-state"><h3>No sample mechanics match</h3><p>Try another category or search term.</p></div>`;
      $$('[data-select-mechanic]',target).forEach(button=>button.addEventListener('click',()=>{const draft=store('booking_draft',{});delete draft.preferredMechanicId;save('booking_draft',{...draft,mechanicId:button.dataset.selectMechanic});location.href='../user/booking-details.html';}));
    };
    ['#mechanic-search','#mechanic-category','#mechanic-sort'].forEach(selector=>$(selector)?.addEventListener('input',render));
    render();
  }
  function bookingDetailsPage() {
    const draft=store('booking_draft',{});
    const mechanic=mechanics().find(item=>item.id===draft.mechanicId);
    const bookingId=new URLSearchParams(location.search).get('id');
    const existing=store('bookings',[]).find(item=>item.id===bookingId);
    let content;
    if(existing) {
      content=`<h1>Booking ${esc(existing.id)}</h1><p>Your demo booking details and status timeline.</p><article class="card"><div class="list-row"><div><h3>${esc(existing.device?.model||categoryLabel(existing.device?.category))}</h3><p>${esc(existing.device?.fault||'Repair request')}</p></div><span class="status ${existing.status==='completed'?'success':'warning'}">${esc(existing.status)}</span></div><div class="form-grid"><p><b>Mechanic</b><br>${esc(existing.mechanicName||'Pending')}</p><p><b>Estimate</b><br>${money(existing.total||existing.estimate)}</p><p><b>Service area</b><br>${esc(existing.location?.city||'')}</p><p><b>Created</b><br>${when(existing.createdAt)}</p></div><p class="notice">Demo booking only. No mechanic has been notified.</p><a class="btn btn-outline" href="../user/repair-status.html">All repair status</a></article>`;
    } else if(!mechanic) {
      content=`<h1>Choose a mechanic first</h1><p>Complete your request and compare the sample profiles before confirming.</p><a class="btn btn-primary" href="../user/repair-request.html">Start repair request</a>`;
    } else if(!draft.category||!draft.address||!draft.city||!/^\d{6}$/.test(draft.pin||'')) {
      content=`<h1>Complete repair details</h1><p>Add your device category and general service area before reviewing this sample mechanic.</p><a class="btn btn-primary" href="../user/repair-request.html">Add repair details</a>`;
    } else {
      const estimate=draft.estimate||mechanic.price;
      content=`<h1>Review your booking</h1><p>Confirm the sample mechanic and estimated repair amount.</p><div class="stepper"><span>✓ Device</span><span>✓ Compare</span><span class="active">3 · Confirm</span></div><article class="card"><div class="list-row"><div><h3>${esc(mechanic.name)}</h3><p>${esc((mechanic.mechanic.categories||[]).map(categoryLabel).join(' · '))} · Sample profile</p></div><div class="stars">★ ${Number(mechanic.mechanic.rating||4.6).toFixed(1)}</div></div><div class="form-grid"><p><b>Device</b><br>${esc(draft.model||categoryLabel(draft.category))}</p><p><b>Issue</b><br>${esc(draft.fault||'To be discussed with mechanic')}</p><p><b>Service area</b><br>${esc(draft.address||'')} · ${esc(draft.city||'')} ${esc(draft.pin||'')}</p><p><b>Estimated price</b><br><span style="font-size:22px;font-weight:800">${money(estimate)}</span></p></div><div class="notice">This is an estimate for demonstration only. Agree on the final scope and price with a provider before any repair work. No card or bank details are requested.</div><button class="btn btn-primary" id="confirm-booking">Confirm demo booking · ${money(estimate)}</button> <a class="btn btn-outline" href="../user/mechanics.html">Change mechanic</a></article>`;
    }
    appShell('user','booking-details','Booking details',content);
    $('#confirm-booking')?.addEventListener('click',()=>{
      const user=getCurrentUser()||getDemoUser('user'),id=`BK-DEMO-${Date.now().toString().slice(-7)}`,estimate=draft.estimate||mechanic.price,now=new Date().toISOString();
      const booking={id,userId:user.id,mechanicId:mechanic.id,mechanicName:mechanic.name,device:{category:draft.category,model:draft.model,fault:draft.fault},location:{address:draft.address,city:draft.city,pin:draft.pin},estimate,total:estimate,platformFee:0,status:'active',timeline:[{step:'request_sent',label:'Request Sent',time:now,done:true},{step:'booking_confirmed',label:'Booking Confirmed',time:now,done:true}],paymentStatus:'demo',paymentMethod:'Simulated demo payment',transactionId:`TXN-DEMO-${Date.now().toString().slice(-7)}`,createdAt:now};
      const all=store('bookings',[]);all.unshift(booking);save('bookings',all);
      const transactions=store('transactions',[]);transactions.unshift({id:booking.transactionId,bookingId:id,userId:user.id,mechanicName:mechanic.name,amount:estimate,method:'Demo payment',status:'simulated',refundStatus:'none',createdAt:now});save('transactions',transactions);
      save('notifications',[{id:`n${Date.now()}`,userId:user.id,title:'Demo booking confirmed',desc:`Booking ${id} is saved on this device.`,type:'success',read:false,createdAt:now},...store('notifications',[])]);
      Storage.remove('booking_draft');location.href=`../user/booking-details.html?id=${encodeURIComponent(id)}`;
    });
  }
  function statusPage() {
    const user=enterDemoRole('user'), filter=new URLSearchParams(location.search).get('status')||'all';
    const bookings=store('bookings',[]).filter(item=>item.userId===user?.id);
    const visible=filter==='all'?bookings:bookings.filter(item=>item.status===filter);
    const content=`<h1>Repair status</h1><p>Follow your local demo booking records. This is not live provider tracking.</p><div class="toolbar">${['all','active','completed','cancelled'].map(item=>`<a class="btn ${filter===item?'btn-primary':'btn-outline'} btn-sm" href="../user/repair-status.html?status=${item}">${item[0].toUpperCase()+item.slice(1)}</a>`).join('')}</div><article class="card">${visible.length?visible.map(booking=>`<div>${bookingRow(booking)}<div class="stepper">${(booking.timeline||[]).map(step=>`<span class="${step.done?'active':''}">${esc(step.label)}</span>`).join('')}</div>${booking.status==='active'?`<button class="btn btn-outline btn-sm" data-progress="${esc(booking.id)}">Advance demo status</button> <button class="btn btn-danger btn-sm" data-cancel="${esc(booking.id)}">Cancel</button>`:''}</div>`).join(''):`<div class="empty-state"><h3>No ${filter==='all'?'':filter} demo bookings</h3><p>Your repair bookings will appear here.</p><a class="btn btn-primary" href="../user/repair-request.html">Request a repair</a></div>`}</article>`;
    appShell('user','repair-status','Repair status',content);
    $$('[data-progress]').forEach(button=>button.addEventListener('click',()=>{
      const all=store('bookings',[]),item=all.find(entry=>entry.id===button.dataset.progress);if(!item)return;
      const states=['Mechanic on the Way','Repairing Started','Repair Completed'],next=states.find(label=>!(item.timeline||[]).some(step=>step.label===label&&step.done));
      if(!next){item.status='completed';item.completedAt=new Date().toISOString();}
      else {item.timeline.push({step:next.toLowerCase().replaceAll(' ','_'),label:next,time:new Date().toISOString(),done:true});if(next==='Repair Completed'){item.status='completed';item.completedAt=new Date().toISOString();}}
      save('bookings',all);location.reload();
    }));
    $$('[data-cancel]').forEach(button=>button.addEventListener('click',()=>{
      const all=store('bookings',[]),item=all.find(entry=>entry.id===button.dataset.cancel);if(item){item.status='cancelled';save('bookings',all);location.reload();}
    }));
  }
  function paymentsPage() {
    const user=enterDemoRole('user'),records=store('transactions',[]).filter(item=>item.userId===user?.id);
    const rows=records.map(txn=>`<tr><td>${esc(txn.id)}</td><td>${when(txn.createdAt)}</td><td>${esc(txn.mechanicName||'Sample mechanic')}</td><td>${esc(txn.bookingId)}</td><td>${money(txn.amount)}</td><td>${esc(txn.method)}</td><td><span class="status warning">${esc(txn.status)}</span></td></tr>`).join('');
    appShell('user','payment-history','Payment history',`<h1>Payment history</h1><p>All entries here are simulated demo records. No money has moved.</p><article class="card"><div class="toolbar"><input id="payment-search" placeholder="Search transaction or booking" aria-label="Search payments"><button class="btn btn-outline btn-sm" id="print-receipt">Print / save receipt</button></div><div class="table-wrap"><table><thead><tr><th>Transaction</th><th>Date</th><th>Mechanic</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody id="payment-rows">${rows||'<tr><td colspan="7">No demo transactions yet.</td></tr>'}</tbody></table></div></article>`);
    $('#payment-search')?.addEventListener('input',event=>$$('#payment-rows tr').forEach(row=>row.classList.toggle('hidden',!row.textContent.toLowerCase().includes(event.target.value.toLowerCase()))));
    $('#print-receipt')?.addEventListener('click',()=>window.print());
  }
  function profilePage(role='user') {
    const user=enterDemoRole(role),mechanic=role==='mechanic',address=user?.address||{};
    const html=`<h1>${mechanic?'Mechanic profile':'Personal details'}</h1><p>Edit non-sensitive demo profile fields. Changes are saved in this browser only.</p><form class="card" id="profile-form"><div class="form-grid"><div class="field"><label for="profile-name">Full name *</label><input id="profile-name" value="${esc(user?.name)}" required></div><div class="field"><label for="profile-mobile">Mobile number</label><input id="profile-mobile" value="${esc(user?.mobile)}" disabled><small>Demo account identifier; not editable here.</small></div><div class="field"><label for="profile-email">Email (optional)</label><input id="profile-email" type="email" value="${esc(user?.email||'')}"></div><div class="field"><label for="profile-gender">Gender</label><select id="profile-gender"><option value="">Prefer not to say</option>${['Female','Male','Non-binary'].map(item=>`<option ${user?.gender===item?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label for="profile-house">House number</label><input id="profile-house" value="${esc(address.house||'')}"></div><div class="field"><label for="profile-street">Street / area</label><input id="profile-street" value="${esc(address.street||'')}"></div><div class="field"><label for="profile-landmark">Landmark</label><input id="profile-landmark" value="${esc(address.landmark||'')}"></div><div class="field"><label for="profile-city">City</label><input id="profile-city" value="${esc(address.city||'')}"></div><div class="field"><label for="profile-state">State</label><input id="profile-state" value="${esc(address.state||'')}"></div><div class="field"><label for="profile-pin">PIN code</label><input id="profile-pin" inputmode="numeric" maxlength="6" value="${esc(address.pin||'')}"></div>${mechanic?`<div class="field"><label for="profile-categories">Service categories</label><select id="profile-categories" multiple size="4">${FixupConfig.serviceCategories.map(item=>`<option value="${esc(item.id)}" ${(user?.mechanic?.categories||[]).includes(item.id)?'selected':''}>${esc(item.label)}</option>`).join('')}</select><small>Use Ctrl / Command to select more than one.</small></div><div class="field"><label for="profile-experience">Years of experience</label><input id="profile-experience" type="number" min="0" max="60" value="${Number(user?.mechanic?.experience||0)}"></div><div class="field"><label for="profile-radius">Service radius (km)</label><input id="profile-radius" type="number" min="1" max="100" value="${Number(user?.mechanic?.radius||5)}"></div><div class="field"><label for="profile-hours">Working hours</label><input id="profile-hours" value="${esc(user?.mechanic?.workingHours||'9 AM – 6 PM')}"></div><div class="field"><label>Demo availability</label><button type="button" class="btn btn-outline" id="availability-toggle">${user?.mechanic?.available?'Available':'Offline'} · Toggle</button></div><div class="field"><label for="profile-price">Starting estimate (₹)</label><input id="profile-price" type="number" min="1" value="${Number(user?.mechanic?.startPrice||299)}"></div>`:''}</div><div class="notice">Do not enter bank details, card numbers, PINs or real sensitive information. This demo does not need payment data.</div><div class="form-actions"><button class="btn btn-primary">Save profile</button><button type="reset" class="btn btn-outline">Reset form</button></div></form>`;
    appShell(role,mechanic?'mechanic-profile':'personal-details',mechanic?'Mechanic profile':'Personal details',html);
    $('#availability-toggle')?.addEventListener('click',event=>{const all=users(),record=all.find(item=>item.id===user.id);record.mechanic.available=!record.mechanic.available;save('users',all);event.currentTarget.textContent=`${record.mechanic.available?'Available':'Offline'} · Toggle`;toast('Demo availability updated.');});
    $('#profile-form')?.addEventListener('submit',event=>{
      event.preventDefault();const pin=$('#profile-pin').value.trim(),email=$('#profile-email').value.trim();
      if(pin&& !/^\d{6}$/.test(pin)){toast('Enter a valid 6-digit PIN code.');return;}
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Enter a valid email address.');return;}
      const all=users(),record=all.find(item=>item.id===user.id);
      Object.assign(record,{name:$('#profile-name').value.trim(),email,gender:$('#profile-gender').value,address:{...(record.address||{}),house:$('#profile-house').value.trim(),street:$('#profile-street').value.trim(),landmark:$('#profile-landmark').value.trim(),city:$('#profile-city').value.trim(),state:$('#profile-state').value.trim(),pin}});
      if(mechanic){record.mechanic={...record.mechanic,categories:Array.from($('#profile-categories').selectedOptions).map(option=>option.value),experience:Number($('#profile-experience').value),radius:Number($('#profile-radius').value)||5,workingHours:$('#profile-hours').value.trim(),startPrice:Number($('#profile-price').value)||299};}
      save('users',all);const active=session();if(active){active.name=record.name;save('session',active);}toast('Demo profile saved on this device.');
    });
  }
  function supportPage(role='user') {
    const user=enterDemoRole(role),records=store('complaints',[]).filter(item=>item.userId===user?.id);
    const categories=['Technical Issue','Payment Issue','Mechanic Issue','Booking Issue','General Question','Other'];
    const content=`<h1>Help & support</h1><p>Submit a local demo request. This form does not reach a real support team.</p><div class="content-grid"><form class="card" id="support-form"><h2 style="font-size:19px">Send a question</h2><div class="field" style="margin-top:14px"><label for="support-category">Category</label><select id="support-category">${categories.map(item=>`<option>${item}</option>`).join('')}</select></div><div class="field" style="margin-top:13px"><label for="support-subject">Subject</label><input id="support-subject" required maxlength="100"></div><div class="field" style="margin-top:13px"><label for="support-message">Message</label><textarea id="support-message" required maxlength="1500"></textarea></div><div class="field" style="margin-top:13px"><label for="support-file">Optional screenshot (up to 5 MB)</label><input id="support-file" type="file" accept="image/png,image/jpeg,image/webp"></div><button class="btn btn-primary" style="margin-top:15px">Create demo complaint</button></form><article class="card"><h2 style="font-size:19px">Your demo requests</h2>${records.length?records.map(item=>`<div class="list-row"><div><h3>${esc(item.subject)}</h3><p>${esc(item.id)} · ${when(item.createdAt)}</p></div><span class="status warning">${esc(item.status)}</span></div>`).join(''):'<p style="margin-top:14px">No support requests yet.</p>'}</article></div>`;
    appShell(role,'support','Help and support',content);
    $('#support-form')?.addEventListener('submit',event=>{
      event.preventDefault();const file=$('#support-file').files?.[0];if(file&&(!file.type.startsWith('image/')||file.size>5*1024*1024)){toast('Use an image file under 5 MB.');return;}
      const all=store('complaints',[]);all.unshift({id:`CPL-DEMO-${Date.now().toString().slice(-7)}`,userId:user.id,category:$('#support-category').value,subject:$('#support-subject').value.trim(),message:$('#support-message').value.trim(),status:'Submitted',createdAt:new Date().toISOString()});save('complaints',all);toast('Demo complaint saved on this device.');supportPage(role);
    });
  }
  function mechanicDashboard() {
    const user=enterDemoRole('mechanic'),requests=store('mechanic_requests',[]).filter(item=>item.mechanicId===user?.id),bookings=store('bookings',[]).filter(item=>item.mechanicId===user?.id);
    const subscription=user?.mechanic?.subscription||{},active=subscription.active&&new Date(subscription.expiryDate)>new Date();
    const accepted=requests.filter(item=>item.status==='accepted'),ongoing=bookings.filter(item=>item.status==='active'),completed=bookings.filter(item=>item.status==='completed');
    const content=`<h1>Welcome, ${esc((user?.name||'Mechanic').split(' ')[0])}</h1><p>Manage your sample requests and demo repair activity.</p><div class="metric-grid"><div class="metric"><span>New requests</span><strong>${requests.filter(item=>item.status==='pending').length}</strong></div><div class="metric"><span>Accepted requests</span><strong>${accepted.length}</strong></div><div class="metric"><span>Active demo repairs</span><strong>${ongoing.length}</strong></div><div class="metric"><span>Membership</span><strong>${active?'Active':'Inactive'}</strong></div></div><div class="content-grid"><article class="card"><div class="list-row"><h2 style="font-size:19px">Incoming sample requests</h2><a href="../mechanic/requests.html">View all →</a></div>${requests.filter(item=>item.status==='pending').slice(0,3).map(request=>`<div class="list-row"><div><h3>${esc(request.device.model)}</h3><p>${esc(request.customerArea)} · ${esc(request.distance)} · ${esc(request.device.fault)}</p></div><a href="../mechanic/requests.html" class="btn btn-outline btn-sm">Review</a></div>`).join('')||'<p>No new sample requests.</p>'}</article><article class="card"><h2 style="font-size:19px">Demo performance</h2><p style="margin:14px 0">Rating <b>★ ${Number(user?.mechanic?.rating||0).toFixed(1)}</b></p><p>Completed demo jobs <b>${completed.length}</b></p><p>Estimated demo earnings <b>${money(completed.reduce((sum,item)=>sum+Number(item.total||item.estimate||0),0))}</b></p><a class="btn btn-outline btn-sm" href="../mechanic/subscription.html" style="margin-top:12px">Manage membership</a><div style="margin-top:15px"><a class="text-link" href="../mechanic/personal-details.html">Edit mechanic profile →</a></div></article></div>`;
    appShell('mechanic','mechanic-dashboard','Mechanic dashboard',content);
  }
  function mechanicRequests() {
    const user=enterDemoRole('mechanic'),requests=store('mechanic_requests',[]).filter(item=>item.mechanicId===user?.id);
    const content=`<h1>New repair requests</h1><p>Review and respond to fictional sample requests. Accepting does not confirm a customer booking.</p><div id="requests-list" class="card-grid">${requests.map(item=>`<article class="card"><span class="demo-tag">${esc(item.id)} · Sample</span><h3>${esc(item.device.model)}</h3><p>${esc(item.device.category)} · ${esc(item.device.fault)}</p><div class="card-meta"><span>⌖ ${esc(item.distance)}</span><span>${esc(item.customerArea)}</span></div><p style="margin-top:10px">Estimate (₹)</p><input class="input" type="number" min="1" value="${Number(item.estimate||user.mechanic?.startPrice||299)}" data-estimate="${esc(item.id)}" aria-label="Estimate for ${esc(item.device.model)}"><p style="margin-top:10px">Status: <span class="status ${item.status==='accepted'?'success':item.status==='rejected'?'error':'warning'}">${esc(item.status)}</span></p>${item.status==='pending'?`<div class="form-actions"><button class="btn btn-primary btn-sm" data-accept="${esc(item.id)}">Accept / send estimate</button><button class="btn btn-outline btn-sm" data-reject="${esc(item.id)}">Decline</button></div>`:''}</article>`).join('')||'<article class="card empty-state">No sample requests.</article>'}</div>`;
    appShell('mechanic','mechanic-requests','New requests',content);
    $$('[data-accept],[data-reject]').forEach(button=>button.addEventListener('click',()=>{
      const all=store('mechanic_requests',[]),request=all.find(item=>item.id===button.dataset.accept||item.id===button.dataset.reject);if(!request)return;
      request.status=button.hasAttribute('data-accept')?'accepted':'rejected';request.estimate=Number($(`[data-estimate="${CSS.escape(request.id)}"]`).value)||299;save('mechanic_requests',all);
      const notifications=store('notifications',[]);notifications.unshift({id:`n${Date.now()}`,userId:request.userId,title:`Mechanic ${request.status} a request`,desc:`A sample mechanic ${request.status} request ${request.id}.`,type:'info',read:false,createdAt:new Date().toISOString()});save('notifications',notifications);
      toast(`Sample request ${request.status}. Customer must still choose and confirm.`);mechanicRequests();
    }));
  }
  function mechanicBookings(completedOnly=false) {
    const user=enterDemoRole('mechanic'),list=store('bookings',[]).filter(item=>item.mechanicId===user?.id&& (completedOnly?item.status==='completed':item.status==='active'));
    const content=`<h1>${completedOnly?'Completed repairs':'Active repairs'}</h1><p>Demo booking records only. Status changes are not sent to a provider or customer.</p><article class="card">${list.map(item=>`<div class="list-row"><div><h3>${esc(item.device?.model||'Device repair')} · ${esc(item.id)}</h3><p>${esc(item.device?.fault||'')} · ${when(item.createdAt)} · Estimate ${money(item.estimate)}</p></div>${completedOnly?`<span class="status success">Completed · ${money(item.total||item.estimate)}</span>`:`<div><select class="input" data-booking-status="${esc(item.id)}"><option value="active">Accepted</option><option value="on-the-way">On the way</option><option value="arrived">Arrived</option><option value="repairing">Repairing started</option><option value="completed">Repair completed</option></select><button class="btn btn-primary btn-sm" data-save-status="${esc(item.id)}" style="margin-top:6px">Update demo status</button></div>`}</div>`).join('')||'<div class="empty-state"><h3>No bookings here yet</h3><p>Customer-confirmed demo bookings will appear here.</p></div>'}</article>`;
    appShell('mechanic',completedOnly?'mechanic-completed':'mechanic-active',completedOnly?'Completed repairs':'Active repairs',content);
    $$('[data-save-status]').forEach(button=>button.addEventListener('click',()=>{
      const all=store('bookings',[]),item=all.find(booking=>booking.id===button.dataset.saveStatus),state=$(`[data-booking-status="${CSS.escape(button.dataset.saveStatus)}"]`).value;if(!item)return;
      const now=new Date().toISOString();
      if(state==='completed'){item.status='completed';item.completedAt=now;}else item.status='active';
      item.timeline=item.timeline||[];item.timeline.push({step:state,label:({ 'on-the-way':'Mechanic on the Way',arrived:'Mechanic Arrived',repairing:'Repairing Started',completed:'Repair Completed' })[state]||'Accepted',time:now,done:true});save('bookings',all);
      const notifications=store('notifications',[]);notifications.unshift({id:`n${Date.now()}`,userId:item.userId,title:'Demo repair status updated',desc:`Booking ${item.id} status changed.`,type:'info',read:false,createdAt:now});save('notifications',notifications);toast('Demo booking status updated.');
    }));
  }
  function mechanicEarnings() {
    const user=enterDemoRole('mechanic'),items=store('bookings',[]).filter(item=>item.mechanicId===user?.id&&item.status==='completed'),total=items.reduce((sum,item)=>sum+Number(item.total||item.estimate||0),0);
    appShell('mechanic','mechanic-earnings','Demo earnings',`<h1>Earnings overview</h1><p>These are simulated amounts, not actual earnings or settlements.</p><div class="metric-grid"><div class="metric"><span>Total demo earnings</span><strong>${money(total)}</strong></div><div class="metric"><span>Current-month demo</span><strong>${money(total)}</strong></div><div class="metric"><span>Completed jobs</span><strong>${items.length}</strong></div><div class="metric"><span>Monthly plan price</span><strong>₹299</strong></div></div><article class="card"><h2 style="font-size:19px">Completed demo jobs</h2>${items.map(item=>`<div class="list-row"><div><h3>${esc(item.id)} · ${esc(item.device?.model||'Repair')}</h3><p>${when(item.completedAt||item.createdAt)}</p></div><b>${money(item.total||item.estimate)}</b></div>`).join('')||'<p style="margin-top:12px">No completed demo jobs yet.</p>'}</article>`);
  }
  function mechanicPayments() {
    const user=enterDemoRole('mechanic'),records=store('transactions',[]).filter(item=>store('bookings',[]).some(booking=>booking.id===item.bookingId&&booking.mechanicId===user?.id));
    appShell('mechanic','mechanic-payments','Demo payment history',`<h1>Payment history</h1><p>These transactions are simulated records only.</p><article class="card table-wrap"><table><thead><tr><th>Transaction</th><th>Booking</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${records.map(item=>`<tr><td>${esc(item.id)}</td><td>${esc(item.bookingId)}</td><td>${when(item.createdAt)}</td><td>${money(item.amount)}</td><td>${esc(item.status)}</td></tr>`).join('')||'<tr><td colspan="5">No demo payment entries.</td></tr>'}</tbody></table></article>`);
  }
  function mechanicReviews() {
    const user=enterDemoRole('mechanic'),records=store('reviews',[]).filter(item=>item.mechanicId===user?.id);
    appShell('mechanic','mechanic-reviews','Ratings & reviews',`<h1>Sample ratings & reviews</h1><p>All entries below are illustrative and not verified customer reviews.</p><article class="card">${records.map(item=>`<div class="list-row"><div><h3>${esc(item.customerName||'Sample customer')} · <span class="stars">★ ${item.rating}</span></h3><p>${esc(item.comment)}</p></div><small>${when(item.createdAt)}</small></div>`).join('')||'<div class="empty-state"><h3>No sample reviews</h3></div>'}</article>`);
  }
  function subscriptionPage() {
    const user=enterDemoRole('mechanic'),sub=user?.mechanic?.subscription||{},active=sub.active&&new Date(sub.expiryDate)>new Date();
    appShell('mechanic','mechanic-subscription','Mechanic membership',`<h1>Fixup Mechanic Monthly</h1><p>Subscription checkout is simulated for this frontend demonstration.</p><div class="content-grid"><article class="card"><span class="eyebrow">30-DAY PLAN</span><h2 style="font-size:36px;margin:12px 0">₹299 <small style="font-size:14px;color:var(--color-text-secondary)">/ 30 days</small></h2><ul style="display:grid;gap:10px;color:var(--color-text-secondary);margin:18px 0"><li>✓ Access to nearby sample requests</li><li>✓ Mechanic profile visibility in demo UI</li><li>✓ Request management tools</li><li>✓ Demo earnings overview</li></ul><button class="btn btn-primary" id="subscribe">${active?'Renew demo membership':'Simulate membership payment'}</button><div class="notice">No payment is processed. Membership status is stored only in this browser and is not securely verified.</div></article><article class="card"><h2 style="font-size:19px">Membership status</h2><p style="margin:15px 0"><span class="status ${active?'success':'warning'}">${active?'Active (demo)':'Inactive'}</span></p><p>Starts: ${when(sub.startDate)}</p><p>Expires: ${when(sub.expiryDate)}</p><h3 style="margin-top:22px">Demo history</h3><p>No real billing records are available.</p></article></div>`);
    $('#subscribe')?.addEventListener('click',()=>{
      const all=users(),record=all.find(item=>item.id===user.id),now=new Date();record.mechanic.subscription={active:true,startDate:now.toISOString(),expiryDate:new Date(now.getTime()+30*86400000).toISOString(),plan:'monthly'};save('users',all);toast('Demo membership activated. No payment was made.');setTimeout(()=>location.href='../mechanic/dashboard.html',600);
    });
  }

  const routes={
    home:homePage,about:aboutPage,services:servicesPage,login:loginPage,signup:signupPage,
    'user-dashboard':userDashboard,'repair-request':repairRequestPage,mechanics:mechanicsPage,
    'booking-details':bookingDetailsPage,'repair-status':statusPage,'payment-history':paymentsPage,
    'personal-details':()=>profilePage('user'),support:()=>supportPage(currentPath.includes('/mechanic/')?'mechanic':'user'),
    'mechanic-dashboard':mechanicDashboard,'mechanic-requests':mechanicRequests,
    'mechanic-active':()=>mechanicBookings(false),'mechanic-completed':()=>mechanicBookings(true),
    'mechanic-earnings':mechanicEarnings,'mechanic-payments':mechanicPayments,
    'mechanic-reviews':mechanicReviews,'mechanic-profile':()=>profilePage('mechanic'),
    'mechanic-subscription':subscriptionPage,
  };
  (routes[page]||homePage)();
})();
