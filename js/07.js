/* ============ HINTERGRUND: Wake-Lock, Auto-Resume, Benachrichtigung ============ */
const Hintergrund = {
  lock: null,
  resumePending: false,
  async wachhalten(){
    try{
      if(document.visibilityState!=='visible') return;
      if(this.lock) return;
      if(navigator.wakeLock && navigator.wakeLock.request){
        this.lock = await navigator.wakeLock.request('screen');
        this.lock.addEventListener('release', ()=>{ this.lock=null; });
      }
    }catch(e){ this.lock=null; }
  },
  loslassen(){
    try{ this.lock && this.lock.release(); }catch(e){}
    this.lock=null;
  },
  async benachrichtigen(titel, text){
    try{
      if(!('Notification' in window)) return;
      if(Notification.permission==='default') await Notification.requestPermission();
      if(Notification.permission==='granted'){
        const n = new Notification(titel||'Roman-Werkstatt', {body:text||'', icon:'icon.svg', tag:'rw-kapitel'});
        n.onclick = ()=>{ window.focus(); n.close(); };
      }
    }catch(e){}
  }
};
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState==='visible'){
    if(typeof Pipe!=='undefined' && Pipe.laeuft) Hintergrund.wachhalten();
    if(typeof App!=='undefined' && App.p && typeof Pipe!=='undefined' && !Pipe.laeuft){
      try{
        const id = App.p.id;
        const offene = (App.p.kapitelIdx||[]).filter(k=>{
          const z = Store.zwischenstand(id, k.n);
          return z && !z.fertig;
        });
        if(offene.length && App._autoResume!==false){
          const n = offene[0].n;
          App.toast && App.toast('Hintergrund: Kapitel '+n+' wird fortgesetzt');
          if(Pipe.kapitel) Pipe.kapitel(App.p, n).then(()=>{ Hintergrund.benachrichtigen('Kapitel fertig','Kapitel '+n+' ist geschrieben.'); App.render && App.render(); }).catch(e=>App.toast && App.toast(String(e.message||e),1));
        }
      }catch(e){}
    }
  }else{
    try{
      if(typeof Pipe!=='undefined' && Pipe.laeuft && App && App.p && App._offenesKapitel){
        const n = App._offenesKapitel;
        const z = Store.zwischenstand(App.p.id, n) || {};
        z.ts = Date.now(); z.paused=true;
        Store.saveZwischenstand(App.p.id, n, z);
      }
    }catch(e){}
  }
});
window.addEventListener('pagehide', ()=>{
  try{ if(App && App.p) Store.save(App.p); }catch(e){}
});

Object.assign(App, {
  setupPWA(){
    const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='28' fill='%23FF9500'/%3E%3Ctext x='96' y='128' text-anchor='middle' font-size='96' fill='white' font-family='-apple-system,sans-serif' font-weight='700'%3ER%3C/text%3E%3C/svg%3E";
    const manifest = {
      name:'Roman-Werkstatt', short_name:'Werkstatt', start_url:'.', display:'standalone',
      orientation:'portrait', background_color:'#F5F5F7', theme_color:'#FF9500',
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
        if(data.length > 1200000) return this.toast('Bild zu groß für den Speicher — kleiner exportieren.',1);
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
