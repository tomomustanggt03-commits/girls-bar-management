import fs from 'fs';
import path from 'path';

export default function handler(req,res){
  try{
    const file=path.join(process.cwd(),'index.html');
    let html=fs.readFileSync(file,'utf8');
    html=html.replace('<script>','<script src="/sync.js"></script><script>');
    html=html.replace('データはブラウザ内に保存されます','データはPC・スマホで共通保存されます');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    return res.status(200).send(html);
  }catch(e){
    console.error(e);
    return res.status(500).send('App load error');
  }
}