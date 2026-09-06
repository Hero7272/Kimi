(async function(){
  const n = 24;
  const parts = [];
  for (let i = 1; i <= n; i++) parts.push(String(i).padStart(2,'0'));
  try{
    const texts = await Promise.all(parts.map(p => fetch('js/'+p+'.js?v=4').then(r=>{
      if(!r.ok) throw new Error('Teil '+p+' fehlt ('+r.status+')');
      return r.text();
    })));
    (0,eval)(texts.join(''));
  }catch(e){
    const v=document.getElementById('view');
    if(v) v.innerHTML = '<div class="card"><h2>App-Code nicht geladen</h2><p class="sub">'+String(e.message||e)+'</p><p class="sub">Hart neu laden. Datei Roman-Werkstatt-komplett.html geht immer.</p></div>';
    console.error(e);
  }
})();
