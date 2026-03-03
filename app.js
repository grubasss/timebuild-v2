// ======================================================
// 🔥 FIRESTORE FULL DATABASE SYNC (STABLE VERSION)
// ======================================================

let isSyncingFromCloud = false;

document.addEventListener("DOMContentLoaded", () => {

    loadDB();

    // 🔥 Nasłuch całej bazy
    cloudDB.collection("erp").doc("main")
    .onSnapshot((doc) => {

        if (!doc.exists) return;

        isSyncingFromCloud = true;

        db = doc.data();

        // backup lokalny
        localStorage.setItem("erp-db", JSON.stringify(db));

        renderAll();

        setTimeout(() => {
            isSyncingFromCloud = false;
        }, 300);
    });

    init();
});
