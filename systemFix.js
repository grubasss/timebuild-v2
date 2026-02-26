// ===== GLOBAL FIX =====

// liczby odporne na przecinki
function safeNumber(val){
    return parseFloat(String(val).replace(',','.')) || 0;
}

// lokalna data (naprawa iPhone UTC)
function formatLocal(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
}

// dzisiaj lokalnie
function getTodayLocal(){
    return formatLocal(new Date());
}

// zakres tygodnia
function getWeekRangeSafe(dateStr){

    const date = new Date(dateStr + "T12:00:00");
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

// auto naprawa bazy
function normalizeDB(){

    if(!db) return;

    db.entries.forEach(e => {
        if (typeof e.hours === "string") {
            e.hours = safeNumber(e.hours);
        }
        if (e.date && e.date.includes("T")) {
            e.date = formatLocal(new Date(e.date));
        }
    });

    db.advances.forEach(a => {
        if (typeof a.amount === "string") {
            a.amount = safeNumber(a.amount);
        }
        if (a.date && a.date.includes("T")) {
            a.date = formatLocal(new Date(a.date));
        }
    });

    saveDB();
}

document.addEventListener("DOMContentLoaded", () => {
    if(typeof db !== "undefined"){
        normalizeDB();
    }
});
