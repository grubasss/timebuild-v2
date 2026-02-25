let hoursChartInstance = null;
let moneyChartInstance = null;

function renderCharts() {

    const ctxHours = document.getElementById("hoursChart").getContext("2d");
    const ctxMoney = document.getElementById("moneyChart").getContext("2d");

    const workerNames = db.workers.map(w => w.name);

    const hoursData = db.workers.map(w =>
        db.entries
            .filter(e => e.worker === w.id)
            .reduce((sum, e) => sum + e.hours, 0)
    );

    const moneyData = db.workers.map((w, index) =>
        hoursData[index] * w.rate
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
            plugins: { legend: { display: true } }
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
            plugins: { legend: { display: true } }
        }
    });
}

function initCharts() {
    renderCharts();
}
