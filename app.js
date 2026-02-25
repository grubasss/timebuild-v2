let currentDate = new Date();

function render() {
    renderStats();
    renderCalendar();
    renderWorkers();
    renderProjects();
    renderSelectors();
    renderAdvances();
    renderPayouts();
}

function renderStats() {
    let earned = 0;
    let advancesTotal = 0;

    db.entries.forEach(e => {
        const worker = db.workers.find(w => w.id === e.worker);
        if (worker) earned += e.hours * worker.rate;
    });

    db.advances.forEach(a => advancesTotal += a.amount);

    document.getElementById("stats").innerHTML = `
        <b>Zarobione:</b> ${earned.toFixed(2)} zł<br>
        <b>Zaliczki:</b> ${advancesTotal.toFixed(2)} zł<br>
        <b>Do wypłaty:</b> ${(earned - advancesTotal).toFixed(2)} zł
    `;
}

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    document.getElementById("monthLabel").innerText =
        firstDay.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });

    let startOffset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < startOffset; i++) {
        calendar.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEntries = db.entries.filter(e => e.date === dateStr);

        const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
        const isToday = new Date().toDateString() === new Date(dateStr).toDateString();

        calendar.innerHTML += `
            <div class="day ${isWeekend ? "weekend" : ""} ${isToday ? "today" : ""}">
                ${day}
                ${dayEntries.length ? '<div class="dot"></div>' : ''}
            </div>
        `;
    }
}

function renderWorkers() {
    const container = document.getElementById("workersList");
    container.innerHTML = "";

    db.workers.forEach(w => {
        container.innerHTML += `
            <div class="row">
                <input value="${w.name}" onchange="updateWorker('${w.id}', this.value, ${w.rate})">
                <input type="number" value="${w.rate}" onchange="updateWorker('${w.id}', '${w.name}', this.value)">
                <button onclick="deleteWorker('${w.id}')">✖</button>
            </div>
        `;
    });
}

function renderProjects() {
    const container = document.getElementById("projectsList");
    container.innerHTML = "";

    db.projects.forEach(p => {
        container.innerHTML += `
            <div class="row">
                ${p.name}
                <button onclick="deleteProject('${p.id}')">✖</button>
            </div>
        `;
    });
}

function renderSelectors() {
    const workerSelect = document.getElementById("hoursWorker");
    const advanceSelect = document.getElementById("advanceWorker");
    const projectSelect = document.getElementById("hoursProject");

    workerSelect.innerHTML = "";
    advanceSelect.innerHTML = "";
    projectSelect.innerHTML = "";

    db.workers.forEach(w => {
        workerSelect.innerHTML += `<option value="${w.id}">${w.name}</option>`;
        advanceSelect.innerHTML += `<option value="${w.id}">${w.name}</option>`;
    });

    db.projects.forEach(p => {
        projectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
}

function renderAdvances() {
    const container = document.getElementById("advancesList");
    container.innerHTML = "";

    db.advances.forEach(a => {
        const worker = db.workers.find(w => w.id === a.worker);
        container.innerHTML += `
            <div class="row">
                ${worker?.name} – ${a.amount} zł (${a.date})
            </div>
        `;
    });
}

function renderPayouts() {
    const container = document.getElementById("payouts");
    container.innerHTML = "";

    db.workers.forEach(w => {
        const workerHours = db.entries
            .filter(e => e.worker === w.id)
            .reduce((sum, e) => sum + e.hours, 0);

        const workerAdv = db.advances
            .filter(a => a.worker === w.id)
            .reduce((sum, a) => sum + a.amount, 0);

        const earned = workerHours * w.rate;

        container.innerHTML += `
            <div class="row">
                ${w.name}: ${(earned - workerAdv).toFixed(2)} zł
            </div>
        `;
    });
}

function addWorker() {
    db.workers.push({
        id: crypto.randomUUID(),
        name: workerName.value,
        rate: +workerRate.value
    });
    saveDB();
    render();
}

function updateWorker(id, name, rate) {
    const w = db.workers.find(w => w.id === id);
    if (w) {
        w.name = name;
        w.rate = +rate;
        saveDB();
        render();
    }
}

function deleteWorker(id) {
    db.workers = db.workers.filter(w => w.id !== id);
    saveDB();
    render();
}

function addProject() {
    db.projects.push({
        id: crypto.randomUUID(),
        name: projectName.value
    });
    saveDB();
    render();
}

function deleteProject(id) {
    db.projects = db.projects.filter(p => p.id !== id);
    saveDB();
    render();
}

function addHoursSingle() {
    db.entries.push({
        date: hoursDate.value,
        worker: hoursWorker.value,
        project: hoursProject.value,
        hours: +hoursValue.value
    });
    saveDB();
    render();
}

function addHoursAll() {
    db.workers.forEach(w => {
        db.entries.push({
            date: hoursDate.value,
            worker: w.id,
            project: hoursProject.value,
            hours: +hoursValue.value
        });
    });
    saveDB();
    render();
}

function addAdvance() {
    db.advances.push({
        worker: advanceWorker.value,
        date: advanceDate.value,
        amount: +advanceValue.value
    });
    saveDB();
    render();
}

render();
