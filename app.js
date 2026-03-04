let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

document.addEventListener("DOMContentLoaded", () => {

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

}

function renderWorkers(){

const list = document.getElementById("workersList");
if(!list) return;

list.innerHTML = db.workers.map(w => `
<div class="row">
<b>${w.name}</b> (${w.rate} zł/h)
</div>
`).join("");

}

function renderProjects(){

const list = document.getElementById("projectsList");
if(!list) return;

list.innerHTML = db.projects.map(p => `
<div class="row">${p.name}</div>
`).join("");

}

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

function addHours(){

const worker = document.getElementById("hoursWorker").value;
const project = document.getElementById("hoursProject").value;
const hours = parseFloat(document.getElementById("hoursValue").value);

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
</div>
`;

}).join("");

}

function addAdvance(){

const worker = document.getElementById("advanceWorker").value;
const amount = parseFloat(document.getElementById("advanceValue").value);
const date = document.getElementById("advanceDate").value;

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
.reduce((s,e)=>s+e.hours,0);

const earned = hours * w.rate;

const advances = db.advances
.filter(a=>a.worker==w.id)
.reduce((s,a)=>s+a.amount,0);

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

function renderCalendar(){

const container = document.getElementById("calendar");
if(!container) return;

container.innerHTML = "";

const year = calendarDate.getFullYear();
const month = calendarDate.getMonth();

const firstDay = new Date(year, month, 1);
const startDay = (firstDay.getDay()+6)%7;
const lastDay = new Date(year, month+1,0).getDate();

const grid = document.createElement("div");
grid.className = "calendar-grid";

["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].forEach(d => {

const div = document.createElement("div");
div.className = "calendar-weekday";
div.textContent = d;
grid.appendChild(div);

});

for(let i=0;i<startDay;i++){

grid.appendChild(document.createElement("div"));

}

for(let day=1;day<=lastDay;day++){

const date = new Date(year,month,day);
const dateStr = formatLocal(date);

const div = document.createElement("div");
div.className="calendar-day";
div.textContent=day;

if(dateStr===selectedDay){

div.classList.add("active-day");

}

const hasHours = db.entries.some(e=>e.date===dateStr);

if(hasHours){

div.classList.add("has-hours");

}

div.onclick=()=>{

selectedDay = dateStr;
renderCalendar();

};

grid.appendChild(div);

}

container.appendChild(grid);

}
