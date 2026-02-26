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

// ===== TYGODNIOWY (LOKALNY - POPRAWIONY) =====

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

// ===== KALENDARZ ERP =====

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

function renderCalendar(){

    const calendar = document.getElementById("calendar");
    const label = document.getElementById("monthLabel");
    const daysRow = document.getElementById("calendarDays");

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

        const weekday = date.getDay();

        if(weekday === 0 || weekday === 6){
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
            renderCalendar();
        };

        calendar.appendChild(el);
    }
}

// ===== STEROWANIE MIESIĄCEM =====

document.addEventListener("DOMContentLoaded", () => {

    const prev = document.getElementById("prevMonth");
    const next = document.getElementById("nextMonth");

    if(prev) prev.onclick = ()=>{
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    };

    if(next) next.onclick = ()=>{
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    };

});

// ===== AUTO ODŚWIEŻANIE =====

const originalAddHours = window.addHours;
window.addHours = function(){
    originalAddHours();
    renderCalendar();
    renderWeeklyReport();
    renderStats();
};
