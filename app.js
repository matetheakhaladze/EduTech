/* EduTech app logic
   1. Language and theme settings
   2. Helpers and icons
   3. Page views: home, tasks, task, profile, employers
   4. Header, routing and events
*/

/* ---------- 1. Language and theme ---------- */
let lang="ka",theme="light";
try{lang=localStorage.getItem("et-lang")||"ka";theme=localStorage.getItem("et-theme")||"light"}catch(e){}
const tr=s=>{const p=String(s).split("|");return lang==="ka"&&p[1]!==undefined?p[1]:p[0]};
const L=(en,ka)=>lang==="ka"?ka:en;

/* ---------- 2. Helpers and icons ---------- */
const $=s=>document.querySelector(s),app=$("#app");
const T=id=>TASKS.find(t=>t.id===id);
const ids=Object.keys(ME.done);
const avg=Math.round(ids.reduce((a,i)=>a+ME.done[i].s,0)/ids.length);
const hrs=(ids.reduce((a,i)=>a+ME.done[i].m,0)/60).toFixed(1);
let filter="All",timer=null;
const ALL="All|ყველა";
const sun=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const moon=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;

const card=t=>{const d=ME.done[t.id],b=tr(t.b);return `<article class="card"><div class="meta"><span class="chip">${tr(t.f)}</span><span class="chip">${tr(t.lvl)}</span><span class="chip">${t.min} ${L("min","წთ")}</span></div>
<h3>${tr(t.t)}</h3><div class="muted small">${tr(t.co)}</div><p style="margin:0">${b.length>115?b.slice(0,115)+"…":b}</p>
<div class="foot">${d?`<span class="done">✓ ${L("Done","შესრულდა")} · ${d.s}/100</span>`:`<span class="small muted">${t.sk.slice(0,2).map(tr).join(", ")}</span>`}<a class="btn ${d?"ghost":""}" href="#task-${t.id}">${d?L("View","ნახვა"):L("Start shift","დაწყება")}</a></div></article>`};

const seal=`<svg class="seal" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="#ffd23f"/><circle cx="27" cy="27" r="18" fill="none" stroke="#15171c" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M18 27l6 6 12-13" fill="none" stroke="#15171c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const fbtns=active=>`<div class="filters">${[ALL].concat(FIELDS).map(f=>{const k=f.split("|")[0];return `<button class="${k===active?"on":""}" data-f="${k}">${tr(f)}</button>`}).join("")}</div>`;

/* ---------- 3. Page views ---------- */
function home(){const t=TASKS.find(x=>!ME.done[x.id]&&x.f===F(0))||TASKS[0];return `<section class="band"><div class="wrap hero">
<div><p class="small muted" style="margin:0 0 10px">${L(`Welcome back, Luka. You have ${ids.length} shifts done and 3 certificates.`,`კეთილი იყოს შენი დაბრუნება, ლუკა. შესრულებული გაქვს ${ids.length} ცვლა და 3 სერტიფიკატი.`)}</p>
<h1>${L("Do the job before you get the job.","შეასრულე სამუშაო, სანამ სამსახურს მიიღებ.")}</h1>
<p class="lead">${L("EduTech gives students small, real-feeling tasks from companies in every field. Finish one and it lands in your portfolio, with feedback, so employers can see what you can actually do.","EduTech მოსწავლეებს სთავაზობს მცირე, რეალურ სამუშაოსთან მიახლოებულ დავალებებს სხვადასხვა სფეროს კომპანიებისგან. დაასრულე დავალება და ის შეფასებასთან ერთად შენს პორტფოლიოში აღმოჩნდება, რათა დამსაქმებლებმა ნახონ, რისი გაკეთება შეგიძლია სინამდვილეში.")}</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn hib" href="#tasks">${L("Browse tasks","დავალებების ნახვა")}</a><a class="btn ghost" href="#profile">${L("See my profile","ჩემი პროფილი")}</a></div>
<p class="small muted" style="margin-top:18px">${L(`${TASKS.length} tasks across ${FIELDS.length} fields · 25 to 75 minutes each`,`${TASKS.length} დავალება ${FIELDS.length} სფეროში · თითოეული 25-დან 75 წუთამდე`)}</p></div>
<div class="ticket"><div class="row"><span>${L("NEXT SHIFT","შემდეგი ცვლა")} · ${tr(t.co)}</span><span>${t.min} ${L("min budget","წთ ლიმიტი")}</span></div>
<h3>${tr(t.t)}</h3><div class="clock" id="hclock">00:00</div><ul>${t.st.slice(0,3).map(s=>`<li>${tr(s)}</li>`).join("")}</ul>
<a class="btn" href="#task-${t.id}">${L("Punch in","ცვლის დაწყება")}</a></div></div></section>
<section class="band" style="border-top:1px solid var(--line)"><div class="wrap"><h2>${L("How a shift works","როგორ მუშაობს ცვლა")}</h2><div class="steps" style="margin-top:20px">
<div class="step"><b>${L("1. Pick a task","1. აირჩიე დავალება")}</b>${L("Choose a field and a level. Each brief comes from a \"manager\" at a company, just like a real first week.","აირჩიე სფერო და დონე. თითოეულ დავალებას კომპანიის „მენეჯერი“ გაძლევს, როგორც ნამდვილ პირველ სამუშაო კვირაში.")}</div>
<div class="step"><b>${L("2. Do the work","2. შეასრულე სამუშაო")}</b>${L("Follow the checklist, keep an eye on the clock, and submit your answer, code or design link.","მიჰყევი ჩამონათვალს, თვალი ადევნე დროს და გაგზავნე პასუხი, კოდი ან დიზაინის ბმული.")}</div>
<div class="step"><b>${L("3. Build your portfolio","3. შექმენი პორტფოლიო")}</b>${L("You get a score and feedback. Finish a field track and you earn a certificate employers can verify.","მიიღებ ქულას და უკუკავშირს. დაასრულე სფეროს კურსი და მიიღე სერტიფიკატი, რომლის გადამოწმებაც დამსაქმებელს შეუძლია.")}</div></div></div></section>
<section class="band"><div class="wrap"><h2>${L("Fields you can try","სფეროები, რომლებიც შეგიძლია სცადო")}</h2><div class="filters">${FIELDS.map(f=>`<button data-f="${f.split("|")[0]}">${tr(f)} · ${TASKS.filter(t=>t.f===f).length}</button>`).join("")}</div></div></section>`}

function tasks(){const list=TASKS.filter(t=>filter==="All"||t.f.split("|")[0]===filter);
return `<section class="band"><div class="wrap"><h1>${L("Task board","დავალებების დაფა")}</h1><p class="lead muted">${L(`You have finished ${ids.length} of ${TASKS.length} tasks. ${TASKS.length-ids.length} are waiting.`,`დასრულებული გაქვს ${ids.length} დავალება ${TASKS.length}-დან. ${TASKS.length-ids.length} ჯერ კიდევ გელოდება.`)}</p>
${fbtns(filter)}<div class="grid">${list.map(card).join("")}</div></div></section>`}

function task(id){const t=T(id);if(!t)return `<section class="band"><div class="wrap"><h2>${L("Task not found","დავალება ვერ მოიძებნა")}</h2><a href="#tasks">${L("Back to tasks","დავალებებზე დაბრუნება")}</a></div></section>`;
const d=ME.done[id],who=tr(t.who);
const crit=d?[[L("Covered the checklist","ჩამონათვალის შესრულება"),Math.round(d.s*.4),40],[L("Quality of the work","ნამუშევრის ხარისხი"),Math.round(d.s*.4),40],[L("Communication","კომუნიკაცია"),d.s-2*Math.round(d.s*.4),20]]:[];
return `<section class="band"><div class="wrap"><a href="#tasks" class="small">← ${L("All tasks","ყველა დავალება")}</a><h1 style="margin-top:10px">${tr(t.t)}</h1>
<div class="meta" style="margin-bottom:22px"><span class="chip">${tr(t.f)}</span><span class="chip">${tr(t.lvl)}</span><span class="chip">${t.min} ${L("min","წთ")}</span>${t.sk.map(s=>`<span class="chip">${tr(s)}</span>`).join("")}</div>
<div class="two"><div><div class="brief"><div class="from"><div class="av">${who[0]}</div><div><b>${who}</b><div class="small muted">${tr(t.co)}</div></div></div>
<p>${tr(t.b)}</p><h3 style="margin-top:18px">${L("Checklist","ჩამონათვალი")}</h3>${t.st.map(s=>`<div class="check"><span class="box ${d?"y":""}">${d?"✓":""}</span><span>${tr(s)}</span></div>`).join("")}</div>
${d?`<div class="entry" style="margin-top:20px"><h3>${L("Luka's submission","ლუკას ნამუშევარი")}</h3><span class="q">${tr(d.ex)}</span><p class="small muted" style="margin:10px 0 0">${L(`Submitted ${tr(d.d)} 2026 · took ${d.m} of ${t.min} minutes`,`გაგზავნილია ${tr(d.d)}. 2026 · დახარჯა ${d.m} წუთი ${t.min}-დან`)}</p></div>`:""}</div>
<aside class="side">${d?`<div class="brief"><div class="small muted">${L("Feedback from","უკუკავშირი:")} ${who}</div><div class="score">${d.s}<span style="font-size:22px">/100</span></div>
${crit.map(r=>`<div class="small" style="display:flex;justify-content:space-between;margin-top:10px"><span>${r[0]}</span><b>${r[1]}/${r[2]}</b></div><div class="meter"><i style="width:${r[1]/r[2]*100}%"></i></div>`).join("")}
<span class="q">„${tr(d.fb)}“</span><a class="btn" href="#profile" style="margin-top:16px">${L("Back to profile","პროფილზე დაბრუნება")}</a></div>`
:`<div class="ticket" style="transform:none"><div class="row"><span>${L("ON THE CLOCK","დრო მიდის")}</span><span>${t.min}:00 ${L("budget","ლიმიტი")}</span></div><div class="clock" id="tclock" style="margin:14px 0">00:00</div>
<div class="small">${L("Punch in when you start. Your answer, code or design link goes in the box below the brief.","დააჭირე დაწყებას, როცა მუშაობას იწყებ. პასუხს, კოდს ან დიზაინის ბმულს დავალების ქვემოთ ჩაწერ.")}</div><div style="margin-top:14px"><a class="btn" href="#task-${id}">${L("Punch in","ცვლის დაწყება")}</a></div></div>`}</aside></div></div></section>`}

function profile(){const mx=Math.max(...ME.weeks);
return `<section class="band"><div class="wrap">
<div class="pro"><div class="av big">${tr(ME.init)}</div><div><h1>${tr(ME.n)}</h1><div style="opacity:.8;margin-bottom:10px">${tr(ME.role)} · ${tr(ME.f)} · ${L("member since","წევრია")} ${tr(ME.joined)}</div>
<div class="meta"><span class="chip open">${L("Open to internships","ღიაა სტაჟირებისთვის")}</span>${ME.links.map(l=>`<span class="chip">${l}</span>`).join("")}</div></div>
<a class="btn hib" href="#profile">${L("Share profile","პროფილის გაზიარება")}</a></div>
<div class="stats">
<div class="stat"><b>${ids.length}</b><span class="small muted">${L("Shifts done","შესრულებული ცვლა")}</span><br><em>${L("+2 this month","+2 ამ თვეში")}</em></div>
<div class="stat"><b>${avg}</b><span class="small muted">${L("Average score","საშუალო ქულა")}</span><br><em>${L("Top 15%","საუკეთესო 15%")}</em></div>
<div class="stat"><b>${hrs}${L("h","სთ")}</b><span class="small muted">${L("Time working","ნამუშევარი დრო")}</span><br><em>${L("94% on time","94% დროულად")}</em></div>
<div class="stat"><b>3</b><span class="small muted">${L("Certificates","სერტიფიკატი")}</span><br><em>${L("1 in progress","1 მიმდინარე")}</em></div>
<div class="stat"><b>37</b><span class="small muted">${L("Employer views","დამსაქმებლის ნახვა")}</span><br><em>${L("+12 this week","+12 ამ კვირაში")}</em></div></div>
<div class="cols"><div>
<div class="sec"><h2>${L("Certificates","სერტიფიკატები")} <span>${L("verified by EduTech","დადასტურებულია EduTech-ის მიერ")}</span></h2><div class="certs">${ME.certs.map(c=>c.wip?`<div class="cert wip"><div class="small muted">${L("In progress","მიმდინარე")}</div><h3>${tr(c.t)}</h3><div class="small">${L(`${c.p} of ${c.of} shifts done`,`${c.p}/${c.of} ცვლა შესრულებულია`)}</div><div class="meter" style="margin-top:10px"><i style="width:${c.p/c.of*100}%"></i></div></div>`
:`<div class="cert">${seal}<div class="small muted">${L("Certificate","სერტიფიკატი")} · ${tr(c.f)}</div><h3>${tr(c.t)}</h3><div class="small">${tr(c.n)}</div><div class="id">${L("Issued","გაცემულია")} ${tr(c.d)} · ID ${c.id}</div></div>`).join("")}</div></div>
<div class="sec"><h2>${L("Completed work","შესრულებული სამუშაო")} <span>${ids.length} ${L("shifts","ცვლა")}</span></h2><div class="list">${ids.slice().reverse().map(i=>{const t=T(i),d=ME.done[i];return `<div class="entry"><div class="top"><div><h3 style="margin:0">${tr(t.t)}</h3><div class="small muted">${tr(t.co)} · ${tr(t.f)} · ${tr(d.d)}</div></div><b style="font-size:26px">${d.s}<span class="small muted">/100</span></b></div>
<span class="q">„${tr(d.fb)}“ <span class="muted small">${tr(t.who)}</span></span><a class="small" href="#task-${i}" style="display:inline-block;margin-top:10px">${L("See the work","ნამუშევრის ნახვა")}</a></div>`}).join("")}</div></div>
</div><div>
<div class="sec brief"><h3>${L("About","ჩემ შესახებ")}</h3><p style="margin:0">${tr(ME.bio)}</p></div>
<div class="sec"><h2>${L("Activity","აქტივობა")} <span>${L("shifts per week","ცვლა კვირაში")}</span></h2><div class="chart">${ME.weeks.map((w,i)=>`<div class="${w?"":"z"} ${i===ME.weeks.length-1?"now":""}" style="height:${w?w/mx*100:2}%">${w?`<span>${w}</span>`:""}</div>`).join("")}</div>
<div class="cax">${ME.wlab.map(l=>`<span>${l?tr(l):""}</span>`).join("")}</div></div>
<div class="sec"><h2>${L("Skills","უნარები")} <span>${L("from scored work","შეფასებული ნამუშევრიდან")}</span></h2>${ME.skills.map(s=>`<div class="skill"><span>${tr(s[0])}</span><div class="meter"><i style="width:${s[1]}%"></i></div><b>${s[1]}</b></div>`).join("")}</div>
<div class="sec"><h2>${L("Badges","ბეჯები")}</h2><div class="badges">${ME.badges.map(b=>`<div class="badge"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2l11 6v14l-11 6-11-6V8z" fill="${b[1]}"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>${tr(b[0])}</div>`).join("")}</div></div>
<div class="sec brief"><h3>${L("Employer interest","დამსაქმებლების ინტერესი")}</h3>${ME.views.map(v=>`<div class="feed"><div class="av s">${tr(v[0])[0]}</div><div><b>${tr(v[0])}</b> ${tr(v[1])}<div class="small muted">${tr(v[2])}</div></div></div>`).join("")}</div>
</div></div></div></section>`}

function employers(){return `<section class="band"><div class="wrap"><h1>${L("Hire people who already did the work","დაიქირავე ისინი, ვინც სამუშაო უკვე შეასრულა")}</h1><p class="lead muted">${L("Browse student portfolios by field and skill. You see finished tasks, scores and verified certificates, not just a CV.","დაათვალიერე მოსწავლეების პორტფოლიოები სფეროსა და უნარების მიხედვით. ნახავ დასრულებულ დავალებებს, ქულებს და დადასტურებულ სერტიფიკატებს და არა მხოლოდ CV-ს.")}</p>
${fbtns(filter)}<div class="grid">${CANDS.filter(c=>filter==="All"||c.f.split("|")[0]===filter).map(c=>{const n=tr(c.n);return `<article class="card"><div style="display:flex;gap:10px;align-items:center"><div class="av">${n[0]}</div><div><h3>${n}</h3><div class="small muted">${tr(c.f)}</div></div></div>
<p style="margin:0" class="small">${tr(c.bio)}</p><div class="meta">${c.sk.map(s=>`<span class="chip">${tr(s)}</span>`).join("")}</div>
<div class="foot"><span class="small"><b>${c.done}</b> ${L("shifts · avg","ცვლა · საშ.")} <b>${c.avg}</b></span>${c.me?`<a class="btn" href="#profile">${L("View profile","პროფილის ნახვა")}</a>`:`<span class="chip">${L("Invite","მოწვევა")}</span>`}</div></article>`}).join("")}</div>
<div class="steps" style="margin-top:40px"><div class="step"><b>${L("Post a task","გამოაქვეყნე დავალება")}</b>${L("Write a short brief from your real work. Students try it for free.","დაწერე მოკლე დავალება შენი რეალური სამუშაოდან. მოსწავლეები მას უფასოდ ცდიან.")}</div>
<div class="step"><b>${L("See real output","ნახე რეალური შედეგი")}</b>${L("Compare answers side by side, with time taken and scores.","შეადარე პასუხები ერთმანეთს, დახარჯულ დროსა და ქულებთან ერთად.")}</div>
<div class="step"><b>${L("Invite the best","მოიწვიე საუკეთესოები")}</b>${L("Offer a paid trial or an interview straight from their profile.","შესთავაზე ანაზღაურებადი საცდელი დავალება ან გასაუბრება პირდაპირ პროფილიდან.")}</div></div></div></section>`}

/* ---------- 4. Header, routing and events ---------- */
function clock(id){const el=$("#"+id);if(!el)return;let s=754;const f=()=>{el.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");s++};f();
if(!matchMedia("(prefers-reduced-motion: reduce)").matches)timer=setInterval(f,1000)}

function chrome(){document.documentElement.lang=lang;document.documentElement.dataset.theme=theme;
$("#nav").innerHTML=[["home","Home|მთავარი"],["tasks","Tasks|დავალებები"],["profile","Profile|პროფილი"],["employers","For employers|დამსაქმებლებს"]].map(n=>`<a href="#${n[0]}">${tr(n[1])}</a>`).join("");
$("#lang").textContent=lang==="ka"?"EN":"ქარ";$("#lang").setAttribute("aria-label",L("Switch to Georgian","ინგლისურზე გადართვა"));
$("#theme").innerHTML=theme==="light"?moon:sun;$("#theme").setAttribute("aria-label",theme==="light"?L("Dark mode","მუქი რეჟიმი"):L("Light mode","ნათელი რეჟიმი"));
$("#me").innerHTML=`<span class="av s">${tr(ME.init)}</span><span>${tr(ME.sh)}</span>`;
$("#foot").textContent=L("EduTech · TechSpark 2026 prototype · Education theme. The student, companies, scores and certificates shown are sample data for the demo.","EduTech · TechSpark 2026 პროტოტიპი · თემა: განათლება. ნაჩვენები მოსწავლე, კომპანიები, ქულები და სერტიფიკატები სადემონსტრაციო მონაცემებია.")}

function paint(keep){const h=location.hash.slice(1)||"home";chrome();
document.querySelectorAll("#nav a").forEach(a=>{const k=a.hash.slice(1);a.classList.toggle("on",h===k||(k==="tasks"&&h.startsWith("task-")))});
clearInterval(timer);const y=window.scrollY;
app.innerHTML=h==="tasks"?tasks():h.startsWith("task-")?task(h.slice(5)):h==="profile"?profile():h==="employers"?employers():home();
clock("hclock");clock("tclock");window.scrollTo(0,keep?y:0)}

$("#lang").onclick=()=>{lang=lang==="ka"?"en":"ka";try{localStorage.setItem("et-lang",lang)}catch(e){}paint(true)};
$("#theme").onclick=()=>{theme=theme==="light"?"dark":"light";try{localStorage.setItem("et-theme",theme)}catch(e){}chrome()};
app.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;filter=b.dataset.f;
const h=location.hash.slice(1);if(h==="tasks"||h==="employers")paint(true);else location.hash="tasks"});
window.addEventListener("hashchange",()=>paint());paint();
