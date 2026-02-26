let hoursChartInstance = null;
let moneyChartInstance = null;

function renderCharts() {

    if (!window.db) return;
    if (!window.Chart) return;

    const hoursCanvas = document.getElementById("hoursChart");
    const moneyCanvas = document.getElementById("moneyChart");

    if (!hoursCanvas || !moneyCanvas) return;

    const workerNames = db.workers.map(w => w.name);

    const hoursData = db.workers.map(w =>
        db.entries
            .filter(e => e.worker === w.id)
            .reduce((sum, e) => sum + Number(e.hours), 0)
    );

    const moneyData = db.workers.map((w, index) =>
        hoursData[index] * Number(w.rate)
    );

    if (hoursChartInstance) hoursChartInstance.destroy();
    if (moneyChartInstance) moneyChartInstance.destroy();

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
            responsive: true
        }
    });

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
            responsive: true
        }
    });

    console.log("Wykresy wyrenderowane");
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        renderCharts();
    }, 500);
});
