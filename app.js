// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    loadDB();
    renderAll();
    setTimeout(renderCalendar, 300);
}

// ===== MASTER RENDER =====

function renderAll() {
    renderStats();
    renderWorkers();
    renderProjects();
    renderSelectors();
    renderEntries();
    renderAdvances();
    renderWeeklyReport();
    renderGlobalReport();
    renderMonthlyReport();
    renderAdvanceHistory();
    renderCalendar();
    if(typeof updateCharts === "function") updateCharts();
}

// ===== RENDER WORKERS WITH CHECKBOX =====

function renderWorkers(){

    let html = "";

    db.workers.forEach(worker => {

        html += `
        <div class="row">
            <div>
                <input type="checkbox" 
                       class="worker-check" 
                       value="${worker.id}">
                <b>${worker.name}</b> (${worker.rate} zł/h)
            </div>
            <div>
                <button onclick="editWorker('${worker.id}')">Edytuj</button>
                <button onclick="deleteWorker('${worker.id}')">Usuń</button>
            </div>
        </div>
        `;
    });

    document.getElementById("workersList").innerHTML = html;
}

// ===== MASOWE GODZINY =====

function addHoursAll(){

    const project = document.getElementById("hoursProject").value;
    const date = document.getElementById("hoursDate").value;
    const hours = parseFloat(document.getElementById("hoursValue").value);

    db.workers.forEach(w=>{
        db.entries.push({
            id: Date.now() + Math.random(),
            worker: w.id,
            project,
            date,
            hours
        });
    });

    saveDB();
    renderAll();
}

function addHoursSelected(){

    const project = document.getElementById("hoursProject").value;
    const date = document.getElementById("hoursDate").value;
    const hours = parseFloat(document.getElementById("hoursValue").value);

    const selected = Array.from(
        document.querySelectorAll(".worker-check:checked")
    ).map(el => el.value);

    selected.forEach(id=>{
        db.entries.push({
            id: Date.now() + Math.random(),
            worker: id,
            project,
            date,
            hours
        });
    });

    saveDB();
    renderAll();
}
