const $=s=>document.querySelector(s),tabs=[['playersTab','playersSettings'],['controlsTab','controlsSettings']];
for(const [id,page]of tabs)$('#'+id).onclick=()=>{for(const [i,p]of tabs){$('#'+i).setAttribute('aria-selected',String(i===id));$('#'+p).hidden=p!==page;}};
// Native details remain inline and retain their open state while roster values update.
for(const detail of document.querySelectorAll('.roster-card details'))detail.addEventListener('toggle',()=>{
 $('#settingsModal').classList.toggle('skills-expanded',Array.from(document.querySelectorAll('.roster-card details')).some(d=>d.open));
});
