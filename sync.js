(function(){
  const KEY='girlsbar_state';
  let syncing=false,lastPull=0;

  function normalize(){
    state=state||{};
    state.daily=Array.isArray(state.daily)?state.daily:[];
    state.staff=Array.isArray(state.staff)?state.staff:[];
    state.plan=state.plan||defaultPlan;
    state.variable=state.variable||{};
    state.castSettings=state.castSettings||{};
  }
  function backup(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  function mark(text){const f=document.querySelector('.footer span:first-child');if(f)f.textContent=text}

  async function push(){
    if(syncing)return;
    syncing=true;
    try{
      const r=await fetch('/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:state})});
      if(!r.ok)throw new Error('HTTP '+r.status);
      mark('データはクラウドでPC・スマホ同期されます');
    }catch(e){console.warn('cloud save failed',e);mark('クラウド同期エラー：再読み込みしてください')}
    finally{syncing=false}
  }

  async function pull(seed){
    if(syncing)return;
    try{
      const r=await fetch('/api/state',{credentials:'same-origin',cache:'no-store'});
      if(!r.ok)return;
      const j=await r.json();
      if(j&&j.data){
        state=j.data;normalize();backup();
        if(typeof loadPlan==='function')loadPlan();
        if(typeof render==='function')render();
        mark('データはクラウドでPC・スマホ同期されます');
      }else if(seed){normalize();backup();await push()}
      lastPull=Date.now();
    }catch(e){console.warn('cloud load failed',e)}
  }

  save=function(){normalize();backup();render();push()};
  loginBtn.addEventListener('click',()=>setTimeout(()=>pull(true),900));
  window.addEventListener('focus',()=>{if(Date.now()-lastPull>1500)pull(false)});
  setInterval(()=>pull(false),5000);
  setTimeout(()=>pull(true),1200);
})();