/* ==========================================================================
 AgriPrice — utils.js
 Toasts, formatters, validators, small shared helpers.
 ========================================================================== */

const AgriUtils = (() => {

 // ---------- Inline feedback notifications ----------
 function ensureNoticeContainer(){
 let container = document.getElementById('inline-feedback');
 if(!container){
 container = document.createElement('div');
 container.id = 'inline-feedback';
 container.className = 'inline-feedback';
 const target = document.querySelector('.page-body') || document.body;
 target.prepend(container);
 }
 return container;
 }

 const ICONS = {
 success: '<i class="fa-solid fa-circle-check"></i>',
 error: '<i class="fa-solid fa-triangle-exclamation"></i>',
 warning: '<i class="fa-solid fa-circle-exclamation"></i>',
 info: '<i class="fa-solid fa-circle-info"></i>'
 };

 function toast(message, type = 'success', title){
 const container = ensureNoticeContainer();
 const safeTitle = title || (type === 'error' ? 'Action needed' : type === 'warning' ? 'Heads up' : 'Update');
 container.innerHTML = `
 <div class="inline-feedback-card ${type}">
 <span class="inline-feedback-icon">${ICONS[type] || ICONS.info}</span>
 <div class="inline-feedback-copy">
 <strong>${safeTitle}</strong>
 <span>${message}</span>
 </div>
 </div>
 `;
 container.classList.add('show');
 clearTimeout(container._hideTimer);
 container._hideTimer = setTimeout(() => {
 container.classList.remove('show');
 container.innerHTML = '';
 }, 3200);
 }

 // ---------- Page loader ----------
 function hidePageLoader(){
 const loader = document.getElementById('page-loader');
 if(loader){
 setTimeout(() => loader.classList.add('hidden'), 350);
 }
 }

 // ---------- Formatters ----------
 function peso(value){
 const num = Number(value) || 0;
 return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 }
 function pesoRound(value){
 const num = Math.round(Number(value) || 0);
 return '₱' + num.toLocaleString('en-PH');
 }
 function formatDate(dateStr){
 const d = new Date(dateStr);
 return d.toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' });
 }
 function initials(first, last){
 return `${(first||'').charAt(0)}${(last||'').charAt(0)}`.toUpperCase();
 }

 // ---------- Validators ----------
 function isValidEmail(email){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 }
 function isValidPassword(pw){
 return typeof pw === 'string' && pw.length >= 8;
 }

 // ---------- Form field error helpers ----------
 function setFieldError(groupEl, message){
 if(!groupEl) return;
 groupEl.classList.add('error');
 const errEl = groupEl.querySelector('.field-error');
 if(errEl) errEl.textContent = message;
 }
 function clearFieldError(groupEl){
 if(!groupEl) return;
 groupEl.classList.remove('error');
 }

 // ---------- Random helper (seeded-ish for realistic dummy values) ----------
 function randomBetween(min, max){
 return Math.random() * (max - min) + min;
 }
 function randomInt(min, max){
 return Math.floor(randomBetween(min, max + 1));
 }

 // ---------- Debounce ----------
 function debounce(fn, delay = 250){
 let t;
 return (...args) => {
 clearTimeout(t);
 t = setTimeout(() => fn(...args), delay);
 };
 }

 return {
 toast, hidePageLoader,
 peso, pesoRound, formatDate, initials,
 isValidEmail, isValidPassword,
 setFieldError, clearFieldError,
 randomBetween, randomInt, debounce
 };
})();

// Auto-hide loader once DOM + this script are ready
document.addEventListener('DOMContentLoaded', () => AgriUtils.hidePageLoader());
