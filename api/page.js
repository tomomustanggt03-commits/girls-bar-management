export default async function handler(req,res){
  try{
    const u='https://raw.githubusercontent.com/tomomustanggt03-commits/girls-bar-management/main/index.html';
    const r=await fetch(u,{cache:'no-store'});
    if(!r.ok)return res.status(502).send('App source unavailable');
    let html=await r.text();
    html=html.replace('</body>','<script src="/sync.js?v=2"></script></body>');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    return res.status(200).send(html);
  }catch(e){console.error(e);return res.status(500).send('App load error')}
}