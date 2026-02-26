// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

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

// ===== EDYCJA GODZIN =====

function editEntry(id){
    const entry = db.entries.find(e => e.id === id);
    if(!entry) return;

    const newHours = prompt("Nowa liczba godzin:", entry.hours);
    if(newHours === null) return;

    entry.hours = parseFloat(newHours) || entry.hours;

    saveDB();
    renderAll();
}

// ===== USUWANIE GODZIN =====

function deleteEntry(id){
    if(!confirm("Usunąć wpis?")) return;

    db.entries = db.entries.filter(e => e.id !== id);
    saveDB();
    renderAll();
}

// ===== ZALICZKI =====

function editAdvance(id){
    const adv = db.advances.find(a => a.id === id);
    if(!adv) return;

    const newVal = prompt("Nowa kwota:", adv.amount);
    if(newVal === null) return;

    adv.amount = parseFloat(newVal) || adv.amount;

    saveDB();
    renderAll();
}

function deleteAdvance(id){
    if(!confirm("Usunąć zaliczkę?")) return;

    db.advances = db.advances.filter(a => a.id !== id);
    saveDB();
    renderAll();
}

// ===== PRACOWNICY =====

function editWorker(id){
    const w = db.workers.find(w => w.id === id);
    if(!w) return;

    const newName = prompt("Nowe imię:", w.name);
    const newRate = prompt("Nowa stawka:", w.rate);

    if(newName) w.name = newName;
    if(newRate) w.rate = parseFloat(newRate);

    saveDB();
    renderAll();
}

function deleteWorker(id){
    if(!confirm("Usunąć pracownika?")) return;

    db.workers = db.workers.filter(w => w.id !== id);
    saveDB();
    renderAll();
}

// ===== PROJEKTY =====

function editProject(id){
    const p = db.projects.find(p => p.id === id);
    if(!p) return;

    const newName = prompt("Nowa nazwa:", p.name);
    if(newName) p.name = newName;

    saveDB();
    renderAll();
}

function deleteProject(id){
    if(!confirm("Usunąć projekt?")) return;

    db.projects = db.projects.filter(p => p.id !== id);
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

// ===== WORKERS RENDER =====

function renderWorkers(){
    const list = document.getElementById("workersList");
    if(!list) return;

    let html = "";
    db.workers.forEach(w=>{
        html += `
        <div class="row">
            <div><b>${w.name}</b> (${w.rate} zł/h)</div>
            <div>
                <button onclick="editWorker(${w.id})">Edytuj</button>
                <button onclick="deleteWorker(${w.id})">Usuń</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

// ===== PROJECTS RENDER =====

function renderProjects(){
    const list = document.getElementById("projectsList");
    if(!list) return;

    let html = "";
    db.projects.forEach(p=>{
        html += `
        <div class="row">
            <div>${p.name}</div>
            <div>
                <button onclick="editProject(${p.id})">Edytuj</button>
                <button onclick="deleteProject(${p.id})">Usuń</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

// ===== ENTRIES RENDER =====

function renderEntries(){
    const list = document.getElementById("entriesList");
    if(!list) return;

    let html = "";
    db.entries.forEach(e=>{
        const worker = db.workers.find(w=>w.id===e.worker);
        const project = db.projects.find(p=>p.id===e.project);

        html += `
        <div class="row">
            <div>
                ${worker?.name||""} – ${project?.name||""} – ${e.hours}h (${e.date})
            </div>
            <div>
                <button onclick="editEntry(${e.id})">Edytuj</button>
                <button onclick="deleteEntry(${e.id})">Usuń</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

// ===== ADVANCES RENDER =====

function renderAdvances(){
    const list = document.getElementById("advancesList");
    if(!list) return;

    let html = "";
    db.advances.forEach(a=>{
        const worker = db.workers.find(w=>w.id===a.worker);

        html += `
        <div class="row">
            <div>${worker?.name||""} – ${a.amount} zł (${a.date})</div>
            <div>
                <button onclick="editAdvance(${a.id})">Edytuj</button>
                <button onclick="deleteAdvance(${a.id})">Usuń</button>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}
