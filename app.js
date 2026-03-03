// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());
let today = formatLocal(new Date());

function init() {
    loadDB();

    const dateInput = document.getElementById("hoursDate");
    if(dateInput){
        dateInput.value = selectedDay;
    }

    renderAll();
}

// ===== MASTER RENDER =====

function renderAll() {
    renderStats();
    renderWorkers();
    renderProjects();
    renderSelectors();
    renderEntries();
    renderAdvances();
    renderCalendar();
    if (typeof updateCharts === "function") updateCharts();
}

// ===== GODZINY =====

function addHours(){

    const worker = document.getElementById("hoursWorker")?.value;
    const project = document.getElementById("hoursProject")?.value;
    const hours = parseFloat(document.getElementById("hoursValue")?.value);
    const date = selectedDay;

    if(!worker || !project || !date || !hours){
        alert("Uzupełnij dane");
        return;
    }

    db.entries.push({
        id: Date.now(),
        worker,
        project,
        date,
        hours
    });

    saveDB();
    renderAll();
}

// ===== ZALICZKI =====

function addAdvance(){

    const worker = document.getElementById("advanceWorker")?.value;
    const amount = parseFloat(document.getElementById("advanceValue")?.value);
    const date = document.getElementById("advanceDate")?.value || selectedDay;

    if(!worker || !amount){
        alert("Uzupełnij dane zaliczki");
        return;
    }

    db.advances.push({
        id: Date.now(),
        worker,
        date,
        amount
    });

    saveDB();
    renderAll();
}

function editAdvance(id){

    const adv = db.advances.find(a=>a.id==id);
    if(!adv) return;

    const newAmount = prompt("Nowa kwota:", adv.amount);
    if(!newAmount) return;

    adv.amount = parseFloat(newAmount);

    saveDB();
    renderAll();
}

function deleteAdvance(id){

    if(!confirm("Usunąć zaliczkę?")) return;

    db.advances = db.advances.filter(a=>a.id!=id);

    saveDB();
    renderAll();
}

// ===== STATYSTYKI =====

function renderStats(){
    if(!db) return;

    const stats = document.getElementById("stats");
    if(!stats) return;

    let totalEarned = db.entries.reduce((s,e)=>{
        const worker = db.workers.find(w=>w.id===e.worker);
        return s + ((e.hours||0) * (worker?.rate||0));
    },0);

    let totalAdvances = db.advances.reduce((s,a)=>s + (a.amount||0), 0);

    stats.innerHTML = `
        Zarobione: ${totalEarned.toFixed(2)} zł<br>
        Zaliczki: ${totalAdvances.toFixed(2)} zł<br>
        Do wypłaty: ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;
}

function renderWorkers(){
    const list = document.getElementById("workersList");
    if(!list) return;

    list.innerHTML = db.workers.map(w => `
        <div class="row">
            <div>
                <b>${w.name}</b> (${w.rate} zł/h)
            </div>
            <div>
                <button onclick="editWorker(${w.id})">Edytuj</button>
                <button onclick="deleteWorker(${w.id})">Usuń</button>
            </div>
        </div>
    `).join("");
}
// ===== PROJECTS =====

function renderProjects(){
    const list = document.getElementById("projectsList");
    if(!list) return;

    let html = "";
    db.projects.forEach(p => {
        html += `<div class="row">${p.name}</div>`;
    });
    list.innerHTML = html;
}

// ===== SELECTORS =====

function renderSelectors(){

    const workerSel = document.getElementById("hoursWorker");
    const projectSel = document.getElementById("hoursProject");
    const advanceSel = document.getElementById("advanceWorker");

    if(workerSel){
        workerSel.innerHTML = "";
        db.workers.forEach(w=>{
            workerSel.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        });
    }

    if(advanceSel){
        advanceSel.innerHTML = "";
        db.workers.forEach(w=>{
            advanceSel.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        });
    }

    if(projectSel){
        projectSel.innerHTML = "";
        db.projects.forEach(p=>{
            projectSel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    }
}

// ===== ENTRIES =====

function renderEntries(){
    const list = document.getElementById("entriesList");
    if(!list) return;

    let html = "";
    db.entries.forEach(e=>{
        const worker = db.workers.find(w=>w.id===e.worker);
        const project = db.projects.find(p=>p.id===e.project);

        html += `
        <div class="row">
            ${worker?.name||""} – ${project?.name||""} – ${e.hours}h (${e.date})
        </div>`;
    });
    list.innerHTML = html;
}

// ===== ADVANCES =====

function renderAdvances(){

    const list = document.getElementById("advancesList");
    if(!list) return;

    let html = "";

    db.advances.forEach(a=>{
        const worker = db.workers.find(w=>w.id===a.worker);

        html += `
        <div class="row">
            <div>
                ${worker?.name||""} – ${a.amount} zł (${a.date})
            </div>
            <div>
                <button onclick="editAdvance(${a.id})">Edytuj</button>
                <button onclick="deleteAdvance(${a.id})">Usuń</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

// ===== KALENDARZ =====

function renderCalendar(){

    const calendar = document.getElementById("calendar");
    const label = document.getElementById("monthLabel");
    const daysRow = document.getElementById("calendarDays");
    const dateInput = document.getElementById("hoursDate");

    if(!calendar || !label || !daysRow) return;

    calendar.innerHTML = "";
    daysRow.innerHTML = "";

    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();

    const monthNames = [
        "styczeń","luty","marzec","kwiecień","maj","czerwiec",
        "lipiec","sierpień","wrzesień","październik","listopad","grudzień"
    ];
    label.innerText = monthNames[month] + " " + year;

    const dayNames = ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"];
    dayNames.forEach(d=>{
        const el = document.createElement("div");
        el.className = "day-name";
        el.innerText = d;
        daysRow.appendChild(el);
    });

    const firstDay = new Date(year, month, 1);
    const startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month+1, 0).getDate();

    for(let i=0;i<startDay;i++){
        calendar.appendChild(document.createElement("div"));
    }

    for(let d=1; d<=daysInMonth; d++){

        const date = new Date(year, month, d);
        const dateStr = formatLocal(date);

        const el = document.createElement("div");
        el.className = "day";

        if(date.getDay() === 0 || date.getDay() === 6){
            el.classList.add("weekend");
        }

        if(dateStr === selectedDay){
            el.classList.add("active");
        }

        if(dateStr === today){
            el.style.outline = "3px solid #3b82f6";
        }

        const hasHours = db.entries.some(e => e.date === dateStr);
        const hasAdvance = db.advances.some(a => a.date === dateStr);

        el.innerHTML = `
            <div class="day-number">${d}</div>
            ${hasHours || hasAdvance ? '<div class="dot"></div>' : ''}
        `;

        el.onclick = ()=>{
            selectedDay = dateStr;
            if(dateInput){
                dateInput.value = dateStr;
            }
            renderCalendar();
        };

        calendar.appendChild(el);
    }
}
// ===== WORKERS FULL CONTROL =====

function addWorker(){

    const name = document.getElementById("workerName")?.value.trim();
    const rate = parseFloat(document.getElementById("workerRate")?.value);

    if(!name || !rate){
        alert("Uzupełnij dane pracownika");
        return;
    }

    db.workers.push({
        id: Date.now(),
        name,
        rate
    });

    saveDB?.(); // jeśli istnieje
    renderAll();
}

function editWorker(id){

    const worker = db.workers.find(w=>w.id==id);
    if(!worker) return;

    const newRate = prompt("Nowa stawka:", worker.rate);
    if(newRate===null) return;

    const parsed = parseFloat(newRate);
    if(isNaN(parsed)){
        alert("Nieprawidłowa wartość");
        return;
    }

    worker.rate = parsed;

    saveDB?.();
    renderAll();
}

function deleteWorker(id){

    const hasEntries = db.entries.some(e=>e.worker==id);
    const hasAdvances = db.advances.some(a=>a.worker==id);

    if(hasEntries || hasAdvances){
        alert("Nie można usunąć — ma przypisane godziny lub zaliczki.");
        return;
    }

    if(!confirm("Usunąć pracownika?")) return;

    db.workers = db.workers.filter(w=>w.id!=id);

    saveDB?.();
    renderAll();
}
