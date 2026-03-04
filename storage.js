const STORAGE_KEY = "houseERP_v2";
const STORAGE_VERSION = 2;

let db = null;

/* ===== LOAD ===== */

function loadDB(){

    const raw = localStorage.getItem(STORAGE_KEY);

    if(!raw) return null;

    try{

        const parsed = JSON.parse(raw);

        if(parsed.version !== STORAGE_VERSION){
            return null;
        }

        return parsed.data;

    }catch(e){

        return null;

    }

}

/* ===== SAVE ===== */

function saveDB(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            version: STORAGE_VERSION,
            data: db
        })
    );

}

/* ===== INIT ===== */

function initDB(initialData){

    const existing = loadDB();

    if(existing){

        db = existing;

    }else{

        db = initialData;
        saveDB();

    }

}

/* ===== EXPORT ===== */

function exportData(){

    const blob = new Blob(
        [JSON.stringify(db, null, 2)],
        { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "erp-backup.json";
    a.click();

}

/* ===== IMPORT ===== */

function importData(event){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        try{

            const parsed = JSON.parse(e.target.result);

            /* backup z telefonu */

            if(parsed.workers){

                db = parsed;

            }

            /* backup z wersją */

            else if(parsed.data){

                db = parsed.data;

            }

            else{

                alert("Niepoprawny format backupu");
                return;

            }

            localStorage.removeItem(STORAGE_KEY);

            saveDB();

            alert("Backup wczytany poprawnie!");

            location.reload();

        }

        catch(err){

            alert("Błąd pliku backupu");

        }

    };

    reader.readAsText(file);

}
