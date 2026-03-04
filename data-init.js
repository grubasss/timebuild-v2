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
    { date: "2026-02-04", worker: "w3", project: "p2", hours: 6 },

    { date: "2026-02-05", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-05", worker: "w2", project: "p1", hours: 8 },
    { date: "2026-02-05", worker: "w3", project: "p2", hours: 6 },

    { date: "2026-02-06", worker: "w1", project: "p1", hours: 6 },
    { date: "2026-02-06", worker: "w2", project: "p1", hours: 6 },
    { date: "2026-02-06", worker: "w3", project: "p2", hours: 4 },

    { date: "2026-02-09", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-09", worker: "w2", project: "p1", hours: 8 },
    { date: "2026-02-09", worker: "w3", project: "p2", hours: 5 },

    { date: "2026-02-10", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-10", worker: "w2", project: "p1", hours: 8 },
    { date: "2026-02-10", worker: "w3", project: "p2", hours: 5 },

    { date: "2026-02-11", worker: "w1", project: "p1", hours: 7 },
    { date: "2026-02-11", worker: "w2", project: "p1", hours: 7 },
    { date: "2026-02-11", worker: "w3", project: "p2", hours: 5 },

    { date: "2026-02-12", worker: "w1", project: "p1", hours: 8 },
    { date: "2026-02-12", worker: "w2", project: "p1", hours: 8 },
    { date: "2026-02-12", worker: "w3", project: "p2", hours: 5 },

    { date: "2026-02-13", worker: "w1", project: "p1", hours: 6 },
    { date: "2026-02-13", worker: "w2", project: "p1", hours: 6 },
    { date: "2026-02-13", worker: "w3", project: "p2", hours: 3.5 }
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
