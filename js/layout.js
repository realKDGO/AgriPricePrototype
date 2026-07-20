/* ==========================================================================
   AgriPrice — layout.js
   Renders the sidebar + topbar shell shared by every authenticated page.
   ========================================================================== */

const AgriLayout = (() => {

  const NAV_ITEMS = [
    { group:'Overview', items:[
      { href:'dashboard.html', icon:'fa-house', label:'Dashboard' }
    ]},
    { group:'Market Data', items:[
      { href:'crop-prices.html', icon:'fa-wheat-awn', label:'Crop Prices' },
      { href:'historical-prices.html', icon:'fa-clock-rotate-left', label:'Historical Prices' }
    ]},
    { group:'Decision Support', items:[
      { href:'forecasting.html', icon:'fa-chart-line', label:'Forecasting' },
      { href:'market-recommendation.html', icon:'fa-compass', label:'Market Recommendation' },
      { href:'profit-estimation.html', icon:'fa-calculator', label:'Profit Estimation' },
      { href:'reports.html', icon:'fa-chart-column', label:'Reports & Analytics' }
    ]},
    { group:'Account', items:[
      { href:'settings.html', icon:'fa-gear', label:'Settings' }
    ]}
  ];

  function renderSidebar(activePage){
    const el = document.getElementById('sidebar');
    if(!el) return;

    const groups = NAV_ITEMS.map(g => `
      <div class="sidebar-section-label">${g.group}</div>
      <div class="sidebar-nav">
        ${g.items.map(it => `
          <a href="${it.href}" class="${it.href === activePage ? 'active' : ''}">
            <span class="nav-ic"><i class="fa-solid ${it.icon}"></i></span> ${it.label}
          </a>
        `).join('')}
      </div>
    `).join('');

    el.innerHTML = `
      <div class="sidebar-brand">
        <span class="brand-mark"><img src="images/logo.png" alt="AgriPrice logo"></span> AgriPrice
        <button class="sidebar-close" id="sidebarClose" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>
      </div>
      ${groups}
    `;
  }

  function renderTopbar(pageTitle){
    const el = document.getElementById('topbar');
    if(!el) return;

    el.innerHTML = `
      <div class="topbar-left">
        <h2>${pageTitle}</h2>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn" aria-label="Notifications" id="notifBtn">
          <i class="fa-solid fa-bell"></i><span class="dot"></span>
        </button>
      </div>
    `;

    document.getElementById('notifBtn').addEventListener('click', () => {
      AgriUtils.toast('You have no new notifications right now.', 'info', 'Notifications');
    });
  }

  const TAB_ITEMS = [
    { href:'dashboard.html', icon:'fa-house', label:'Home' },
    { href:'forecasting.html', icon:'fa-chart-line', label:'Forecast' },
    { href:'crop-prices.html', icon:'fa-store', label:'Markets' },
    { href:'profit-estimation.html', icon:'fa-sack-dollar', label:'Profit Estimator' },
    { href:'profile.html', icon:'fa-user', label:'Profile' }
  ];

  function renderBottomNav(activePage){
    let nav = document.getElementById('bottomNav');
    if(!nav){
      nav = document.createElement('nav');
      nav.id = 'bottomNav';
      nav.className = 'bottom-nav';
      document.body.appendChild(nav);
    }
    nav.innerHTML = TAB_ITEMS.map(it => `
      <a href="${it.href}" class="${it.href === activePage ? 'active' : ''}">
        <i class="fa-solid ${it.icon}"></i>
        <span>${it.label}</span>
      </a>
    `).join('');
  }

  function wireLogoutOverlay(){
    let overlay = document.getElementById('logoutOverlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'logoutOverlay';
      overlay.className = 'overlay-scrim';
      overlay.innerHTML = `
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--white); border-radius:20px; padding:28px; width:90%; max-width:340px; text-align:center; box-shadow:var(--shadow-lg);">
          <div style="font-size:2rem; margin-bottom:10px; color:var(--leaf);"><i class="fa-solid fa-right-from-bracket"></i></div>
          <h3 style="margin-bottom:6px;">Log out of AgriPrice?</h3>
          <p style="margin-bottom:20px; font-size:.88rem;">You'll need to sign in again to access your dashboard.</p>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline btn-block" id="cancelLogout">Cancel</button>
            <button class="btn btn-danger btn-block" id="confirmLogout">Logout</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.classList.remove('show'); });
    document.getElementById('cancelLogout').addEventListener('click', () => overlay.classList.remove('show'));
    document.getElementById('confirmLogout').addEventListener('click', () => AgriAuth.logout());
  }

  function applyDarkMode(){
    const prefs = AgriStore.getPrefs();
    document.body.classList.toggle('dark-mode', !!prefs.darkMode);
  }

  function init(activePage, pageTitle){
    AgriAuth.requireAuth();
    applyDarkMode();
    renderSidebar(activePage);
    renderTopbar(pageTitle);
    renderBottomNav(activePage);
    wireLogoutOverlay();
  }

  return { init, applyDarkMode };
})();
