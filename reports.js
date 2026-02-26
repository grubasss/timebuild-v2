// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    loadDB();
    normalizeDB(); // 🔧 naprawa starych danych
    renderAll();
}

function renderAll() {
    renderStats();
    renderWeeklyReport();
    renderGlobalReport();
}

// ===== NORMALIZACJA (NAPRAWA iPhone + PRZECINKI) =====

function normalizeDB() {

    db.entries.forEach(e => {

        // godziny jako liczba
        if (typeof e.hours === "string") {
            e.hours = parseFloat(e.hours.replace(',', '.')) || 0;
        }

        // naprawa dat UTC
        if (e.date.includes("T")) {
            const d = new Date(e.date);
            e.date = formatLocal(d);
        }
    });

    db.advances.forEach(a => {

        if (typeof a.amount === "string") {
            a.amount = parseFloat(a.amount.replace(',', '.')) || 0;
        }

        if (a.date.includes("T")) {
            const d = new Date(a.date);
            a.date = formatLocal(d);
        }
    });

    saveDB();
}

// ===== POMOCNICZE =====

function formatLocal(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
}

function safeHours(val){
    return parseFloat(String(val).replace(',','.')) || 0;
}

// ===== STATYSTYKI =====

function renderStats() {

    let totalHours = db.entries.reduce((s,e)=>s + safeHours(e.hours),0);

    let totalEarned = db.entries.reduce((s,e)=>{
        const worker = db.workers.find(w=>w.id===e.worker);
        return s + (safeHours(e.hours) * worker.rate);
    },0);

    let totalAdvances = db.advances.reduce((s,a)=>s + safeHours(a.amount),0);

    document.getElementById("stats").innerHTML = `
        <b>Zarobione:</b> ${totalEarned.toFixed(2)} zł<br>
        <b>Zaliczki:</b> ${totalAdvances.toFixed(2)} zł<br>
        <b>Do wypłaty:</b> ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;
}

// ===== TYGODNIOWY =====

function getWeekRange(dateStr) {

    const date = new Date(dateStr + "T12:00:00"); // fix iOS UTC
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;

    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: formatLocal(monday),
        end: formatLocal(sunday)
    };
}

function renderWeeklyReport() {

    const now = new Date();
    const today = formatLocal(now);
    const week = getWeekRange(today);

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

        const hours = entries.reduce((s,e)=>s + safeHours(e.hours),0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s + safeHours(a.amount),0);
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

    html += `
        <hr>
        <b>Firma razem:</b><br>
        Godziny: ${totalHours}<br>
        Zarobione: ${totalEarned.toFixed(2)} zł<br>
        Zaliczki: ${totalAdvances.toFixed(2)} zł<br>
        Do wypłaty: ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;

    document.getElementById("weeklyReport").innerHTML = html;
}

// ===== GLOBALNY =====

function renderGlobalReport() {

    let html = `<h2>📊 Podsumowanie całkowite</h2>`;

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e => e.worker === worker.id);
        const advances = db.advances.filter(a => a.worker === worker.id);

        const hours = entries.reduce((s,e)=>s + safeHours(e.hours),0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s + safeHours(a.amount),0);
        const toPay = earned - advanceSum;

        totalHours += hours;
        totalEarned += earned;
        totalAdvances += advanceSum;

        html += `
            <div style="margin-bottom:15px;">
                <b>${worker.name}</b><br>
                Godziny łącznie: ${hours}<br>
                Zarobione: ${earned.toFixed(2)} zł<br>
                Zaliczki: ${advanceSum.toFixed(2)} zł<br>
                Do wypłaty: ${toPay.toFixed(2)} zł
            </div>
        `;
    });

    html += `
        <hr>
        <b>Firma razem:</b><br>
        Godziny: ${totalHours}<br>
        Zarobione: ${totalEarned.toFixed(2)} zł<br>
        Zaliczki: ${totalAdvances.toFixed(2)} zł<br>
        Do wypłaty: ${(totalEarned-totalAdvances).toFixed(2)} zł
    `;

    document.getElementById("companyReport").innerHTML = html;
}
