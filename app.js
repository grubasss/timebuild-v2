// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    loadDB();
    renderAll();
    setTimeout(renderCalendar, 300);
}

function renderAll() {
    renderStats();
    renderWeeklyReport();
    renderGlobalReport();
    renderMonthlyReport();
    renderAdvanceHistory();
    renderCalendar();
}

// ===== STATYSTYKI =====

function renderStats() {

    let totalHours = db.entries.reduce((s,e)=>s+e.hours,0);
    let totalEarned = db.entries.reduce((s,e)=>{
        const worker = db.workers.find(w=>w.id===e.worker);
        return s + (e.hours * worker.rate);
    },0);
    let totalAdvances = db.advances.reduce((s,a)=>s+a.amount,0);

    document.getElementById("stats").innerHTML = `
        <b>Zarobione:</b> ${totalEarned.toFixed(2)} zł<br>
        <b>Zaliczki:</b> ${totalAdvances.toFixed(2)} zł<br>
        <b>Do wypłaty:</b> ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;
}

// ===== FUNKCJA TYGODNIOWA FINANSE =====

function getWeeklyFinance(){

    const today = getTodayLocal();
    const week = getWeekRangeSafe(today);

    let advancesWeek = db.advances.filter(a =>
        a.date >= week.start &&
        a.date <= week.end
    );

    return advancesWeek.reduce((s,a)=>s+a.amount,0);
}

// ===== RAPORT TYGODNIOWY =====

function renderWeeklyReport() {

    const today = getTodayLocal();
    const week = getWeekRangeSafe(today);

    let html = `<h2>📅 Raport tygodniowy (${week.start} – ${week.end})</h2>`;

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e =>
            e.worker === worker.id &&
            e.date >= week.start &&
            e.date <= week.end
        );

        const advances = db.advances.filter(a =>
            a.worker === worker.id &&
            a.date >= week.start &&
            a.date <= week.end
        );

        const hours = entries.reduce((s,e)=>s+e.hours,0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s+a.amount,0);
        const toPay = earned - advanceSum;

        totalHours += hours;
        totalEarned += earned;
        totalAdvances += advanceSum;

        html += `
            <div style="margin-bottom:15px;">
                <b>${worker.name}</b><br>
                Godziny: ${hours}<br>
                Zarobione: ${earned.toFixed(2)} zł<br>
                Zaliczki: ${advanceSum.toFixed(2)} zł<br>
                Do wypłaty: ${toPay.toFixed(2)} zł
            </div>
        `;
    });

    let weeklyAdvances = getWeeklyFinance();

    html += `
        <hr>
        <h3>📊 Podsumowanie tygodnia</h3>
        <b>Godziny w tygodniu:</b> ${totalHours}<br>
        <b>Zarobione:</b> ${totalEarned.toFixed(2)} zł<br>
        <b>Zaliczki w tygodniu:</b> ${weeklyAdvances.toFixed(2)} zł<br>
        <b>Do wypłaty:</b> ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;

    document.getElementById("weeklyReport").innerHTML = html;
}

// ===== RAPORT GLOBALNY =====

function renderGlobalReport() {

    let html = `<h2>📊 Podsumowanie całkowite</h2>`;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e => e.worker === worker.id);
        const advances = db.advances.filter(a => a.worker === worker.id);

        const hours = entries.reduce((s,e)=>s+e.hours,0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s+a.amount,0);

        html += `
            <div style="margin-bottom:15px;">
                <b>${worker.name}</b><br>
                Godziny łącznie: ${hours}<br>
                Zarobione: ${earned.toFixed(2)} zł<br>
                Zaliczki: ${advanceSum.toFixed(2)} zł<br>
                Do wypłaty: ${(earned-advanceSum).toFixed(2)} zł
            </div>
        `;
    });

    document.getElementById("companyReport").innerHTML = html;
}

// ===== RAPORT MIESIĘCZNY =====

function renderMonthlyReport(){

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth()+1).padStart(2,'0');

    let start = `${year}-${month}-01`;
    let end = `${year}-${month}-31`;

    let html = `<h2>📆 Raport miesięczny</h2>`;

    db.workers.forEach(worker=>{

        const entries = db.entries.filter(e =>
            e.worker===worker.id &&
            e.date>=start &&
            e.date<=end
        );

        const advances = db.advances.filter(a =>
            a.worker===worker.id &&
            a.date>=start &&
            a.date<=end
        );

        const hours = entries.reduce((s,e)=>s+e.hours,0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s+a.amount,0);

        html += `
        <div style="margin-bottom:15px;">
            <b>${worker.name}</b><br>
            Godziny: ${hours}<br>
            Zarobione: ${earned.toFixed(2)} zł<br>
            Zaliczki: ${advanceSum.toFixed(2)} zł<br>
            Do wypłaty: ${(earned-advanceSum).toFixed(2)} zł
        </div>
        `;
    });

    document.getElementById("companyReport").innerHTML += html;
}

// ===== HISTORIA ZALICZEK =====

function renderAdvanceHistory(){

    let html = `<h2>💵 Historia zaliczek</h2>`;

    db.advances.forEach(a=>{
        const worker = db.workers.find(w=>w.id===a.worker);

        html += `
            <div class="row">
                <div>
                    <b>${worker.name}</b><br>
                    ${a.date}
                </div>
                <div>${a.amount} zł</div>
            </div>
        `;
    });

    document.getElementById("advancesList").innerHTML = html;
}

// ===== EDYCJA PRACOWNIKA =====

function editWorker(id){
    const worker = db.workers.find(w=>w.id===id);
    const name = prompt("Imię:", worker.name);
    const rate = prompt("Stawka:", worker.rate);

    if(!name || !rate) return;

    worker.name = name;
    worker.rate = parseFloat(rate);

    saveDB();
    renderAll();
}

function deleteWorker(id){
    if(!confirm("Usunąć pracownika?")) return;

    db.workers = db.workers.filter(w=>w.id!==id);
    db.entries = db.entries.filter(e=>e.worker!==id);
    db.advances = db.advances.filter(a=>a.worker!==id);

    saveDB();
    renderAll();
}

// ===== EDYCJA PROJEKTU =====

function editProject(id){
    const project = db.projects.find(p=>p.id===id);
    const name = prompt("Nazwa projektu:", project.name);

    if(!name) return;

    project.name = name;
    saveDB();
    renderAll();
}

function deleteProject(id){
    if(!confirm("Usunąć projekt?")) return;

    db.projects = db.projects.filter(p=>p.id!==id);
    db.entries = db.entries.filter(e=>e.project!==id);

    saveDB();
    renderAll();
}
