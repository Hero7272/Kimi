(async function(){
  const parts = ['p01','p02','p03','p04','p05','p06','p07','p08','p09'];
  try{
    const texts = await Promise.all(parts.map(p => fetch('parts/'+p+'.txt').then(r=>{
      if(!r.ok) throw new Error('Teil '+p+' fehlt ('+r.status+')');
      return r.text();
    })));
    const b64 = texts.join('');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    const code = await new Response(stream).text();
    (0,eval)(code);
  }catch(e){
    const v=document.getElementById('view');
    if(v) v.innerHTML = '<div class="card"><h2>App-Code nicht geladen</h2><p class="sub">'+String(e.message||e)+'</p><p class="sub">Hart neu laden (Cache leeren).</p></div>';
    console.error(e);
  }
})();
