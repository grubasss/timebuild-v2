// ===============================
// GODZINY / PROJEKTY / SELECTORY
// ===============================

// ===== SELECTORY =====

function renderSelectors() {
    const workerSelect = document.getElementById("hoursWorker");
    const projectSelect = document.getElementById("hoursProject");

    if (!workerSelect || !projectSelect) return;

    workerSelect.innerHTML = "";
    projectSelect.innerHTML = "";

    db.workers.forEach(w => {
        const option = document.createElement("option");
        option.value = w.id;
        option.textContent = w.name;
        workerSelect.appendChild(option);
    });

    db.projects?.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.name;
        projectSelect.appendChild(option);
    });
}

// ===== PROJEKTY =====

function renderProjects() {
    const container = document.getElementById("projectsList");
    if (!container) return;

    container.innerHTML = "";

    db.projects?.forEach(p => {
        const div = document.createElement("div");
        div.textContent = p.name;
        container.appendChild(div);
    });
}

// ===== WPISY GODZIN =====

function renderEntries() {
    const container = document.getElementById("entriesList");
    if (!container) return;

    container.innerHTML = "";

    db.entries.forEach(e => {
        const worker = db.workers.find(w => w.id === e.worker);
        const project = db.projects?.find(p => p.id === e.project);

        const div = document.createElement("div");
        div.className = "entry-row";
        div.innerHTML = `
            <strong>${worker?.name || "?"}</strong> 
            - ${project?.name || "Brak projektu"} 
            - ${e.hours}h 
            (${e.date})
            <button onclick="deleteEntry('${e.id}')">Usuń</button>
        `;

        container.appendChild(div);
    });
}

// ===== DODAWANIE GODZIN =====

function addHours() {
    const worker = document.getElementById("hoursWorker")?.value;
    const project = document.getElementById("hoursProject")?.value;
    const hours = parseFloat(document.getElementById("hoursValue")?.value);
    const date = selectedDay;

    if (!worker || !hours) return;

    db.entries.push({
        id: Date.now().toString(),
        worker,
        project,
        hours,
        date
    });

    saveDB();
    renderAll();
}

// ===== USUWANIE =====

function deleteEntry(id) {
    if (!confirm("Usunąć wpis?")) return;

    db.entries = db.entries.filter(e => e.id !== id);

    saveDB();
    renderAll();
}
// ===== ZALICZKI =====

function renderAdvances() {
    const container = document.getElementById("advancesList");
    if (!container) return;

    container.innerHTML = "";

    db.advances.forEach(a => {
        const worker = db.workers.find(w => w.id === a.worker);

        const div = document.createElement("div");
        div.className = "advance-row";
        div.innerHTML = `
            <strong>${worker?.name || "?"}</strong>
            - ${a.amount} zł
            (${a.date})
            <button onclick="deleteAdvance('${a.id}')">Usuń</button>
        `;

        container.appendChild(div);
    });
}

function deleteAdvance(id) {
    if (!confirm("Usunąć zaliczkę?")) return;

    db.advances = db.advances.filter(a => a.id !== id);

    saveDB();
    renderAll();
}
