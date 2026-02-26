// ===== BACKUP EXPORT =====

function exportData(){

    if(!window.db){
        alert("Brak danych");
        return;
    }

    const dataStr = JSON.stringify(db, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ERP_backup.json";
    a.click();
}

// ===== BACKUP IMPORT =====

function importData(event){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        try{
            const imported = JSON.parse(e.target.result);

            if(!imported.workers || !imported.projects){
                alert("Niepoprawny plik backup");
                return;
            }

            db = imported;
            saveDB();

            alert("Backup przywrócony ✔");

            if(typeof renderAll === "function"){
                renderAll();
            }

        }catch(err){
            alert("Błąd odczytu backupu");
        }
    };

    reader.readAsText(file);
}
