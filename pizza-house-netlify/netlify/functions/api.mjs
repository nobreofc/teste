import {getStore} from '@netlify/blobs';
import crypto from 'node:crypto';
import {ADMIN_HTML,ADMIN_JS} from './lib/private.mjs';
export const config={path:['/api/*','/admin','/admin/*']};
const PASS=process.env.ADMIN_PASSWORD||'',USER=process.env.ADMIN_USER||'admin',SEC=process.env.SESSION_SECRET||'';
const WA='5584992270085',SZ=['Média (6 fatias)','Grande (8 fatias)'],BD=[['Sem borda',0],['Catupiry',8],['Cheddar',8],['Chocolate',8]],CATS=['pz','dc','pt','bb'];
const SEED=[['pz','Calabresa','Calabresa fatiada, cebola, mussarela e orégano','🌶️',38,48,50],['pz','Mussarela','Mussarela, tomate e manjericão','🧀',34,44,40],['pz','Portuguesa','Presunto, ovo, cebola, azeitona e mussarela','🥚',40,52,35],['pz','Frango c/ Catupiry','Frango desfiado, catupiry e milho','🍗',40,52,60],['pz','Margherita','Mussarela, tomate fresco e manjericão','🌿',36,46,25],['pz','Quatro Queijos','Mussarela, provolone, parmesão e catupiry','🧀',42,54,45],['pz','Bacon','Bacon crocante, mussarela e cebola','🥓',42,54,30],['pz','Pepperoni','Pepperoni, mussarela e orégano','🍕',44,56,28],['dc','Chocolate c/ Morango','Chocolate ao leite e morangos','🍓',40,50,20],['dc','Banana c/ Canela','Banana, açúcar, canela e mussarela','🍌',36,46,12],['dc','Prestígio','Chocolate e coco ralado','🥥',40,50,15],['pt','Batata Frita','Porção crocante com cheddar e bacon','🍟',22,null,38],['pt','Calabresa Acebolada','Porção generosa com cebola dourada','🌭',28,null,22],['pt','Isca de Frango','Iscas empanadas com molho especial','🍗',30,null,18],['bb','Coca-Cola 2L','Gelada','🥤',14,null,55],['bb','Guaraná 2L','Gelado','🥤',12,null,42],['bb','Coca-Cola Lata','350ml','🥫',6,null,20],['bb','Guaraná Lata','350ml','🥫',6,null,16],['bb','Água Mineral','500ml','💧',3,null,10]];
const HS={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Strict-Transport-Security':'max-age=31536000; includeSubDomains','Cache-Control':'no-store'};
const CSP="default-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const J=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{...HS,'Content-Type':'application/json',...h}});
const T=(b,type,s=200,h={})=>new Response(b,{status:s,headers:{...HS,'Content-Type':type+'; charset=utf-8','Content-Security-Policy':CSP,...h}});
const bad=(m='Pedido inválido')=>J({error:m},400);
const R=n=>'R$ '+n.toFixed(2).replace('.',','),eff=(p,pr)=>Math.round(p*(100-pr))/100,
txt=(v,n)=>typeof v=='string'?v.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n):'',
num=(v,max)=>{v=Number(v);return Number.isFinite(v)&&v>=0&&v<=max?Math.round(v*100)/100:null};
/* ---------- armazenamento (Netlify Blobs) ---------- */
const st=()=>getStore({name:'pizza',consistency:'strong'});
const gj=async(k,d)=>(await st().get(k,{type:'json'}))??d,sj=(k,v)=>st().setJSON(k,v);
async function loadDb(){let db=await gj('db');if(!db){db={next:SEED.length+1,fee:5,items:SEED.map((x,i)=>({id:i+1,cat:x[0],name:x[1],descr:x[2],emoji:x[3],p1:x[4],p2:x[5],promo:0,active:1,seed:x[6]}))};await sj('db',db)}return db}
async function hit(k,max,win){const n=Date.now(),r=await gj('rl/'+k,{c:0,t:n});if(n-r.t>win){r.c=0;r.t=n}if(r.c>=max)return false;r.c++;await sj('rl/'+k,r);return true}
/* ---------- segurança ---------- */
const salt=crypto.randomBytes(16),H=s=>crypto.scryptSync(String(s).slice(0,200),salt,32),safe=(a,b)=>crypto.timingSafeEqual(H(a),H(b));
const sig=d=>crypto.createHmac('sha256',SEC).update(d).digest('base64url');
const mk=()=>{const d=Buffer.from(JSON.stringify({e:Date.now()+72e5,c:crypto.randomBytes(24).toString('hex')})).toString('base64url');return d+'.'+sig(d)};
const sess=req=>{const [d,s]=(Object.fromEntries((req.headers.get('cookie')||'').split(';').map(x=>x.trim().split('='))).sid||'').split('.');if(!d||!s)return null;
 const a=Buffer.from(sig(d)),b=Buffer.from(s);if(a.length!=b.length||!crypto.timingSafeEqual(a,b))return null;
 try{const o=JSON.parse(Buffer.from(d,'base64url'));return o.e>Date.now()?o:null}catch{return null}};
const page=err=>`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex><title>ADM</title><style>body{background:#0a0a0a;color:#fff;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0}form{background:#161616;border:1px solid #f7941d;border-radius:18px;padding:26px;width:min(340px,90vw)}h1{color:#f7941d;font-size:20px;margin:0 0 14px}input,button{width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #333;background:#1f1f1f;color:#fff;font:inherit;box-sizing:border-box}button{background:#f7941d;color:#111;font-weight:700;border:0}p{color:#ff6b6b;font-size:13px}</style><form method=post action=/admin/login autocomplete=off><h1>🍕 Painel ADM – Pizza House</h1>${err?'<p>'+err+'</p>':''}<input name=user placeholder=Usuário required maxlength=60><input name=pass type=password placeholder=Senha required maxlength=200><button>Entrar</button></form>`;
const clean=b=>{b=b||{};const two=b.p2!==''&&b.p2!=null,o={cat:b.cat,name:txt(b.name,60),descr:txt(b.descr,160),emoji:txt(b.emoji,8)||'🍕',p1:num(b.p1,9999),p2:two?num(b.p2,9999):null,promo:Math.round(Number(b.promo)||0),active:b.active?1:0};
 if(!CATS.includes(o.cat)||!o.name||o.p1===null||(two&&o.p2===null)||o.promo<0||o.promo>90||((o.cat=='pz'||o.cat=='dc')!==(o.p2!==null)))return null;return o};
const body=async(req,lim)=>{try{const t=await req.text();return t.length>lim?null:JSON.parse(t||'{}')}catch{return null}};
/* ---------- rotas ---------- */
export default async(req,ctx)=>{try{return await route(req,ctx)}catch(e){console.error(e);return J({error:'Erro interno'},500)}};
async function route(req,ctx){
 const p=new URL(req.url).pathname.replace(/\/+$/,'')||'/',m=req.method,ip=String(ctx.ip||'x').replace(/\W/g,'_');
 if(p=='/api/menu'&&m=='GET'){const db=await loadDb(),sold=await gj('sold',{});
  return J({fee:db.fee,items:db.items.filter(i=>i.active).map(i=>({id:i.id,c:i.cat,n:i.name,d:i.descr,e:i.emoji,pr:i.promo,s:i.seed+(sold[i.id]||0)*3,o:i.p2==null?i.p1:[i.p1,i.p2],p:i.p2==null?eff(i.p1,i.promo):[eff(i.p1,i.promo),eff(i.p2,i.promo)]}))})}
 if(p=='/api/order'&&m=='POST')return order(req,ip);
 if(!(p.startsWith('/admin')||p.startsWith('/api/admin')))return J({error:'Não encontrado'},404);
 if(PASS.length<10||SEC.length<32)return J({error:'Defina ADMIN_PASSWORD (10+ caracteres) e SESSION_SECRET (32+ caracteres) nas variáveis de ambiente do Netlify.'},500);
 if(p=='/admin/login'&&m=='POST'){
  if(!await hit('l'+ip,5,9e5))return T(page('Muitas tentativas. Aguarde 15 minutos.'),'text/html',429);
  const f=new URLSearchParams((await req.text()).slice(0,2000)),ok=safe(f.get('user')||'',USER)&safe(f.get('pass')||'',PASS);
  if(!ok){await new Promise(z=>setTimeout(z,900));return T(page('Usuário ou senha incorretos.'),'text/html',401)}
  await st().delete('rl/l'+ip);return new Response(null,{status:302,headers:{...HS,Location:'/admin','Set-Cookie':`sid=${mk()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`}})}
 const s=sess(req);
 if(p=='/admin'&&m=='GET')return s?T(ADMIN_HTML.replace('__CSRF__',s.c),'text/html'):T(page(),'text/html');
 if(!s)return p=='/admin/admin.js'?J({error:'Não encontrado'},404):J({error:'Não autorizado'},401);
 if(p=='/admin/admin.js'&&m=='GET')return T(ADMIN_JS,'application/javascript');
 if(m!='GET'&&!safe(req.headers.get('x-csrf')||'',s.c))return J({error:'Token inválido'},403);
 if(p=='/admin/logout'&&m=='POST')return J({ok:1},200,{'Set-Cookie':'sid=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
 if(p=='/api/admin/items'&&m=='GET'){const db=await loadDb();return J({fee:db.fee,items:[...db.items].sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name))})}
 if(p=='/api/admin/items'&&m=='POST'){const o=clean(await body(req,10e3));if(!o)return bad('Dados inválidos (pizzas precisam de 2 preços; promoção de 0 a 90%)');
  const db=await loadDb();db.items.push({...o,id:db.next++,seed:0});await sj('db',db);return J({ok:1})}
 if(p=='/api/admin/fee'&&m=='PUT'){const b=await body(req,1e3),f=num(b&&b.fee,999);if(f===null)return bad('Valor inválido');const db=await loadDb();db.fee=f;await sj('db',db);return J({ok:1})}
 const mm=p.match(/^\/api\/admin\/items\/(\d{1,9})$/);
 if(mm){const id=+mm[1],db=await loadDb(),i=db.items.findIndex(x=>x.id==id);if(i<0)return bad('Item não encontrado');
  if(m=='DELETE'){db.items.splice(i,1);await sj('db',db);return J({ok:1})}
  if(m=='PUT'){const o=clean(await body(req,10e3));if(!o)return bad('Dados inválidos');db.items[i]={...db.items[i],...o};await sj('db',db);return J({ok:1})}}
 return J({error:'Não encontrado'},404)}
async function order(req,ip){
 if(!await hit('o'+ip,8,6e4))return J({error:'Muitos pedidos seguidos. Aguarde um minuto.'},429);
 const b=await body(req,20e3)||{},e=b.tipo=='e',nome=txt(b.nome,60),fone=txt(b.fone,25),rua=txt(b.rua,80),nr=txt(b.num,10),bai=txt(b.bai,50),ref=txt(b.ref,80),obs=txt(b.obs,200),troco=txt(b.troco,20),
 pg=['Pix','Cartão (na entrega)','Dinheiro'].includes(b.pg)?b.pg:null,tal=/^Não/.test(b.tal)?'Não, sem talheres':'Sim, com talheres';
 if(!Array.isArray(b.items)||!b.items.length||b.items.length>40||!nome||fone.replace(/\D/g,'').length<8||!pg||(e&&!(rua&&nr&&bai)))return bad();
 const db=await loadDb(),ln='━━━━━━━━━━━━━━━━━━',L=[],its=[];let sub=0;
 for(const x of b.items){const it=db.items.find(i=>i.id==Number(x.id)&&i.active),n=Number(x.q);if(!it||!Number.isInteger(n)||n<1||n>50)return bad();
  const sz=it.p2!=null&&Number(x.sz)==1?1:0,bd=it.cat=='pz'&&[1,2,3].includes(Number(x.bd))?Number(x.bd):0,price=eff(sz?it.p2:it.p1,it.promo)+BD[bd][1],
  det=(it.p2!=null?SZ[sz]:'')+(bd?' + borda '+BD[bd][0]:'')+(it.promo?' (promo -'+it.promo+'%)':'');
  sub+=price*n;its.push([it.id,n]);L.push('▪️ *'+n+'x '+it.name+'*',...(det?['     _'+det+'_']:[]),'     '+R(price*n),'')}
 sub=Math.round(sub*100)/100;const f=e?db.fee:0,total=Math.round((sub+f)*100)/100,code=Math.floor(1000+Math.random()*9000);
 const text=['🍕 *PIZZA HOUSE – NOVA CRUZ* 🍕','_Petiscaria_',ln,'📋 *COMANDA #'+code+'*','🕒 '+new Date().toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Fortaleza'}),ln,'👤 *Cliente:* '+nome,'📞 *Contato:* '+fone,'',e?'🛵 *ENTREGA*':'🏪 *RETIRADA NA LOJA*',
 ...(e?['📍 '+rua+', nº '+nr,'🏘️ Bairro: '+bai,...(ref?['📌 Ref.: '+ref]:[])]:[]),ln,'🍽️ *ITENS DO PEDIDO*','',...L,ln,'🍴 *Talheres:* '+tal,'💳 *Pagamento:* '+pg+(pg=='Dinheiro'&&troco?' (troco p/ '+troco+')':''),...(obs?['📝 *Obs.:* '+obs]:[]),ln,'Subtotal: '+R(sub),e?'Entrega: '+R(f):'Retirada: grátis','💰 *TOTAL: '+R(total)+'*',ln,'Obrigado pela preferência! 🧡'].join('\n');
 const sold=await gj('sold',{});its.forEach(([id,n])=>sold[id]=(sold[id]||0)+n);await sj('sold',sold);await st().set('orders/'+Date.now()+'-'+code,text);
 return J({url:'https://wa.me/'+WA+'?text='+encodeURIComponent(text)})}
