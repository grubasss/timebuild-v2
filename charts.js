let hoursChartInstance = null;
let moneyChartInstance = null;

function renderCharts() {

    // Sprawdzenie czy istnieje db i Chart
    if (typeof db === "undefined") return;
    if (typeof Chart === "undefined") return;

    const hoursCanvas = document.getElementById("hoursChart");
    const moneyCanvas = document.getElementById("moneyChart");

    if (!hoursCanvas || !moneyCanvas) return;

    // Jeśli brak pracowników – nie renderuj
    if (!db.workers || db.workers.length === 0) return;

    const workerNames = db.workers.map(w => w.name);

    const hoursData = db.workers.map(w =>
        (db.entries || [])
            .filter(e => e.worker === w.id)
            .reduce((sum, e) => sum + Number(e.hours || 0), 0)
    );

    const moneyData = db.workers.map((w, index) =>
        hoursData[index] * Number(w.rate || 0)
    );

    // Niszczenie starych wykresów
    if (hoursChartInstance) {
        hoursChartInstance.destroy();
    }

    if (moneyChartInstance) {
        moneyChartInstance.destroy();
    }

    // Wykres godzin
    hoursChartInstance = new Chart(hoursCanvas, {
        type: "bar",
        data: {
            labels: workerNames,
            datasets: [{
                label: "Godziny",
                data: hoursData,
                backgroundColor: "#5fa68a"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Wykres zarobków
    moneyChartInstance = new Chart(moneyCanvas, {
        type: "bar",
        data: {
            labels: workerNames,
            datasets: [{
                label: "Zarobek (zł)",
                data: moneyData,
                backgroundColor: "#2f6f5e"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    console.log("Wykresy wyrenderowane");
}


// Uruchom po pełnym załadowaniu strony
window.addEventListener("load", () => {
    renderCharts();
});
