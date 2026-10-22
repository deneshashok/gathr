import {timingSafeEqual} from 'node:crypto';
export function isAdmin(req){const actual=req.headers.get('authorization')||'',expected='Bearer '+(process.env.ADMIN_TOKEN||'');return !!process.env.ADMIN_TOKEN&&Buffer.byteLength(actual)===Buffer.byteLength(expected)&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected));}
export async function smallJSON(req){const body=await req.text();if(Buffer.byteLength(body)>16000)throw Error('Request too large');return JSON.parse(body);}
