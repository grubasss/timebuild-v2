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
renderWorkers();
renderProjects();
renderSelectors();
renderEntries();
renderAdvances();
renderPayouts();
renderCalendar();
renderDashboard();
renderRanking();
}

function renderDashboard(){

const workers = db.workers.length;

const hours = db.entries.reduce((s,e)=>s+Number(e.hours),0);

const advances = db.advances.reduce((s,a)=>s+Number(a.amount),0);

let earned = 0;

db.workers.forEach(w=>{

const h = db.entries
.filter(e=>e.worker==w.id)
.reduce((s,e)=>s+Number(e.hours),0);

earned += h * w.rate;

});

const toPay = earned - advances;

document.getElementById("dashWorkers").innerText = workers;
document.getElementById("dashHours").innerText = hours;
document.getElementById("dashAdvances").innerText = advances.toFixed(2) + " zł";
document.getElementById("dashToPay").innerText = toPay.toFixed(2) + " zł";

}

function renderWorkers(){

const list = document.getElementById("workersList");
if(!list) return;

list.innerHTML = db.workers.map(w => `
<div class="row">
<b onclick="showWorker('${w.id}')" style="cursor:pointer">${w.name}</b> (${w.rate} zł/h)
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

function showWorker(id){

const panel = document.getElementById("workerPanel");
if(!panel) return;

const worker = db.workers.find(w=>w.id==id);

const entries = db.entries.filter(e=>e.worker==id);
const advances = db.advances.filter(a=>a.worker==id);

const hours = entries.reduce((s,e)=>s+Number(e.hours),0);
const earned = hours * worker.rate;
const advanceSum = advances.reduce((s,a)=>s+Number(a.amount),0);
const toPay = earned - advanceSum;

panel.innerHTML = `
<h3>${worker.name}</h3>

<div class="row"><b>Godziny</b><span>${hours}</span></div>
<div class="row"><b>Zarobione</b><span>${earned.toFixed(2)} zł</span></div>
<div class="row"><b>Zaliczki</b><span>${advanceSum.toFixed(2)} zł</span></div>
<div class="row"><b>Do wypłaty</b><span>${toPay.toFixed(2)} zł</span></div>
`;

}

function renderProjects(){

const list = document.getElementById("projectsList");
if(!list) return;

list.innerHTML = db.projects.map(p => `
<div class="row">${p.name}</div>
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

function renderSelectors(){

const workers = document.getElementById("hoursWorker");
const projects = document.getElementById("hoursProject");
const advWorker = document.getElementById("advanceWorker");
const filter = document.getElementById("entriesFilter");

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

if(filter){
filter.innerHTML = `<option value="all">Wszyscy</option>` +
db.workers.map(w =>
`<option value="${w.id}">${w.name}</option>`
).join("");
}

}

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

const filter = document.getElementById("entriesFilter")?.value;

let entries = db.entries;

if(filter && filter!="all"){
entries = entries.filter(e=>e.worker==filter);
}

list.innerHTML = entries.map(e => {

const worker = db.workers.find(w=>w.id==e.worker)?.name || "?";
const project = db.projects.find(p=>p.id==e.project)?.name || "?";

return `
<div class="row">
${worker} – ${project} – ${e.hours}h (${e.date})
</div>
`;

}).join("");

}

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
</div>
`;

}).join("");

}

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

function renderRanking(){

const el = document.getElementById("workersRanking");
if(!el) return;

const ranking = db.workers.map(w=>{

const hours = db.entries
.filter(e=>e.worker==w.id)
.reduce((s,e)=>s+Number(e.hours),0);

return {
name: w.name,
hours
};

}).sort((a,b)=>b.hours-a.hours);

el.innerHTML = ranking.map((r,i)=>`
<div class="row">
${i+1}. ${r.name}
<span>${r.hours}h</span>
</div>
`).join("");

}

function renderCalendar(){

const container = document.getElementById("calendar");
if(!container) return;

container.innerHTML = "";

const year = calendarDate.getFullYear();
const month = calendarDate.getMonth();

const months = [
"Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
"Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
];

document.getElementById("monthLabel").innerText =
months[month] + " " + year;

const firstDay = new Date(year, month, 1);
const startDay = (firstDay.getDay()+6)%7;
const lastDay = new Date(year, month+1,0).getDate();

for(let i=0;i<startDay;i++){

const empty = document.createElement("div");
empty.className="day empty";
container.appendChild(empty);

}

for(let day=1;day<=lastDay;day++){

const date = new Date(year,month,day);
const dateStr = formatLocal(date);

const div = document.createElement("div");
div.className="day";

div.innerHTML = `<div class="day-number">${day}</div>`;

if(dateStr===selectedDay){
div.classList.add("active");
}

if(db.entries.some(e=>e.date===dateStr)){
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
