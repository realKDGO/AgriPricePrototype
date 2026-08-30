
const AgriAdminLayout = (() => {
 const ROLE_KEY = 'agri_management_role';

 const adminGroups = [
 {label:'Overview',items:[['admin-dashboard.html','fa-gauge-high','Admin Dashboard']]},
 {label:'Agricultural Management',items:[
 ['admin-prices.html','fa-tags','Price Management'],
 ['admin-crops.html','fa-seedling','Crop Management'],
 ['admin-markets.html','fa-store','Market Management']
 ]},
 {label:'Monitoring',items:[
 ['admin-historical.html','fa-clock-rotate-left','Historical Prices'],
 ['admin-forecasts.html','fa-chart-line','Forecast Monitoring']
 ]},
 {label:'Reports',items:[['admin-reports.html','fa-chart-column','Reports & Analytics']]},
 {label:'Administration',items:[
 ['admin-users.html','fa-users','User Management'],
 ['admin-mao-accounts.html','fa-user-tie','MAO Accounts'],
 ['admin-roles.html','fa-shield-halved','Roles & Permissions']
 ]},
 {label:'Account',items:[['admin-profile.html','fa-user-gear','Profile']]}
 ];

 const maoGroups = [
 {label:'Overview',items:[['mao-dashboard.html','fa-gauge-high','MAO Dashboard']]},
 {label:'Agricultural Management',items:[
 ['admin-crops.html','fa-seedling','Crop Management'],
 ['admin-markets.html','fa-store','Market Management'],
 ['admin-prices.html','fa-tags','Price Management'],
 ['mao-price-validation.html','fa-circle-check','Price Validation']
 ]},
 {label:'Monitoring',items:[
 ['admin-historical.html','fa-clock-rotate-left','Historical Records'],
 ['admin-forecasts.html','fa-chart-line','Forecast Information']
 ]},
 {label:'Reports',items:[['admin-reports.html','fa-chart-column','Reports & Analytics']]},
 {label:'Account',items:[['mao-profile.html','fa-user-gear','MAO Profile']]}
 ];

 function setRole(role){
 const normalized = role === 'MAO' ? 'MAO' : 'ADMIN';
 sessionStorage.setItem(ROLE_KEY, normalized);
 return normalized;
 }

 function getRole(){
 return sessionStorage.getItem(ROLE_KEY) === 'MAO' ? 'MAO' : 'ADMIN';
 }

 function applyAppearance(){
 const prefs = window.AgriStore?.getPrefs?.() || {theme:'light',textSize:'medium'};
 const theme=prefs.theme||'light';
 const useDark=theme==='dark'||(theme==='system'&&window.matchMedia?.('(prefers-color-scheme:dark)').matches);
 document.body.classList.toggle('dark-mode',useDark);
 document.documentElement.dataset.theme=theme;
 document.documentElement.dataset.textSize=prefs.textSize||'medium';
 }

 function init(active,title,forcedRole=null){
 if(forcedRole) setRole(forcedRole);
 const role=getRole();
 applyAppearance();

 document.body.dataset.managementRole=role;
 const groups=role==='MAO'?maoGroups:adminGroups;
 const side=document.getElementById('adminSidebar');
 const top=document.getElementById('adminTopbar');

 if(side){
 side.innerHTML=`
 <div class="admin-brand">
 <img src="images/logo.png" alt="AgriPrice logo">
 <div>AgriPrice<small>${role==='MAO'?'MAO Portal':'Admin Portal'}</small></div>
 </div>
 <div class="admin-nav-scroll">
 ${groups.map(g=>`
 <div class="admin-nav-label">${g.label}</div>
 <nav class="admin-nav">
 ${g.items.map(([href,icon,label])=>`
 <a href="${href}" class="${href===active?'active':''}">
 <span class="nav-ic"><i class="fa-solid ${icon}"></i></span>${label}
 </a>`).join('')}
 </nav>`).join('')}
 </div>
 <div class="admin-sidebar-footer">
 <button class="admin-logout" id="adminLogout">
 <span class="nav-ic"><i class="fa-solid fa-right-from-bracket"></i></span>Logout
 </button>
 </div>`;

 document.getElementById('adminLogout')?.addEventListener('click',()=>{
 sessionStorage.removeItem(ROLE_KEY);
 location.href=role==='MAO'?'mao-login.html':'admin-login.html';
 });
 }

 if(top){
 const profile=role==='MAO'
 ? (window.AgriAdminStore?.getMaoProfile?.() || {firstName:'King',lastName:'Obrero'})
 : (window.AgriAdminStore?.getProfile?.() || {firstName:'Admin',lastName:'User'});
 const initials=`${profile.firstName?.[0]||''}${profile.lastName?.[0]||''}`.toUpperCase() || (role==='MAO'?'MP':'AU');
 top.innerHTML=`
 <div><h1>${title}</h1></div>
 <div class="admin-topbar-right">
 <div class="admin-role-pill">
 <span class="admin-avatar">${initials}</span>
 <span>${role==='MAO'?'MAO Personnel':'Administrator'}</span>
 </div>
 </div>`;
 }

 window.dispatchEvent(new CustomEvent('agri:management-role',{detail:{role}}));
 return role;
 }

 return {init,applyAppearance,setRole,getRole};
})();
