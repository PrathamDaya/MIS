
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LTS=["A+","A","A-","BBB+","BBB","BBB-","BB+","BB","BB-","B+","B","B-","C+","C","C-","D"],STS=["A1+","A1","A2+","A2","A3+","A3","A4+","A4","D"];
const DEF={lt:{"A-":"","BB+":"B+","BB":"B+","BB-":"B+","B+":"B","B":"B-","B-":"C+","C+":"C","C":"C-","C-":"C-","D":"D"},st:{"A4+":"A4","A4":"A4","D":"D"}};
let S={co:[],bk:[],map:DEF,inc:true},V="mis",F={q:"",an:"",gh:"",f:"all",rs:"live",tr:false,srt:"due",n:120,cols:{},mobileFilters:false,moreTotals:false};
try{const x=JSON.parse(localStorage.getItem("mis_v1")||"null");if(x&&x.co)S=Object.assign(S,x)}catch(e){}

let st;const save=()=>{clearTimeout(st);st=setTimeout(()=>{try{localStorage.setItem("mis_v1",JSON.stringify(S))}catch(e){}},300);xPushSoon()};
const toast=m=>{const t=$("#toast"),isError=/(?:could(?:n't| not)|couldn’t|unable|failed|error|unavailable|blocked|invalid|not found|can't|cannot|missing|denied)/i.test(String(m));t.textContent=m;t.dataset.state=isError?"error":"success";t.setAttribute("role",isError?"alert":"status");t.setAttribute("aria-live",isError?"assertive":"polite");t.setAttribute("aria-atomic","true");t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),3600)};
/* ---------- rating logic (mirrors check.xlsm Sheet1 / Sheet2) ---------- */
const gp=s=>{const m=String(s||"").match(/IVR\s*([ABCD]+[+\-]?\d*\+?)/i);return m?{g:m[1].toUpperCase(),ce:/\(CE\)/i.test(s),neg:/negative/i.test(s)}:null};
const isST=g=>/\d|^D$/.test(g)&&!LTS.includes(g)||g==="D"&&false;
const norm=(s,kind)=>{const p=gp(s);if(!p)return"";const inc=/INC|ISSUER/i.test(s);return`IVR ${p.g}${p.ce?"(CE)":""}${kind==="lt"&&p.g!=="D"&&p.neg?" /Negative":""}${inc?"; ISSUER NOT COOPERATING":""}`};
const fmt=(g,kind,ce)=>g?`IVR ${g}${ce?"(CE)":""}${kind==="lt"&&g!=="D"?" /Negative":""}${S.inc?"; ISSUER NOT COOPERATING":""}`:"";
const auto=(prev,kind)=>{const p=gp(prev);if(!p)return"";const m=S.map[kind][p.g];return m?fmt(m,kind,p.ce):""};
const rank=(g,kind)=>(kind==="lt"?LTS:STS).indexOf(g);
const action=(prev,cur,kind)=>{const a=gp(prev),b=gp(cur);if(!a||!b)return"";if(a.g===b.g)return"Reaffirmed";const x=rank(a.g,kind),y=rank(b.g,kind);return x>=0&&y>=0&&y<x?"Upgraded":"Downgraded"};
const D0=d=>{const x=new Date(d+"T00:00:00");return x},iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const TODAY=new Date(new Date().toDateString()+" 00:00");$("#today").textContent=TODAY.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const due=c=>{if(!c.lp)return null;const d=D0(c.lp);d.setFullYear(d.getFullYear()+1);return d};
const over=c=>{const d=due(c);return d?Math.round((TODAY-d)/864e5):null};
const fd=s=>s?D0(s).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"–";
const words=n=>{const o=["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],t=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
 const two=n=>n<20?o[n]:t[n/10|0]+(n%10?" "+o[n%10]:""),w=n=>{if(!n)return"";let r="";for(const[v,l]of[[1e7,"Crore"],[1e5,"Lakh"],[1e3,"Thousand"]])if(n>=v){r+=w(n/v|0)+" "+l+" ";n%=v}if(n>=100){r+=o[n/100|0]+" Hundred ";n%=100}if(n)r+=two(n);return r.trim()};return w(n)||"Zero"};
const amtWords=a=>{if(a===""||a==null||!Number.isFinite(Number(a)))return"";const units=Math.round(Number(a)*100);if(units<0)return"";const crore=Math.floor(units/100),lakhs=units%100,parts=[];if(crore)parts.push(words(crore)+" Crore");if(lakhs)parts.push(words(lakhs)+(lakhs===1?" Lakh":" Lakhs"));return"Rupees "+(parts.join(" and ")||"Zero")+" only"}
/* ---------- views ---------- */
const stat=c=>{const o=over(c);return c.w?["Withdrawn","nu"]:c.tr?["Transferred","nu"]:o==null?["No PR date","nu"]:o>0?[o+"d overdue","bad"]:o>=-30?["Due in "+-o+"d","warn"]:["Due in "+-o+"d","ok"]};
function list(){let r=S.co.filter(c=>{if(V==="ncd"&&!c.ncd)return false;if(F.rs==="live"&&c.tr||F.rs==="tr"&&!c.tr)return false;if(F.an&&c.an!==F.an)return false;if(F.gh&&c.gh!==F.gh)return false;
 const o=over(c);if(F.f==="over"&&!(o>0))return false;if(F.f==="soon"&&!(o!=null&&o<=0&&o>=-30))return false;if(F.f==="open"&&c.dn)return false;if(F.rs==="live"&&c.w||F.rs==="w"&&!c.w)return false;if(F.f==="done"&&!c.dn)return false;if(F.f==="mail"&&!dueM(c).length)return false;if(F.f==="fu"&&!(c.fu&&c.fu<=iso(TODAY)))return false;if(F.f==="bk"&&!S.bk.find(b=>b.id===c.id))return false;
 if(F.cdf&&(c.cd||c.cdp)!==F.cdf)return false;
 const cf=F.cols||{},cm=(k,v)=>!cf[k]||String(v??"").toLowerCase().includes(cf[k]),status=stat(c)[0];
 if(!cm("company",c.n)||!cm("amount",c.a)||!cm("lastpr",c.lp)||!cm("status",status)||!cm("lt",c.lt)||!cm("st",c.st))return false;
 return!F.q||(c.n+" "+c.an+" "+c.gh+" "+c.lt).toLowerCase().includes(F.q)});
 const k={due:c=>-(over(c)??-1e9),name:c=>c.n.toLowerCase(),amt:c=>-(c.a||0),cd:c=>c.cd||"9"}[F.srt];r.sort((a,b)=>k(a)>k(b)?1:k(a)<k(b)?-1:0);return r}
function mis(){const sc0=V==="ncd"?S.co.filter(c=>c.ncd):S.co,act=sc0.filter(c=>!c.tr&&!c.w),ov=act.filter(c=>over(c)>0).length,so=act.filter(c=>{const o=over(c);return o!=null&&o<=0&&o>=-30}).length;
 const an=[...new Set(sc0.map(c=>c.an).filter(Boolean))].sort(),gh=[...new Set(sc0.map(c=>c.gh).filter(Boolean))].sort(),L=list(),bs=new Set(S.bk.map(b=>b.id)),nt=sc0.filter(c=>c.tr&&!c.w).length,nw=sc0.filter(c=>c.w).length,fa=F.q||F.cdf||F.an||F.gh||Object.values(F.cols||{}).some(Boolean)||F.f!=="all"||F.rs!=="live",hid=(F.rs==="live"&&(nt||nw)?`<span>${nt} transferred and ${nw} withdrawn case(s) are hidden by Status. </span>`:"")+(fa?'<button class="btn" id="clrf" style="padding:2px 10px">Clear filters</button> ':"");
 let cardOrder=0;const sc=(k,n,l)=>`<div class="st ${F.f===k?"on":""}" data-f="${k}" style="--motion-index:${Math.min(cardOrder++,7)}"><b>${n}</b><span>${l}</span></div>`;
 return`${bn()}<div class="stats primary-stats">${sc("all",act.length,"Active cases")}${sc("over",ov,"Overdue for PR")}${sc("soon",so,"Due in 30 days")}${sc("open",act.filter(c=>!c.dn).length,"PR pending")}</div>
 <details class="secondary-stats" ${F.moreTotals||window.matchMedia("(min-width:761px)").matches?"open":""}><summary>More totals</summary><div class="stats">${sc("done",act.filter(c=>c.dn).length,"PR done")}${sc("mail",act.filter(c=>dueM(c).length).length,"Mails due")}${sc("bk",S.bk.length,"In committee basket")}${sc("fu",sc0.filter(c=>c.fu&&c.fu<=iso(TODAY)&&!c.tr).length,"Follow-ups due")}</div></details>
 <div class="bar case-toolbar ${F.mobileFilters?"mobile-filters-open":""}"><input type="search" id="q" placeholder="Search company, analyst, rating…" value="${esc(F.q)}"><button class="btn mobile-filter-toggle" id="toggleFilters" type="button" aria-expanded="${F.mobileFilters?"true":"false"}" aria-controls="case-filters">${F.mobileFilters?"Hide filters":"Filters"}</button>
 
 
 <select id="gh"><option value="">All group heads</option>${gh.map(x=>`<option ${F.gh===x?"selected":""}>${esc(x)}</option>`)}</select>
 <select id="rs" aria-label="Status"><option value="live">Status: live</option><option value="tr" ${F.rs==="tr"?"selected":""}>Status: transferred</option><option value="w" ${F.rs==="w"?"selected":""}>Status: withdrawn</option><option value="all" ${F.rs==="all"?"selected":""}>Status: all</option></select><select id="srt"><option value="due">Sort: most overdue</option><option value="name" ${F.srt==="name"?"selected":""}>Sort: name</option><option value="amt" ${F.srt==="amt"?"selected":""}>Sort: amount</option><option value="cd" ${F.srt==="cd"?"selected":""}>Sort: committee date</option></select>
 <button class="btn" id="paste">Paste list…</button>${F.f==="mail"?'<button class="btn p" id="zdue">Download due drafts (.zip)</button>':""}</div><div class="mut case-hint">${hid}Tap a company to edit it. Select cases for committee actions.</div>
 <div class="tw ${F.mobileFilters?"mobile-filters-open":""}" id="case-filters"><table><thead><tr><th><input type="checkbox" id="sa" ${L.length&&L.every(c=>bs.has(c.id))?"checked":""} title="Select / deselect everything shown"></th><th>Company<input class="col-filter" type="search" data-col-filter="company" value="${esc((F.cols||{}).company||"")}" placeholder="Filter" title="Filter company"></th><th class="num">₹ Cr<input class="col-filter" type="search" data-col-filter="amount" value="${esc((F.cols||{}).amount||"")}" placeholder="Filter" title="Filter amount"></th><th>Analyst<select id="an" class="col-filter"><option value="">All analysts</option>${an.map(x=>`<option ${F.an===x?"selected":""}>${esc(x)}</option>`).join("")}</select></th><th>Last PR<input class="col-filter" type="date" data-col-filter="lastpr" value="${esc((F.cols||{}).lastpr||"")}" title="Filter by Last PR date"></th><th>PR status<input class="col-filter" type="search" data-col-filter="status" value="${esc((F.cols||{}).status||"")}" placeholder="Filter" title="Filter PR status"></th><th>LT<input class="col-filter" type="search" data-col-filter="lt" value="${esc((F.cols||{}).lt||"")}" placeholder="Filter" title="Filter LT rating"></th><th>ST<input class="col-filter" type="search" data-col-filter="st" value="${esc((F.cols||{}).st||"")}" placeholder="Filter" title="Filter ST rating"></th><th>Committee<input class="col-filter" type="date" id="cdf" value="${esc(F.cdf||"")}" aria-label="Filter by committee date"></th><th>Mail</th></tr></thead><tbody>
 ${L.slice(0,F.n).map(c=>{const[t,k]=stat(c),inb=S.bk.some(b=>b.id===c.id);return`<tr class="r" data-id="${c.id}"><td><input type="checkbox" data-b="${c.id}" ${inb?"checked":""} title="Add to committee basket"></td><td data-e="${c.id}">${esc(c.n)} <a href="${ilink(c.n)}" target="_blank" rel="noopener" class="tag ac" style="text-decoration:none" title="Open on Infomerics website">↗</a>${c.ncd?' <span class="tag ac">NCD</span>':""}${c.nt?` <span title="${esc(c.nt)}">📝</span>`:""}<div class="mut" style="font-weight:400;font-size:12px">${esc(c.gh)}</div></td><td class="num">${c.a??"–"}</td><td>${esc(c.an)}</td><td>${fd(c.lp)}</td><td><span class="tag ${k}">${t}</span></td><td class="rt">${esc(c.lt.replace("; ISSUER NOT COOPERATING","")||"–")}</td><td class="rt">${esc(c.st.replace("; ISSUER NOT COOPERATING","")||"–")}</td><td>${fd(c.cd||c.cdp)}</td><td style="white-space:nowrap"><button class="btn" data-mail="${c.id}" style="padding:3px 8px" title="Checklist / reminder mail">✉</button> ${mst(c)}</td></tr>`}).join("")||`<tr><td colspan="11" class="empty">No cases match these filters.</td></tr>`}</tbody></table></div>
 <div class="mobile-list">${L.slice(0,F.n).map(c=>{const[t,k]=stat(c),inb=S.bk.some(b=>b.id===c.id),lt=c.lt.replace("; ISSUER NOT COOPERATING","")||"–",st=c.st.replace("; ISSUER NOT COOPERATING","")||"–";return`<article class="mobile-case" data-id="${c.id}"><div class="mobile-case-flags"><label><input type="checkbox" data-b="${c.id}" ${inb?"checked":""} aria-label="Add ${esc(c.n)} to committee basket"> Committee</label></div><div class="mobile-company-row"><button type="button" class="mobile-company-name" data-e="${c.id}">${esc(c.n)}</button><a href="${ilink(c.n)}" target="_blank" rel="noopener noreferrer" class="mobile-company-link" aria-label="Open ${esc(c.n)} on Infomerics">↗</a>${c.ncd?'<span class="tag ac">NCD</span>':""}${c.nt?`<span title="${esc(c.nt)}" aria-label="Has notes">📝</span>`:""}</div><div class="mobile-case-subtitle">${esc(c.gh||"")}</div><div class="mobile-case-summary"><div><span>Analyst</span><b>${esc(c.an||"–")}</b></div><div><span>Exposure</span><b>${c.a==null?"–":esc(c.a)+" Cr"}</b></div><div><span>Last PR</span><b>${fd(c.lp)||"–"}</b></div></div><div class="mobile-rating-row"><span class="tag ${k}">${esc(t)}</span><span class="tag nu">LT ${esc(lt)}</span><span class="tag nu">ST ${esc(st)}</span>${mst(c)}</div><details class="mobile-case-details"><summary>More case details</summary><dl><div><dt>Committee</dt><dd>${fd(c.cd||c.cdp)||"–"}</dd></div><div><dt>Follow-up</dt><dd>${fd(c.fu)||"–"}</dd></div><div><dt>Group head</dt><dd>${esc(c.gh||"–")}</dd></div></dl></details><div class="mobile-case-actions"><button class="btn" data-mail="${c.id}" type="button" aria-label="Open mail checklist for ${esc(c.n)}">Mail</button></div></article>`}).join("")||`<p class="mobile-empty">No cases match these filters.</p>`}</div>
 <div class="bar" style="margin-top:12px"><span class="mut">Showing ${Math.min(F.n,L.length)} of ${L.length}</span>${L.length>F.n?'<button class="btn" id="more">Show more</button>':""}</div>`}
const cur=(c,b,k)=>b[k]==="-"?"":b[k]?fmt(b[k],k,gp(c[k])?.ce):auto(c[k],k);
function cmt(){const items=S.bk.map(b=>({b,c:S.co.find(c=>c.id===b.id)})).filter(x=>x.c);
 const opt=(arr,v)=>`<option value="">Auto (rule)</option><option value="-" ${v==="-"?"selected":""}>None</option>${arr.map(g=>`<option ${v===g?"selected":""}>${g}</option>`)}`;
 return`<div class="panel"><h2>Generate documents for ${items.length} selected case${items.length===1?"":"s"}</h2><div class="gen">
 <button class="btn p" id="genbundle" ${items.length?"":"disabled"}>Generate selected documents…</button>
 <button class="btn" id="cp" ${items.length?"":"disabled"}>Copy committee brief</button><button class="btn" id="csv" ${items.length?"":"disabled"}>Export as check sheet (.csv)</button><button class="btn" id="mdone" ${items.some(x=>!x.c.dn)?"":"disabled"}>Mark all done…</button><button class="btn" id="rt">Update Word templates…</button><button class="btn" id="prt">Print / save as PDF</button><button class="btn p" id="bmail" ${items.length?"":"disabled"}>✉ Mails for these cases…</button><button class="btn p" id="held" ${items.length?"":"disabled"}>Committee held: start timers…</button></div>
 <div class="bar" style="margin:12px 0 0"><label><b>Committee date</b> <input type="date" data-cd value="${S.lcd||""}"></label><span class="mut">applies to all ${items.length} case(s) below</span></div><p class="mut" style="margin:10px 0 0;font-size:12px">Select one or more document types above. The ZIP contains Company / INC _ MMMYY, with Rating Note in Rating Pack, Rating Letter and Press Release in Post Rating Process, and an empty Rating Process folder.
 <label style="margin-left:8px"><input type="checkbox" id="inc" ${S.inc?"checked":""}> Add “ISSUER NOT COOPERATING”</label></p></div>
 <div class="cases">${items.map(({b,c})=>{const cl=cur(c,b,"lt"),cs=cur(c,b,"st"),al=action(c.lt,cl,"lt"),as=action(c.st,cs,"st"),kc=x=>x==="Downgraded"?"bad":x==="Upgraded"?"ok":"nu";
 return`<div class="case"><div><h3>${esc(c.n)} <a href="${ilink(c.n)}" target="_blank" rel="noopener" class="tag ac" style="text-decoration:none" title="Open on Infomerics website">↗</a></h3><div class="mut">₹ ${c.a??"–"} Cr · ${esc(c.an)} · Last PR ${fd(c.lp)} · <b>Committee ${fd(c.cd||c.cdp)}</b></div></div>
 <div class="pair"><span class="mut">LT</span><span class="rt">${esc(c.lt||"–")} → <b>${esc(cl||"–")}</b> ${al?`<span class="tag ${kc(al)}">${al}</span>`:""}</span><span class="mut">ST</span><span class="rt">${esc(c.st||"–")} → <b>${esc(cs||"–")}</b> ${as?`<span class="tag ${kc(as)}">${as}</span>`:""}</span></div>
 <div style="display:grid;gap:6px"><select data-o="lt" data-id="${c.id}" title="Decide current LT">${opt(LTS,b.lt)}</select><select data-o="st" data-id="${c.id}" title="Decide current ST">${opt(STS,b.st)}</select><button class="btn d" data-rm="${c.id}">Remove</button></div>
 <div class="say"><b>Say in committee:</b> ${esc(say(c,cl,cs,al,as))}</div></div>`}).join("")||`<div class="empty panel">No cases yet. Tick the checkbox in the first column of the MIS table to add cases here.</div>`}</div>`}
const say=(c,cl,cs,al,as)=>{const p=[];if(c.lt||cl)p.push(`LT: ${c.lt?c.lt.split(";")[0]:"new"} → ${cl?cl.split(";")[0]:"none"} (${al||"n/a"})`);if(c.st||cs)p.push(`ST: ${c.st?c.st.split(";")[0]:"new"} → ${cs?cs.split(";")[0]:"none"} (${as||"n/a"})`);return`${c.n}, ₹${c.a??"–"} Cr. ${p.join("; ")}.`};
const co=id=>S.co.find(c=>c.id===id);
const ttl=()=>{const A=S.co.filter(c=>!c.tr&&!c.w).length,T={mis:["All cases",A+" active · "+S.co.length+" in total"],ncd:["NCD cases",S.co.filter(c=>c.ncd&&!c.tr&&!c.w).length+" active NCD cases"],ins:["Insights","Exposure, ratings and workload at a glance"],dl:["Deadlines","Rating Letter, Press Release and website upload after each committee"],cmt:["Committee",S.bk.length+" case(s) selected"]}[V]||["",""];return`<div class="ttl"><h2>${T[0]}</h2><p>${T[1]}</p></div>`};
function setB(ids,on){ids=[...new Set(ids)];S.bk=S.bk.filter(b=>!ids.includes(b.id));if(on)ids.forEach(id=>S.bk.push({id,lt:"",st:""}));save();render()}
function applyCd(v){if(!v)return;S.lcd=v;let n=0;S.bk.forEach(b=>{const c=co(b.id);if(c&&!c.dn&&!c.tr&&!c.w){c.cd=v;n++}});save();render();toast("Committee date "+fd(v)+" set for "+n+" case(s)"+(n<S.bk.length?" (skipped "+(S.bk.length-n)+" done/transferred)":""))}
function bar(){const sb=$("#sel"),n=S.bk.length;sb.hidden=!n||V==="cmt"||V==="ins"||V==="dl";if(sb.hidden)return;sb.innerHTML=`<b>${n} selected</b><label>Committee date <input type="date" data-cd value="${S.lcd||""}"></label><button class="btn" id="bmail2">✉ Mails</button><button class="btn p review-button" id="gocm" type="button" aria-label="Review selected cases in Committee"><span class="svg-wrapper-1" aria-hidden="true"><span class="svg-wrapper"><svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path></svg></span></span><span>Review in Committee</span></button><button class="btn" id="clr">Clear</button>`}
function pasteDlg(){const dlg=$("#dlg");dlg.innerHTML=`<div class="dh">Add cases by pasting names</div><div class="db"><label class="f">One company per line (from your agenda or an Excel column)<textarea id="pl" rows="10"></textarea></label></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Add to basket</button></div>`;dlg.showModal();
 dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  const n1=x=>x.split("\t")[0].toLowerCase().replace(/^\s*(\d+[.)]|[-•*])\s*/,"").replace(/[^a-z0-9& ]/g," ").replace(/\s+/g," ").trim(),ids=[],miss=[];
  $("#pl").value.split("\n").map(n1).filter(Boolean).forEach(l=>{const c=S.co.find(c=>n1(c.n)===l)||(l.length>=4?S.co.find(c=>{const n=n1(c.n);return n.includes(l)||l.includes(n)}):null);c?ids.push(c.id):miss.push(l)});
  dlg.close();setB(ids,true);toast(ids.length+" added"+(miss.length?", not found: "+miss.slice(0,3).join(", ")+(miss.length>3?"…":""):""))}}
function syncNavIndicator(){const nav=$("#primary-nav"),indicator=nav&&nav.querySelector(".nav-indicator"),active=nav&&nav.querySelector("button[data-v].on");if(!nav||!indicator||!active)return;const n=nav.getBoundingClientRect(),a=active.getBoundingClientRect();if(!n.width||!a.width)return;const x=a.left-n.left,y=a.top-n.top,w=a.width,h=a.height,m=window.MISMotion,reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(m&&!reduced)m.animate(indicator,{x,y,width:w,height:h},{type:"spring",stiffness:500,damping:30});else{indicator.style.transform="translate("+x+"px,"+y+"px)";indicator.style.width=w+"px";indicator.style.height=h+"px"}}
function animateViewEntrance(){const view=$("#app .view-enter"),m=window.MISMotion;if(!view||!m||window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const blocks=Array.from(view.children).filter(el=>!el.classList.contains("stats")&&!el.classList.contains("secondary-stats")),cards=view.querySelectorAll(".stats .st");if(blocks.length)m.animate(blocks,{opacity:[0,1],y:[10,0]},{duration:.42,ease:"easeOut",delay:m.stagger(.045)});if(cards.length)m.animate(cards,{opacity:[0,1],y:[12,0],scale:[.98,1]},{duration:.46,ease:"easeOut",delay:m.stagger(.03)})}
document.addEventListener("mis-motion-ready",()=>{syncNavIndicator();animateViewEntrance()});
function render(animate=false){const oldMore=$("#app .secondary-stats");if(oldMore)F.moreTotals=oldMore.open;const view=ttl()+(V==="dl"?"":al())+(V==="cmt"?cmt():V==="ins"?ins():V==="dl"?dl():mis()),host=$("#app");host.innerHTML=animate?String.fromCharCode(60)+"div class="+String.fromCharCode(34)+"view-enter"+String.fromCharCode(34)+String.fromCharCode(62)+view+String.fromCharCode(60)+"/div"+String.fromCharCode(62):view;if(!S.co.length)host.insertAdjacentHTML("afterbegin",'<div class="panel"><h2>Welcome</h2><p class="mut" style="margin:6px 0 12px">No cases loaded yet. Connect your database to load your cases on this device, or import your Portfolio Excel once (menu → Import Excel).</p><button class="btn p" onclick="dbDlg()">Connect database (all devices)</button> <button class="btn" onclick="document.querySelector(\'#xs\').click()">Use a local Excel file</button></div>');$("#bc").textContent=S.bk.length;$("#nc").textContent=S.co.filter(c=>c.ncd&&!c.tr).length;$("#add").textContent=V==="ncd"?"+ Add NCD company":"+ Add company";document.querySelectorAll("#primary-nav button[data-v]").forEach(b=>{const active=b.dataset.v===V;b.classList.toggle("on",active);b.setAttribute("aria-current",active?"page":"false")});bar();dbadge();requestAnimationFrame(()=>{syncNavIndicator();if(animate)animateViewEntrance()})}
/* ---------- downloads ---------- */
async function out(name,data){try{const d=window.claude&&await claude.use("downloads");if(d){await d.save({filename:name,data});return}}catch(e){if(e&&e.code==="declined")return}
 const a=document.createElement("a"),u=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
const clean=s=>s.replace(/[\\\/:*?"<>|]/g,"_").trim().replace(/[. ]+$/,"");
const PARTS=/^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/,PH=/\{\s*\{\s*([^{}]*?)\s*\}\s*\}/g;
function mailDates(c){
 const dates=["m1","r1","r2"].map(k=>(c.ml&&c.ml.d&&c.ml.d[k])||(c.md&&c.md[k])||"").filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
 const f=dates.map(x=>D0(x).toLocaleDateString("en-US",{month:"long",day:"2-digit",year:"numeric"}));
 if(!f.length)return"–";if(f.length===1)return f[0];if(f.length===2)return f[0]+" and "+f[1];return f.slice(0,-1).join(", ")+", and "+f[f.length-1]
}
function needsNoOutlook(cl,cs){
 const ratings=[cl,cs].filter(Boolean);
 return ratings.some(r=>{const p=gp(r);return p&&p.g==="D"&&/(?:ISSUER\s+NOT\s+COOPERATING|\bINC\b)/i.test(r)})||(!cl&&!!cs)
}
function fill(xml,vals,literals,opts){
 opts=opts||{};
 const doc=new DOMParser().parseFromString(xml,"application/xml");if(doc.getElementsByTagName("parsererror").length)throw new Error("unreadable template XML");
 for(const p of [...doc.getElementsByTagName("w:p")]){
  const ts=[...p.getElementsByTagName("w:t")].filter(t=>{let n=t.parentNode;while(n&&n.nodeName!=="w:p")n=n.parentNode;return n===p});if(!ts.length)continue;
  const tx=ts.map(t=>t.textContent),full=tx.join("");
  if(opts.omitOutlook&&/Criteria of assigning rating outlook/i.test(full)){p.parentNode.removeChild(p);continue}
  if(opts.notApplicable&&/^Outlook:\s*Negative$/i.test(full.trim())){ts[0].textContent="Outlook: Not Applicable";ts.slice(1).forEach(t=>t.textContent="");ts.forEach(t=>t.setAttribute("xml:space","preserve"));continue}
  if(opts.notApplicable&&/^The Outlook remained negative due to information availability risk\.$/i.test(full.trim())){p.parentNode.removeChild(p);continue}
  const ln=tx.map(x=>x.length),st=[];let pos=0;ln.forEach(l=>{st.push(pos);pos+=l});
  const ed=[];let m;PH.lastIndex=0;while((m=PH.exec(full))){const k=m[1].replace(/\s+/g," ").trim().toLowerCase();if(k in vals)ed.push([m.index,m.index+m[0].length,vals[k]])}
  Object.entries(literals||{}).forEach(([from,to])=>{if(!from)return;let at=0;while((at=full.indexOf(from,at))>=0){ed.push([at,at+from.length,String(to)]);at+=from.length}});
  const dateNow=new Date(),dateShort=dateNow.toLocaleDateString("en-US",{month:"short"}),dateLong=dateNow.toLocaleDateString("en-US",{month:"long"}),dateYear=dateNow.getFullYear(),datePattern=/\b(Mmmm|Mmm)\s+XX,\s*(?:Y{3,4}|\d{4})\b/gi;let dm;while((dm=datePattern.exec(full)))ed.push([dm.index,dm.index+dm[0].length,(dm[1].length===4?dateLong:dateShort)+" XX, "+dateYear]);
  ed.sort((a,b)=>b[0]-a[0]);
  for(const[a,b,v]of ed){let first=true;ts.forEach((t,i)=>{const x=st[i],y=x+ln[i];if(y<=a||x>=b)return;const lo=Math.max(a,x)-x,hi=Math.min(b,y)-x;tx[i]=tx[i].slice(0,lo)+(first?v:"")+tx[i].slice(hi);first=false})}
  if(ed.length)ts.forEach((t,i)=>{t.textContent=tx[i];t.setAttribute("xml:space","preserve")})
 }
 const o=new XMLSerializer().serializeToString(doc);return/^<\?xml/.test(o)?o:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+o
}
const pick=(acc=".docx")=>new Promise(r=>{const f=$("#fi");f.accept=acc;f.value="";f.onchange=()=>r(f.files[0]);f.click()});
const docKinds=[["note","Rating Note"],["letter","Rating Letter"],["pr","Press Release"]];
function bytesB64(buf){const a=new Uint8Array(buf);let s="";for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(i+0x8000,a.length)));return btoa(s)}
function b64Bytes(s){const x=atob(s),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}
function templateDlg(){
 const dlg=$("#dlg"),saved=S.docTemplates||{};
 dlg.innerHTML='<div class="dh">Update Word templates</div><div class="db"><p class="f mut" style="margin:0 0 10px">Choose any template files you want to add or replace. The saved versions are shared with signed-in MIS users through your database.</p>'+
 docKinds.map(([k,n])=>'<label class="f">'+n+' · '+(saved[k]?'Saved':'Not uploaded')+'<input type="file" id="tpl-'+k+'" accept=".docx"></label>').join("")+
 '<p class="f mut" style="margin:0;font-size:12px">Only Word .docx files are accepted. Choosing no file leaves that template unchanged.</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Save selected templates</button></div>';
 dlg.showModal();dlg.onclick=async e=>{
  const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  const updates={};
  try{
   for(const[k,n]of docKinds){const f=$("#tpl-"+k).files[0];if(!f)continue;if(f.size>10*1024*1024)throw new Error(n+" is over the 10 MB limit");
    const buf=await f.arrayBuffer(),z=new PizZip(buf);if(!z.file("word/document.xml"))throw new Error(f.name+" is not a readable Word document");updates[k]=bytesB64(buf)}
   const keys=Object.keys(updates);if(!keys.length)return toast("Choose at least one .docx file");
   S.docTemplates=Object.assign({},S.docTemplates||{},updates);save();dlg.close();render();
   toast(keys.length+" template(s) saved"+(XH&&XH.db?"; syncing to the shared database":" on this device; sign in to share them"));
  }catch(err){toast("Could not save templates: "+err.message)}
 }
}
const ANNEXURE_HEADERS=["Name of Facility/ /Security","ISIN","Date of Issuance","Coupon Rate/ IRR","Maturity Date","Size of Facility / (Rs. Crore)","Rating Assigned/ Outlook","Listing Status","Regulator^","Complexity Indicator"];
const ANNEXURE_FIELDS=[["name","Name of Facility / Security"],["isin","ISIN"],["issuance","Date of Issuance"],["coupon","Coupon Rate / IRR"],["maturity","Maturity Date"],["size","Size of Facility (Rs. Crore)"],["ratingType","Rating Assigned / Outlook"],["listingStatus","Listing Status"],["regulator","Regulator^"],["complexity","Complexity Indicator"]];
const emptyFacility=()=>({name:"",isin:"-",issuance:"-",coupon:"-",maturity:"-",size:"",ratingType:"",listingStatus:"NA",regulator:"RBI",complexity:"Simple"});
function facilityEditor(c,index){
 const rows=Array.isArray(c.annexure1)&&c.annexure1.length?c.annexure1:[emptyFacility()];
 const heads=ANNEXURE_FIELDS.map(([,label])=>"<th scope=\"col\">"+label+"</th>").join("");
 const body=rows.map((row,i)=>"<tr>"+ANNEXURE_FIELDS.map(([field])=>{
  if(field==="ratingType")return"<td><select data-facility-id=\""+c.id+"\" data-facility-row=\""+i+"\" data-facility-field=\"ratingType\" aria-label=\"Rating option for row "+(i+1)+"\"><option value=\"\">Choose LT / ST / Both</option><option value=\"LT\" "+(row.ratingType==="LT"?"selected":"")+">LT</option><option value=\"ST\" "+(row.ratingType==="ST"?"selected":"")+">ST</option><option value=\"Both\" "+(row.ratingType==="Both"?"selected":"")+">Both</option></select></td>";
  const remove=field==="name"?"<button class=\"btn annexure-remove\" type=\"button\" data-remove-facility=\""+c.id+"\" data-facility-row=\""+i+"\" aria-label=\"Remove facility row "+(i+1)+"\">Remove</button>":"";
  return"<td><input type=\"text\" value=\""+esc(row[field]??"")+"\" data-facility-id=\""+c.id+"\" data-facility-row=\""+i+"\" data-facility-field=\""+field+"\" aria-label=\""+ANNEXURE_FIELDS.find(x=>x[0]===field)[1]+" for row "+(i+1)+"\">"+remove+"</td>";
 }).join("")+"</tr>").join("");
 return"<details class=\"annexure-case\" "+(index===0?"open":"")+"><summary>"+esc(c.n)+" · "+(Array.isArray(c.annexure1)?c.annexure1.length:0)+" saved facility row(s)</summary><div class=\"annexure-case-body\"><div class=\"annexure-table-scroll\" role=\"region\" tabindex=\"0\" aria-label=\"Horizontal Annexure 1 facilities table for "+esc(c.n)+"\"><table class=\"annexure-input-table\"><thead><tr>"+heads+"</tr></thead><tbody>"+body+"</tbody></table></div><div class=\"annexure-actions\"><button class=\"btn\" type=\"button\" data-add-facility=\""+c.id+"\">+ Add facility</button><span class=\"mut\">Rows are saved to this company and reused next time. Scroll horizontally to reach all 10 columns.</span></div></div></details>";
}
function annexureRating(row,kind,cl,cs){
 if(kind==="note")return"-";
 const selected=row.ratingType==="Both"?[cl,cs]:row.ratingType==="LT"?[cl]:row.ratingType==="ST"?[cs]:[];
 return selected.filter(Boolean).map(value=>String(value).replace(/;?\s*ISSUER NOT COOPERATING\*?/ig,"; ISSUER NOT COOPERATING*")).join(" / ")||"-";
}
function writeAnnexureTable(xml,company,kind,cl,cs){
 const doc=new DOMParser().parseFromString(xml,"application/xml");
 if(doc.getElementsByTagName("parsererror").length)throw new Error("The Word document XML could not be read");
 const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
 const textOf=el=>[...el.getElementsByTagName("w:t")].map(t=>t.textContent).join("");
 const expected=ANNEXURE_HEADERS.map(normalize);
 const table=[...doc.getElementsByTagName("w:tbl")].find(tbl=>{
  const row=tbl.getElementsByTagName("w:tr")[0];if(!row)return false;
  const cells=[...row.getElementsByTagName("w:tc")];
  return cells.length>=expected.length&&expected.every((heading,i)=>normalize(textOf(cells[i]))===heading);
 });
 if(!table)throw new Error("Could not find the 10-column Annexure 1 table in the "+(kind==="note"?"Rating Note":kind==="letter"?"Rating Letter":"Press Release")+" template. Keep the Annexure 1 column headings unchanged.");
 const rows=[...table.getElementsByTagName("w:tr")];if(rows.length<2)throw new Error("The Annexure 1 template needs one sample facility row to preserve its formatting");
 const prototype=rows[1].cloneNode(true);rows.slice(1).forEach(row=>row.parentNode.removeChild(row));
 const facilities=(Array.isArray(company.annexure1)?company.annexure1:[]).filter(row=>String(row.name||"").trim());
 for(const facility of facilities){
  const row=prototype.cloneNode(true),cells=[...row.getElementsByTagName("w:tc")];
  const values=[facility.name,facility.isin,facility.issuance,facility.coupon,facility.maturity,facility.size,annexureRating(facility,kind,cl,cs),facility.listingStatus,facility.regulator,facility.complexity];
  cells.slice(0,values.length).forEach((cell,i)=>{
   const runs=[...cell.getElementsByTagName("w:t")];
   if(!runs.length)throw new Error("An Annexure 1 template cell has no editable text run");
   runs[0].textContent=String(values[i]??"");runs[0].setAttribute("xml:space","preserve");runs.slice(1).forEach(run=>run.textContent="");
  });
  table.appendChild(row);
 }
 const output=new XMLSerializer().serializeToString(doc);
 return/^<\?xml/.test(output)?output:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+output;
}
function generateDlg(){
 const dlg=$("#dlg");if(dlg.open)dlg.close();const cases=S.bk.map(b=>({b:b,c:S.co.find(x=>x.id===b.id)})).filter(x=>x.c);
 dlg.innerHTML='<div class="dh">Generate documents for '+S.bk.length+' selected case(s)</div><div class="db annexure-dialog-body"><p class="f mut" style="margin:0 0 10px">Choose document types and enter Annexure 1 facilities for each company. The same horizontal facility rows are inserted into the Note, Rating Letter, and Press Release.</p>'+
 docKinds.map(([k,n])=>'<label class="f"><span><input type="checkbox" id="gen-'+k+'" checked> '+n+' · '+((S.docTemplates||{})[k]?'template saved':'template needed')+'</span></label>').join("")+
 '<p class="f mut annexure-help">Add the 10-column headings below each company. Rating Note always shows “-”. For Rating Letter and Press Release, choose LT, ST, or Both; the current committee rating is used, with the * marker when “ISSUER NOT COOPERATING” is enabled. You can enter “-” in any field that does not apply.</p>'+
 cases.map((item,i)=>facilityEditor(item.c,i)).join("")+
 '<p class="f mut annexure-help">Short name, former name, and funding-basis placeholders in Word templates are omitted automatically. The committee date sets the MMMYY folder name.</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Generate ZIP</button></div>';
 dlg.showModal();
 dlg.onchange=e=>{
  const t=e.target;if(!t.dataset.facilityField)return;
  const company=co(+t.dataset.facilityId),rowIndex=+t.dataset.facilityRow,field=t.dataset.facilityField;if(!company)return;
  const rows=Array.isArray(company.annexure1)?company.annexure1.slice():[];
  while(rows.length<=rowIndex)rows.push(emptyFacility());
  rows[rowIndex][field]=t.value;company.annexure1=rows;const summary=t.closest(".annexure-case")?.querySelector("summary");if(summary)summary.textContent=company.n+" · "+rows.length+" saved facility row(s)";save();
 };
 dlg.onclick=async e=>{
  const add=e.target.closest("[data-add-facility]");
  if(add){const company=co(+add.dataset.addFacility);if(!company)return;const rows=Array.isArray(company.annexure1)&&company.annexure1.length?company.annexure1.slice():[emptyFacility()];rows.push(emptyFacility());company.annexure1=rows;save();return generateDlg()}
  const remove=e.target.closest("[data-remove-facility]");
  if(remove){const company=co(+remove.dataset.removeFacility);if(!company)return;const rows=Array.isArray(company.annexure1)&&company.annexure1.length?company.annexure1.slice():[emptyFacility()];rows.splice(+remove.dataset.facilityRow,1);company.annexure1=rows.length?rows:[emptyFacility()];save();return generateDlg()}
  const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  const selected=docKinds.filter(([k])=>$("#gen-"+k).checked);if(!selected.length)return toast("Select at least one document type");
  if(!cases.length)return toast("Select at least one case first");
  const missing=selected.filter(([k])=>!(S.docTemplates||{})[k]);if(missing.length){dlg.close();return toast("Upload the "+missing.map(x=>x[1]).join(", ")+" template(s) with Update Word templates first")}
  const withFacilities=cases.filter(({c})=>Array.isArray(c.annexure1)&&c.annexure1.some(row=>String(row.name||"").trim()));
  if(withFacilities.length!==cases.length)return toast("Enter at least one facility name in Annexure 1 for every selected company");
  if(selected.some(([k])=>k==="letter"||k==="pr")&&cases.some(({c})=>c.annexure1.some(row=>String(row.name||"").trim()&&!["LT","ST","Both"].includes(row.ratingType))))return toast("Choose LT, ST, or Both for each facility before generating the Rating Letter or Press Release");
  try{
   const z=new PizZip();let count=0;
   for(const item of cases){
    const c=item.c,ds=c.cd||c.cdp||S.lcd||iso(TODAY),dt=D0(ds),month=dt.toLocaleDateString("en-US",{month:"short"}).toUpperCase()+String(dt.getFullYear()).slice(-2);
    const root=clean(c.n)+"/INC _ "+month;
    z.folder(root+"/Post Rating Process");z.folder(root+"/Rating Pack");z.folder(root+"/Rating Process");
    const dateText=dt.toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
    const cl=cur(c,item.b,"lt"),cs=cur(c,item.b,"st");
    const vals={"company name":c.n,"amount":c.a==null?"":(+c.a).toFixed(2),"amount words":amtWords(c.a),"previous rating lt":c.lt,"previous rating st":c.st,"current rating lt":cl,"current rating st":cs,"action lt":action(c.lt,cl,"lt"),"action st":action(c.st,cs,"st"),"committee date":dateText,"rating date":dateText,"mail dates":mailDates(c),"last pr date":c.lp?D0(c.lp).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"–","company short name":"","company acronym":"","short name":"","formerly known as":"","former name":"","funding basis":""};
    const literals={"April 07, 2025":dateText,"[Fund/Non-Fund based]":"","[Formerly known as ...]":""};
    for(const[k,label]of selected){
     const docVals=k==="note"?vals:{...vals,"amount words":""};
     const template=new PizZip(b64Bytes(S.docTemplates[k]));
     const noOutlook=needsNoOutlook(cl,cs),opts={omitOutlook:(k==="note"||k==="pr")&&noOutlook,notApplicable:k==="pr"&&noOutlook};
     template.file(PARTS).forEach(f=>{let xml=fill(f.asText(),docVals,literals,opts);if(f.name==="word/document.xml")xml=writeAnnexureTable(xml,c,k,cl,cs);template.file(f.name,xml)});
     const typeFolder=k==="note"?"Rating Pack":"Post Rating Process",title=label==="Press Release"?"Press Release":label;
     z.folder(root+"/"+typeFolder).file(title+"_"+clean(c.n)+".docx",template.generate({type:"uint8array",compression:"DEFLATE"}));count++
    }
   }
   await out("MIS_Rating_Bundle_"+iso(TODAY).replace(/-/g,"")+".zip",z.generate({type:"uint8array",compression:"DEFLATE"}));dlg.close();toast(count+" document(s) saved in the company/month folder bundle")
  }catch(err){toast("Could not generate documents: "+err.message)}
 }
}

const undone=c=>{c.dn=false;delete c.dd;if("lp0"in c){c.lp=c.lp0;delete c.lp0}if(c.cdp&&!c.cd&&(!c.lp||c.lp<c.cdp)){c.cd=c.cdp;delete c.cdp}};
function doneDlg(ids){const dlg=$("#dlg"),cs=ids.map(i=>S.co.find(c=>c.id===i)).filter(Boolean);if(!cs.length)return;
 const oth=S.bk.map(b=>S.co.find(c=>c.id===b.id)).filter(c=>c&&!c.dn&&!ids.includes(c.id));
 dlg.innerHTML=`<div class="dh">Mark PR done · ${cs.length>1?cs.length+" cases":esc(cs[0].n)}</div><div class="db"><label class="f">Date done / PR uploaded<input type="date" id="dd" value="${S.ld||cs[0].cd||iso(TODAY)}"></label>
 ${oth.length?`<label class="f"><span><input type="checkbox" id="dall" checked> Also mark the other ${oth.length} pending case(s) in my committee basket with this date</span></label>`:""}
 <label class="f"><span><input type="checkbox" id="dlp" checked> Set this date as Last PR date (next review moves to 12 months after it)</span></label></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Mark done</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();const d=$("#dd").value;if(!d){toast("Pick a date");return}
  const all=[...cs,...($("#dall")?.checked?oth:[])],lp=$("#dlp").checked;all.forEach(c=>{if(c.dn)undone(c);c.dn=true;c.dd=d;if(lp){c.lp0=c.lp;c.lp=d}});S.ld=d;fin();toast(all.length+" case(s) marked done on "+fd(d))}}
/* ---------- dialogs ---------- */
const FLD=[["n","Company name","f"],["a","Amount (₹ Cr)","","number"],["an","Previous analyst"],["gh","Group head"],["lp","Last PR date","","date"],["cd","Committee date","","date"],["rlDate","Rating letter date","","date"],["fu","Follow-up date","","date"],["p","Contact person"],["ph","Number","","tel"],["em","Email","f","email"]];
const mk=(g,kind,ce,neg,inc)=>g?`IVR ${g}${ce?"(CE)":""}${kind==="lt"&&g!=="D"&&neg?" /Negative":""}${inc?"; ISSUER NOT COOPERATING":""}`:"";
const gOpt=(arr,v)=>`<option value="">— none —</option>${arr.concat(v&&!arr.includes(v)?[v]:[]).map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("")}`;
function rdd(c){const a=gp(c.lt),b=gp(c.st),inc=c.lt||c.st?/INC|ISSUER/i.test((c.lt||"")+(c.st||"")):true;
 return`<label>Previous LT rating<select name="lg">${gOpt(LTS,a?a.g:"")}</select></label><label>LT outlook<select name="lo"><option value="1" ${!a||a.neg?"selected":""}>Negative</option><option value="0" ${a&&!a.neg?"selected":""}>None</option></select></label>
 <label>Previous ST rating<select name="sg">${gOpt(STS,b?b.g:"")}</select></label><div class="fl" style="align-self:end;padding-bottom:6px"><label><input type="checkbox" name="lce" ${a&&a.ce?"checked":""}> LT (CE)</label><label><input type="checkbox" name="sce" ${b&&b.ce?"checked":""}> ST (CE)</label></div>
 <label>Rating status<select name="rs"><option value="0">Live</option><option value="1" ${c.w?"selected":""}>Withdrawn</option></select></label><label class="f">Notes<textarea name="nt" rows="3">${esc(c.nt||"")}</textarea></label><div class="f fl"><label><input type="checkbox" name="inc" ${inc?"checked":""}> Issuer not cooperating</label></div>`}
const uniq=k=>[...new Set(S.co.map(c=>String(c[k]||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
function selBox(k,l,cur){cur=String(cur||"").trim();return`<label>${l}<select name="${k}" data-new="${k}"><option value="">— select —</option>${uniq(k).map(x=>`<option ${x===cur?"selected":""}>${esc(x)}</option>`).join("")}<option value="__new">+ Add new…</option></select><input name="${k}2" placeholder="Type new name" hidden></label>`}
$("#dlg").addEventListener("change",e=>{const t=e.target;if(t.name==="lg"){const o=$("#dlg").querySelector("[name=lo]");if(o)o.value=t.value==="D"?"0":"1"}if(t.dataset&&t.dataset.pd){const c=co(+$("#dlg").dataset.id),sy=S.bk.some(b=>b.id===c.id)&&S.bk.length>1,L2=sy?S.bk.map(b=>co(b.id)):[c];L2.forEach(x=>{x.ml=x.ml||{};x.ml.d=Object.assign({},x.ml.d,{[t.dataset.pd]:t.value})});save();render();if(sy)toast("Date applied to all "+L2.length+" committee cases");return}if(t.dataset&&t.dataset.new){const i=$("#dlg").querySelector(`[name=${t.dataset.new}2]`);i.hidden=t.value!=="__new";if(!i.hidden)i.focus()}});
function form(c){const dlg=$("#dlg"),n=!c;c=c||{n:"",a:"",an:"",gh:"",lp:"",cd:"",rlDate:"",lt:"",st:"",p:"",ph:"",em:"",ncd:V==="ncd"};
 dlg.innerHTML=`<div class="dh">${n?"Add company to MIS":esc(c.n)}</div><div class="db">${FLD.map(([k,l,f,t])=>k==="an"||k==="gh"?selBox(k,l,c[k]):`<label class="${f}">${l}<input name="${k}" type="${t||"text"}" step="any" value="${esc(c[k]??"")}" ></label>`).join("")}${rdd(c)}
 <label><span>Withdrawal basis<select name="withdrawType"><option value="" ${!c.withdrawType?"selected":""}>No withdrawal</option><option value="NOC" ${c.withdrawType==="NOC"?"selected":""}>NOC-based</option><option value="NDC" ${c.withdrawType==="NDC"?"selected":""}>NDC-based</option></select></span></label>
 <label><span><input type="checkbox" name="ncd" ${c.ncd?"checked":""}> NCD case</span></label><label class="f"><span><input type="checkbox" name="tr" ${c.tr?"checked":""}> Transferred (hide from active list)</span></label>
 <div class="f"><button type="button" class="btn" id="prhist">View PR history (${(c.prHistory||[]).length})</button><span class="mut" style="font-size:12px;margin-left:8px">Each new PR date is saved as a separate history entry.</span></div>${n?"":'<div class="f"><button class="btn" value="transfer">Transfer to analyst…</button><span class="mut" style="font-size:12px;margin-left:8px">Save other edits first.</span></div>'}</div>
 <div class="df">${n?"":'<button class="btn d" value="del">Delete</button>'}<button class="btn" value="x">Cancel</button><button class="btn p" value="ok">${n?"Add":"Save"}</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  if(v==="transfer"){if(confirm("Transfer the saved case record? Save any edits in this form first; choose Cancel to return.")){dlg.close();transferDlg(c)}return}
  if(v==="del"){if(confirm("Delete "+c.n+"?")){(S.dl=S.dl||[]).push(key(c.xn||c.n));S.co=S.co.filter(x=>x.id!==c.id);S.bk=S.bk.filter(b=>b.id!==c.id);fin()}return}
  const g=k=>dlg.querySelector(`[name=${k}]`),sv=k=>g(k).value==="__new"?g(k+"2").value.trim():g(k).value,nm=g("n").value.trim();if(!nm){toast("Company name is required");return}
  if(n&&S.co.some(x=>x.n.toLowerCase()===nm.toLowerCase())){toast("That company already exists");return}
  if(!n&&nm.toLowerCase()!==c.n.toLowerCase()&&S.co.some(x=>x.id!==c.id&&x.n.toLowerCase()===nm.toLowerCase())){toast("Another company already has that name");return}
  const oldLp=c.lp||"",newLp=g("lp").value,oldHistory=Array.isArray(c.prHistory)?c.prHistory.slice():[];
  if(newLp&&newLp!==oldLp)oldHistory.push({date:newLp,kind:"Last PR date updated",at:new Date().toISOString()});
  const o={n:nm,a:g("a").value===""?null:+g("a").value,an:sv("an"),gh:sv("gh"),lp:newLp,cd:g("cd").value,rlDate:g("rlDate").value,sd:g("rlDate").value,prHistory:oldHistory,withdrawType:g("withdrawType").value,lt:mk(g("lg").value,"lt",g("lce").checked,g("lo").value==="1",g("inc").checked),st:mk(g("sg").value,"st",g("sce").checked,false,g("inc").checked),p:g("p").value.trim(),ph:g("ph").value.trim(),em:g("em").value.trim(),ncd:g("ncd").checked,tr:g("tr").checked,fu:g("fu").value,nt:g("nt").value.trim(),w:g("rs").value==="1"||!!g("withdrawType").value};
  if(!n&&nm!==c.n)o.xn=(c.xn&&key(c.xn)===key(nm))?undefined:(c.xn||c.n);
  if(o.withdrawType==="NOC"){o.w=true;o.withdrawStatus="Withdrawn after rating issued";}
  if(o.withdrawType==="NDC"){o.w=true;o.a=0;o.withdrawStatus="Withdrawn with amount reduced to ₹0.00 Cr";}
  if(n)S.co.unshift({id:Date.now()*1000+Math.floor(Math.random()*1000),dn:false,...o});else Object.assign(c,o);fin();toast(o.withdrawType==="NOC"?"Case marked withdrawn (NOC-based) with rating retained":o.withdrawType==="NDC"?"Case marked withdrawn; amount set to ₹0.00 Cr":(n?"Company added":"Saved"))}}
function fin(){$("#dlg").close();save();render()}
function rules(){const dlg=$("#dlg"),t=k=>Object.entries(S.map[k]).map(([a,b])=>`${a} > ${b}`).join("\n");
 dlg.innerHTML=`<div class="dh">Rating rules (previous → current)</div><div class="db"><label>Long term (one per line: PREVIOUS &gt; CURRENT, blank = decide manually)<textarea id="rl" rows="12">${esc(t("lt"))}</textarea></label><label>Short term<textarea id="rs" rows="12">${esc(t("st"))}</textarea></label><p class="f mut">This replaces the lookup table on Sheet2 of check.xlsm. Cases still use the “decide” dropdowns to override it.</p></div><div class="df"><button class="btn" value="r">Restore defaults</button><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Save</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  const par=s=>Object.fromEntries(s.split("\n").map(l=>l.split(">").map(x=>x.trim())).filter(a=>a[0]));
  S.map=v==="r"?DEF:{lt:par($("#rl").value),st:par($("#rs").value)};fin();toast("Rules updated")}}
function backup(){const dlg=$("#dlg");dlg.innerHTML=`<div class="dh">Backup & restore</div><div class="db"><p class="f mut">Your edits live in this browser. Download a backup to keep them safe or move to another device.</p><button class="btn f" value="exj">Download backup (.json)</button><button class="btn f" value="exc">Download MIS as spreadsheet (.csv)</button><button class="btn f" value="exx">Download MIS as Excel (.xlsx)</button><button class="btn f" value="exn">Download NCD sheet (.csv)</button><button class="btn f" value="imp">Restore from backup…</button></div><div class="df"><button class="btn" value="x">Close</button></div>`;
 dlg.showModal();dlg.onclick=async e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  if(v==="exj"){out("mis-backup.json",JSON.stringify(S));S.lb=iso(TODAY);save()}
  const H=["Company","Amount","Previous Analyst","Group Head","Last PR date","Next PR due","LT Rating","ST Rating","Committee Date","Done on","Contact","Number","Email"],R=a=>a.map(c=>[c.n,c.a,c.an,c.gh,c.lp,due(c)?iso(due(c)):"",c.lt,c.st,c.cd,c.dd||"",c.p,c.ph,c.em]);if(v==="exc")out("MIS.csv",csv(H,R(S.co)));if(v==="exn")out("NCD.csv",csv(H,R(S.co.filter(c=>c.ncd))));if(v==="exx")out("MIS.xlsx",xlsx(H,R(S.co)));
  if(v==="imp"){const f=await pick(".json");if(!f)return;try{const x=JSON.parse(await f.text());if(!x.co)throw 0;S=Object.assign(S,x);fin();toast("Backup restored")}catch(_){toast("That file isn't a valid backup")}}}}
const csv=(h,r)=>"\ufeff"+[h,...r].map(a=>a.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
/* ---------- Excel import (reads .xlsx/.xlsm directly, no library needed) ---------- */
const yes=v=>/^(true|yes|y|1)$/i.test(String(v));const colIdx=r=>r.replace(/\d/g,"").split("").reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0)-1,key=n=>String(n||"").toLowerCase().replace(/[^a-z0-9]/g,"");
function readXlsx(buf){const z=new PizZip(buf),rd=n=>{const f=z.file(n);return f?f.asText():null},P=s=>new DOMParser().parseFromString(s,"application/xml");
 if(!rd("xl/workbook.xml"))throw new Error("not an Excel workbook");
 const ss=[],sx=rd("xl/sharedStrings.xml");if(sx)[...P(sx).getElementsByTagName("si")].forEach(si=>ss.push([...si.getElementsByTagName("t")].map(t=>t.textContent).join("")));
 const rel={};[...P(rd("xl/_rels/workbook.xml.rels")).getElementsByTagName("Relationship")].forEach(r=>rel[r.getAttribute("Id")]=r.getAttribute("Target"));
 const sheets=[...P(rd("xl/workbook.xml")).getElementsByTagName("sheet")].map(s=>({name:s.getAttribute("name"),path:"xl/"+String(rel[s.getAttribute("r:id")]).replace(/^\/?(xl\/)?/,"")}));
 const grid=p=>{const x=rd(p);if(!x)return[];const rows=[];for(const row of P(x).getElementsByTagName("row")){const o={};for(const c of row.getElementsByTagName("c")){const t=c.getAttribute("t"),v=c.getElementsByTagName("v")[0],is=c.getElementsByTagName("is")[0];let val=null;
  if(t==="s"&&v)val=ss[+v.textContent];else if(t==="inlineStr"&&is)val=[...is.getElementsByTagName("t")].map(q=>q.textContent).join("");else if(v)val=t==="str"?v.textContent:t==="b"?v.textContent==="1":t==="e"?null:+v.textContent;o[colIdx(c.getAttribute("r"))]=val}rows[+row.getAttribute("r")-1]=o}return rows};
 const hdr=g=>{for(let i=0;i<Math.min(g.length,15);i++){const r=g[i];if(!r)continue;const m={};Object.entries(r).forEach(([c,v])=>{if(typeof v==="string")m[v.trim().toLowerCase()]=+c});if(m["name"]!==undefined)return{i,m}}return null};
 const dt=v=>{if(v==null||v==="")return"";if(typeof v==="number")return new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5).toISOString().slice(0,10);const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);return m?`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:""};
 const iss=[],tx=v=>v==null?"":String(v).replace(/\u00a0/g," ").trim(),cl=(v,nm,f)=>{const q=tx(v);if(/\[object Object\]/i.test(q)){iss.push({n:nm,m:f+": “[object Object]” removed"});return""}if(q[0]==="="){iss.push({n:nm,m:f+": formula text “"+q.slice(0,28)+"” removed"});return""}return q};
 let main=null,ncd=new Set();
 for(const sh of sheets){const g=grid(sh.path),h=hdr(g);if(!h)continue;
  if(/ncd/i.test(sh.name)){g.slice(h.i+1).forEach(r=>{if(r&&r[h.m["name"]])ncd.add(key(tx(r[h.m["name"]])))});continue}
  if(h.m["lt rating"]!==undefined||h.m["amount"]!==undefined){if(!main||/^all$/i.test(sh.name))main={g,h}}}
 if(!main)throw new Error("couldn't find a sheet with a Name column");
 const{g,h}=main,m=h.m,col=n=>m[n],skipCols=Object.values(m),out=[];
 for(const r of g.slice(h.i+1)){if(!r)continue;const name=tx(r[col("name")]);if(!name)continue;const ltRaw=tx(r[col("lt rating")]),stRaw=tx(r[col("st rating")]);const wd=/withdrawn/i.test(ltRaw+" "+stRaw);
  const g2=n=>col(n)===undefined?"":r[col(n)],dtf=(v,nm,f)=>{const q=dt(v);if(!q&&v!=null&&String(v).trim()!==""&&typeof v!=="number")iss.push({n:nm,m:f+": date “"+String(v).slice(0,20)+"” couldn't be read"});return q},sc=splitC(cl(g2("contact person"),name,"Contact").replace(/^-$/,""),cl(g2("number"),name,"Number").replace(/^-$/,"")),amt=g2("amount");if(/[A-Za-z]/.test(sc[1])||(/\d{6,}/.test(sc[0])))iss.push({n:name,m:"Contact looks malformed: “"+(sc[0]+" "+sc[1]).trim().slice(0,40)+"”"});
  out.push({n:name,a:typeof amt==="number"?amt:(parseFloat(amt)||null),an:tx(g2("previous analyst")),gh:tx(g2("group head")),lp:dtf(g2("last pr date"),name,"Last PR date"),lt:norm(ltRaw,"lt"),st:norm(stRaw,"st"),p:sc[0],ph:sc[1],em:tx(g2("email")),cd:(x=>clrs().includes(x)||clrc().includes(key(name)+"|"+x)?"":x)(dt(g2("committee date"))),dn:yes(g2("done")),dd:dt(g2("done on")),fu:dt(g2("follow-up date")),nt:tx(g2("notes")),md:{m1:dt(g2("checklist mail date")),r1:dt(g2("reminder 1 date")),r2:dt(g2("reminder 2 date"))},
   w:wd||yes(g2("withdrawn")),tr:yes(g2("transferred"))||/^transfer/i.test(tx(g2("transfer")))||Object.entries(r).some(([c,v])=>!skipCols.includes(+c)&&String(v).trim().toLowerCase()==="transfer"),ncd:ncd.has(key(name))||yes(g2("ncd"))})}
 {const m={};out.forEach(c=>{const k=canon(c.n);(m[k]=m[k]||[]).push(c.n)});Object.values(m).filter(a=>a.length>1).forEach(a=>iss.push({n:a[0],m:"Possible duplicate or variant: "+a.join(" ↔ ")}))}out.issues=iss;out.hasTr=col("transfer")!==undefined||col("transferred")!==undefined;return out}
function mergeIn(list,mode){if(mode==="replace"){S.co=list.map((c,i)=>({id:i+1,...c,dn:!!c.dn}));S.bk=[];S.dl=[];return}
 const idx=new Map(),used=new Map();S.co.forEach(c=>{new Set([key(c.n),c.xn?key(c.xn):null]).forEach(k=>{if(k)idx.set(k,(idx.get(k)||[]).concat(c))})});let id=Math.max(0,...S.co.map(x=>x.id));const dq=new Map();(S.dl||[]).forEach(k=>dq.set(k,(dq.get(k)||0)+1));
 list.forEach(n=>{const k0=key(n.n),u0=used.get(k0)||0,e=(idx.get(k0)||[])[u0];used.set(k0,u0+1);if(!e){const q=dq.get(k0)||0;if(q>0){dq.set(k0,q-1);return}S.co.push({id:++id,...n,dn:!!n.dn});return}
  if(e.xn&&key(n.n)===key(e.n))delete e.xn;
  for(const k of ["a","an","gh","lt","st","p","ph","em"])if(n[k]!==null&&n[k]!==""&&n[k]!==undefined)e[k]=n[k];
  if(n.lp&&(!e.lp||n.lp>e.lp))e.lp=n.lp;if(n.cd&&!e.cd)e.cd=n.cd;if(list.hasTr)e.tr=!!n.tr;else if(n.tr)e.tr=true;if(n.w)e.w=true;if(n.ncd)e.ncd=true;if(n.dn)e.dn=true});
 /* forget a deletion once the row is gone from Excel */const ec=new Map(),tc=new Map();list.forEach(n=>{const k=key(n.n);ec.set(k,(ec.get(k)||0)+1)});S.co.forEach(c=>{const k=key(c.n);tc.set(k,(tc.get(k)||0)+1)});const keep=new Map(),nd=[];(S.dl||[]).forEach(k=>{const m=Math.max(0,(ec.get(k)||0)-(tc.get(k)||0)),u=keep.get(k)||0;if(u<m){keep.set(k,u+1);nd.push(k)}});S.dl=nd}
async function impXlsx(){const f=await pick(".xlsx,.xlsm");if(!f)return;let list;try{list=readXlsx(await f.arrayBuffer())}catch(e){toast("Couldn't read that file: "+e.message);return}
 if(!list.length){toast("No companies found in that file");return}
 const have=new Set(S.co.map(c=>key(c.n))),nw=list.filter(c=>!have.has(key(c.n))).length,dlg=$("#dlg");
 dlg.innerHTML=`<div class="dh">Import MIS from Excel</div><div class="db"><p class="f" style="margin:0">Found <b>${list.length}</b> companies in “${esc(f.name)}” · <b>${nw}</b> new · <b>${list.length-nw}</b> already in the tracker · <b>${list.filter(c=>c.ncd).length}</b> NCD · <b>${list.filter(c=>c.tr).length}</b> transferred.</p>
 <label class="f fl"><span><input type="radio" name="md" value="merge" checked> <b>Add new & update existing</b> <span class="mut">(keeps your Done dates, committee dates, basket and newer PR dates)</span></span></label>
 <label class="f fl"><span><input type="radio" name="md" value="replace"> <b>Replace everything</b> <span class="mut">(clears the tracker and basket first)</span></span></label>
 <p class="f mut" style="margin:0;font-size:12px">Reads the “ALL” sheet (Name, Amount, Previous Analyst, Group Head, Last PR date, LT/ST Rating, Contact, Email, Committee Date, Done) and the “NCD” sheet. Withdrawn cases come in with a Withdrawn status. Odd values (text dates, malformed contacts, “[object Object]”, formula text, possible duplicates) are cleaned where safe and listed under Data notes, never dropped.</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Import</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  const md=dlg.querySelector("[name=md]:checked").value;if(md==="replace"&&!confirm("Replace all "+S.co.length+" companies with the "+list.length+" from this file?"))return;
  mergeIn(list,md);fixCd();S.issues=list.issues||[];F.n=120;fin();toast(md==="replace"?"Imported "+list.length+" companies":nw+" added, "+(list.length-nw)+" updated")}}
const bn=()=>{const d=S.lb?Math.round((TODAY-D0(S.lb))/864e5):null;return S.co.length&&(d===null||d>7)?`<div class="panel" style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 14px"><span>Your data is stored in this browser only. ${d===null?"You haven't backed it up yet.":"Last backup "+d+" days ago."}</span><button class="btn p" id="bnow">Back up now</button></div>`:""};
function ins(){const act=S.co.filter(c=>!c.tr&&!c.w),tot=act.reduce((a,c)=>a+(c.a||0),0),n0=act.length||1,fm=x=>Math.round(x).toLocaleString("en-IN"),ov=act.filter(c=>over(c)>0).length;
 const by=f=>{const m={};act.forEach(c=>{const k=f(c)||"—";(m[k]=m[k]||[]).push(c)});return m},sum=a=>a.reduce((x,c)=>x+(c.a||0),0);
 const br=(r,mx)=>r.map(([k,v,sub])=>`<div class="br"><span>${esc(k)}</span><div><i style="width:${mx?Math.max(2,v/mx*100):0}%"></i></div><b>${v}</b>${sub?`<em>${sub}</em>`:""}</div>`).join("")||'<div class="mut">No data</div>';
 const g=by(c=>(gp(c.lt)||{}).g),gr=LTS.filter(x=>g[x]).map(x=>[x,g[x].length,"₹ "+fm(sum(g[x]))+" Cr"]);
 const an=Object.entries(by(c=>String(c.an||"").trim())).map(([k,v])=>[k,v.length,v.filter(c=>over(c)>0).length+" overdue · "+v.filter(c=>c.dn).length+" done"]).sort((a,b)=>b[1]-a[1]);
 const now=TODAY.getFullYear()*12+TODAY.getMonth(),mo=[["Overdue",ov]];for(let i=0;i<7;i++){const m=now+i;mo.push([new Date(Math.floor(m/12),m%12,1).toLocaleDateString("en-IN",{month:"short",year:"2-digit"}),act.filter(c=>{const d=due(c);return d&&over(c)<=0&&d.getFullYear()*12+d.getMonth()===m}).length])}
 const fu=S.co.filter(c=>c.fu&&c.fu<=iso(TODAY)&&!c.tr).sort((a,b)=>a.fu<b.fu?-1:1);
 const k=(b,l)=>`<div class="st" style="cursor:default"><b>${b}</b><span>${l}</span></div>`;
 return`<div class="stats">${k(act.length,"Active cases")}${k("₹ "+fm(tot)+" Cr","Total exposure")}${k("₹ "+fm(tot/n0)+" Cr","Average per case")}${k(Math.round(ov/n0*100)+"%","Overdue for PR")}</div>
 <div class="g2"><div class="panel"><h2>PR due by month</h2>${br(mo,Math.max(1,...mo.map(x=>x[1])))}</div><div class="panel"><h2>Cases by LT rating</h2>${br(gr,Math.max(1,...gr.map(x=>x[1])))}</div>
 <div class="panel"><h2>Workload by analyst</h2>${br(an,Math.max(1,...an.map(x=>x[1])))}</div>
 <div class="panel"><h2>Follow-ups due (${fu.length})</h2>${fu.slice(0,12).map(c=>`<div class="fu" data-e="${c.id}"><span><b>${esc(c.n)}</b><div class="mut" style="font-size:12px">${esc(c.nt||"")}</div></span><span class="tag warn">${fd(c.fu)}</span></div>`).join("")||'<div class="mut">Nothing due. Set a follow-up date when you edit a company.</div>'}</div></div>`}
function xlsx(H,R){const E=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]),cl=i=>String.fromCharCode(65+i),X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
 const cell=(v,i,r,h)=>{const f=cl(i)+r;if(v==null||v==="")return"";if(typeof v==="number")return`<c r="${f}"><v>${v}</v></c>`;if(!h&&/^\d{4}-\d\d-\d\d$/.test(v))return`<c r="${f}" s="1"><v>${Math.round((D0(v)-new Date(1899,11,30))/864e5)}</v></c>`;return`<c r="${f}"${h?' s="2"':""} t="inlineStr"><is><t xml:space="preserve">${E(v)}</t></is></c>`};
 const rows=[H,...R].map((r,i)=>`<row r="${i+1}">${r.map((v,j)=>cell(v,j,i+1,i===0)).join("")}</row>`).join(""),z=new PizZip();
 z.file("[Content_Types].xml",X+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
 z.file("_rels/.rels",X+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 z.file("xl/workbook.xml",X+`<workbook ${NS} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="MIS" sheetId="1" r:id="rId1"/></sheets></workbook>`);
 z.file("xl/_rels/workbook.xml.rels",X+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
 z.file("xl/styles.xml",X+`<styleSheet ${NS}><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="15" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`);
 z.file("xl/worksheets/sheet1.xml",X+`<worksheet ${NS}><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="46" customWidth="1"/><col min="2" max="13" width="18" customWidth="1"/></cols><sheetData>${rows}</sheetData></worksheet>`);
 return z.generate({type:"uint8array",compression:"DEFLATE"})}
document.addEventListener("keydown",e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$("#dlg").open||e.ctrlKey||e.metaKey)return;if(e.key==="/"){e.preventDefault();if(V!=="mis"&&V!=="ncd"){V="mis";render()}const q=$("#q");q&&q.focus()}else if(e.key==="n"){e.preventDefault();form()}});
const ilink=n=>"https://www.infomerics.com/pressrelease/"+String(n).toLowerCase().replace(/^m\/s\.?\s*/,"").replace(/&/g," ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const KN={m1:"Information checklist",r1:"Reminder 1",r2:"Reminder 2"},SH={m1:"Checklist",r1:"R1",r2:"R2"};
const DEFAULT_TPL={from:"",cc:"",subj:"Information required for surveillance of {{C}}",text:"Dear Sir/Madam,\n\nThis is with regard to the surveillance of the rating of {Company}. Kindly share the information and documents required for surveillance.\n\nRegards,\nPratham",att:null};
let TPL=Object.assign({},DEFAULT_TPL,S.mail||{});
const ML=()=>Object.assign({cc:TPL.cc||"",r1:"Dear {Contact},\n\nThis is a gentle reminder to our mail below regarding the information required for the surveillance of {Company}. Kindly share the details at the earliest.\n\nRegards,\nPratham",r2:"Dear {Contact},\n\nThis is a second reminder to our mail below. Kindly share the information required for the surveillance of {Company} at the earliest, failing which the rating may be reviewed on the basis of the information available.\n\nRegards,\nPratham"},S.mail||{});
const fT=(t,c)=>t.replace(/\{(\w+)\}/g,(m,k)=>({Company:c.n,Contact:c.p||"Sir/Madam",Analyst:c.an,Date:fd(iso(TODAY)),Amount:c.a??""})[k]??m);
const dueM=c=>{const m=c.ml||{},D=m.d||{},X=m.s||{};return["m1","r1","r2"].filter(k=>D[k]&&!X[k]&&D[k]<=iso(TODAY))};
const mst=c=>{const m=c.ml||{},D=m.d||{},X=m.s||{},k=["m1","r1","r2"].find(k=>D[k]&&!X[k]);if(k)return`<span class="tag ${D[k]<=iso(TODAY)?"warn":"nu"}">${SH[k]} ${fd(D[k])}</span>`;const l=["r2","r1","m1"].find(k=>X[k]);return l?`<span class="tag ok">${SH[l]} drafted</span>`:""};
const enc=t=>{const a=new TextEncoder().encode(t);let r="";for(let i=0;i<a.length;i+=8192)r+=String.fromCharCode.apply(null,a.subarray(i,i+8192));return btoa(r)},wr=b=>b.replace(/.{1,76}/g,"$&\r\n"),eh=t=>/^[\x20-\x7e]*$/.test(t)?t:"=?UTF-8?B?"+enc(t)+"?=";
function draft(c,k,to,cc){
 const M=ML(),sj=fT(String(TPL.subj||DEFAULT_TPL.subj).replace(/\{\{C\}\}/g,c.n),c);
 const baseText=fT(String(TPL.text||DEFAULT_TPL.text).replace(/\{\{C\}\}/g,c.n),c);
 const first="<html><body>"+esc(baseText).replace(/\r?\n/g,"<br>")+"</body></html>";
 const inner=h=>h.replace(/^[\s\S]*?<body[^>]*>/i,"").replace(/<\/body>[\s\S]*$/i,"");
 const pd=x=>(c.ml&&c.ml.d&&c.ml.d[x])||iso(TODAY);
 const hd=x=>`<div style="border-top:1px solid #b5c4df;padding:6px 0;font:11pt Calibri,Arial,sans-serif">${TPL.from?`<b>From:</b> ${esc(TPL.from)}<br>`:""}<b>Sent:</b> ${fd(pd(x))}<br><b>To:</b> ${esc(to)}<br><b>Cc:</b> ${esc(cc)}<br><b>Subject:</b> ${x==="m1"?"":"RE: "}${esc(sj)}</div>`;
 const rem=x=>`<div style="font:12pt 'Aptos Narrow',Aptos,Calibri,sans-serif">${esc(fT(M[x],c)).replace(/\n/g,"<br>")}</div><br>`;
 let html,plain;
 if(k==="m1"){html=first;plain=baseText}
 else{html="<html><body>"+rem(k)+(k==="r2"?["r1","m1"]:["m1"]).map(x=>hd(x)+(x==="m1"?inner(first):rem(x))).join("")+"</body></html>";plain=fT(M[k],c)}
 const B1="=_m"+Math.random().toString(36).slice(2),B2="=_a"+Math.random().toString(36).slice(2),part=(t,b)=>`--${B2}\r\nContent-Type: ${t}; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${wr(enc(b))}`;
 let e=`X-Unsent: 1\r\n${TPL.from?`From: ${TPL.from}\r\n`:""}To: ${to}\r\nCc: ${cc}\r\nSubject: ${eh((k==="m1"?"":"RE: ")+sj)}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${B1}"\r\n\r\n--${B1}\r\nContent-Type: multipart/alternative; boundary="${B2}"\r\n\r\n${part("text/plain",plain)}${part("text/html",html)}--${B2}--\r\n`;
 if(k==="m1"&&TPL.att)e+=`--${B1}\r\nContent-Type: ${TPL.att.type}; name="${TPL.att.name}"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename="${TPL.att.name}"\r\n\r\n${wr(TPL.att.b64)}`;
 return{name:`${KN[k]} - ${clean(c.n)}.eml`,data:e+`--${B1}--\r\n`,to,cc,subj:(k==="m1"?"":"RE: ")+sj,html,k,dt:(c.ml&&c.ml.d&&c.ml.d[k])||""}
}
function mark(c,k){c.ml=c.ml||{};c.ml.s=Object.assign({},c.ml.s,{[k]:iso(TODAY)})}
function mailDlg(id){const c=co(id),m=c.ml||{},D=m.d||{},X=m.s||{},dlg=$("#dlg"),M=ML();dlg.dataset.id=id;
 dlg.innerHTML=`<div class="dh">Mails · ${esc(c.n)}</div><div class="db"><label class="f">To (client)<input id="mt" value="${esc(c.em||"")}"></label><label class="f">CC<input id="mc" value="${esc(M.cc)}"></label>
 ${Object.entries(KN).map(([k,v])=>`<div class="f" style="display:grid;grid-template-columns:1fr 150px auto;gap:8px;align-items:center"><b>${v}${X[k]?` <span class="tag ok">drafted ${fd(X[k])}</span>`:""}</b><input type="date" data-pd="${k}" value="${D[k]||""}"><button class="btn p" data-mk="${k}">Create draft</button></div>`).join("")}
 <p class="f mut" style="margin:0;font-size:12px">Pick a date for each mail. Create draft downloads a script that places the message in classic Outlook Drafts with any future delivery date set to 10:00. Open it, review the draft, and press Send to activate scheduling.</p></div><div class="df"><button class="btn" value="t">Mail wording…</button><button class="btn" value="x">Close</button></div>`;
 dlg.showModal();dlg.onclick=async e=>{const k=e.target.dataset.mk,v=e.target.tagName==="BUTTON"?e.target.value:"";if(k){e.preventDefault();const to=$("#mt").value.trim(),cc=$("#mc").value.trim();if(to)c.em=to;const d=draft(c,k,to,cc);await out("MIS-Outlook-Draft-"+clean(c.n)+"-"+k+"-"+Date.now()+".vbs",vbs([d]));mark(c,k);save();render();return mailDlg(id)}
  if(!v)return;e.preventDefault();if(v==="x")return dlg.close();if(v==="t")return mailSet(id)}}
function mailSet(id,returnToBulk=false){
 const M=ML(),dlg=$("#dlg"),K=[["r1","Reminder 1 wording",6],["r2","Reminder 2 wording",6]];
 dlg.innerHTML=`<div class="dh">Mail wording</div><div class="db">
 <label class="f">Default CC<input id="mx_cc" value="${esc(M.cc)}"></label>
 <label class="f">Checklist subject<input id="mx_subj" value="${esc(TPL.subj)}"></label>
 <label class="f">Checklist message<textarea id="mx_text" rows="7">${esc(TPL.text)}</textarea></label>
 ${K.map(([k,l,r])=>`<label class="f">${l}<textarea id="mx_${k}" rows="${r}">${esc(M[k])}</textarea></label>`).join("")}
 <p class="f mut" style="margin:0;font-size:12px">The checklist message and reminders are saved in this MIS and used in the Outlook drafts. Placeholders: {Company}, {Contact}, {Analyst}, {Date}, {Amount}; the subject also supports {{C}}.</p></div>
 <div class="df"><button class="btn" value="r">Restore defaults</button><button class="btn" value="x">Back</button><button class="btn p" value="ok">Save wording</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();
  if(v==="x")return returnToBulk?bulkMail():mailDlg(id);
  if(v==="r"){S.mail=null;TPL=Object.assign({},DEFAULT_TPL);save();return mailSet(id,returnToBulk)}
  S.mail={cc:$("#mx_cc").value.trim(),subj:$("#mx_subj").value,text:$("#mx_text").value,r1:$("#mx_r1").value,r2:$("#mx_r2").value};
  TPL=Object.assign({},DEFAULT_TPL,S.mail);save();toast("Mail wording saved");return returnToBulk?bulkMail():mailDlg(id)}
}
function vbs(items){const ymd=dt=>dt&&dt>=iso(TODAY)?[+dt.slice(0,4),+dt.slice(5,7),+dt.slice(8,10)].join(","):"0,0,0",ch=(x,v)=>{const b=enc(v);let o=x+'=""\r\n';for(let i=0;i<b.length;i+=200)o+=`${x}=${x}&"${b.slice(i,i+200)}"\r\n`;return o},need=items.some(i=>i.k==="m1"&&TPL.att),attName=TPL.att?String(TPL.att.name||"attachment").replace(/[^a-zA-Z0-9._ -]/g,"_"):"x";
 return`' Pratham MIS Tracker: creates ${items.length} draft(s) in your Outlook Drafts folder
Option Explicit
Dim T,C,S,H,A,ol,fso,tmp,cnt,xa,na,sa
Function D(b)
Dim x,n,s
Set x=CreateObject("MSXML2.DOMDocument")
Set n=x.createElement("b")
n.dataType="bin.base64"
n.text=b
Set s=CreateObject("ADODB.Stream")
s.Type=1
s.Open
s.Write n.nodeTypedValue
s.Position=0
s.Type=2
s.Charset="utf-8"
D=s.ReadText
s.Close
End Function
Sub Mk(withAtt,y,mo,dy)
Dim m
Set m=ol.CreateItem(0)
m.To=D(T)
m.CC=D(C)
m.Subject=D(S)
m.HTMLBody=D(H)
If withAtt Then m.Attachments.Add tmp
If y>0 Then m.DeferredDeliveryTime=DateSerial(y,mo,dy)+TimeSerial(10,0,0)
m.Save
cnt=cnt+1
End Sub
On Error Resume Next
Set ol=CreateObject("Outlook.Application")
If Err.Number<>0 Then
MsgBox "Could not start classic Outlook. Please open Outlook and run this file again.",16
WScript.Quit
End If
On Error GoTo 0
Set fso=CreateObject("Scripting.FileSystemObject")
tmp=fso.GetSpecialFolder(2)&Chr(92)&"${attName}"
${need?ch("A",TPL.att.b64.replace(/^/,""))+`Set xa=CreateObject("MSXML2.DOMDocument")
Set na=xa.createElement("b")
na.dataType="bin.base64"
na.text=A
Set sa=CreateObject("ADODB.Stream")
sa.Type=1
sa.Open
sa.Write na.nodeTypedValue
sa.SaveToFile tmp,2
sa.Close
`:""}${items.map(i=>ch("T",i.to)+ch("C",i.cc)+ch("S",i.subj)+ch("H",i.html)+"Mk "+(i.k==="m1"&&TPL.att?"True":"False")+","+ymd(i.dt)+"\r\n").join("")}On Error Resume Next
If fso.FileExists(tmp) Then fso.DeleteFile tmp
MsgBox cnt&" draft(s) saved in your Outlook Drafts folder. Review them and press Send: mails with a date are held and delivered on that date at 10:00 (Outlook must be open).",64
`.replace(/\r?\n/g,"\r\n")}
const ymdS=dt=>dt&&dt>iso(TODAY)?[+dt.slice(0,4),+dt.slice(5,7),+dt.slice(8,10)].join(","):"0,0,0";
const payload=it=>{const L=[];if(it.some(i=>i.k==="m1")&&TPL.att)L.push("ATT|"+TPL.att.name+"|"+TPL.att.b64);it.forEach(i=>L.push(["MAIL",i.k,enc(i.to),enc(i.cc),enc(i.subj),enc(i.html),ymdS(i.dt)].join("|")));return L.join("\r\n")+"\r\n"};
function bulkMail(){
 const cs=S.bk.map(b=>co(b.id)).filter(Boolean),dlg=$("#dlg"),M=ML(),d0=(cs[0]&&cs[0].ml&&cs[0].ml.d)||{},nm=cs.filter(c=>!c.em).length;
 if(!cs.length)return toast("Select cases in the committee basket first");
 dlg.innerHTML='<div class="dh">Mails for '+cs.length+' committee case(s)</div><div class="db"><label class="f">Default CC<input id="bc2" value="'+esc(M.cc)+'"></label>'+
 Object.entries(KN).map(([k,v])=>'<div class="f" style="display:grid;grid-template-columns:1fr 160px;gap:8px;align-items:center"><b>'+v+': date for all selected cases</b><input type="date" id="bd_'+k+'" value="'+((d0&&d0[k])||"")+'"></div>').join("")+
 '<label class="f">Create now<select id="bk2">'+Object.entries(KN).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join("")+'<option value="all" selected>All three mails for each company</option></select></label>'+
 '<p class="f mut" style="margin:0;font-size:12px">'+(nm?'<b style="color:var(--bad)">'+nm+' case(s) have no client email; fill those in before creating drafts.</b> ':"")+'Click <b>Create Outlook drafts</b> to download one script for all selected mails. Open the script on this Windows computer to create the drafts in classic Outlook. Future dates are set to deliver at 10:00. Review each draft and press Send to activate scheduling. This script requires classic Outlook; the .eml ZIP is a manual fallback.</p></div>'+
 '<div class="df"><button class="btn" value="t">Mail wording…</button><button class="btn" value="s">Save dates</button><button class="btn" value="z">Download .eml ZIP</button><button class="btn p" value="v">Create Outlook drafts</button><button class="btn" value="x">Close</button></div>';
 dlg.showModal();dlg.onclick=async e=>{
  const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();if(v==="t")return mailSet(cs[0].id,true);if(v==="t")return mailSet(cs[0].id,true);
  const dt={};Object.keys(KN).forEach(k=>{const x=$("#bd_"+k).value;if(x)dt[k]=x});cs.forEach(c=>{c.ml=c.ml||{};c.ml.d=Object.assign({},c.ml.d,dt)});
  if(v==="s"){save();render();return toast("Dates set for all "+cs.length+" selected cases")}
  const k=$("#bk2").value,ks=k==="all"?["m1","r1","r2"]:[k],cc=$("#bc2").value.trim(),dr=cs.flatMap(c=>ks.map(x=>draft(c,x,c.em||"",cc)));
  if(v==="z"){const z=new PizZip();dr.forEach(d=>z.file(d.name,d.data));await out("Mail drafts.zip",z.generate({type:"uint8array"}))}
  else await out("MIS-Outlook-Drafts-"+iso(TODAY).replace(/-/g,"")+"-"+Date.now()+".vbs",vbs(dr));
  cs.forEach(c=>ks.forEach(x=>mark(c,x)));save();dlg.close();render();
  toast(v==="z"?dr.length+" .eml files downloaded":"Prepared "+dr.length+" Outlook drafts. Run the downloaded script, then review and send them.")
 }
}
async function zipDue(){const z=new PizZip();let n=0,nm=0;for(const c of list()){for(const k of dueM(c)){if(!c.em)nm++;const d=draft(c,k,c.em||"",ML().cc);z.file(d.name,d.data);mark(c,k);n++}}
 if(!n)return toast("No mails are due");await out("Due mail drafts.zip",z.generate({type:"uint8array"}));save();render();toast(n+" drafts created"+(nm?` (${nm} without a client email)`:""))}
/* ---------- Excel auto-sync (Chrome / Edge, File System Access) ---------- */
/* ---------- Excel two-way sync (edits your own file in place, keeps its format) ---------- */
let XH=null,XP=null,XT=0,XB=false,xt,XQueued=false;
const idb=(m,k,v)=>new Promise((res,rej)=>{const r=indexedDB.open("misx",1);r.onupgradeneeded=()=>r.result.createObjectStore("h");r.onsuccess=()=>{const t=r.result.transaction("h",m==="get"?"readonly":"readwrite"),o=t.objectStore("h"),q=m==="get"?o.get(k):o.put(v,k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)};r.onerror=()=>rej(r.error)});
const xst=(t,c)=>{const e=$("#xs");e.textContent=t;e.style.color=c==="w"?"var(--warn)":c==="o"?"var(--ok)":"";const sm=$(".more summary");if(sm)sm.dataset.s=c||""};
const xnow=()=>new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
async function xLink(){if(!window.showOpenFilePicker||window.top!==window)return linkHelp();
 try{const[h]=await showOpenFilePicker({types:[{description:"Excel",accept:{"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx",".xlsm"]}}]});if(await h.requestPermission({mode:"readwrite"})!=="granted")return toast("Permission to edit the file wasn't given");
  XH=h;await idb("put","h",h);await xPull(true);await xPush(true);toast("Linked to "+h.name+": changes now save to it automatically")}catch(e){if(e.name==="AbortError")return;if(e.name==="SecurityError"||/cross.origin|sub ?frame/i.test(e.message))return linkHelp();toast("Couldn't link the file: "+e.message)}}
async function xPull(first){if(!XH)return;if(XH.db)return dbPull(first);try{if(S.xd&&!(await xPush()))return;const f=await XH.getFile();if(!first&&f.lastModified===XT)return;{const L=readXlsx(await f.arrayBuffer());mergeIn(L,"merge");fixCd();S.issues=L.issues||[]}XT=f.lastModified;save();render();xst("Excel ✓ "+xnow(),"o")}catch(e){xst("⚠ Excel unreadable","w")}}
function xPushSoon(){if(!XH){if(XP)S.xd=true;return}XQueued=true;clearTimeout(xt);xt=setTimeout(()=>xPush(),650)}
async function xPush(){if(!XH)return;if(XH.db)return xPushDb();if(XB){XQueued=true;return}clearTimeout(xt);xt=null;XB=true;XQueued=false;let ok=false;try{const f=await XH.getFile(),o=(patchXlsx.ren=[],patchXlsx(await f.arrayBuffer(),S.co));if(o){const w=await XH.createWritable();await w.write(o);await w.close();XT=(await XH.getFile()).lastModified}if((patchXlsx.ren||[]).length){patchXlsx.ren.forEach(c=>delete c.xn);patchXlsx.ren=[];save()}S.xd=false;ok=true;xst("Excel synced "+xnow(),"o")}catch(e){S.xd=true;xst("⚠ Excel not updated (is it open in Excel?)","w")}finally{XB=false;try{localStorage.setItem("mis_v1",JSON.stringify(S))}catch(e){}if(XQueued&&ok){clearTimeout(xt);xt=setTimeout(()=>xPush(),150)}}return ok}
function patchXlsx(buf,cos){const z=new PizZip(buf),P=t=>new DOMParser().parseFromString(t,"application/xml"),M="http://schemas.openxmlformats.org/spreadsheetml/2006/main",X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
 const rel={};[...P(z.file("xl/_rels/workbook.xml.rels").asText()).getElementsByTagName("Relationship")].forEach(r=>rel[r.getAttribute("Id")]=r.getAttribute("Target"));
 const sh=[...P(z.file("xl/workbook.xml").asText()).getElementsByTagName("sheet")].find(q=>q.getAttribute("name")==="ALL");if(!sh)throw new Error("no ALL sheet");const path="xl/"+rel[sh.getAttribute("r:id")].replace(/^\/?(xl\/)?/,"");
 const ss=[],sx=z.file("xl/sharedStrings.xml");if(sx)[...P(sx.asText()).getElementsByTagName("si")].forEach(si=>ss.push([...si.getElementsByTagName("t")].map(t=>t.textContent).join("")));
 const doc=P(z.file(path).asText()),sd=doc.getElementsByTagName("sheetData")[0],rows=[...sd.getElementsByTagName("row")],ci=x=>x.replace(/\d/g,"").split("").reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0);
 const cv=c=>{if(!c)return null;const t=c.getAttribute("t"),v=c.getElementsByTagName("v")[0],is=c.getElementsByTagName("is")[0];if(t==="inlineStr"&&is)return[...is.getElementsByTagName("t")].map(q=>q.textContent).join("");if(!v)return null;return t==="s"?ss[+v.textContent]:t==="b"?v.textContent==="1":t==="str"?v.textContent:+v.textContent};
 const cell=(row,col)=>[...row.getElementsByTagName("c")].find(c=>c.getAttribute("r")===col+row.getAttribute("r")),cvs=(row,col)=>cv(cell(row,col));
 const hd={};[...rows[0].getElementsByTagName("c")].forEach(c=>{const v=cv(c);if(typeof v==="string")hd[v.trim().toLowerCase()]=c.getAttribute("r").replace(/\d/g,"")});
 const col=n=>hd[n];["name","amount","last pr date","lt rating","st rating","done"].forEach(n=>{if(!col(n))throw new Error("Column “"+n+"” not found in ALL")});
 let tcol=hd["transfer"]||hd["transferred"]||"R";if(!(hd["transfer"]||hd["transferred"]))rows.forEach(r=>[...r.getElementsByTagName("c")].forEach(c=>{if(cv(c)==="Transfer"&&!Object.values(hd).includes(c.getAttribute("r").replace(/\d/g,"")))tcol=c.getAttribute("r").replace(/\d/g,"")}));
 const mk=(c,x)=>{const e=doc.createElementNS(M,"v");e.textContent=x;c.appendChild(e)};
 const setC=(row,cl,val)=>{const r=row.getAttribute("r");let c=cell(row,cl);if(!c){c=doc.createElementNS(M,"c");c.setAttribute("r",cl+r);const nx=[...row.getElementsByTagName("c")].find(e=>ci(e.getAttribute("r"))>ci(cl+r));nx?row.insertBefore(c,nx):row.appendChild(c)}
  while(c.firstChild)c.removeChild(c.firstChild);c.removeAttribute("t");if(val===null||val==="")return;
  if(typeof val==="boolean"){c.setAttribute("t","b");mk(c,val?"1":"0")}else if(typeof val==="number")mk(c,String(val));else{c.setAttribute("t","inlineStr");const is=doc.createElementNS(M,"is"),t=doc.createElementNS(M,"t");t.setAttribute("xml:space","preserve");t.textContent=val;is.appendChild(t);c.appendChild(is)}};
 const ser=iso=>Math.round((Date.UTC(+iso.slice(0,4),+iso.slice(5,7)-1,+iso.slice(8,10))-Date.UTC(1899,11,30))/864e5),nameC=col("name"),idx=new Map();
 rows.slice(1).forEach(r=>{const n=cvs(r,nameC);if(n){const k=key(n);idx.set(k,(idx.get(k)||[]).concat(r))}});const used=new Map(),nz=x=>String(x??"").replace(/\u00a0/g," ").trim();let ch=0,last=rows[rows.length-1];
 const FD=[["a","amount","n"],["an","previous analyst","s"],["gh","group head","s"],["lp","last pr date","d"],["lt","lt rating","lt"],["st","st rating","st"],["p","contact person","s"],["ph","number","s"],["em","email","s"],["cd","committee date","d"]];
 const apply=(row,c)=>{const set=(cl,v)=>{setC(row,cl,v);ch++};
  for(const[f,h,k]of FD){const cl=col(h);if(!cl)continue;const d=c[f],cur=cvs(row,cl);if(f==="cd"&&!d&&typeof cur==="number"&&(clrs().some(z=>ser(z)===Math.round(cur))||clrc().includes(key(c.n)+"|"+new Date(Date.UTC(1899,11,30)+Math.round(cur)*864e5).toISOString().slice(0,10)))){set(cl,null);continue}if(d===null||d===""||d===undefined)continue;if(f==="p"&&nz(d)===nz(splitC(String(cur??""),"")[0]))continue;if(f==="ph"&&!cur&&nz(d)===nz(splitC(String(cvs(row,col("contact person"))??""),"")[1]))continue;
   if(k==="n"){if(cur!==d)set(cl,d)}else if(k==="d"){if(!(typeof cur==="number"&&Math.round(cur)===ser(d)))set(cl,ser(d))}
   else if(k==="s"){if(nz(cur)!==nz(d))set(cl,d)}else if(norm(String(cur??""),k)!==d)set(cl,d.replace("; ISSUER NOT COOPERATING","; INC"))}
  if(c.w){if(!/withdrawn/i.test(String(cvs(row,col("lt rating"))??"")))set(col("lt rating"),"Withdrawn")}
  if(!!cvs(row,col("done"))!==!!c.dn)set(col("done"),!!c.dn);const tr=cvs(row,tcol)==="Transfer";if(c.tr&&!tr)set(tcol,"Transfer");else if(!c.tr&&tr)set(tcol,null)};
 let add=0;const tm=[...rows].reverse().find(r=>{const a=cell(r,"A");return a&&a.getElementsByTagName("f").length})||rows[rows.length-1];
 for(const c of cos){const k0=key(c.xn&&idx.has(key(c.xn))?c.xn:c.n),u=used.get(k0)||0,row=(idx.get(k0)||[])[u];used.set(k0,u+1);if(row){if(c.xn){if(nz(cvs(row,nameC))!==nz(c.n)){setC(row,nameC,c.n);ch++}(patchXlsx.ren=patchXlsx.ren||[]).push(c)}apply(row,c);continue}
  const n=+last.getAttribute("r")+1,nr=tm.cloneNode(true);nr.setAttribute("r",n);[...nr.getElementsByTagName("c")].forEach(x=>{const cl=x.getAttribute("r").replace(/\d/g,"");x.setAttribute("r",cl+n);const f=x.getElementsByTagName("f")[0];while(x.firstChild)x.removeChild(x.firstChild);x.removeAttribute("t");
   if(f){const e=doc.createElementNS(M,"f");e.textContent=cl==="A"?`IF(OR(${col("lt rating")}${n}="Withdrawn",${tcol}${n}="Transfer"),"",($A$1-${col("last pr date")}${n})-365)`:`EDATE(${col("last pr date")}${n},12)`;x.appendChild(e)}});
  sd.appendChild(nr);setC(nr,nameC,c.n);setC(nr,col("done"),!!c.dn);apply(nr,c);last=nr;add++}
 if(!ch&&!add)return null;
 if(add){const d=doc.getElementsByTagName("dimension")[0];if(d)d.setAttribute("ref",d.getAttribute("ref").replace(/\d+$/,last.getAttribute("r")))}
 z.file(path,X+new XMLSerializer().serializeToString(doc).replace(/^<\?xml[^>]*\?>\s*/,""));
 let w=z.file("xl/workbook.xml").asText();w=/<calcPr/.test(w)?w.replace(/<calcPr([^>]*?)\/>/,(m,a)=>"<calcPr"+a.replace(/ fullCalcOnLoad="[^"]*"/,"")+' fullCalcOnLoad="1"/>'):w;z.file("xl/workbook.xml",w);
 return z.generate({type:"uint8array",compression:"DEFLATE"})}

/* ---------- Database sync (Supabase): one shared, login-protected copy for every device ---------- */
const DB_URL="https://wpkowlgljmcfvusrmsea.supabase.co",DB_KEY="sb_publishable_e6bAV65GDPmgdbUn2Ja-2Q__z2q-5bu";const DB={ver:0,base:null,lock:null,uid:null,metaUid:null,ownerMode:false,ownerChecked:false,identityMismatch:false,deletedRow:false,cfg:()=>{try{const c=JSON.parse(localStorage.getItem("mis_db")||"null");return c?{...c,url:DB_URL,key:DB_KEY}:null}catch(e){return null}}};
const dbSaveCfg=c=>{try{localStorage.setItem("mis_db",JSON.stringify(c))}catch(e){}},dbSaveMeta=()=>{try{localStorage.setItem("mis_db_meta",JSON.stringify({ver:DB.ver,base:DB.base,uid:DB.uid}))}catch(e){}},dbLoadMeta=()=>{try{const m=JSON.parse(localStorage.getItem("mis_db_meta")||"null");if(m){DB.ver=m.ver||0;DB.base=m.base||null;DB.metaUid=m.uid||null}}catch(e){}};
const dbState=()=>{const o=JSON.parse(JSON.stringify(S));delete o.xd;delete o.issues;return o};
function dbClearLocal(){S={co:[],bk:[],map:DEF,inc:true};try{localStorage.removeItem("mis_v1")}catch(e){}render()}
function dbSessionLost(){try{localStorage.removeItem("mis_db");localStorage.removeItem("mis_db_meta")}catch(e){}DB.ver=0;DB.base=null;DB.uid=null;DB.metaUid=null;DB.ownerMode=false;DB.ownerChecked=false;DB.identityMismatch=false;DB.deletedRow=true;if(XH&&XH.db)XH=null;dbClearLocal();xst("Sign in again to load your cases","w")}
async function dbWho(c){const r=await fetch(c.url+"/auth/v1/user",{cache:"no-store",headers:{apikey:c.key,Authorization:"Bearer "+c.at}});if(!r.ok){if(r.status===401)dbSessionLost();throw new Error("Could not verify the signed-in account")};const j=await r.json();if(!j.id)throw new Error("Could not verify the signed-in account");c.uid=j.id;DB.uid=j.id;dbSaveCfg(c);return c}
async function dbAuth(c,grant,body){const r=await fetch(c.url+"/auth/v1/token?grant_type="+grant,{method:"POST",headers:{apikey:c.key,"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(grant==="password"?"Wrong email or password":"Signed out – please sign in again (Database sync)");
 c.at=j.access_token;c.rt=j.refresh_token;c.exp=Date.now()+(j.expires_in||3600)*1000-60000;c.uid=j.user&&j.user.id||c.uid||null;DB.uid=c.uid;dbSaveCfg(c);return c}
async function dbTok(){let c=DB.cfg();if(!c)throw new Error("Not connected");if(!c.at||Date.now()>c.exp){if(!DB.lock)DB.lock=dbAuth(c,"refresh_token",{refresh_token:c.rt}).finally(()=>{DB.lock=null});c=await DB.lock}if(!c.uid)c=await dbWho(c);DB.uid=c.uid;return c}
async function dbReq(path,o){const c=await dbTok();const r=await fetch(c.url+"/rest/v1/"+path,{cache:"no-store",...o,headers:{apikey:c.key,Authorization:"Bearer "+c.at,"Content-Type":"application/json",...((o&&o.headers)||{})}});
 if(!r.ok&&r.status!==409){let m="";try{const j=await r.json();m=j.message||j.hint||j.details||""}catch(e){}const err=new Error("Database "+r.status+(m?" – "+m:""));err.status=r.status;if(r.status===401)dbSessionLost();throw err}return r}
async function dbEnsure(){let c=await dbTok();if(!c.uid)c=await dbWho(c);DB.uid=c.uid;if(!DB.ownerChecked){const saved=(()=>{try{return JSON.parse(localStorage.getItem("mis_db_meta")||"null")}catch(e){return null}})();try{await dbReq("rpc/mis_list_analysts",{method:"POST",body:"{}"});DB.ownerMode=true}catch(e){if(e.status===404||/PGRST202|function.+not found/i.test(e.message||""))DB.ownerMode=false;else throw e}DB.ownerChecked=true;if(DB.ownerMode){DB.identityMismatch=!saved||saved.uid!==DB.uid;if(DB.identityMismatch){DB.ver=0;DB.base=null}}else DB.identityMismatch=false}return c}
const dbFilter=()=>DB.ownerMode?"owner_id=eq."+encodeURIComponent(DB.uid):"id=eq.main";
const dbRow=async sel=>(await(await dbReq("mis_state?"+dbFilter()+"&select="+sel)).json())[0]||null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/* 3-way merge: keeps edits from both devices; only the same field of the same case edited on both sides is a real conflict (this device wins) */
function merge3(base,loc,rem){base=base||{co:[]};const out={...rem};
 new Set([...Object.keys(loc),...Object.keys(rem),...Object.keys(base)]).forEach(k=>{if(k==="co"||k==="xd")return;if(!same(loc[k],base[k])){if(loc[k]===undefined)delete out[k];else out[k]=loc[k]}});
 const bm=new Map((base.co||[]).map(c=>[c.id,c])),lm=new Map((loc.co||[]).map(c=>[c.id,c])),rm=new Map((rem.co||[]).map(c=>[c.id,c])),co=[];
 new Set([...lm.keys(),...rm.keys()]).forEach(id=>{const b=bm.get(id),l=lm.get(id),r=rm.get(id);
  if(l&&r){const o={...r};new Set([...Object.keys(l),...Object.keys(r),...Object.keys(b||{})]).forEach(k=>{if(!same(l[k],b&&b[k])){if(l[k]===undefined)delete o[k];else o[k]=l[k]}});co.push(o)}
  else if(l){if(!b||!same(l,b))co.push(l)}
  else if(r){if(!b||!same(r,b))co.push(r)}});
 out.co=co;return out}
const dbApply=d=>{S=Object.assign({co:[],bk:[],map:DEF,inc:true},d,{xd:false})};
async function dbPush(){await dbEnsure();if(DB.ownerMode&&DB.identityMismatch)return"skip";const ownerFilter=dbFilter();for(let t=0;t<4;t++){const loc=dbState();let ok=false,r,j;
  if(!DB.ver){const row={id:DB.ownerMode?DB.uid:"main",data:loc,version:1};if(DB.ownerMode)row.owner_id=DB.uid;r=await dbReq("mis_state",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(row)});if(r.ok){j=await r.json();DB.ver=j[0].version;ok=true}}
  else{r=await dbReq("mis_state?"+ownerFilter+"&version=eq."+DB.ver,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({data:loc,version:DB.ver+1,updated_at:new Date().toISOString()})});j=await r.json();if(j.length){DB.ver=j[0].version;ok=true}}
  if(ok){DB.base=loc;DB.identityMismatch=false;DB.deletedRow=false;dbSaveMeta();return}
  const rem=await dbRow("version,data");if(!rem){if(DB.ownerMode&&DB.ver){dbClearLocal();DB.ver=0;DB.base=null;DB.deletedRow=true;dbSaveMeta();return"cleared"}DB.ver=0;continue}
  dbApply(merge3(DB.base,loc,rem.data));DB.identityMismatch=false;S.xd=true;DB.ver=rem.version;DB.base=rem.data;dbSaveMeta();render()}
 throw new Error("busy – will retry")}
async function xPushDb(){if(XB){XQueued=true;return false}clearTimeout(xt);xt=null;XB=true;XQueued=false;let ok=false;
 try{const outcome=await dbPush();S.xd=false;ok=true;if(outcome==="skip")xst("Loading this account’s cases…","o");else if(outcome==="cleared")xst("No saved cases for this login","o");else xst("Database synced "+xnow(),"o")}catch(e){S.xd=true;xst("⚠ Not synced: "+(e.message||"offline")+" – will retry","w")}
 finally{XB=false;try{localStorage.setItem("mis_v1",JSON.stringify(S))}catch(e){}if(XQueued&&ok){clearTimeout(xt);xt=setTimeout(()=>xPush(),150)}}return ok}
async function dbPull(first){if(!first&&(xt||XB))return;try{await dbEnsure();if(S.xd&&!(DB.ownerMode&&DB.identityMismatch)&&!(await xPushDb()))return;
 const m=await dbRow("version");if(!m){if(DB.ownerMode){await dbWho(await dbTok());dbClearLocal();DB.ver=0;DB.base=null;DB.identityMismatch=false;DB.deletedRow=false;dbSaveMeta();xst("Database connected – no cases for this login","o");return}if(first&&S.co.length)await xPushDb();else xst("Database connected – empty","o");return}
 if(m.version!==DB.ver){const r=await dbRow("version,data");dbApply(r.data);DB.ver=r.version;DB.base=r.data;DB.identityMismatch=false;DB.deletedRow=false;dbSaveMeta();try{localStorage.setItem("mis_v1",JSON.stringify(S))}catch(e){}render()}
 xst("Database synced "+xnow(),"o")}catch(e){xst("⚠ Database: "+(e.message||"offline"),"w")}}
const dbPoll=()=>{if(!DB.poll)DB.poll=setInterval(()=>{if(XH&&XH.db&&!document.hidden)xPull()},15000)};
async function transferDlg(c){if(!DB.cfg())return toast("Connect the database before transferring a case");try{await dbEnsure();if(!DB.ownerMode){DB.ownerChecked=false;await dbEnsure()}if(!DB.ownerMode)return toast("First run the account-separation SQL setup in Supabase; then refresh and try again");const people=await(await dbReq("rpc/mis_list_analysts",{method:"POST",body:"{}"})).json();if(!people.length)return toast("No other Supabase analyst accounts were found");const dlg=$("#dlg"),opts=people.map(p=>'<option value="'+esc(p.user_id)+'">'+esc(p.display_name)+'</option>').join("");dlg.innerHTML='<div class="dh">Transfer case · '+esc(c.n)+'</div><div class="db"><p class="f mut" style="margin:0">Choose the analyst who should own this case. It will be removed from your MIS and added to theirs.</p><label class="f">Transfer to<select id="transfer-user"><option value="">Choose an analyst…</option>'+opts+'</select></label></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" id="transfer-confirm" value="ok">Transfer case</button></div>';dlg.showModal();dlg.onclick=async e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();const recipient=$("#transfer-user").value,person=people.find(p=>p.user_id===recipient);if(!person)return toast("Choose an analyst first");if(!confirm("Transfer "+c.n+" to "+person.display_name+"? It will be removed from your cases and appear in theirs."))return;const btn=$("#transfer-confirm");if(btn)btn.disabled=true;try{await dbReq("rpc/mis_transfer_case",{method:"POST",body:JSON.stringify({p_case_id:c.id,p_recipient:recipient})});dlg.close();await dbPull(true);toast("Transferred "+c.n+" to "+person.display_name)}catch(err){if(btn)btn.disabled=false;toast("Transfer failed: "+err.message)}}}catch(e){toast("Could not load analyst accounts: "+e.message)}}
function dbDlg(){const c=DB.cfg()||{},dlg=$("#dlg");
 dlg.innerHTML='<div class="dh db-login-title">Database sync (all your devices)</div><div class="db db-login-fields"><p class="f mut" style="margin:0;font-size:12px">Sign in with your Supabase account. After the account-separation setup, each analyst sees only their cases. Transfer cases before deleting an analyst account; Supabase blocks deletion while it still owns cases. Each analyst uses their own email and password. Your password is not stored; this browser keeps a sign-in session.</p><label class="f">Email<input id="dbe" type="email" value="'+esc(c.email||"")+'" autocomplete="username"></label><label class="f">Password<input id="dbp" type="password" autocomplete="current-password"></label></div><div class="df db-login-actions">'+(c.url?'<button class="btn" value="off">Sign out</button>':"")+'<button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Connect &amp; sync</button></div>';
 dlg.showModal();dlg.onclick=async e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();
  if(v==="off"){if(S.xd&&!confirm("Some changes are still waiting to sync. Signing out clears this browser’s saved copy. Continue?"))return;localStorage.removeItem("mis_db");localStorage.removeItem("mis_db_meta");DB.ver=0;DB.base=null;DB.uid=null;DB.metaUid=null;DB.ownerMode=false;DB.ownerChecked=false;DB.identityMismatch=false;DB.deletedRow=false;XH=null;dbClearLocal();dlg.close();xst("Sign in to database sync");return toast("Signed out on this device")}
  const cfg={url:DB_URL,key:DB_KEY,email:$("#dbe").value.trim()},pw=$("#dbp").value;
  if(!/^https:\/\/[\w-]+\.supabase\.co$/.test(cfg.url))return toast("Project URL should look like https://xxxx.supabase.co");
  if(!cfg.email||!pw)return toast("Enter your email and password");
  if(/^sb_secret_/.test(cfg.key)||(()=>{try{return /service_role/.test(atob((cfg.key.split(".")[1]||"").replace(/-/g,"+").replace(/_/g,"/")))}catch(e){return false}})())return toast("That is the secret key. Use the publishable / anon key instead.");
  const oldCfg=localStorage.getItem("mis_db"),oldMeta=localStorage.getItem("mis_db_meta"),prev=oldCfg?JSON.parse(oldCfg):null;
  try{await dbAuth(cfg,"password",{email:cfg.email,password:pw});DB.ownerChecked=false;DB.ownerMode=false;DB.identityMismatch=false;DB.ver=0;DB.base=null;dbLoadMeta();await dbEnsure();if(DB.ownerMode&&prev&&prev.uid&&prev.uid!==cfg.uid){dbClearLocal();DB.ver=0;DB.base=null;DB.identityMismatch=true}
   const m=await dbRow("version");
   if(m&&S.co.length&&!DB.base&&!DB.identityMismatch&&!confirm("The database already has data. Replace the "+S.co.length+" case(s) on this device with the database version?\n\nOK = use the database data\nCancel = stop"))throw new Error("Cancelled")
   dlg.close();XH={db:true};dbPoll();xst("Connecting…");await xPull(true);toast("Database sync is on for this device")}
  catch(err){if(oldCfg)localStorage.setItem("mis_db",oldCfg);else localStorage.removeItem("mis_db");if(oldMeta)localStorage.setItem("mis_db_meta",oldMeta);DB.ownerChecked=false;DB.uid=prev&&prev.uid||null;toast("Couldn’t connect: "+err.message)}}}
$("#xs").onclick=async()=>{if(XH){await xPull(true);return xPush()}if(XP){try{if(await XP.requestPermission({mode:"readwrite"})==="granted"){XH=XP;XP=null;await xPull(true);await xPush();return}}catch(e){}}xLink()};
window.addEventListener("focus",()=>{xPull()});
if(DB.cfg()){dbLoadMeta();XH={db:true};xst("Connecting…");dbPoll();xPull(true)}else if(window.indexedDB)idb("get","h").then(async h=>{if(!h)return;try{if(await h.queryPermission({mode:"readwrite"})==="granted"){XH=h;await xPull(true)}else{XP=h;xst(S.xd?"Reconnect Excel · changes waiting":"Reconnect Excel","w");document.addEventListener("pointerdown",async e=>{if(!XP||e.target.closest&&e.target.closest("#xs"))return;try{const h2=XP;if(await h2.requestPermission({mode:"readwrite"})==="granted"){XH=h2;XP=null;await xPull(true);await xPush()}}catch(x){}},{once:true,capture:true})}}catch(e){}}).catch(()=>{});
/* ---------- post-committee deadlines (working days) ---------- */
const NOW=()=>new Date(new Date().toDateString()+" 00:00"),DK=[["sd",1],["ud",7]];
const isWD=d=>{const w=d.getDay();return w!==0&&(S.sat||w!==6)&&!(S.hol||[]).includes(iso(d))};
const addWD=(i,n)=>{const d=D0(i);while(n>0){d.setDate(d.getDate()+1);if(isWD(d))n--}return iso(d)};
const wdd=(a,b)=>{let n=0,sg=1,x=D0(a),y=D0(b);if(y<x){[x,y]=[y,x];sg=-1}while(x<y){x.setDate(x.getDate()+1);if(isWD(x))n++}return sg*n};
const rem=(t,d)=>d<t?-Math.max(1,wdd(d,t)):wdd(t,d),clrs=()=>[].concat(S.clrd||[]),clrc=()=>[].concat(S.clrc||[]);
const pend=c=>c.cd&&c.cd<=iso(NOW())&&!c.tr&&!c.w&&c.cd>(c.lp||"")&&!c.dn;
function setI(c,f,d){if(d){c[f]=d;if(f==="ud"){if(c.dn)undone(c);c.lp0=c.lp;c.lp=d;c.dn=true;c.dd=d;
 if(Array.isArray(c.prHistory)){c.prHistory.push({date:d,kind:"PR uploaded",at:new Date().toISOString()})}else c.prHistory=[{date:d,kind:"PR uploaded",at:new Date().toISOString()}];
 /* Preserve c.cd when a later PR is uploaded; deadline logic handles completion separately. */}}else{delete c[f];if(f==="ud"&&"lp0"in c)undone(c)}}
function syncSet(f,id,d){const c=co(id),ds=F.ds&&F.ds.size,sel=ds&&F.ds.has(id),T=d?(sel?S.co.filter(x=>x.id!==id&&F.ds.has(x.id)&&pend(x)&&!x[f]):(!ds&&S.dsync!==false?S.co.filter(x=>x.id!==id&&pend(x)&&!x[f]):[])):[];T.unshift(c);T.forEach(x=>setI(x,f,d));save();render();if(T.length>1)toast("Date applied to "+T.length+" cases")}
function prDateScopeDlg(id,d){
 const c=co(id),dlg=$("#dlg");if(!c)return;
 dlg.innerHTML='<div class="dh">Apply this final PR date</div><div class="db"><p class="f" style="margin:0">Apply '+fd(d)+' to '+esc(c.n)+' only, or to this case and all other pending cases?</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn" value="one">Only this case</button><button class="btn p" value="all">All pending cases</button></div>';
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x"){dlg.close();render();return}
  const targets=v==="all"?[c,...S.co.filter(x=>x.id!==c.id&&pend(x)&&!x.ud)]:[c];targets.forEach(x=>setI(x,"ud",d));dlg.close();save();render();toast(v==="all"?"PR date applied to "+targets.length+" pending case(s)":"PR date set for this case")}
}
function dItems(){const t=iso(NOW()),r=[];S.co.forEach(c=>{if(!pend(c))return;DK.forEach(([f,n])=>{if(c[f])return;const d=addWD(c.cd,n);r.push({c,f,d,x:rem(t,d)})})});return r}
function cleanCd(){return 0; /* committee dates are never mass-cleared automatically */}
function fixCd(){/* Migrate dates previously hidden in cdp back to the main committee-date field. Keep a separate cdp only when a newer/current cd also exists. */let changed=0;S.co.forEach(c=>{if(!c.cd&&c.cdp){c.cd=c.cdp;delete c.cdp;changed++}});S.clrc=S.clrc||[];S.co.forEach(c=>{if(c.cd&&(c.tr||(c.dn&&(!c.lp||c.cd>c.lp)))){const k=key(c.n)+"|"+c.cd;if(!S.clrc.includes(k))S.clrc.push(k);delete c.cd;delete c.cdp;changed++}if(c.tr&&S.bk.some(b=>b.id===c.id)){S.bk=S.bk.filter(b=>b.id!==c.id);changed++}});if(changed)save();return changed}
const canon=n=>String(n||"").toLowerCase().replace(/\u00a0/g," ").replace(/\bm\/?s\.?\s/g,"").replace(/&/g,"and").replace(/\blimited\b/g,"ltd").replace(/\bprivate\b/g,"pvt").replace(/[^a-z0-9]/g,"");
const splitC=(p,ph)=>{p=String(p||"").trim();ph=String(ph||"").trim();if(p&&!ph){const m=p.match(/^(.*?)[\s\-–—:,]*(\+?\d[\d\s\-]{7,}\d)\s*$/);if(m&&m[1].trim())return[m[1].trim(),m[2].replace(/[\s\-]+/g,"")]}return[p,ph]};
function dupScan(){const m={};S.co.forEach(c=>{const k=canon(c.n);(m[k]=m[k]||[]).push(c)});return Object.values(m).filter(a=>a.length>1)}
const alerts=()=>{const r=dItems().filter(i=>i.x<=0);return{n:r.length,od:r.filter(i=>i.x<0).length,td:r.filter(i=>i.x===0).length}};
const dchip=x=>x<0?`<span class="tag bad">Overdue ${-x} working day${x===-1?"":"s"}</span>`:x===0?'<span class="tag warn">Due today</span>':`<span class="tag ${x<=1?"warn":"ok"}">In ${x} working day${x===1?"":"s"}</span>`;
const al=()=>{const a=alerts();return a.n?`<div class="panel" style="border-left:4px solid var(--${a.od?"bad":"warn"});display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 14px"><span>⏰ <b>${a.od}</b> overdue · <b>${a.td}</b> due today: sending RL & PR to clients or uploading PR on the website</span><button class="btn p" data-v2="dl">View deadlines</button></div>`:""};
function dbadge(){const a=alerts(),e=$("#dc");if(e){e.textContent=a.n;e.hidden=!a.n}const page={mis:["All cases","Review rating cases, analysts, PR dates and current status."],ncd:["NCD cases","Review non-convertible debenture ratings and related PR dates."],ins:["Insights","View rating portfolio exposure, case status and analyst workload."],dl:["Deadlines","Track client rating letters, press releases and website publication dates."],cmt:["Committee","Review selected cases and generate rating committee documents."]}[V]||["All cases","Internal management information system for rating case workflows."];document.title=(a.n?"("+a.n+") ":"")+page[0]+" | Pratham MIS Tracker";const description=document.querySelector('meta[name="description"]');if(description)description.content=page[1]}
function notify(){dbadge();if(typeof Notification==="undefined"||Notification.permission!=="granted")return;const items=dItems().filter(i=>i.x<=0);if(!items.length){if(S.ln){S.ln="";save()}return}const key=iso(NOW())+":"+items.map(i=>i.c.id+":"+i.f+":"+i.d).sort().join("|");if(S.ln===key)return;const od=items.filter(i=>i.x<0).length,td=items.filter(i=>i.x===0).length;try{const n=new Notification("MIS deadlines",{body:od+" overdue · "+td+" due today. Open Deadlines to review.",tag:"mis-deadlines"});n.onclick=()=>{window.focus();V="dl";render(true);n.close()};S.ln=key;save()}catch(e){/* The in-app badge remains visible if the browser blocks a desktop alert. */}}
function dl(){if(F.ds)F.ds=new Set([...F.ds].filter(id=>S.co.some(c=>c.id===id&&pend(c))));const t=iso(NOW()),mn=c=>Math.min(99,...DK.filter(([f])=>!c[f]).map(([f,n])=>rem(t,addWD(c.cd,n)))),rows=S.co.filter(c=>(pend(c)||(F.dc&&(c.cd||c.cdp)&&!c.tr&&!c.w&&c.ud))&&(!F.dq||c.n.toLowerCase().includes(F.dq))&&(!F.cdf||(c.cd||c.cdp)===F.cdf)).sort((a,b)=>mn(a)-mn(b));
 const cf=(c,f,n)=>{const d=addWD(c.cd||c.cdp,n);return`<td>${fd(d)}<div>${c[f]?`<span class="tag ${c[f]>d?"warn":"ok"}">${c[f]>d?"Done late ":"Done "}${fd(c[f])}</span>`:dchip(rem(t,d))}</div></td><td style="white-space:nowrap"><input type="date" data-dk="${f}" data-id="${c.id}" value="${c[f]||""}"><button class="btn" data-dn="${f}" data-id="${c.id}" style="padding:3px 8px">✓ Today</button></td>`},perm=window.Notification?Notification.permission:"";
 return`<div class="panel"><h2>Post-committee deadlines</h2><p class="mut" style="margin:0 0 10px;font-size:13px">Rating Letter and Press Release to the client: <b>1 working day</b> after the committee. PR on the Infomerics website: <b>7 working days</b> after. Weekends${S.sat?" (except Saturdays)":""} and the holidays you add are skipped. A case remains pending until the website PR is uploaded. Entering the Rating Letter / client PR date only marks that step done; it does <b>not</b> complete the website PR deadline. Marking website upload records a new PR-history row, updates Last PR date in the MIS, and removes the case from this list.</p><div class="bar" style="margin:0"><button class="btn" id="hol">Holidays & working days…</button><button class="btn" id="cdd">Committee dates…</button>${perm==="default"?'<button class="btn p" id="ntf">Enable desktop alerts</button>':perm==="granted"?'<span class="tag ok" aria-live="polite">Desktop alerts on</span>':perm==="denied"?'<span class="tag warn">Desktop alerts blocked in browser settings</span>':'<span class="mut" style="font-size:12px">Desktop alerts unavailable in this browser</span>'}<label class="mut"><input type="checkbox" id="dcm" ${F.dc?"checked":""}> show completed</label></div><div class="bar" style="margin:10px 0 0"><label><b>Date</b> <input type="date" id="bdt" value="${iso(NOW())}"></label><button class="btn p" id="dball">${F.ds&&F.ds.size?"Mark "+F.ds.size+" selected":"Mark all"} sent & uploaded on this date</button><label class="mut"><input type="checkbox" id="dsy" ${S.dsync===false?"":"checked"}> With nothing ticked, a client-mail date is copied to all pending cases. The final PR date asks before applying.</label><span class="mut">Tick cases to copy a date only to them.</span><span class="mut" style="font-size:12px">Desktop alerts check every minute while this tracker is open.</span></div></div>
 <div class="deadline-filters"><input type="search" id="dq" placeholder="Search company…" value="${esc(F.dq||"")}"><label class="date-filter"><span>Committee date</span><input type="date" id="cdf" value="${esc(F.cdf||"")}" aria-label="Filter by committee date"></label><button class="btn" id="dclrf" style="padding:6px 10px">Clear filters</button></div><p class="mut deadline-hint">Record each client and website date as the work is completed.</p><div class="tw deadline-wrap"><table class="deadline-table"><thead><tr><th><input type="checkbox" id="dsa" aria-label="Select all pending" ${rows.length&&rows.every(c=>F.ds&&F.ds.has(c.id))?"checked":""}></th><th>Company</th><th>Committee</th><th>Last PR</th><th>RL & PR to client due</th><th>Sent on</th><th>PR on website due</th><th>Uploaded on</th></tr></thead><tbody>${rows.map(c=>`<tr class="r"><td><input type="checkbox" data-ds="${c.id}" ${F.ds&&F.ds.has(c.id)?"checked":""} aria-label="Select"></td><td data-e="${c.id}" style="cursor:pointer;font-weight:600">${esc(c.n)}</td><td>${fd(c.cd||c.cdp)}</td><td>${fd(c.lp)}</td>${cf(c,"sd",1)}${cf(c,"ud",7)}</tr>`).join("")||'<tr><td colspan="8" class="empty">Nothing pending. A case appears here when its committee date is after its last PR date, until you mark it sent and uploaded.</td></tr>'}</tbody></table></div>`}
function heldDlg(){const cs=S.bk.map(b=>co(b.id)).filter(c=>c&&!c.dn&&!c.tr&&!c.w),dlg=$("#dlg");dlg.innerHTML=`<div class="dh">Committee held · ${cs.length} case(s)</div><div class="db"><label class="f">Committee date<input type="date" id="hd" value="${S.lcd||iso(NOW())}"></label><p class="f mut" style="margin:0;font-size:12px">Starts two timers for each case: Rating Letter & Press Release to the client (1 working day) and PR on the website (7 working days). You'll see an alert here, in the browser tab title and, if you enable it, as a desktop notification. Starting again for a case resets its timers.</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Start timers</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();const d=$("#hd").value;if(!d)return toast("Pick the committee date");cs.forEach(c=>{c.cm=d;c.cd=d;delete c.sd;delete c.ud});const doneIds=new Set(cs.map(c=>c.id));S.bk=S.bk.filter(b=>!doneIds.has(b.id));S.lcd=d;dlg.close();save();V="dl";render();toast("Timers started for "+cs.length+" case(s)")}}
function cdDlg(){const m={};S.co.forEach(c=>{if(c.cd)m[c.cd]=(m[c.cd]||0)+1});const dlg=$("#dlg"),E=Object.entries(m).sort();dlg.innerHTML=`<div class="dh">Committee dates</div><div class="db"><p class="f mut" style="margin:0;font-size:12px">Only cases that were actually presented should have a committee date. Tick the dates that are wrong and clear them: those cases drop off the deadlines list, and the date is blanked in your linked Excel too.</p>${E.map(([d,n])=>`<label class="f" style="flex-direction:row;align-items:center;gap:8px;color:var(--ink);font-size:14px"><input type="checkbox" value="${d}"> ${fd(d)} · ${n} case${n>1?"s":""}</label>`).join("")||'<p class="f mut" style="margin:0">No committee dates are set.</p>'}</div><div class="df"><button class="btn" value="x">Close</button><button class="btn p" value="ok">Clear selected dates</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();const sel=[...dlg.querySelectorAll("input:checked")].map(x=>x.value);if(!sel.length)return toast("Tick the dates to clear");S.co.forEach(c=>{if(sel.includes(c.cd))delete c.cd});S.clrd=[...new Set([...clrs(),...sel])];dlg.close();save();render();toast("Cleared "+sel.length+" committee date(s)")}}
function holDlg(){const dlg=$("#dlg");dlg.innerHTML=`<div class="dh">Holidays & working days</div><div class="db"><label class="f">Holidays (one date per line, as 2026-11-09 or 09-11-2026)<textarea id="hl" rows="9">${(S.hol||[]).join("\n")}</textarea></label><label class="f"><span><input type="checkbox" id="st6" ${S.sat?"checked":""}> Saturdays are working days</span></label><p class="f mut" style="margin:0;font-size:12px">Sundays are always skipped. I don't know your office holiday list, so add the dates here.</p></div><div class="df"><button class="btn" value="x">Cancel</button><button class="btn p" value="ok">Save</button></div>`;
 dlg.showModal();dlg.onclick=e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();S.hol=[...new Set($("#hl").value.split(/[\n,;]+/).map(x=>x.trim()).map(x=>{const m=x.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);return m?`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:x}).filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)))].sort();S.sat=$("#st6").checked;dlg.close();save();render();toast("Saved")}}
function linkHelp(){const dlg=$("#dlg"),emb=window.top!==window;dlg.innerHTML=`<div class="dh">Linking needs the saved file</div><div class="db"><p class="f" style="margin:0">${emb?"This tracker is running inside another web page (an embedded view), and browsers do not allow a file picker there.":"This browser can't link a file for automatic saving. It needs Chrome or Edge."}</p><ol class="f" style="margin:0;padding-left:18px;line-height:1.8"><li>Open the downloaded <b>MIS-Tracker.html</b> file directly: double-click it, or drag it into a Chrome or Edge window.</li><li>Click <b>⋯ → Link Excel</b> and pick your Portfolio file once.</li></ol><p class="f mut" style="margin:0;font-size:12px">Until then, <b>Update an Excel file now</b> writes today's changes into a copy of your workbook (format kept) that you save over the original. Import Excel and the downloads work everywhere.</p></div><div class="df"><button class="btn" value="x">Close</button><button class="btn p" value="c">Update an Excel file now</button></div>`;
 dlg.showModal();dlg.onclick=async e=>{const v=e.target.tagName==="BUTTON"?e.target.value:"";if(!v)return;e.preventDefault();if(v==="x")return dlg.close();const f=await pick(".xlsx,.xlsm");if(!f)return;try{const b=await f.arrayBuffer(),o=patchXlsx(b,S.co);await out(f.name.replace(/\.(xlsx|xlsm)$/i,"")+" (updated).xlsx",o||new Uint8Array(b));dlg.close();toast(o?"Updated copy downloaded":"Nothing to change: your file already matches")}catch(er){toast("Couldn't update that file: "+er.message)}}}
/* ---------- events ---------- */
const app=$("#app");
app.addEventListener("click",e=>{const t=e.target,g=k=>t.closest(`[${k}]`)?.getAttribute(k);
 if(t.closest("a[href]"))return;if(t.id==="toggleFilters"){F.mobileFilters=!F.mobileFilters;render();return}if(t.id==="clrf"){F.q="";F.dq="";F.cdf="";F.an="";F.gh="";F.cols={};F.f="all";F.rs="live";F.n=120;render();return}if(t.id==="dclrf"){F.dq="";F.cdf="";render();return}if(t.dataset.v2){V=t.dataset.v2;render(true);return}if(t.id==="held")return heldDlg();if(t.id==="hol")return holDlg();if(t.id==="cdd")return cdDlg();if(t.id==="ntf"){if(typeof Notification==="undefined")return toast("Desktop alerts are unavailable in this browser");Notification.requestPermission().then(p=>{render();toast(p==="granted"?"Desktop due alerts enabled":"Allow notifications in browser settings")}).catch(()=>toast("Could not enable desktop alerts"));return}if(t.id==="dball"){const d=$("#bdt").value||iso(NOW()),p=F.ds&&F.ds.size?S.co.filter(c=>F.ds.has(c.id)&&pend(c)):S.co.filter(pend);if(p.length&&confirm("Mark "+p.length+" case(s) as sent to the client and uploaded on "+fd(d)+"?")){p.forEach(c=>{if(!c.sd)setI(c,"sd",d);setI(c,"ud",d)});save();render();toast(p.length+" case(s) done: removed from deadlines and updated in the main list")}return}if(t.dataset.dn){syncSet(t.dataset.dn,+t.dataset.id,iso(NOW()));return}if(t.dataset.mail){mailDlg(+t.dataset.mail);return}
 if(t.dataset.b){const id=+t.dataset.b,L=list();let ids=[id];if(e.shiftKey&&F.last!=null){const a=L.findIndex(c=>c.id===F.last),b=L.findIndex(c=>c.id===id);if(a>=0&&b>=0)ids=L.slice(Math.min(a,b),Math.max(a,b)+1).map(c=>c.id)}F.last=id;setB(ids,t.checked);return}
 if(t.id==="paste")return pasteDlg();if(t.id==="zdue")return zipDue();
 if(g("data-f")){F.f=g("data-f");render()}else if(g("data-e")){form(S.co.find(c=>c.id==g("data-e")))}
 else if(t.id==="more"){F.n+=150;render()}else if(t.id==="genbundle")generateDlg();else if(g("data-rm")){S.bk=S.bk.filter(b=>b.id!=g("data-rm"));save();render()}
 else if(t.id==="bnow"){out("mis-backup.json",JSON.stringify(S));S.lb=iso(TODAY);save();render();toast("Backup downloaded")}else if(t.id==="bmail")bulkMail();else if(t.id==="prt")window.print();else if(t.id==="mdone")doneDlg(S.bk.map(b=>b.id).filter(id=>!S.co.find(c=>c.id===id)?.dn));else if(t.id==="rt")templateDlg();else if(t.id==="cp"){const s=S.bk.map(b=>{const c=S.co.find(x=>x.id===b.id),cl=cur(c,b,"lt"),cs=cur(c,b,"st");return"• "+say(c,cl,cs,action(c.lt,cl,"lt"),action(c.st,cs,"st"))}).join("\n");navigator.clipboard?.writeText(s).then(()=>toast("Brief copied"),()=>toast("Copy blocked by browser"))}
 else if(t.id==="csv"){out("check.csv",csv(["Company Name","Amount","Previous Rating LT","Previous Rating ST","Current Rating LT","Current Rating ST","Action LT","Action ST"],S.bk.map(b=>{const c=S.co.find(x=>x.id===b.id),cl=cur(c,b,"lt"),cs=cur(c,b,"st");return[c.n,c.a,c.lt,c.st,cl,cs,action(c.lt,cl,"lt"),action(c.st,cs,"st")]})))}});
app.addEventListener("change",e=>{const t=e.target;
 if(t.id==="sa")setB(list().map(c=>c.id),t.checked);else if(t.hasAttribute("data-cd"))applyCd(t.value);else if(t.dataset.dk){if(t.dataset.dk==="ud"&&t.value)prDateScopeDlg(+t.dataset.id,t.value);else syncSet(t.dataset.dk,+t.dataset.id,t.value)}else if(t.dataset.ds){F.ds=F.ds||new Set();t.checked?F.ds.add(+t.dataset.ds):F.ds.delete(+t.dataset.ds);render()}else if(t.id==="dsa"){F.ds=new Set(t.checked?S.co.filter(pend).map(c=>c.id):[]);render()}else if(t.id==="dsy"){S.dsync=t.checked;save()}else if(t.id==="dcm"){F.dc=t.checked;render()}else if(t.id==="cdf"){F.cdf=t.value;F.n=120;render()}
 else if(t.dataset.doneDate){const c=S.co.find(x=>x.id==t.dataset.doneDate);if(!c)return;if(t.value){if(c.dn)undone(c);c.dn=true;c.dd=t.value;c.lp0=c.lp;c.lp=t.value;S.ld=t.value;save();render();toast("PR marked done on "+fd(t.value)+"; Last PR date updated")}else{undone(c);save();render();toast("PR completion date cleared; case marked pending")}}
 else if(t.dataset.o){S.bk.find(b=>b.id==t.dataset.id)[t.dataset.o]=t.value;save();render()}
 else if(t.id==="inc"){S.inc=t.checked;save();render()}
 else if(t.id==="an"||t.id==="gh"||t.id==="srt"||t.id==="rs"){F[t.id]=t.value;F.n=120;render()}else if(t.id==="tr"){F.tr=t.checked;render()}});
let qt,cqt;app.addEventListener("input",e=>{const t=e.target;if(t.dataset.colFilter){clearTimeout(cqt);const k=t.dataset.colFilter,v=t.value;cqt=setTimeout(()=>{F.cols=F.cols||{};F.cols[k]=v.trim().toLowerCase();if(k==="status"&&F.cols[k])F.rs="all";F.n=120;const p=t.type==="search"?t.selectionStart:null;render();const q=app.querySelector(`[data-col-filter="${k}"]`);if(q){q.focus();if(p!==null)q.setSelectionRange(p,p)}},180);return}const id=t.id;if(id!=="q"&&id!=="dq")return;clearTimeout(qt);const v=t.value;qt=setTimeout(()=>{F[id==="dq"?"dq":"q"]=v.trim().toLowerCase();F.n=120;const p=t.selectionStart;render();const q=$("#"+id);if(q){q.focus();q.setSelectionRange(p,p)}},180)});
const headerEl=document.querySelector("header"),navToggle=$("#nav-toggle");
const mobileActions=$("#mobile-actions");
const closeNav=()=>{headerEl.classList.remove("nav-open");if(mobileActions)mobileActions.open=false;navToggle?.setAttribute("aria-expanded","false");navToggle?.setAttribute("aria-label","Open navigation and actions");if(navToggle)navToggle.textContent="Menu"};
navToggle?.addEventListener("click",()=>{const open=headerEl.classList.toggle("nav-open");if(mobileActions)mobileActions.open=open;navToggle.setAttribute("aria-expanded",String(open));navToggle.setAttribute("aria-label",open?"Close navigation and actions":"Open navigation and actions");navToggle.textContent=open?"Close":"Menu";requestAnimationFrame(syncNavIndicator)});window.addEventListener("resize",syncNavIndicator,{passive:true});
document.querySelectorAll("#primary-nav button[data-v]").forEach(b=>b.onclick=()=>{V=b.dataset.v;F.f="all";closeNav();render(true);window.scrollTo({top:0,behavior:"smooth"})});
const home=()=>{V="mis";F.f="all";closeNav();render(true);window.scrollTo({top:0,behavior:"smooth"})};
document.querySelectorAll(".brand-link,.footer-home").forEach(link=>link.addEventListener("click",e=>{e.preventDefault();home()}));
const copyrightYear=$("#copyright-year");if(copyrightYear)copyrightYear.textContent=String(new Date().getFullYear());
$("#sel").addEventListener("change",e=>{if(e.target.hasAttribute("data-cd"))applyCd(e.target.value)});$("#sel").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.id==="bmail2")bulkMail();if(b.id==="gocm"){V="cmt";render(true);scrollTo(0,0)}if(b.id==="clr"){S.bk=[];save();render()}});
$("#imp").onclick=impXlsx;$(".menu").addEventListener("click",()=>{if(mobileActions)mobileActions.open=false;closeNav()});$("#add").onclick=()=>form();$("#rules").onclick=rules;$("#bk").onclick=backup;
$("#quick-dock")?.addEventListener("click",e=>{const b=e.target.closest("[data-dock]");if(!b)return;const a=b.dataset.dock;if(a==="search"){V="mis";F.f="all";closeNav();render(true);requestAnimationFrame(()=>{$("#q")?.focus();$("#q")?.scrollIntoView({behavior:"smooth",block:"center"})})}else if(a==="add")$("#add").click();else if(a==="theme")$("#th").click();else if(a==="database")$("#dbs").click();else if(a==="rules")$("#rules").click()});
const themeNow=()=>document.documentElement.dataset.theme||(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");const themeLabel=()=>{const dark=themeNow()==="dark",label="Switch to "+(dark?"light":"dark")+" mode",t=$("#th"),dock=$("#quick-dock [data-dock=theme]");t.dataset.themeState=dark?"dark":"light";t.setAttribute("aria-pressed",String(dark));t.setAttribute("aria-label",label);t.innerHTML='<span class="theme-switch-track" aria-hidden="true"><span class="theme-switch-knob"></span></span><span class="theme-toggle-label">'+label+'</span>';if(dock){dock.dataset.themeState=dark?"dark":"light";dock.setAttribute("aria-pressed",String(dark));dock.setAttribute("aria-label",label)}};try{const savedTheme=localStorage.getItem("mis_theme");if(savedTheme==="light"||savedTheme==="dark")document.documentElement.dataset.theme=savedTheme}catch(e){}themeLabel();$("#th").onclick=()=>{document.documentElement.dataset.theme=themeNow()==="dark"?"light":"dark";try{localStorage.setItem("mis_theme",document.documentElement.dataset.theme)}catch(e){}themeLabel()};
render();
/* Do not auto-clear committee dates: Excel is the source of truth and prior dates remain visible. */fixCd();S.co.forEach(c=>{const x=splitC(c.p,c.ph);c.p=x[0];c.ph=x[1]});render();notify();setInterval(notify,60000);
