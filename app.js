/* EduTech app logic
   1. Settings and saved data (everything lives in this browser's localStorage)
   2. Helpers and icons
   3. Numbers computed from scored work: stats, certificates, skills, badges
   4. Page views: home, join, tasks, task, profile, employers, verify
   5. Actions: sign up, shift (punch in, work trace, submit, follow-up), employer
   6. Header, clock, routing and events
   Grading is not here. It is done by hand in review.js.
*/

/* ---------- 1. Settings and saved data ---------- */
let lang="ka",theme="light";
try{lang=localStorage.getItem("et-lang")||"ka";theme=localStorage.getItem("et-theme")||"light"}catch(e){}
const tr=s=>{const p=String(s).split("|");return lang==="ka"&&p[1]!==undefined?p[1]:p[0]};
const L=(en,ka)=>lang==="ka"?ka:en;

/* db.user   the signed-up student, or null
   db.shifts shifts in progress, by task id: {start,end,checks,draft,link,typed,pasted,away,fu}
   db.subs   submitted work, by task id: {id,at,min,ans,link,checks,nums,trace,fu,g}
             g is the grade, added by review.js: {c,q,m,fb,by,sup}
   db.tasks  tasks posted from the employer page
   db.invites / db.invited  employer invites to the student / to sample candidates */
const fresh=()=>({user:null,shifts:{},subs:{},tasks:[],invites:[],invited:{}});
let db=fresh();
try{Object.assign(db,JSON.parse(localStorage.getItem("et-db")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("et-db",JSON.stringify(db))}catch(e){}};

/* ---------- 2. Helpers and icons ---------- */
const $=s=>document.querySelector(s),app=$("#app");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s||"").replace(/\|/g,"/").trim();
const allTasks=()=>TASKS.concat(db.tasks);
const T=id=>allTasks().find(t=>t.id===id);
const cur=()=>location.hash.startsWith("#task-")?location.hash.slice(6):null;
const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const MON=["Jan|იან","Feb|თებ","Mar|მარ","Apr|აპრ","May|მაი","Jun|ივნ","Jul|ივლ","Aug|აგვ","Sep|სექ","Oct|ოქტ","Nov|ნოე","Dec|დეკ"];
const day=iso=>{const d=new Date(iso);return d.getDate()+" "+tr(MON[d.getMonth()])+" "+d.getFullYear()};
const num=n=>n>=1000?n.toLocaleString("en-US").replace(/,/g,lang==="ka"?" ":","):String(n);
const mmss=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const total=g=>g.c+g.q+g.m;
const mean=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;
const graded=()=>Object.values(db.subs).filter(s=>s.g&&T(s.id)).sort((a,b)=>a.at<b.at?-1:1);
const pending=()=>Object.values(db.subs).filter(s=>!s.g&&T(s.id));
/* Text of the demo student is "English|Georgian". Text typed by a real student is shown as typed. */
const ut=s=>db.user&&db.user.demo?tr(s):s||"";
const own=(s,bi)=>esc(bi?tr(s):s);
const firstName=()=>ut(db.user.n).split(" ")[0];
const say=t=>{const m=$("#msg");if(m)m.textContent=t};

/* Per-student numbers: every student gets slightly different numbers in some briefs,
   so a finished answer cannot simply be passed to a classmate. */
const numsFor=t=>(t.nums||[]).map((n,i)=>db.user&&!db.user.demo?n[0]+n[2]*(hash(db.user.id+t.id+i)%(2*n[1]+1)-n[1]):n[0]);
const fill=(s,ns)=>s.replace(/\{(\d|\+)\}/g,(m,k)=>num(k==="+"?ns.reduce((a,b)=>a+b,0):ns[k]));
const brief=(t,ns)=>fill(tr(t.b),ns&&ns.length?ns:numsFor(t));

let filter="All",timer=null,sure=false,asCo=Object.keys(CO)[0];
const ALL="All|ყველა";
const sun=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const moon=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const seal=`<svg class="seal" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="#ffd23f"/><circle cx="27" cy="27" r="18" fill="none" stroke="#15171c" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M18 27l6 6 12-13" fill="none" stroke="#15171c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const fbtns=active=>`<div class="filters">${[ALL].concat(FIELDS).map(f=>{const k=f.split("|")[0];return `<button class="${k===active?"on":""}" data-f="${k}">${tr(f)}</button>`}).join("")}</div>`;
const fieldOpts=()=>FIELDS.map((f,i)=>`<option value="${i}">${tr(f)}</option>`).join("");

/* ---------- 3. Numbers computed from scored work ---------- */
function stats(){const g=graded();
return {g,n:g.length,avg:mean(g.map(s=>total(s.g))),mins:g.reduce((a,s)=>a+s.min,0),onTime:g.filter(s=>s.min<=T(s.id).min).length}}

function certs(){if(!db.user)return [];const g=graded();
return FIELDS.map((f,i)=>{const d=g.filter(s=>T(s.id).f===f);if(!d.length)return null;
  const avg=mean(d.map(s=>total(s.g))),ok=d.length>=NEED&&avg>=PASS;
  return {f,t:CERT[i],n:d.length,avg,ok,at:ok?d[d.length-1].at:null,
    id:ok?"ET-"+f.slice(0,3).toUpperCase()+"-"+String(hash(db.user.id+f)%100000).padStart(5,"0"):null}}).filter(Boolean)}

function skills(){const m={};graded().forEach(s=>T(s.id).sk.forEach(k=>(m[k]=m[k]||[]).push(total(s.g))));
return Object.entries(m).map(([k,v])=>[k,mean(v),v.length]).sort((a,b)=>b[2]-a[2]||b[1]-a[1]).slice(0,6)}

function badges(){const {g,n,onTime}=stats();
return [[n>=1,"First shift|პირველი ცვლა","#ffd23f"],[onTime>=5,"5 on time|5 დროულად","#2448e0"],[n>=5,"5 shifts done|5 შესრულებული ცვლა","#11804a"],
  [g.some(s=>total(s.g)>=90),"Score 90+|ქულა 90+","#c2331f"],[new Set(g.map(s=>T(s.id).f)).size>=3,"Multi-field|მრავალი სფერო","#7b4bd6"],
  [certs().some(c=>c.ok),"Certified|სერტიფიცირებული","#15171c"]].filter(b=>b[0])}

/* Scored shifts per week for the last 12 weeks */
function weeks(){const now=new Date(),mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(now.getDay()+6)%7),g=graded(),out=[];
for(let i=11;i>=0;i--){const a=new Date(mon);a.setDate(mon.getDate()-7*i);const b=new Date(a);b.setDate(a.getDate()+7);
  out.push({a,n:g.filter(s=>{const d=new Date(s.at);return d>=a&&d<b}).length})}
return out}

/* ---------- 4. Page views ---------- */
const card=t=>{const s=db.subs[t.id],live=db.shifts[t.id],b=brief(t,s&&s.nums);
const left=s&&s.g?`<span class="done">✓ ${L("Done","შესრულდა")} · ${total(s.g)}/100</span>`
  :s?`<span class="wait">${L("In review","ფასდება")}</span>`
  :live?`<span class="wait">${L("On the clock","დრო მიდის")}</span>`
  :`<span class="small muted">${t.custom?L("New from an employer","ახალი დამსაქმებლისგან"):t.sk.slice(0,2).map(tr).join(", ")}</span>`;
return `<article class="card"><div class="meta"><span class="chip">${tr(t.f)}</span><span class="chip">${tr(t.lvl)}</span><span class="chip">${t.min} ${L("min","წთ")}</span></div>
<h3>${esc(tr(t.t))}</h3><div class="muted small">${esc(tr(t.co))}</div><p style="margin:0">${esc(b.length>115?b.slice(0,115)+"…":b)}</p>
<div class="foot">${left}<a class="btn ${s?"ghost":""}" href="#task-${t.id}">${s?L("View","ნახვა"):live?L("Continue","გაგრძელება"):L("Start shift","დაწყება")}</a></div></article>`};

function home(){const u=db.user,live=Object.keys(db.shifts)[0],open=allTasks().filter(x=>!db.subs[x.id]);
const t=T(live)||open.find(x=>u&&x.f===u.f)||open[0]||TASKS[0];
return `<section class="band"><div class="wrap hero">
<div><p class="small muted" style="margin:0 0 10px">${u?L(`Welcome back, ${esc(firstName())}. You have ${stats().n} scored shifts and ${certs().filter(c=>c.ok).length} certificates.`,`კეთილი იყოს შენი დაბრუნება, ${esc(firstName())}. გაქვს ${stats().n} შეფასებული ცვლა და ${certs().filter(c=>c.ok).length} სერტიფიკატი.`):L("Free for every school student in Georgia.","უფასოა საქართველოს ყველა სკოლის მოსწავლისთვის.")}</p>
<h1>${L("Do the job before you get the job.","შეასრულე სამუშაო, სანამ სამსახურს მიიღებ.")}</h1>
<p class="lead">${L("EduTech gives students small, real-feeling tasks from companies in every field. Finish one and it lands in your portfolio, with feedback, so employers can see what you can actually do.","EduTech მოსწავლეებს სთავაზობს მცირე, რეალურ სამუშაოსთან მიახლოებულ დავალებებს სხვადასხვა სფეროს კომპანიებისგან. დაასრულე დავალება და ის შეფასებასთან ერთად შენს პორტფოლიოში აღმოჩნდება, რათა დამსაქმებლებმა ნახონ, რისი გაკეთება შეგიძლია სინამდვილეში.")}</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">${u?`<a class="btn hib" href="#tasks">${L("Browse tasks","დავალებების ნახვა")}</a><a class="btn ghost" href="#profile">${L("See my profile","ჩემი პროფილი")}</a>`
  :`<a class="btn hib" href="#join">${L("Create my profile","პროფილის შექმნა")}</a><button class="btn ghost" type="button" data-act="demo">${L("Try the demo account","სადემონსტრაციო ანგარიში")}</button>`}</div>
<p class="small muted" style="margin-top:18px">${L(`${allTasks().length} tasks across ${FIELDS.length} fields · 25 to 75 minutes each`,`${allTasks().length} დავალება ${FIELDS.length} სფეროში · თითოეული 25-დან 75 წუთამდე`)}</p></div>
<div class="ticket"><div class="row"><span>${live?L("YOUR SHIFT","შენი ცვლა"):L("NEXT SHIFT","შემდეგი ცვლა")} · ${esc(tr(t.co))}</span><span>${t.min} ${L("min budget","წთ ლიმიტი")}</span></div>
<h3>${esc(tr(t.t))}</h3><div class="clock" id="hclock">00:00</div><ul>${t.st.slice(0,3).map(s=>`<li>${esc(tr(s))}</li>`).join("")}</ul>
<a class="btn" href="#task-${t.id}">${live?L("Back to work","სამუშაოზე დაბრუნება"):L("Punch in","ცვლის დაწყება")}</a></div></div></section>
<section class="band" style="border-top:1px solid var(--line)"><div class="wrap"><h2>${L("How a shift works","როგორ მუშაობს ცვლა")}</h2><div class="steps" style="margin-top:20px">
<div class="step"><b>${L("1. Pick a task","1. აირჩიე დავალება")}</b>${L("Choose a field and a level. Each brief comes from a \"manager\" at a company, just like a real first week.","აირჩიე სფერო და დონე. თითოეულ დავალებას კომპანიის „მენეჯერი“ გაძლევს, როგორც ნამდვილ პირველ სამუშაო კვირაში.")}</div>
<div class="step"><b>${L("2. Do the work","2. შეასრულე სამუშაო")}</b>${L("Punch in, follow the checklist and submit. Then your manager asks one question about your own answer, like in a real job.","დაიწყე ცვლა, მიჰყევი ჩამონათვალს და გაგზავნე ნამუშევარი. შემდეგ მენეჯერი შენივე პასუხზე ერთ კითხვას დაგისვამს, როგორც ნამდვილ სამსახურში.")}</div>
<div class="step"><b>${L("3. Build your portfolio","3. შექმენი პორტფოლიო")}</b>${L(`A reviewer scores your work and writes feedback. Finish ${NEED} shifts in a field and you earn a certificate employers can verify.`,`შემფასებელი ნამუშევარს ქულას უწერს და უკუკავშირს გაძლევს. დაასრულე ${NEED} ცვლა ერთ სფეროში და მიიღე სერტიფიკატი, რომლის გადამოწმებაც დამსაქმებელს შეუძლია.`)}</div></div></div></section>
<section class="band"><div class="wrap"><h2>${L("Fields you can try","სფეროები, რომლებიც შეგიძლია სცადო")}</h2><div class="filters">${FIELDS.map(f=>`<button data-f="${f.split("|")[0]}">${tr(f)} · ${allTasks().filter(t=>t.f===f).length}</button>`).join("")}</div></div></section>`}

function join(){return `<section class="band"><div class="wrap narrow"><h1>${L("Create your profile","შექმენი პროფილი")}</h1>
<p class="lead muted">${L("For school students anywhere in Georgia. It takes a minute and it is free.","საქართველოს ნებისმიერი სკოლის მოსწავლისთვის. ერთი წუთი სჭირდება და უფასოა.")}</p>
<form class="brief form" data-form="join">
<label>${L("Name and surname","სახელი და გვარი")}<input name="n" required maxlength="40" autocomplete="name"></label>
<label>${L("School","სკოლა")}<input name="school" required maxlength="60"></label>
<label>${L("City or village","ქალაქი ან სოფელი")}<input name="city" required maxlength="40"></label>
<label>${L("Grade","კლასი")}<select name="grade">${[7,8,9,10,11,12].map(g=>`<option ${g===10?"selected":""}>${g}</option>`).join("")}</select></label>
<label>${L("Field you want to try first","სფერო, რომლის ცდაც პირველად გინდა")}<select name="f">${fieldOpts()}</select></label>
<label>${L("About you (optional)","შენ შესახებ (არასავალდებულო)")}<textarea name="bio" rows="3" maxlength="240"></textarea></label>
<button class="btn hib">${L("Create my profile","პროფილის შექმნა")}</button>
<p class="small muted" style="margin:0">${L("Demo: your profile and your work are saved only in this browser. Nothing is sent anywhere.","დემო: შენი პროფილი და ნამუშევრები მხოლოდ ამ ბრაუზერში ინახება. არსად არაფერი იგზავნება.")}</p></form>
<p style="margin-top:18px"><button class="btn ghost" type="button" data-act="demo">${L("Or try the demo account","ან სცადე სადემონსტრაციო ანგარიში")}</button></p></div></section>`}

function tasks(){const all=allTasks(),list=all.filter(t=>filter==="All"||t.f.split("|")[0]===filter),n=Object.keys(db.subs).length;
return `<section class="band"><div class="wrap"><h1>${L("Task board","დავალებების დაფა")}</h1><p class="lead muted">${db.user?L(`You have submitted ${n} of ${all.length} tasks. ${all.length-n} are waiting.`,`გაგზავნილი გაქვს ${n} დავალება ${all.length}-დან. ${all.length-n} ჯერ კიდევ გელოდება.`):L("Pick any task and punch in. You will need a free profile to start.","აირჩიე ნებისმიერი დავალება და დაიწყე ცვლა. დასაწყებად უფასო პროფილი დაგჭირდება.")}</p>
${fbtns(filter)}<div class="grid">${list.map(card).join("")||`<p class="muted">${L("No tasks in this field yet.","ამ სფეროში დავალებები ჯერ არ არის.")}</p>`}</div></div></section>`}

/* The submitted work with its work trace. Also used by review.js. */
function submission(s,t){const tc=s.trace,all=tc?tc.typed+tc.pasted:0,p=all?Math.round(tc.typed/all*100):100;
return `<div class="entry" style="margin-top:20px"><h3>${L("Submitted work","გაგზავნილი ნამუშევარი")}</h3><span class="q pre">${own(s.ans,s.bi)}</span>
${s.link?`<p class="small" style="margin:10px 0 0">${L("Link","ბმული")}: ${/^https?:\/\//.test(s.link)?`<a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.link)}</a>`:esc(s.link)}</p>`:""}
${s.fu?`<p class="small muted" style="margin:14px 0 0">${L("Follow-up question","დამატებითი კითხვა")}: ${esc(tr(s.fu.q))}</p><span class="q pre">${esc(s.fu.a)}</span>`:""}
<p class="small muted" style="margin:10px 0 0">${L(`Submitted ${day(s.at)} · took ${s.min} of ${t.min} minutes`,`გაგზავნილია ${day(s.at)} · დახარჯა ${s.min} წუთი ${t.min}-დან`)}</p>
${tc?`<div class="meta" style="margin-top:8px"><span class="small muted">${L("Work trace","მუშაობის კვალი")}:</span><span class="chip">${L(`${p}% typed`,`${p}% აკრეფილია`)}</span><span class="chip">${L(`${tc.pasted} characters pasted`,`${tc.pasted} სიმბოლო ჩასმულია`)}</span><span class="chip">${L(`left the tab ${tc.away}×`,`ჩანართი დატოვა ${tc.away}×`)}</span>${s.fu?`<span class="chip">${L(`follow-up in ${s.fu.sec}s`,`კითხვას უპასუხა ${s.fu.sec} წმ-ში`)}</span>`:""}</div>`:""}</div>`}

function task(id){const t=T(id);if(!t)return `<section class="band"><div class="wrap"><h2>${L("Task not found","დავალება ვერ მოიძებნა")}</h2><a href="#tasks">${L("Back to tasks","დავალებებზე დაბრუნება")}</a></div></section>`;
const s=db.subs[id],sh=db.shifts[id],g=s&&s.g,who=tr(t.who),ticks=s?s.checks||t.st.map(()=>1):sh?sh.checks:[];
const box=i=>`<span class="box ${ticks[i]?"y":""}">${ticks[i]?"✓":""}</span>`;
const list=t.st.map((x,i)=>sh&&!sh.fu?`<button type="button" class="check" data-act="tick" data-i="${i}">${box(i)}<span>${esc(tr(x))}</span></button>`:`<div class="check">${box(i)}<span>${esc(tr(x))}</span></div>`).join("");
/* left column, under the brief: answer box, follow-up question, or the submitted work */
const work=sh&&sh.fu?`<div class="entry" style="margin-top:20px"><div class="small muted">${L("One quick question before you clock out","ერთი მოკლე კითხვა ცვლის დასრულებამდე")} · ${esc(who)}</div>
<h3 style="margin-top:6px">${esc(tr(sh.fu.q))}</h3><textarea id="fua" rows="4" placeholder="${L("Answer in your own words","უპასუხე შენი სიტყვებით")}"></textarea>
<p class="small muted">${L("Pasting is switched off here. You have about two minutes:","აქ ტექსტის ჩასმა გამორთულია. გაქვს დაახლოებით ორი წუთი:")} <b id="fclock"></b></p><p class="warn" id="msg"></p>
<button class="btn hib" type="button" data-act="fu">${L("Clock out","ცვლის დასრულება")}</button></div>`
:sh?`<div class="entry" style="margin-top:20px"><h3>${L("Your answer","შენი პასუხი")}</h3><textarea id="ans" rows="10" placeholder="${L("Write your answer, code or explanation here","აქ ჩაწერე პასუხი, კოდი ან ახსნა")}">${esc(sh.draft)}</textarea>
<input id="lnk" type="url" placeholder="${L("Link to your design or code (optional)","დიზაინის ან კოდის ბმული (არასავალდებულო)")}" value="${esc(sh.link)}">
<p class="small muted">${L("Saved as you type. The reviewer also sees your work trace: time taken, how much was typed or pasted, and how often you left this tab.","ინახება წერის დროს. შემფასებელი ხედავს მუშაობის კვალსაც: დახარჯულ დროს, რამდენი აკრიფე ან ჩასვი და რამდენჯერ დატოვე ეს ჩანართი.")}</p><p class="warn" id="msg"></p>
<button class="btn hib" type="button" data-act="submit">${L("Submit work","ნამუშევრის გაგზავნა")}</button></div>`
:s?submission(s,t):"";
/* right column: score, waiting note, or the shift ticket */
const crit=g?[[L("Covered the checklist","ჩამონათვალის შესრულება"),g.c,40],[L("Quality of the work","ნამუშევრის ხარისხი"),g.q,40],[L("Communication","კომუნიკაცია"),g.m,20]]:[];
const side=g?`<div class="brief"><div class="small muted">${L("Feedback from","უკუკავშირი:")} ${own(g.by,s.bi)}</div><div class="score">${total(g)}<span style="font-size:22px">/100</span></div>
${g.sup?`<span class="chip" style="margin-top:8px">${L("Done in class, supervised","შესრულდა კლასში, მეთვალყურეობით")}</span>`:""}
${crit.map(r=>`<div class="small" style="display:flex;justify-content:space-between;margin-top:10px"><span>${r[0]}</span><b>${r[1]}/${r[2]}</b></div><div class="meter"><i style="width:${r[1]/r[2]*100}%"></i></div>`).join("")}
<span class="q">„${own(g.fb,s.bi)}“</span><a class="btn" href="#profile" style="margin-top:16px">${L("Back to profile","პროფილზე დაბრუნება")}</a></div>`
:s?`<div class="brief"><h3>${L("Waiting for review","ელოდება შეფასებას")}</h3><p>${L("A reviewer scores your work on three things: the checklist, quality and communication. The score and feedback then appear here and in your portfolio.","შემფასებელი ნამუშევარს სამი რამით აფასებს: ჩამონათვალი, ხარისხი და კომუნიკაცია. ქულა და უკუკავშირი შემდეგ აქ და შენს პორტფოლიოში გამოჩნდება.")}</p>
<p class="small muted" style="margin-bottom:0">${L("In this demo the reviewer works at the","ამ დემოში შემფასებელი მუშაობს გვერდზე")} <a href="#review">${L("Review desk","შეფასების მაგიდა")}</a>.</p></div>`
:`<div class="ticket" style="transform:none"><div class="row"><span>${sh?L("ON THE CLOCK","დრო მიდის"):L("READY","მზად ხარ?")}</span><span>${t.min}:00 ${L("budget","ლიმიტი")}</span></div><div class="clock" id="tclock" style="margin:14px 0">00:00</div>
<div class="small">${sh?L("Tick the checklist as you go. Your answer goes in the box below the brief.","მუშაობისას მონიშნე ჩამონათვალის პუნქტები. პასუხი დავალების ქვემოთ ჩაწერე."):db.user?L("The clock starts when you punch in. You can take longer than the budget, but the time is recorded.","დრო ცვლის დაწყებისთანავე ითვლება. ლიმიტზე მეტი დროც შეგიძლია დახარჯო, მაგრამ დრო ჩაიწერება."):L("Create a free profile first, then punch in.","ჯერ შექმენი უფასო პროფილი, შემდეგ დაიწყე ცვლა.")}</div>
${sh?"":`<div style="margin-top:14px"><button class="btn" type="button" data-act="punch">${L("Punch in","ცვლის დაწყება")}</button></div>`}</div>`;
return `<section class="band"><div class="wrap"><a href="#tasks" class="small">← ${L("All tasks","ყველა დავალება")}</a><h1 style="margin-top:10px">${esc(tr(t.t))}</h1>
<div class="meta" style="margin-bottom:22px"><span class="chip">${tr(t.f)}</span><span class="chip">${tr(t.lvl)}</span><span class="chip">${t.min} ${L("min","წთ")}</span>${t.sk.map(k=>`<span class="chip">${tr(k)}</span>`).join("")}</div>
<div class="two"><div><div class="brief"><div class="from"><div class="av">${esc(who[0])}</div><div><b>${esc(who)}</b><div class="small muted">${esc(tr(t.co))}</div></div></div>
<p>${esc(brief(t,s&&s.nums))}</p><h3 style="margin-top:18px">${L("Checklist","ჩამონათვალი")}</h3>${list}</div>${work}</div>
<aside class="side">${side}</aside></div></div></section>`}

function profile(){const u=db.user,st=stats(),cs=certs(),sk=skills(),bd=badges(),wk=weeks(),mx=Math.max(1,...wk.map(w=>w.n)),pend=pending();
const role=[L(`Grade ${u.grade} student`,`მე-${u.grade} კლასის მოსწავლე`),ut(u.school),ut(u.city)].filter(Boolean).map(esc).join(" · ");
const none=t=>`<p class="muted" style="margin:0">${t}</p>`;
return `<section class="band"><div class="wrap">
<div class="pro"><div class="av big">${esc(ut(u.n)[0])}</div><div><h1>${esc(ut(u.n))}</h1><div style="opacity:.8;margin-bottom:10px">${role} · ${tr(u.f)} · ${L("member since","წევრია")} ${day(u.joined)}</div>
<div class="meta"><span class="chip open">${L("Open to internships","ღიაა სტაჟირებისთვის")}</span>${u.demo?ME.links.map(l=>`<span class="chip">${l}</span>`).join(""):""}</div></div>
<button class="btn hib noprint" type="button" data-act="print">${L("Print or save as PDF","ბეჭდვა ან PDF-ად შენახვა")}</button></div>
<div class="stats">
<div class="stat"><b>${st.n}</b><span class="small muted">${L("Shifts scored","შეფასებული ცვლა")}</span><br><em>${L(`${pend.length} in review`,`${pend.length} ფასდება`)}</em></div>
<div class="stat"><b>${st.n?st.avg:"–"}</b><span class="small muted">${L("Average score","საშუალო ქულა")}</span><br><em>${L("out of 100","100-დან")}</em></div>
<div class="stat"><b>${st.mins<60?st.mins+L(" min"," წთ"):(st.mins/60).toFixed(1)+L("h","სთ")}</b><span class="small muted">${L("Time working","ნამუშევარი დრო")}</span><br><em>${L(`${st.onTime} of ${st.n} on time`,`${st.onTime} დროულად ${st.n}-დან`)}</em></div>
<div class="stat"><b>${cs.filter(c=>c.ok).length}</b><span class="small muted">${L("Certificates","სერტიფიკატი")}</span><br><em>${L(`${cs.filter(c=>!c.ok).length} in progress`,`${cs.filter(c=>!c.ok).length} მიმდინარე`)}</em></div>
<div class="stat"><b>${db.invites.length}</b><span class="small muted">${L("Employer invites","დამსაქმებლის მოწვევა")}</span><br><em>&nbsp;</em></div></div>
<div class="cols"><div>
<div class="sec"><h2>${L("Certificates","სერტიფიკატები")} <span>${L(`${NEED} scored shifts in a field, average ${PASS}+`,`${NEED} შეფასებული ცვლა ერთ სფეროში, საშუალო ${PASS}+`)}</span></h2><div class="certs">${cs.map(c=>c.ok
  ?`<div class="cert">${seal}<div class="small muted">${L("Certificate","სერტიფიკატი")} · ${tr(c.f)}</div><h3>${tr(c.t)}</h3><div class="small">${L(`${c.n} shifts, average ${c.avg}`,`${c.n} ცვლა, საშუალო ${c.avg}`)}</div><div class="id">${L("Issued","გაცემულია")} ${day(c.at)} · <a href="#verify-${c.id}">ID ${c.id}</a></div></div>`
  :`<div class="cert wip"><div class="small muted">${L("In progress","მიმდინარე")}</div><h3>${tr(c.t)}</h3><div class="small">${c.n<NEED?L(`${c.n} of ${NEED} shifts scored`,`${c.n}/${NEED} ცვლა შეფასებულია`):L(`Average ${c.avg}, needs ${PASS}`,`საშუალო ${c.avg}, საჭიროა ${PASS}`)}</div><div class="meter" style="margin-top:10px"><i style="width:${Math.min(1,c.n/NEED)*100}%"></i></div></div>`).join("")}</div>
${cs.length?"":none(L("No certificates yet. Your first scored shift starts one.","სერტიფიკატები ჯერ არ არის. პირველი შეფასებული ცვლა მას დაიწყებს."))}</div>
<div class="sec"><h2>${L("Completed work","შესრულებული სამუშაო")} <span>${st.n+pend.length} ${L("shifts","ცვლა")}</span></h2><div class="list">
${pend.map(s=>{const t=T(s.id);return `<div class="entry"><div class="top"><div><h3 style="margin:0">${esc(tr(t.t))}</h3><div class="small muted">${esc(tr(t.co))} · ${tr(t.f)} · ${day(s.at)}</div></div><span class="wait">${L("In review","ფასდება")}</span></div><a class="small" href="#task-${s.id}" style="display:inline-block;margin-top:10px">${L("See the work","ნამუშევრის ნახვა")}</a></div>`}).join("")}
${st.g.slice().reverse().map(s=>{const t=T(s.id);return `<div class="entry"><div class="top"><div><h3 style="margin:0">${esc(tr(t.t))}</h3><div class="small muted">${esc(tr(t.co))} · ${tr(t.f)} · ${day(s.at)}</div></div><b style="font-size:26px">${total(s.g)}<span class="small muted">/100</span></b></div>
<span class="q">„${own(s.g.fb,s.bi)}“ <span class="muted small">${own(s.g.by,s.bi)}</span></span><a class="small" href="#task-${s.id}" style="display:inline-block;margin-top:10px">${L("See the work","ნამუშევრის ნახვა")}</a></div>`}).join("")}
${st.n+pend.length?"":`${none(L("Nothing here yet.","აქ ჯერ არაფერია."))}<p><a class="btn" href="#tasks">${L("Start your first shift","დაიწყე პირველი ცვლა")}</a></p>`}</div></div>
</div><div>
${ut(u.bio)?`<div class="sec brief"><h3>${L("About","ჩემ შესახებ")}</h3><p style="margin:0">${esc(ut(u.bio))}</p></div>`:""}
<div class="sec"><h2>${L("Activity","აქტივობა")} <span>${L("scored shifts per week","შეფასებული ცვლა კვირაში")}</span></h2><div class="chart">${wk.map((w,i)=>`<div class="${w.n?"":"z"} ${i===11?"now":""}" style="height:${w.n?w.n/mx*100:2}%">${w.n?`<span>${w.n}</span>`:""}</div>`).join("")}</div>
<div class="cax">${wk.map((w,i)=>`<span>${i%3===0||i===11?w.a.getDate()+" "+tr(MON[w.a.getMonth()]):""}</span>`).join("")}</div></div>
<div class="sec"><h2>${L("Skills","უნარები")} <span>${L("from scored work","შეფასებული ნამუშევრიდან")}</span></h2>${sk.map(k=>`<div class="skill"><span>${tr(k[0])}</span><div class="meter"><i style="width:${k[1]}%"></i></div><b>${k[1]}</b></div>`).join("")||none(L("Skills appear after your first scored shift.","უნარები პირველი შეფასებული ცვლის შემდეგ გამოჩნდება."))}</div>
<div class="sec"><h2>${L("Badges","ბეჯები")}</h2><div class="badges">${bd.map(b=>`<div class="badge"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2l11 6v14l-11 6-11-6V8z" fill="${b[2]}"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>${tr(b[1])}</div>`).join("")}</div>${bd.length?"":none(L("No badges yet.","ბეჯები ჯერ არ არის."))}</div>
<div class="sec brief"><h3>${L("Employer interest","დამსაქმებლების ინტერესი")}</h3>${db.invites.slice().reverse().map(v=>`<div class="feed"><div class="av s">${esc(tr(v.co)[0])}</div><div><b>${esc(tr(v.co))}</b> ${L("invited you to a paid trial task","მოგიწვია ანაზღაურებად საცდელ დავალებაზე")}<div class="small muted">${day(v.at)}</div></div></div>`).join("")||none(L("No invites yet. Employers find you on the employer page.","მოწვევები ჯერ არ არის. დამსაქმებლები დამსაქმებლების გვერდზე გპოულობენ."))}</div>
</div></div>
<p class="small noprint" style="margin-top:10px"><button class="link" type="button" data-act="reset">${sure?L("Click again to delete this profile and all its work","კიდევ ერთხელ დააჭირე, რომ წაიშალოს პროფილი და ყველა ნამუშევარი"):L("Sign out and clear this browser's data","გასვლა და ამ ბრაუზერის მონაცემების წაშლა")}</button></p>
</div></section>`}

function employers(){const st=stats(),u=db.user;
const me=u&&st.n?{n:ut(u.n),f:u.f,done:st.n,avg:st.avg,sk:skills().slice(0,3).map(k=>k[0]),bio:ut(u.bio)||L(`Grade ${u.grade} student, ${ut(u.city)}`,`მე-${u.grade} კლასის მოსწავლე, ${ut(u.city)}`),own:1}:null;
const list=(me?[me]:[]).concat(CANDS.filter(c=>!(c.me&&u&&u.demo))).filter(c=>filter==="All"||c.f.split("|")[0]===filter);
const sent=db.invites.some(v=>v.co===CO[asCo]);
return `<section class="band"><div class="wrap"><h1>${L("Hire people who already did the work","დაიქირავე ისინი, ვინც სამუშაო უკვე შეასრულა")}</h1><p class="lead muted">${L("Browse student portfolios by field and skill. You see finished tasks, scores and verified certificates, not just a CV.","დაათვალიერე მოსწავლეების პორტფოლიოები სფეროსა და უნარების მიხედვით. ნახავ დასრულებულ დავალებებს, ქულებს და დადასტურებულ სერტიფიკატებს და არა მხოლოდ CV-ს.")}</p>
<label class="small inline">${L("You are browsing as","ათვალიერებ როგორც")} <select id="asco">${Object.keys(CO).map(k=>`<option value="${k}" ${k===asCo?"selected":""}>${tr(CO[k])}</option>`).join("")}</select></label>
${fbtns(filter)}<div class="grid">${list.map(c=>{const n=tr(c.n),inv=c.own?sent:db.invited[c.n];return `<article class="card"><div style="display:flex;gap:10px;align-items:center"><div class="av">${esc(n[0])}</div><div><h3>${esc(n)}</h3><div class="small muted">${tr(c.f)}</div></div></div>
<p style="margin:0" class="small">${esc(tr(c.bio))}</p><div class="meta">${c.sk.map(k=>`<span class="chip">${tr(k)}</span>`).join("")}</div>
<div class="small"><b>${c.done}</b> ${L("shifts · avg","ცვლა · საშ.")} <b>${c.avg}</b></div>
<div class="foot">${c.own?`<a class="btn ghost" href="#profile">${L("View profile","პროფილის ნახვა")}</a>`:`<span></span>`}${inv?`<span class="done">✓ ${L("Invited","მოწვეულია")}</span>`:`<button class="btn" type="button" data-act="invite" data-n="${c.own?"":esc(c.n)}">${L("Invite","მოწვევა")}</button>`}</div></article>`}).join("")}</div>
<div class="two" style="margin-top:44px">
<form class="brief form" data-form="post"><h2>${L("Post a task","გამოაქვეყნე დავალება")}</h2><p class="muted" style="margin:0">${L("Write a short brief from your real work. Students try it for free and you see what they can do.","დაწერე მოკლე დავალება შენი რეალური სამუშაოდან. მოსწავლეები მას უფასოდ ცდიან, შენ კი ხედავ, რა შეუძლიათ.")}</p>
<label>${L("Your name and role","შენი სახელი და პოზიცია")}<input name="who" required maxlength="50" placeholder="${L("Nino, Product lead","ნინო, პროდუქტის მენეჯერი")}"></label>
<label>${L("Task title","დავალების სათაური")}<input name="t" required maxlength="70"></label>
<label>${L("Field","სფერო")}<select name="f">${fieldOpts()}</select></label>
<label>${L("Time budget in minutes","დროის ლიმიტი წუთებში")}<input name="min" type="number" min="15" max="90" value="30" required></label>
<label>${L("Brief: what is the problem?","დავალება: რა პრობლემაა?")}<textarea name="b" rows="4" required maxlength="500"></textarea></label>
<label>${L("Checklist, one step per line (at least 2)","ჩამონათვალი, თითო ხაზზე ერთი ნაბიჯი (მინიმუმ 2)")}<textarea name="st" rows="4" required></textarea></label>
<p class="warn" id="msg"></p><button class="btn hib">${L("Publish to the task board","დაფაზე გამოქვეყნება")}</button></form>
<form class="brief form" data-form="verify"><h2>${L("Verify a certificate","სერტიფიკატის გადამოწმება")}</h2><p class="muted" style="margin:0">${L("Type the ID printed on a student's certificate.","ჩაწერე მოსწავლის სერტიფიკატზე მითითებული ID.")}</p>
<label>ID<input name="id" required placeholder="ET-WEB-00000"></label><button class="btn">${L("Check","შემოწმება")}</button></form>
</div></div></section>`}

function verify(id){const c=id&&certs().find(x=>x.ok&&x.id===id.toUpperCase()),u=db.user;
return `<section class="band"><div class="wrap narrow"><a href="#employers" class="small">← ${L("For employers","დამსაქმებლებს")}</a><h1 style="margin-top:10px">${L("Verify a certificate","სერტიფიკატის გადამოწმება")}</h1>
<form class="form" data-form="verify" style="margin-bottom:22px"><label>ID<input name="id" required value="${esc(id)}" placeholder="ET-WEB-00000"></label><button class="btn">${L("Check","შემოწმება")}</button></form>
${c?`<div class="cert">${seal}<div class="done">✓ ${L("Valid certificate","სერტიფიკატი ნამდვილია")}</div><h3>${tr(c.t)}</h3>
<div>${esc(ut(u.n))} · ${L(`Grade ${u.grade}`,`მე-${u.grade} კლასი`)}${ut(u.school)?" · "+esc(ut(u.school)):""}</div>
<div class="small">${L(`${c.n} scored shifts in ${tr(c.f)}, average ${c.avg} out of 100`,`${c.n} შეფასებული ცვლა სფეროში „${tr(c.f)}“, საშუალო ${c.avg} 100-დან`)}</div>
<div class="id">${L("Issued","გაცემულია")} ${day(c.at)} · ID ${c.id}</div><p style="margin:12px 0 0"><a class="btn" href="#profile">${L("See the work behind it","ნახე ნამუშევრები")}</a></p></div>`
:id?`<p class="warn">${L("No certificate with this ID. In this demo, certificates live only in the browser where they were earned.","ასეთი ID-ით სერტიფიკატი ვერ მოიძებნა. ამ დემოში სერტიფიკატები მხოლოდ იმ ბრაუზერში ინახება, სადაც მიიღეს.")}</p>`:""}</div></section>`}

/* ---------- 5. Actions ---------- */
/* Fill the demo account. Dates are moved so the demo always looks recent. */
function demo(){const ago=Date.now()-new Date(2026,10,24),when=d=>{const p=d.split("|")[0].split(" ");return new Date(+new Date(2026,MON.findIndex(m=>m.startsWith(p[1])),+p[0],12)+ago).toISOString()};
db=fresh();db.user={id:"luka",demo:1,n:ME.n,grade:ME.grade,city:ME.city,school:"",f:ME.f,bio:ME.bio,joined:when("1 Sep")};
for(const id in ME.done){const d=ME.done[id],c=Math.round(d.s*.4);
  db.subs[id]={id,bi:1,at:when(d.d),min:d.m,ans:d.ex,nums:numsFor(T(id)),g:{c,q:c,m:d.s-2*c,fb:d.fb,by:T(id).who}}}
db.invites=[{co:ME.invite,at:new Date(Date.now()-7*864e5).toISOString()}]}

const forms={
join(d){db.user={id:"u"+Date.now(),n:clean(d.n),school:clean(d.school),city:clean(d.city),grade:+d.grade,f:FIELDS[+d.f],bio:clean(d.bio),joined:new Date().toISOString()};
  save();filter=db.user.f.split("|")[0];location.hash="tasks"},
post(d){const st=clean(d.st).split("\n").map(x=>x.trim()).filter(Boolean);
  if(st.length<2)return say(L("Write at least 2 checklist steps, one per line.","დაწერე მინიმუმ 2 ნაბიჯი, თითო ცალკე ხაზზე."));
  db.tasks.push({id:"c"+Date.now(),custom:1,f:FIELDS[+d.f],t:clean(d.t),co:tr(CO[asCo]),who:clean(d.who),lvl:BEG,min:Math.min(90,Math.max(15,+d.min||30)),sk:[],b:clean(d.b),st});
  save();filter="All";location.hash="tasks"},
verify(d){location.hash="verify-"+clean(d.id).toUpperCase()},
grade(d,f){gradeForm(d,f)}};

function act(a,b){const id=cur(),sh=db.shifts[id];
if(a==="demo"){demo();save();location.hash="profile";paint()}
else if(a==="punch"){if(!db.user){location.hash="join";return}
  db.shifts[id]={start:Date.now(),checks:[],draft:"",link:"",typed:0,pasted:0,away:0};save();paint(true)}
else if(a==="tick"&&sh){const i=+b.dataset.i,x=b.querySelector(".box");sh.checks[i]=!sh.checks[i];save();x.classList.toggle("y",sh.checks[i]);x.textContent=sh.checks[i]?"✓":""}
else if(a==="submit"&&sh){if(sh.draft.trim().length<20)return say(L("Write your answer first (at least a couple of sentences).","ჯერ დაწერე პასუხი (სულ მცირე ორიოდე წინადადება)."));
  sh.end=Date.now();sh.fu={q:FOLLOW[hash(db.user.id+id)%FOLLOW.length],at:Date.now()};save();paint()}
else if(a==="fu"&&sh){const ans=$("#fua").value.trim();if(ans.length<10)return say(L("Answer the question in a sentence or two.","უპასუხე კითხვას ერთი-ორი წინადადებით."));
  db.subs[id]={id,at:new Date(sh.end).toISOString(),min:Math.max(1,Math.round((sh.end-sh.start)/6e4)),ans:sh.draft.trim(),link:sh.link.trim(),checks:T(id).st.map((x,i)=>!!sh.checks[i]),nums:numsFor(T(id)),
    trace:{typed:sh.typed,pasted:sh.pasted,away:sh.away},fu:{q:sh.fu.q,a:ans,sec:Math.round((Date.now()-sh.fu.at)/1e3)}};
  delete db.shifts[id];save();paint()}
else if(a==="invite"){if(b.dataset.n)db.invited[b.dataset.n]=1;else db.invites.push({co:CO[asCo],at:new Date().toISOString()});save();paint(true)}
else if(a==="print")window.print();
else if(a==="reset"){if(!sure){sure=true;paint(true);return}db=fresh();save();location.hash="home";paint()}
else if(typeof reviewAct==="function")reviewAct(a,b)}

/* ---------- 6. Header, clock, routing and events ---------- */
function clock(){clearInterval(timer);const id=cur(),live=Object.keys(db.shifts)[0];
const secs=sh=>sh?((sh.end||Date.now())-sh.start)/1e3:0;
const f=()=>{const h=$("#hclock"),t=$("#tclock"),c=$("#fclock"),sh=db.shifts[id];
  if(h)h.textContent=mmss(secs(db.shifts[live]));
  if(t){t.textContent=mmss(secs(sh));t.classList.toggle("over",secs(sh)>T(id).min*60)}
  if(c&&sh&&sh.fu)c.textContent=mmss(120-(Date.now()-sh.fu.at)/1e3)};
f();timer=setInterval(f,1000)}

function chrome(){const u=db.user;document.documentElement.lang=lang;document.documentElement.dataset.theme=theme;
$("#nav").innerHTML=[["home","Home|მთავარი"],["tasks","Tasks|დავალებები"],["profile","Profile|პროფილი"],["employers","For employers|დამსაქმებლებს"],["review","Review desk|შეფასება"]].map(n=>`<a href="#${n[0]}">${tr(n[1])}</a>`).join("");
$("#lang").textContent=lang==="ka"?"EN":"ქარ";$("#lang").setAttribute("aria-label",L("Switch to Georgian","ინგლისურზე გადართვა"));
$("#theme").innerHTML=theme==="light"?moon:sun;$("#theme").setAttribute("aria-label",theme==="light"?L("Dark mode","მუქი რეჟიმი"):L("Light mode","ნათელი რეჟიმი"));
$("#me").href=u?"#profile":"#join";
$("#me").innerHTML=u?`<span class="av s">${esc(ut(u.n)[0])}</span><span>${esc(firstName())}</span>`:`<span class="av s">+</span><span>${L("Sign up","რეგისტრაცია")}</span>`;
$("#foot").textContent=L("EduTech · TechSpark 2026 prototype · Education theme. The companies and the sample candidates are made up for the demo. Your own profile and work stay in this browser.","EduTech · TechSpark 2026 პროტოტიპი · თემა: განათლება. კომპანიები და სანიმუშო კანდიდატები დემოსთვის არის გამოგონილი. შენი პროფილი და ნამუშევრები ამ ბრაუზერში რჩება.")}

function paint(keep){const h=location.hash.slice(1)||"home",u=db.user;if(h!=="profile")sure=false;chrome();
document.querySelectorAll("#nav a").forEach(a=>{const k=a.hash.slice(1);a.classList.toggle("on",h===k||(k==="tasks"&&h.startsWith("task-"))||(k==="employers"&&h.startsWith("verify")))});
const y=window.scrollY;
app.innerHTML=h==="tasks"?tasks():h.startsWith("task-")?task(h.slice(5)):h==="profile"||h==="join"?(u?profile():join()):h==="employers"?employers():h==="review"?review():h.startsWith("verify")?verify(h.slice(7)):home();
clock();window.scrollTo(0,keep?y:0)}

$("#lang").onclick=()=>{lang=lang==="ka"?"en":"ka";try{localStorage.setItem("et-lang",lang)}catch(e){}paint(true)};
$("#theme").onclick=()=>{theme=theme==="light"?"dark":"light";try{localStorage.setItem("et-theme",theme)}catch(e){}chrome()};
app.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(b)return act(b.dataset.act,b);
  const f=e.target.closest("[data-f]");if(!f)return;filter=f.dataset.f;
  const h=location.hash.slice(1);if(h==="tasks"||h==="employers")paint(true);else location.hash="tasks"});
app.addEventListener("submit",e=>{e.preventDefault();const f=e.target;forms[f.dataset.form](Object.fromEntries(new FormData(f)),f)});
app.addEventListener("change",e=>{if(e.target.id==="asco"){asCo=e.target.value;paint(true)}});
/* Work trace: save the draft and count typing, pasting and leaving the tab */
app.addEventListener("input",e=>{const sh=db.shifts[cur()];if(!sh)return;
  if(e.target.id==="ans"){sh.draft=e.target.value;if(/^insert/.test(e.inputType)&&!/Paste|Drop/.test(e.inputType))sh.typed+=e.data?e.data.length:1;save()}
  if(e.target.id==="lnk"){sh.link=e.target.value;save()}});
app.addEventListener("paste",e=>{const sh=db.shifts[cur()];
  if(e.target.id==="fua"){e.preventDefault();return}
  if(sh&&e.target.id==="ans"){sh.pasted+=(e.clipboardData?e.clipboardData.getData("text"):"").length;save()}});
app.addEventListener("drop",e=>{if(e.target.id==="fua")e.preventDefault()});
document.addEventListener("visibilitychange",()=>{const sh=db.shifts[cur()];if(document.hidden&&sh&&!sh.end){sh.away++;save()}});
window.addEventListener("hashchange",()=>paint());paint();
