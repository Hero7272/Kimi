(async function(){
  const [a,b] = await Promise.all([
    fetch('app.p1.txt').then(r=>r.text()),
    fetch('app.p2.txt').then(r=>r.text())
  ]);
  const bin = Uint8Array.from(atob(a+b), c => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bin]).stream().pipeThrough(ds);
  const text = await new Response(stream).text();
  (0, eval)(text);
})().catch(e => {
  const v = document.getElementById('view');
  if (v) v.innerHTML = '<div class="card"><h2>Ladefehler</h2><p class="sub">'+String(e.message||e)+'</p></div>';
  console.error(e);
});
