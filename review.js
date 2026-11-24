/* EduTech review desk  ·  TEMPORARY FILE

   All grading lives here and it is done by hand. Nothing is scored automatically.
   A person (teacher, mentor, the employer) reads each submission and types three
   scores and feedback. They may ask an AI helper for a second opinion: each
   submission has a ready text to paste into any AI chat, but the person still
   types the final scores.

   To grade on another computer: "Download submissions" saves a file, the reviewer
   fills in the "g" part of each submission, and "Load graded file" brings it back.

   When real grading exists, delete this file, its <script> line in index.html and
   the "Review desk" link in app.js. A grade is just:
     db.subs[taskId].g = {c: 0-40, q: 0-40, m: 0-20, fb: "feedback", by: "reviewer", sup: true/false}
*/

/* The text a reviewer can paste into an AI helper */
function aiText(s,t){return `You are helping a reviewer score a school student's work-simulation task. Be fair and encouraging, and be strict about the checklist.

TASK: ${t.t.split("|")[0]} (${t.min} minute budget)
BRIEF: ${fill(t.b.split("|")[0],s.nums&&s.nums.length?s.nums:numsFor(t))}
CHECKLIST:
${t.st.map((x,i)=>`${i+1}. ${x.split("|")[0]}`).join("\n")}

STUDENT'S ANSWER:
${s.ans}
${s.link?`LINK: ${s.link}\n`:""}
FOLLOW-UP QUESTION: ${s.fu.q.split("|")[0]}
STUDENT'S REPLY: ${s.fu.a}

WORK TRACE: took ${s.min} minutes, ${s.trace.typed} characters typed, ${s.trace.pasted} characters pasted, left the tab ${s.trace.away} times, follow-up answered in ${s.fu.sec} seconds.

Suggest scores and 1-2 sentences of feedback written to the student:
Checklist covered: _/40
Quality of the work: _/40
Communication: _/20
Feedback:`}

function review(){const p=pending(),g=graded().filter(s=>!s.bi).reverse();
return `<section class="band"><div class="wrap"><h1>${L("Review desk","შეფასების მაგიდა")}</h1>
<p class="lead muted">${L("Every submission is scored by a person, by hand. Read the work, the follow-up answer and the work trace, then give three scores and feedback.","ყველა ნამუშევარს ადამიანი აფასებს, ხელით. წაიკითხე ნამუშევარი, დამატებითი კითხვის პასუხი და მუშაობის კვალი, შემდეგ დაწერე სამი ქულა და უკუკავშირი.")}</p>
<div class="meta" style="margin-bottom:24px"><button class="btn ghost" type="button" data-act="export">${L("Download submissions","ნამუშევრების ჩამოტვირთვა")}</button>
<label class="btn ghost">${L("Load graded file","შეფასებული ფაილის ატვირთვა")}<input type="file" id="gfile" accept=".json,application/json" hidden></label></div>
<h2>${L("Waiting for review","ელოდება შეფასებას")} <span class="muted small">${p.length}</span></h2>
${p.map(s=>{const t=T(s.id);return `<div class="two" style="margin-bottom:34px"><div><div class="brief"><div class="small muted">${esc(ut(db.user.n))} · ${esc(tr(t.co))} · ${tr(t.f)}</div><h3 style="margin-top:6px">${esc(tr(t.t))}</h3><p>${esc(brief(t,s.nums))}</p>
${t.st.map((x,i)=>`<div class="check"><span class="box ${s.checks[i]?"y":""}">${s.checks[i]?"✓":""}</span><span>${esc(tr(x))}</span></div>`).join("")}</div>${submission(s,t)}</div>
<form class="brief form" data-form="grade" data-id="${s.id}"><h3>${L("Score","ქულა")}</h3>
<label>${L("Covered the checklist (0 to 40)","ჩამონათვალის შესრულება (0-დან 40-მდე)")}<input name="c" type="number" min="0" max="40" required></label>
<label>${L("Quality of the work (0 to 40)","ნამუშევრის ხარისხი (0-დან 40-მდე)")}<input name="q" type="number" min="0" max="40" required></label>
<label>${L("Communication (0 to 20)","კომუნიკაცია (0-დან 20-მდე)")}<input name="m" type="number" min="0" max="20" required></label>
<label>${L("Feedback to the student","უკუკავშირი მოსწავლეს")}<textarea name="fb" rows="3" required maxlength="300"></textarea></label>
<label>${L("Reviewer","შემფასებელი")}<input name="by" required value="${esc(tr(t.who))}"></label>
<label class="inline"><input type="checkbox" name="sup"> ${L("Done in class, supervised by a teacher","შესრულდა კლასში, მასწავლებლის მეთვალყურეობით")}</label>
<button class="btn hib">${L("Save score","ქულის შენახვა")}</button>
<details><summary class="small">${L("Second opinion: text to paste into an AI helper","მეორე აზრი: ტექსტი AI დამხმარეში ჩასასმელად")}</summary><textarea rows="8" readonly>${esc(aiText(s,t))}</textarea></details></form></div>`}).join("")
||`<p class="muted">${L("Nothing is waiting. Finish a shift as a student and it will show up here.","შესაფასებელი არაფერია. დაასრულე ცვლა როგორც მოსწავლემ და ის აქ გამოჩნდება.")}</p>`}
${g.length?`<h2 style="margin-top:34px">${L("Scored","შეფასებული")} <span class="muted small">${g.length}</span></h2><div class="list">${g.map(s=>`<div class="entry"><div class="top"><div><b>${esc(tr(T(s.id).t))}</b><div class="small muted">${esc(s.g.by)} · „${esc(s.g.fb)}“</div></div>
<div><b>${total(s.g)}/100</b> <button class="link small" type="button" data-act="regrade" data-id="${s.id}">${L("Score again","ხელახლა შეფასება")}</button></div></div></div>`).join("")}</div>`:""}
</div></section>`}

const lim=(v,max)=>Math.min(max,Math.max(0,Math.round(+v||0)));

function gradeForm(d,f){db.subs[f.dataset.id].g={c:lim(d.c,40),q:lim(d.q,40),m:lim(d.m,20),fb:d.fb.trim(),by:d.by.trim(),sup:!!d.sup};save();paint(true)}

function reviewAct(a,b){
if(a==="regrade"){delete db.subs[b.dataset.id].g;save();paint(true)}
if(a==="export"){const out={};pending().forEach(s=>out[s.id]={task:T(s.id).t.split("|")[0],...s,g:{c:null,q:null,m:null,fb:"",by:"",sup:false}});
  const l=document.createElement("a");l.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:"application/json"}));l.download="edutech-submissions.json";l.click()}}

/* Load a graded file: every submission in it with a complete "g" gets that grade */
document.addEventListener("change",async e=>{if(e.target.id!=="gfile"||!e.target.files[0])return;
try{const data=JSON.parse(await e.target.files[0].text());
  for(const id in data){const g=data[id].g,s=db.subs[id];if(s&&g&&g.c!=null&&g.q!=null&&g.m!=null)s.g={c:lim(g.c,40),q:lim(g.q,40),m:lim(g.m,20),fb:String(g.fb||""),by:String(g.by||"Reviewer"),sup:!!g.sup}}
  save()}catch(err){}
paint(true)});
