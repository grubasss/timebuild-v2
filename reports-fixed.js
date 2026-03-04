document.addEventListener("DOMContentLoaded", () => {
setTimeout(()=>{
renderAllReports();
},300);
});

function renderAllReports(){

if(typeof db === "undefined") return;

renderWeeklyReport();
renderCompanyReport();

}

/* ===== SAFE NUMBER ===== */

function safeNumber(val){
return parseFloat(String(val).replace(",", ".")) || 0;
}

/* ===== WEEK RANGE ===== */

function getWeekRangeSafe(dateStr){

const d = new Date(dateStr);
const day = (d.getDay()+6)%7;

const start = new Date(d);
start.setDate(d.getDate()-day);

const end = new Date(start);
end.setDate(start.getDate()+6);

return{
start:formatLocal(start),
end:formatLocal(end)
};

}

/* ===== WEEKLY REPORT ===== */

function renderWeeklyReport(){

const el=document.getElementById("weeklyReport");
if(!el) return;

const today=getTodayLocal();
const week=getWeekRangeSafe(today);

let totalHours=0;
let totalEarned=0;
let totalAdvances=0;

let html=`<h2>📅 Raport tygodniowy (${week.start} – ${week.end})</h2>`;

db.workers.forEach(worker=>{

const entries=db.entries.filter(e=>
e.worker==worker.id &&
e.date>=week.start &&
e.date<=week.end
);

const advances=db.advances.filter(a=>
a.worker==worker.id &&
a.date>=week.start &&
a.date<=week.end
);

const hours=entries.reduce((s,e)=>s+safeNumber(e.hours),0);
const earned=hours*safeNumber(worker.rate);
const advanceSum=advances.reduce((s,a)=>s+safeNumber(a.amount),0);
const toPay=earned-advanceSum;

totalHours+=hours;
totalEarned+=earned;
totalAdvances+=advanceSum;

let status="🟢";

if(toPay<0) status="🔴";
else if(advanceSum>earned*0.7) status="🟡";

html+=`
<div class="card">
<b>${status} ${worker.name}</b><br>
Godziny: ${hours}<br>
Zarobione: ${earned.toFixed(2)} zł<br>
Zaliczki: ${advanceSum.toFixed(2)} zł<br>
<b>Do wypłaty: ${toPay.toFixed(2)} zł</b>
</div>
`;

});

html+=`

<div class="card">

<h3>🏢 Firma razem</h3>

Godziny: ${totalHours}<br>
Zarobione: ${totalEarned.toFixed(2)} zł<br>
Zaliczki: ${totalAdvances.toFixed(2)} zł<br>

<b>Do wypłaty: ${(totalEarned-totalAdvances).toFixed(2)} zł</b>

</div>

`;

el.innerHTML=html;

}

/* ===== COMPANY REPORT ===== */

function renderCompanyReport(){

const el=document.getElementById("companyReport");
if(!el) return;

let totalHours=0;
let totalEarned=0;
let totalAdvances=0;

let html=`<h2>📊 Podsumowanie całkowite</h2>`;

db.workers.forEach(worker=>{

const entries=db.entries.filter(e=>e.worker==worker.id);
const advances=db.advances.filter(a=>a.worker==worker.id);

const hours=entries.reduce((s,e)=>s+safeNumber(e.hours),0);
const earned=hours*safeNumber(worker.rate);
const advanceSum=advances.reduce((s,a)=>s+safeNumber(a.amount),0);
const toPay=earned-advanceSum;

totalHours+=hours;
totalEarned+=earned;
totalAdvances+=advanceSum;

let status="🟢";

if(toPay<0) status="🔴";
else if(advanceSum>earned*0.7) status="🟡";

html+=`

<div class="card">

<b>${status} ${worker.name}</b><br>

Godziny łącznie: ${hours}<br>
Zarobione: ${earned.toFixed(2)} zł<br>
Zaliczki: ${advanceSum.toFixed(2)} zł<br>

<b>Do wypłaty: ${toPay.toFixed(2)} zł</b>

</div>

`;

});

html+=`

<div class="card">

<h3>🏢 Firma razem</h3>

Godziny: ${totalHours}<br>
Zarobione: ${totalEarned.toFixed(2)} zł<br>
Zaliczki: ${totalAdvances.toFixed(2)} zł<br>

<b>Do wypłaty: ${(totalEarned-totalAdvances).toFixed(2)} zł</b>

</div>

`;

el.innerHTML=html;

}
