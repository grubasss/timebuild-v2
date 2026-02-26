// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

function init() {
    loadDB();

    // 🔑 USTAW input daty na wybrany dzień
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

// ===== DODAWANIE GODZIN =====

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

    renderEntries();
    renderStats();
    renderCalendar();

    if (typeof updateCharts === "function") updateCharts();
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

// ===== WORKERS =====

function renderWorkers(){
    const list = document.getElementById("workersList");
    if(!list) return;

    let html = "";
    db.workers.forEach(worker => {
        html += `
        <div class="row">
            <div>
                <b>${worker.name}</b> (${worker.rate} zł/h)
            </div>
        </div>
        `;
    });
    list.innerHTML = html;
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

    if(workerSel){
        workerSel.innerHTML = "";
        db.workers.forEach(w=>{
            workerSel.innerHTML += `<option value="${w.id}">${w.name}</option>`;
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
            ${worker?.name||""} – ${a.amount} zł (${a.date})
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

        const hasHours = db.entries.some(e => e.date === dateStr);

        el.innerHTML = `
            <div class="day-number">${d}</div>
            ${hasHours ? '<div class="dot"></div>' : ''}
        `;

        el.onclick = ()=>{
            selectedDay = dateStr;

            // 🔑 synchronizacja inputa
            if(dateInput){
                dateInput.value = dateStr;
            }

            renderCalendar();
        };

        calendar.appendChild(el);
    }
}
