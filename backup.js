// ======================================================
// BACKUP SYSTEM (AUTO-DETECT DATABASE)
// ======================================================

// ===== EXPORT =====

function exportData(){

    let raw = null;

    // 1️⃣ Nowy system
    raw = localStorage.getItem("erpDB");

    // 2️⃣ Firebase system
    if(!raw){
        raw = localStorage.getItem("erp-db");
    }

    // 3️⃣ Stary system (twoje dane z telefonu)
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

    const blob = new Blob([raw], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ERP_backup.json";
    a.click();
}



// ===== IMPORT =====

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
                version: 2,
                data: imported
            }));

            alert("Backup wczytany!");
            location.reload();

        }catch{

            alert("Niepoprawny plik backupu");

        }

    };

    reader.readAsText(file);
}
