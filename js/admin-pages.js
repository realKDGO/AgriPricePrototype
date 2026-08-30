
const AgriAdminUI = (() => {
  const peso=v=>'₱'+Number(v||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
  const byId=id=>document.getElementById(id);
  function openModal(id){ byId(id)?.classList.add('show'); }
  function closeModal(id){ byId(id)?.classList.remove('show'); }
  function bindModal(id){
    const overlay=byId(id); if(!overlay)return;
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal(id);});
    overlay.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(id)));
  }
  function toast(msg,type='success',title='Admin'){
    window.AgriUtils?.toast?.(msg,type,title);
  }
  function fillSelect(el,items,valueKey='id',labelKey='name',allLabel=null){
    if(!el)return;
    el.innerHTML=(allLabel?`<option value="">${allLabel}</option>`:'')+
      items.map(x=>`<option value="${x[valueKey]}">${x[labelKey]}</option>`).join('');
  }
  return {peso,byId,openModal,closeModal,bindModal,toast,fillSelect};
})();
