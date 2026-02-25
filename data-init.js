const initialData = {
workers: [
    { id: "w1", name: "Łukasz", rate: 25 },
    { id: "w2", name: "Komuna", rate: 25 },
    { id: "w3", name: "Daniel", rate: 25 }
],

projects: [
    { id: "p1", name: "Hala" },
    { id: "p2", name: "Elewacja Łagów" }
],

entries: [
    // Luty 2026 - przykładowe rozpisanie 173.5h
    { date: "2026-02-16", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-16", worker: "w2", project: "p1", hours: 8 },
    { date: "2026-02-16", worker: "w3", project: "p2", hours: 4 },

    { date: "2026-02-17", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-17", worker: "w2", project: "p1", hours: 8 },

    { date: "2026-02-18", worker: "w1", project: "p1", hours: 6 },
    { date: "2026-02-18", worker: "w2", project: "p1", hours: 7.5 },

    { date: "2026-02-19", worker: "w1", project: "p1", hours: 5 },
    { date: "2026-02-19", worker: "w2", project: "p1", hours: 6 },

    { date: "2026-02-20", worker: "w1", project: "p1", hours: 3.9 },
    { date: "2026-02-20", worker: "w2", project: "p1", hours: 14 }
],

advances: [
    { worker: "w1", date: "2026-02-17", amount: 500 },
    { worker: "w1", date: "2026-02-19", amount: 140 },
    { worker: "w1", date: "2026-02-20", amount: 100 },

    { worker: "w2", date: "2026-02-18", amount: 100 },
    { worker: "w2", date: "2026-02-21", amount: 100 },

    { worker: "w3", date: "2026-02-17", amount: 1350 }
],

materials: [],
notes: ""
};

initDB(initialData);
