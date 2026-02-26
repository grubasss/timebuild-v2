// ===== EXPORT =====

function exportData(){

    const raw = localStorage.getItem("erpDB");

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

            localStorage.setItem("erpDB", JSON.stringify(imported));

            alert("Backup wczytany!");
            location.reload();

        }catch{
            alert("Niepoprawny plik backupu");
        }
    };

    reader.readAsText(file);
}
