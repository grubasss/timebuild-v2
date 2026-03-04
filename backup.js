// ======================================================
// BACKUP SYSTEM + DATABASE FIX
// ======================================================


// ===== EXPORT BACKUP =====

function exportData(){

    let raw = null;

    // nowy system
    raw = localStorage.getItem("erpDB");

    // firebase system
    if(!raw){
        raw = localStorage.getItem("erp-db");
    }

    // stary system (twoje dane z telefonu)
    if(!raw){
        const old = localStorage.getItem("houseERP_v2");

        if(old){
            try{
                const parsed = JSON.parse(old);
                raw = JSON.stringify(parsed.data || parsed);
            }catch(e){}
        }
    }

    if(!raw){
        alert("Brak danych do backupu");
        return;
    }

    const blob = new Blob([raw], { type:"application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ERP_backup.json";
    a.click();
}



// ===== IMPORT BACKUP =====

function importData(event){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        try{

            const imported = JSON.parse(e.target.result);

            // zapis do wszystkich systemów
            localStorage.setItem("erpDB", JSON.stringify(imported));
            localStorage.setItem("erp-db", JSON.stringify(imported));

            localStorage.setItem("houseERP_v2", JSON.stringify({
                version:2,
                data:imported
            }));

            alert("Backup wczytany ✔");
            location.reload();

        }catch{

            alert("Niepoprawny plik backupu");

        }

    };

    reader.readAsText(file);
}



// ===== NAPRAWA BAZY =====

function fixWorkerIDs(){

let raw = localStorage.getItem("houseERP_v2");

if(!raw){
    alert("Nie znaleziono bazy");
    return;
}

let parsed = JSON.parse(raw);
let db = parsed.data || parsed;

const map = {

 "1772561610510":"w4", // Szczur
 "1772561630691":"w5"  // Błażej

};


// workers

db.workers = db.workers.map(w=>{
    if(map[w.id]) w.id = map[w.id];
    return w;
});


// entries

db.entries = db.entries.map(e=>{
    if(map[e.worker]) e.worker = map[e.worker];
    return e;
});


// advances

db.advances = db.advances.map(a=>{
    if(map[a.worker]) a.worker = map[a.worker];
    return a;
});


localStorage.setItem("houseERP_v2",JSON.stringify({
 version:2,
 data:db
}));


alert("Baza naprawiona ✔");

location.reload();

}
