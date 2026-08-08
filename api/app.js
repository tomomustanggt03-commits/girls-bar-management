import fs from 'fs';
import path from 'path';

export default function handler(req,res){
  try{
    const root=process.cwd();
    let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
    const sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
    html=html.replace('</body>',`<script>\n${sync}\n</script></body>`);
    html=html.replace('データはブラウザ内に保存されます','データはPC・スマホで共通保存されます');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
    res.setHeader('Pragma','no-cache');
    return res.status(200).send(html);
  }catch(e){
    console.error(e);
    return res.status(500).send('App load error');
  }
}