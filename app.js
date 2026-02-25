// ====== RAPORTY ======

function getWeekRange(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;

    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().slice(0,10),
        end: sunday.toISOString().slice(0,10)
    };
}

function inRange(date, start, end) {
    return date >= start && date <= end;
}

function renderWeeklyReport() {
    const today = new Date().toISOString().slice(0,10);
    const week = getWeekRange(today);

    let html = `<h2>📅 Raport tygodniowy (${week.start} – ${week.end})</h2>`;

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e =>
            e.worker === worker.id &&
            inRange(e.date, week.start, week.end)
        );

        const advances = db.advances.filter(a =>
            a.worker === worker.id &&
            inRange(a.date, week.start, week.end)
        );

        const hours = entries.reduce((sum,e)=>sum+e.hours,0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((sum,a)=>sum+a.amount,0);
        const toPay = earned - advanceSum;

        totalHours += hours;
        totalEarned += earned;
        totalAdvances += advanceSum;

        html += `
        <div class="reportBox">
            <b>${worker.name}</b><br>
            Godziny: ${hours}<br>
            Zarobione: ${earned} zł<br>
            Zaliczki: ${advanceSum} zł<br>
            Do wypłaty: ${toPay} zł
        </div>`;
    });

    html += `
    <hr>
    <b>Firma razem:</b><br>
    Godziny: ${totalHours}<br>
    Zarobione: ${totalEarned} zł<br>
    Zaliczki: ${totalAdvances} zł<br>
    Do wypłaty: ${totalEarned - totalAdvances} zł
    `;

    document.getElementById("weeklyReport").innerHTML = html;
}

function renderGlobalReport() {

    let totalHours = 0;
    let totalEarned = 0;
    let totalAdvances = 0;

    db.workers.forEach(worker => {

        const entries = db.entries.filter(e => e.worker === worker.id);
        const advances = db.advances.filter(a => a.worker === worker.id);

        const hours = entries.reduce((sum,e)=>sum+e.hours,0);
        const earned = hours * worker.rate;
        const advanceSum = advances.reduce((sum,a)=>sum+a.amount,0);
        const toPay = earned - advanceSum;

        totalHours += hours;
        totalEarned += earned;
        totalAdvances += advanceSum;

        document.getElementById("payouts").innerHTML += `
        <div class="reportBox">
            <b>${worker.name}</b><br>
            Godziny łącznie: ${hours}<br>
            Zarobione: ${earned} zł<br>
            Zaliczki: ${advanceSum} zł<br>
            Do wypłaty: ${toPay} zł
        </div>`;
    });

    document.getElementById("companyReport").innerHTML = `
    <h2>📊 Firma łącznie</h2>
    Godziny: ${totalHours}<br>
    Zarobione: ${totalEarned} zł<br>
    Zaliczki: ${totalAdvances} zł<br>
    Do wypłaty: ${totalEarned - totalAdvances} zł
    `;
}
