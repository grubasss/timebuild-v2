document.addEventListener("DOMContentLoaded", () => {
    renderAllReports();
});

function renderAllReports(){
    renderWeeklyReport();
    renderCompanyReport();
}

// ===== WEEKLY =====

function renderWeeklyReport(){

    if(!document.getElementById("weeklyReport")) return;

    const today = getTodayLocal();
    const week = getWeekRangeSafe(today);

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    let html = `<h2>📅 Raport tygodniowy (${week.start} – ${week.end})</h2>`;

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

        const hours = entries.reduce((s,e)=>s + safeNumber(e.hours),0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s + safeNumber(a.amount),0);
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

// ===== COMPANY =====

function renderCompanyReport(){

    if(!document.getElementById("companyReport")) return;

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    let html = `<h2>📊 Podsumowanie całkowite</h2>`;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e => e.worker === worker.id);
        const advances = db.advances.filter(a => a.worker === worker.id);

        const hours = entries.reduce((s,e)=>s + safeNumber(e.hours),0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((s,a)=>s + safeNumber(a.amount),0);
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
