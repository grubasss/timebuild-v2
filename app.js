let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

document.addEventListener("DOMContentLoaded", () => {

if(typeof db === "undefined") return;

renderAll();

document.getElementById("prevMonth")?.addEventListener("click", () => {
calendarDate.setMonth(calendarDate.getMonth() - 1);
renderCalendar();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
calendarDate.setMonth(calendarDate.getMonth() + 1);
renderCalendar();
});

});

function renderAll(){
if(!db) return;
renderWorkers();
renderProjects();
renderSelectors();
renderEntries();
renderAdvances();
renderPayouts();
renderCalendar();
}

/* ===== PRACOWNICY ===== */

function renderWorkers(){

const list = document.getElementById("workersList");
if(!list) return;

list.innerHTML = db.workers.map(w => `
<div class="row">
<b>${w.name}</b> (${w.rate} zł/h)
<button onclick="editWorker('${w.id}')">Edytuj</button>
<button onclick="deleteWorker('${w.id}')">Usuń</button>
</div>
`).join("");

}

function addWorker(){

const name = document.getElementById("workerName").value;
const rate = parseFloat(document.getElementById("workerRate").value);

if(!name || !rate){
alert("Podaj imię i stawkę");
return;
}

db.workers.push({
id: Date.now().toString(),
name,
rate
});

saveDB();
renderAll();

}

function editWorker(id){

const worker = db.workers.find(w=>w.id==id);
if(!worker) return;

const name = prompt("Imię:", worker.name);
const rate = prompt("Stawka:", worker.rate);

if(!name || !rate) return;

worker.name = name;
worker.rate = parseFloat(rate);

saveDB();
renderAll();

}

function deleteWorker(id){

const hasHours = db.entries.some(e=>e.worker==id);
const hasAdv = db.advances.some(a=>a.worker==id);

if(hasHours || hasAdv){
alert("Nie można usunąć pracownika. Najpierw usuń jego godziny i zaliczki.");
return;
}

if(!confirm("Usunąć pracownika?")) return;

db.workers = db.workers.filter(w=>w.id!=id);

saveDB();
renderAll();

}

/* ===== PROJEKTY ===== */

function renderProjects(){

const list = document.getElementById("projectsList");
if(!list) return;

list.innerHTML = db.projects.map(p => `
<div class="row">
${p.name}
<button onclick="deleteProject('${p.id}')">Usuń</button>
</div>
`).join("");

}

function addProject(){

const name = document.getElementById("projectName").value;

if(!name){
alert("Podaj nazwę projektu");
return;
}

db.projects.push({
id: Date.now().toString(),
name
});

saveDB();
renderAll();

}

function deleteProject(id){

if(!confirm("Usunąć projekt?")) return;

db.projects = db.projects.filter(p=>p.id!=id);

saveDB();
renderAll();

}

/* ===== SELECTORY ===== */

function renderSelectors(){

const workers = document.getElementById("hoursWorker");
const projects = document.getElementById("hoursProject");
const advWorker = document.getElementById("advanceWorker");

if(workers){
workers.innerHTML = db.workers.map(w =>
`<option value="${w.id}">${w.name}</option>`
).join("");
}

if(projects){
projects.innerHTML = db.projects.map(p =>
`<option value="${p.id}">${p.name}</option>`
).join("");
}

if(advWorker){
advWorker.innerHTML = db.workers.map(w =>
`<option value="${w.id}">${w.name}</option>`
).join("");
}

}

/* ===== GODZINY ===== */

function addHours(){

const worker = document.getElementById("hoursWorker").value;
const project = document.getElementById("hoursProject").value;
const hours = parseFloat(document.getElementById("hoursValue").value);

if(!hours) return;

db.entries.push({
id: Date.now(),
worker,
project,
hours,
date: selectedDay
});

saveDB();
renderAll();

}

function renderEntries(){

const list = document.getElementById("entriesList");
if(!list) return;

list.innerHTML = db.entries.map(e => {

const worker = db.workers.find(w=>w.id==e.worker)?.name || "?";
const project = db.projects.find(p=>p.id==e.project)?.name || "?";

return `
<div class="row">
${worker} – ${project} – ${e.hours}h (${e.date})
<button onclick="editEntry(${e.id})">Edytuj</button>
<button onclick="deleteEntry(${e.id})">Usuń</button>
</div>
`;

}).join("");

}

function editEntry(id){

const entry = db.entries.find(e=>e.id==id);
if(!entry) return;

const worker = prompt("ID pracownika:", entry.worker);
const project = prompt("ID projektu:", entry.project);
const date = prompt("Data:", entry.date);
const hours = prompt("Godziny:", entry.hours);

if(!worker || !project || !date || !hours) return;

entry.worker = worker;
entry.project = project;
entry.date = date;
entry.hours = parseFloat(hours);

saveDB();
renderAll();

}

function deleteEntry(id){

if(!confirm("Usunąć wpis godzin?")) return;

db.entries = db.entries.filter(e=>e.id!=id);

saveDB();
renderAll();

}

/* ===== ZALICZKI ===== */

function addAdvance(){

const worker = document.getElementById("advanceWorker").value;
const amount = parseFloat(document.getElementById("advanceValue").value);
const date = document.getElementById("advanceDate").value;

if(!amount) return;

db.advances.push({
id: Date.now(),
worker,
amount,
date
});

saveDB();
renderAll();

}

function renderAdvances(){

const list = document.getElementById("advancesList");
if(!list) return;

list.innerHTML = db.advances.map(a => {

const worker = db.workers.find(w=>w.id==a.worker)?.name || "?";

return `
<div class="row">
${worker} – ${a.amount} zł (${a.date})
<button onclick="editAdvance(${a.id})">Edytuj</button>
<button onclick="deleteAdvance(${a.id})">Usuń</button>
</div>
`;

}).join("");

}

function editAdvance(id){

const adv = db.advances.find(a=>a.id==id);
if(!adv) return;

const worker = prompt("ID pracownika:", adv.worker);
const date = prompt("Data:", adv.date);
const amount = prompt("Kwota:", adv.amount);

if(!worker || !date || !amount) return;

adv.worker = worker;
adv.date = date;
adv.amount = parseFloat(amount);

saveDB();
renderAll();

}

function deleteAdvance(id){

if(!confirm("Usunąć zaliczkę?")) return;

db.advances = db.advances.filter(a=>a.id!=id);

saveDB();
renderAll();

}

/* ===== WYPŁATY ===== */

function renderPayouts(){

const el = document.getElementById("payouts");
if(!el) return;

el.innerHTML = db.workers.map(w => {

const hours = db.entries
.filter(e=>e.worker==w.id)
.reduce((s,e)=>s+Number(e.hours),0);

const earned = hours * w.rate;

const advances = db.advances
.filter(a=>a.worker==w.id)
.reduce((s,a)=>s+Number(a.amount),0);

const toPay = earned - advances;

return `
<div class="row">
<b>${w.name}</b><br>
Godziny: ${hours}<br>
Zarobione: ${earned.toFixed(2)} zł<br>
Zaliczki: ${advances.toFixed(2)} zł<br>
Do wypłaty: ${toPay.toFixed(2)} zł
</div>
`;

}).join("<hr>");

}

/* ===== KALENDARZ ===== */

function renderCalendar(){

const container = document.getElementById("calendar");
if(!container) return;

container.innerHTML = "";

const today = formatLocal(new Date());

const year = calendarDate.getFullYear();
const month = calendarDate.getMonth();

const months = [
"Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
"Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
];

const label = document.getElementById("monthLabel");
if(label){
label.textContent = months[month] + " " + year;
}

const daysContainer = document.getElementById("calendarDays");

if(daysContainer){

daysContainer.innerHTML="";

["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].forEach(d=>{
const div=document.createElement("div");
div.className="day-name";
div.textContent=d;
daysContainer.appendChild(div);
});

}

const firstDay = new Date(year, month, 1);
const startDay = (firstDay.getDay()+6)%7;
const lastDay = new Date(year, month+1,0).getDate();

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
