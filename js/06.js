/* ============ PWA + COVER ============ */
Object.assign(App, {
  setupPWA(){
    const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='30' fill='%230E1216'/%3E%3Crect x='52' y='34' width='88' height='124' rx='44' fill='none' stroke='%234A9EFF' stroke-width='5'/%3E%3Cpath d='M70 60 C70 128 96 150 96 150' stroke='%23C9D1D7' stroke-width='4' fill='none' opacity='.55'/%3E%3Ccircle cx='96' cy='96' r='7' fill='%234A9EFF'/%3E%3C/svg%3E";
    const manifest = {
      name:'Roman-Werkstatt', short_name:'Roman-Werkstatt', start_url:'.', display:'standalone',
      orientation:'portrait', background_color:'#0E1216', theme_color:'#0E1216',
      icons:[{src:icon, sizes:'192x192', type:'image/svg+xml'},{src:icon, sizes:'512x512', type:'image/svg+xml'}]
    };
    try{
      const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/json'}));
      const m=document.getElementById('manifestLink'); if(m) m.href=url;
      const a=document.getElementById('appleIcon'); if(a) a.href=icon;
    }catch(e){}
  },

  coverWaehlen(ev){
    const f=ev.target.files && ev.target.files[0]; if(!f) return;
    if(!/^image\//.test(f.type)) return this.toast('Das ist kein Bild.',1);
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const maxH=1400, sk=Math.min(1, maxH/img.height);
        const c=document.createElement('canvas');
        c.width=Math.round(img.width*sk); c.height=Math.round(img.height*sk);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        const data=c.toDataURL('image/jpeg',0.82);
        if(data.length > 1_200_000) return this.toast('Bild zu groß für den Speicher — kleiner exportieren.',1);
        this.p.cover=data; this.save(); this.render();
        const v=img.width/img.height;
        if(Math.abs(v-0.625)>0.06) this.toast('Gespeichert. KDP mag 1600×2560 (Seitenverhältnis 1:1,6).');
        else this.toast('Cover gespeichert');
      };
      img.onerror=()=>this.toast('Bild ließ sich nicht laden.',1);
      img.src=r.result;
    };
    r.readAsDataURL(f);
  },

  coverWeg(){ if(!confirm('Cover entfernen?')) return; this.p.cover=null; this.save(); this.render(); }
});

App.setupPWA();
App.init();



/* ============ HINTERGRUND / RESUME ============ */
(function(){
  const KEY = 'rw:bg-lauf';
  function merken(p, anzahl){
    try{ localStorage.setItem(KEY, JSON.stringify({id:p.id, anzahl:anzahl||99, t:Date.now()})); }catch(e){}
  }
  function merker(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; }
  }
  function loescheMerker(){ try{ localStorage.removeItem(KEY); }catch(e){}

  const origLauf = Pipe.lauf.bind(Pipe);
  Pipe.lauf = async function(p, anzahl){
    merken(p, anzahl);
    try{
      await origLauf(p, anzahl);
    }finally{
      if(!this.laeuft) loescheMerker();
    }
  };

  App.resumeHintergrund = async function(){
    const m = merker();
    if(!m || !this.p || m.id !== this.p.id) return;
    if(Pipe.laeuft) return;
    const offen = (this.p.toc||[]).length - (this.p.kapitelIdx||[]).length;
    if(offen <= 0){ loescheMerker(); return; }
    this.toast('Hintergrund-Lauf wird fortgesetzt …');
    Pipe.log('App war weg — Lauf wird automatisch fortgesetzt.','k');
    Pipe.lauf(this.p, 99);
  };

  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){
      try{ App.save(); }catch(e){}
      if(Pipe.laeuft && App.p) merken(App.p, 99);
    }else{
      setTimeout(()=>App.resumeHintergrund && App.resumeHintergrund(), 400);
    }
  });
  window.addEventListener('pageshow', ()=> setTimeout(()=>App.resumeHintergrund && App.resumeHintergrund(), 600));
  window.addEventListener('pagehide', ()=>{ try{ App.save(); }catch(e){} });

  const origKapitel = Pipe.kapitel.bind(Pipe);
  Pipe.kapitel = async function(p,n){
    const r = await origKapitel(p,n);
    try{
      if(window.Notification && Notification.permission === 'granted'){
        new Notification('Kapitel '+n+' fertig', {body:(p.toc[n-1]&&p.toc[n-1].titel)||''});
      }
    }catch(e){}
    return r;
  };

  App.bitteBenachrichtigung = async function(){
    if(!('Notification' in window)){ this.toast('Dieser Browser kann nicht benachrichtigen',1); return; }
    const p = await Notification.requestPermission();
    this.toast(p==='granted' ? 'Du wirst benachrichtigt, wenn ein Kapitel fertig ist.' : 'Keine Erlaubnis.');
    this.render();
  };

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
})();
