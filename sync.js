(function(){
  const KEY='girlsbar_state';
  const nativeGet=Storage.prototype.getItem;
  const nativeSet=Storage.prototype.setItem;
  let syncing=false;
  function local(){try{return nativeGet.call(localStorage,KEY)}catch(e){return null}}
  function writeLocal(v){try{nativeSet.call(localStorage,KEY,v)}catch(e){}}
  try{
    const xhr=new XMLHttpRequest();
    xhr.open('GET','/api/state',false);
    xhr.send(null);
    if(xhr.status===200){
      const res=JSON.parse(xhr.responseText||'{}');
      if(res&&res.data){
        writeLocal(JSON.stringify(res.data));
      }else{
        const existing=local();
        if(existing){
          const seed=new XMLHttpRequest();
          seed.open('PUT','/api/state',false);
          seed.setRequestHeader('Content-Type','application/json');
          seed.send(JSON.stringify({data:JSON.parse(existing)}));
        }
      }
    }
  }catch(e){console.warn('Cloud sync init failed',e)}
  Storage.prototype.setItem=function(k,v){
    nativeSet.call(this,k,v);
    if(this===localStorage&&k===KEY&&!syncing){
      try{
        syncing=true;
        fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:JSON.parse(v)})}).catch(()=>{}).finally(()=>{syncing=false});
      }catch(e){syncing=false}
    }
  };
})();