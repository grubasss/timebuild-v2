// ======================================================
// 🔥 FIRESTORE FULL DATABASE SYNC
// ======================================================

let isSyncingFromCloud = false;

document.addEventListener("DOMContentLoaded", () => {

    loadDB();

    // 🔥 Synchronizacja całej bazy
    cloudDB.collection("erp").doc("main")
    .onSnapshot((doc) => {

        if (!doc.exists) return;

        isSyncingFromCloud = true;

        db = doc.data();

        localStorage.setItem("erp-db", JSON.stringify(db));

        renderAll();

        setTimeout(() => {
            isSyncingFromCloud = false;
        }, 300);
    });

    init();
});

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());
let today = formatLocal(new Date());

function init() {

    const dateInput = document.getElementById("hoursDate");
    if(dateInput){
        dateInput.value = selectedDay;
    }

    renderAll();
}

// ======================================================
// 🔥 SAVE DB (LOCAL + FIRESTORE)
// ======================================================

function saveDB() {

    localStorage.setItem("erp-db", JSON.stringify(db));

    if (isSyncingFromCloud) return;

    cloudDB.collection("erp").doc("main").set(db);
}

// ======================================================
// MASTER RENDER
// ======================================================

function renderAll() {
    renderStats();
    renderWorkers();
   // renderProjects();
    renderSelectors();
    renderEntries();
    renderAdvances();
    renderCalendar();
    if (typeof updateCharts === "function") updateCharts();
}

// ======================================================
// GODZINY
// ======================================================

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

// ======================================================
// ZALICZKI
// ======================================================

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

// ======================================================
// STATYSTYKI
// ======================================================

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

// ======================================================
// WORKERS
// ======================================================

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

// ======================================================
// RESZTA TWOJEGO KODU (projekty, selektory, entries,
// advances, kalendarz, addWorker, editWorker, deleteWorker)
// ======================================================

/* --- TU WKLEJASZ RESZTĘ SWOJEGO KODU 1:1 BEZ ZMIAN --- */
