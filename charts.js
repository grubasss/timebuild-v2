let hoursChartInstance = null;
let moneyChartInstance = null;

function renderCharts() {

    if (!window.db) return;

    const hoursCanvas = document.getElementById("hoursChart");
    const moneyCanvas = document.getElementById("moneyChart");

    if (!hoursCanvas || !moneyCanvas) return;

    const ctxHours = hoursCanvas.getContext("2d");
    const ctxMoney = moneyCanvas.getContext("2d");

    const workerNames = db.workers.map(w => w.name);

    const hoursData = db.workers.map(w =>
        db.entries
            .filter(e => e.worker === w.id)
            .reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0)
    );

    const moneyData = db.workers.map((w, index) =>
        hoursData[index] * (parseFloat(w.rate) || 0)
    );

    if (hoursChartInstance) hoursChartInstance.destroy();
    if (moneyChartInstance) moneyChartInstance.destroy();

    hoursChartInstance = new Chart(ctxHours, {
        type: "bar",
        data: {
            labels: workerNames,
            datasets: [{
                label: "Godziny",
                data: hoursData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    moneyChartInstance = new Chart(ctxMoney, {
        type: "bar",
        data: {
            labels: workerNames,
            datasets: [{
                label: "Zarobek (zł)",
                data: moneyData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initCharts() {
    setTimeout(() => {
        renderCharts();
    }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
    initCharts();
});
