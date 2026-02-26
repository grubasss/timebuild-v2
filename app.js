// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();
});

let calendarDate = new Date();
let selectedDay = formatLocal(new Date());

function init() {
    loadDB();
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
    renderWeeklyReport();
    renderGlobalReport();
    renderMonthlyReport();
    renderAdvanceHistory();
    renderCalendar();
    if(typeof updateCharts === "function") updateCharts();
}

// ===== KALENDARZ =====

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

// ===== WORKERS WITH CHECKBOX =====

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
