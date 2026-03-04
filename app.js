let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

document.addEventListener("DOMContentLoaded", () => {

if(typeof db === "undefined") return;

renderAll();

document.getElementById("prevMonth")?.addEventListener("click", () => {
calendarDate.setMonth(calendarDate.getMonth()-1);
renderCalendar();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
calendarDate.setMonth(calendarDate.getMonth()+1);
renderCalendar();
});

});

/* ===== MASTER RENDER ===== */

function renderAll(){

renderDashboard();
renderWorkers();
renderProjects();
renderSelectors();
renderEntries();
renderAdvances();
renderPayouts();
renderCalendar();

}

/* ===== DASHBOARD ===== */

function renderDashboard(){

const workers=db.workers.length;

const hours=db.entries.reduce((s,e)=>s+Number(e.hours||0),0);

const advances=db.advances.reduce((s,a)=>s+Number(a.amount||0),0);

let earned=0;

db.entries.forEach(e=>{
const w=db.workers.find(x=>x.id==e.worker);
if(w) earned+=e.hours*w.rate;
});

const toPay=earned-advances;

const wEl=document.getElementById("dashWorkers");
const hEl=document.getElementById("dashHours");
const aEl=document.getElementById("dashAdvances");
const pEl=document.getElementById("dashToPay");

if(wEl) wEl.textContent=workers;
if(hEl) hEl.textContent=hours.toFixed(1);
if(aEl) aEl.textContent=advances.toFixed(2)+" zł";
if(pEl) pEl.textContent=toPay.toFixed(2)+" zł";

}

/* ===== PRACOWNICY ===== */

function renderWorkers(){

const list=document.getElementById("workersList");
if(!list) return;

list.innerHTML=db.workers.map(w=>`
<div class="row">
<b>${w.name}</b> (${w.rate} zł/h)
<div>
<button onclick="editWorker('${w.id}')">Edytuj</button>
<button onclick="deleteWorker('${w.id}')">Usuń</button>
</div>
</div>
`).join("");

}

function addWorker(){

const name=document.getElementById("workerName").value;
const rate=parseFloat(document.getElementById("workerRate").value);

if(!name||!rate){
alert("Podaj imię i stawkę");
return;
}

db.workers.push({
id:Date.now().toString(),
name,
rate
});

saveDB();
renderAll();

}

function editWorker(id){

const worker=db.workers.find(w=>w.id==id);
if(!worker) return;

const name=prompt("Imię:",worker.name);
const rate=prompt("Stawka:",worker.rate);

if(!name||!rate) return;

worker.name=name;
worker.rate=parseFloat(rate);

saveDB();
renderAll();

}

function deleteWorker(id){

const hasHours=db.entries.some(e=>e.worker==id);
const hasAdv=db.advances.some(a=>a.worker==id);

if(hasHours||hasAdv){
alert("Usuń najpierw godziny i zaliczki pracownika");
return;
}

if(!confirm("Usunąć pracownika?")) return;

db.workers=db.workers.filter(w=>w.id!=id);

saveDB();
renderAll();

}

/* ===== PROJEKTY ===== */

function renderProjects(){

const list=document.getElementById("projectsList");
if(!list) return;

list.innerHTML=db.projects.map(p=>`
<div class="row">
${p.name}
<button onclick="deleteProject('${p.id}')">Usuń</button>
</div>
`).join("");

}

function addProject(){

const name=document.getElementById("projectName").value;

if(!name){
alert("Podaj nazwę projektu");
return;
}

db.projects.push({
id:Date.now().toString(),
name
});

saveDB();
renderAll();

}

function deleteProject(id){

if(!confirm("Usunąć projekt?")) return;

db.projects=db.projects.filter(p=>p.id!=id);

saveDB();
renderAll();

}

/* ===== SELECTORY ===== */

function renderSelectors(){

const workers=document.getElementById("hoursWorker");
const projects=document.getElementById("hoursProject");
const advWorker=document.getElementById("advanceWorker");
const filter=document.getElementById("entriesFilter");

if(workers){
workers.innerHTML=db.workers.map(w=>
`<option value="${w.id}">${w.name}</option>`
).join("");
}

if(projects){
projects.innerHTML=db.projects.map(p=>
`<option value="${p.id}">${p.name}</option>`
).join("");
}

if(advWorker){
advWorker.innerHTML=db.workers.map(w=>
`<option value="${w.id}">${w.name}</option>`
).join("");
}

if(filter){

const current=filter.value||"all";

filter.innerHTML=
`<option value="all">Wszyscy</option>`+
db.workers.map(w=>
`<option value="${w.id}">${w.name}</option>`
).join("");

filter.value=current;

}

}

/* ===== GODZINY ===== */

function addHours(){

const worker=document.getElementById("hoursWorker").value;
const project=document.getElementById("hoursProject").value;
const hours=parseFloat(document.getElementById("hoursValue").value);

if(!hours) return;

db.entries.push({
id:Date.now(),
worker,
project,
hours,
date:selectedDay
});

saveDB();
renderAll();

}

function renderEntries(){

const list=document.getElementById("entriesList");
if(!list) return;

const filter=document.getElementById("entriesFilter")?.value||"all";

let entries=[...db.entries];

entries.sort((a,b)=>b.date.localeCompare(a.date));

if(filter!=="all"){
entries=entries.filter(e=>e.worker==filter);
}

list.innerHTML=entries.map(e=>{

const worker=db.workers.find(w=>w.id==e.worker)?.name||"?";
const project=db.projects.find(p=>p.id==e.project)?.name||"?";

return`
<div class="row">
<span>${worker} – ${project} – ${e.hours}h (${e.date})</span>
<div>
<button onclick="editEntry(${e.id})">✏️</button>
<button onclick="deleteEntry(${e.id})">🗑</button>
</div>
</div>
`;

}).join("");

renderWorkerSummary(filter);

}

/* ===== PODSUMOWANIE PRACOWNIKA ===== */

function renderWorkerSummary(workerId){

const box=document.getElementById("workerSummary");
if(!box) return;

if(workerId==="all"){
box.innerHTML="";
return;
}

const worker=db.workers.find(w=>w.id==workerId);
if(!worker) return;

const hours=db.entries
.filter(e=>e.worker==workerId)
.reduce((s,e)=>s+Number(e.hours),0);

const earned=hours*worker.rate;

const advances=db.advances
.filter(a=>a.worker==workerId)
.reduce((s,a)=>s+Number(a.amount),0);

const toPay=earned-advances;

box.innerHTML=`
<div class="card">
<b>${worker.name}</b><br>
Godziny: ${hours}<br>
Zarobione: ${earned.toFixed(2)} zł<br>
Zaliczki: ${advances.toFixed(2)} zł<br>
<b>Do wypłaty: ${toPay.toFixed(2)} zł</b>
</div>
`;

}

/* ===== EDYCJA GODZIN ===== */

function editEntry(id){

const entry=db.entries.find(e=>e.id==id);
if(!entry) return;

const worker=prompt("ID pracownika:",entry.worker);
const project=prompt("ID projektu:",entry.project);
const date=prompt("Data:",entry.date);
const hours=prompt("Godziny:",entry.hours);

if(!worker||!project||!date||!hours) return;

entry.worker=worker;
entry.project=project;
entry.date=date;
entry.hours=parseFloat(hours);

saveDB();
renderAll();

}

function deleteEntry(id){

if(!confirm("Usunąć wpis godzin?")) return;

db.entries=db.entries.filter(e=>e.id!=id);

saveDB();
renderAll();

}

/* ===== ZALICZKI ===== */

function addAdvance(){

const worker=document.getElementById("advanceWorker").value;
const amount=parseFloat(document.getElementById("advanceValue").value);
const date=document.getElementById("advanceDate").value;

if(!amount) return;

db.advances.push({
id:Date.now(),
worker,
amount,
date
});

saveDB();
renderAll();

}

function renderAdvances(){

const list=document.getElementById("advancesList");
if(!list) return;

list.innerHTML=db.advances.map(a=>{

const worker=db.workers.find(w=>w.id==a.worker)?.name||"?";

return`
<div class="row">
<span>${worker} – ${a.amount} zł (${a.date})</span>
<div>
<button onclick="editAdvance(${a.id})">✏️</button>
<button onclick="deleteAdvance(${a.id})">🗑</button>
</div>
</div>
`;

}).join("");

}

function editAdvance(id){

const adv=db.advances.find(a=>a.id==id);
if(!adv) return;

const worker=prompt("ID pracownika:",adv.worker);
const date=prompt("Data:",adv.date);
const amount=prompt("Kwota:",adv.amount);

if(!worker||!date||!amount) return;

adv.worker=worker;
adv.date=date;
adv.amount=parseFloat(amount);

saveDB();
renderAll();

}

function deleteAdvance(id){

if(!confirm("Usunąć zaliczkę?")) return;

db.advances=db.advances.filter(a=>a.id!=id);

saveDB();
renderAll();

}

/* ===== WYPŁATY ===== */

function renderPayouts(){

const el=document.getElementById("payouts");
if(!el) return;

el.innerHTML=db.workers.map(w=>{

const hours=db.entries
.filter(e=>e.worker==w.id)
.reduce((s,e)=>s+Number(e.hours),0);

const earned=hours*w.rate;

const advances=db.advances
.filter(a=>a.worker==w.id)
.reduce((s,a)=>s+Number(a.amount),0);

const toPay=earned-advances;

return`
<div class="row">
<b>${w.name}</b>
<span>${hours} h</span>
<span>${earned.toFixed(2)} zł</span>
<span>${advances.toFixed(2)} zł</span>
<span><b>${toPay.toFixed(2)} zł</b></span>
</div>
`;

}).join("");

}

/* ===== KALENDARZ ===== */

function renderCalendar(){

const container=document.getElementById("calendar");
if(!container) return;

container.innerHTML="";

const today=formatLocal(new Date());

const year=calendarDate.getFullYear();
const month=calendarDate.getMonth();

const months=[
"Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
"Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
];

const label=document.getElementById("monthLabel");

if(label){
label.textContent=months[month]+" "+year;
}

const daysContainer=document.getElementById("calendarDays");

if(daysContainer){

daysContainer.innerHTML="";

["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].forEach(d=>{
const div=document.createElement("div");
div.className="day-name";
div.textContent=d;
daysContainer.appendChild(div);
});

}

const firstDay=new Date(year,month,1);
const startDay=(firstDay.getDay()+6)%7;
const lastDay=new Date(year,month+1,0).getDate();

for(let i=0;i<startDay;i++){

const empty=document.createElement("div");
empty.className="day empty";
container.appendChild(empty);

}

for(let day=1;day<=lastDay;day++){

const date=new Date(year,month,day);
const dateStr=formatLocal(date);

const div=document.createElement("div");
div.className="day";

const number=document.createElement("div");
number.className="day-number";
number.textContent=day;

div.appendChild(number);

if(dateStr===today){
div.style.border="2px solid #22c55e";
}

if(dateStr===selectedDay){
div.classList.add("active");
}

const hasHours=db.entries.some(e=>e.date===dateStr);

if(hasHours){
const dot=document.createElement("div");
dot.className="dot";
div.appendChild(dot);
}

div.onclick=()=>{
selectedDay=dateStr;
renderCalendar();
};

container.appendChild(div);

}

}
