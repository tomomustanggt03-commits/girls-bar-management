import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

function makeToken(secret){const day=new Date().toISOString().slice(0,10);return crypto.createHmac("sha256",secret).update("girlsbar:"+day).digest("hex")}
function authorized(req){const secret=process.env.SESSION_SECRET;if(!secret)return false;const cookie=req.headers.cookie||"";const m=cookie.match(/(?:^|;\s*)girlsbar_session=([^;]+)/);return !!m&&m[1]===makeToken(secret)}

export default async function handler(req,res){
  if(!authorized(req))return res.status(401).json({error:"Unauthorized"});
  const url=process.env.DATABASE_URL;
  if(!url)return res.status(503).json({error:"DATABASE_URL not configured"});
  const sql=neon(url);
  try{
    await sql`CREATE TABLE IF NOT EXISTS girlsbar_app_state (id integer PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
    if(req.method==="GET"){
      const rows=await sql`SELECT data, updated_at FROM girlsbar_app_state WHERE id=1`;
      return res.status(200).json(rows[0]||{data:null});
    }
    if(req.method==="PUT"||req.method==="POST"){
      const data=req.body?.data;
      if(!data||typeof data!=="object")return res.status(400).json({error:"Invalid data"});
      await sql`INSERT INTO girlsbar_app_state (id,data,updated_at) VALUES (1,${JSON.stringify(data)}::jsonb,now()) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data, updated_at=now()`;
      return res.status(200).json({ok:true});
    }
    return res.status(405).end();
  }catch(e){console.error(e);return res.status(500).json({error:"Database error"})}
}