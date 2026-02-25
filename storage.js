const STORAGE_KEY = "houseERP_v2";
const STORAGE_VERSION = 2;

let db = null;

function loadDB() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (parsed.version !== STORAGE_VERSION) return null;
        return parsed.data;
    } catch (e) {
        return null;
    }
}

function saveDB() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            version: STORAGE_VERSION,
            data: db
        })
    );
}

function initDB(initialData) {
    const existing = loadDB();

    if (existing) {
        db = existing;
    } else {
        db = initialData;
        saveDB();
    }
}

function exportData() {
    const blob = new Blob(
        [JSON.stringify({ version: STORAGE_VERSION, data: db }, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "erp-backup.json";
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const parsed = JSON.parse(reader.result);
        if (parsed.version === STORAGE_VERSION) {
            db = parsed.data;
            saveDB();
            location.reload();
        } else {
            alert("Niepoprawna wersja backupu.");
        }
    };

    reader.readAsText(file);
}
