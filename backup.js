function waitForDB(callback){

    let tries = 0;

    const interval = setInterval(()=>{

        if(window.db && db.workers){
            clearInterval(interval);
            callback();
        }

        tries++;
        if(tries > 20){
            clearInterval(interval);
            alert("DB nie została załadowana");
        }

    }, 200);
}

// ===== EXPORT =====

function exportData(){

    waitForDB(()=>{

        if(!db || !db.workers || db.workers.length === 0){
            alert("Brak danych do backupu");
            return;
        }

        const dataStr = JSON.stringify(db, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ERP_backup.json";
        a.click();

    });
}

// ===== IMPORT =====

function importData(event){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
        try{
            const imported = JSON.parse(e.target.result);

            localStorage.setItem("erpDB", JSON.stringify(imported));

            alert("Backup wczytany!");
            location.reload();

        }catch{
            alert("Niepoprawny plik backupu");
        }
    };

    reader.readAsText(file);
}
