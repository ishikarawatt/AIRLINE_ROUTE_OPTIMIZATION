# ✈️ Airline Shortest Path Finder

> A sleek, full-stack web app for finding optimal flight routes across 15 major Indian airports — powered by Dijkstra's and Bellman-Ford algorithms, with an interactive map and downloadable tickets.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🗺️ Interactive Map | Animated flight paths rendered with Leaflet.js |
| 🧠 Dual Algorithms | Dijkstra (fast) and Bellman-Ford (handles subsidies/negative weights) |
| 💰 Cost & Distance Modes | Optimize routes by fare or by kilometers |
| 🎫 Downloadable Ticket | Export your flight summary as a PNG image |
| 🌓 Theme Toggle | Switch between dark and light mode |
| 🎨 Glassmorphism UI | Modern dark interface with smooth animations |
| 📱 Responsive | Works seamlessly across all screen sizes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14+ and `npm`
- A static file server (VS Code Live Server, or `npx serve`)

---

### 1 — Start the Backend

```bash
cd backend
npm install
npm start
```

The API will be available at `http://localhost:5000`

---

### 2 — Serve the Frontend

**Option A — `npx serve`**
```bash
cd frontend
npx serve
```
Then open the URL shown in your terminal (e.g. `http://localhost:3000`).

**Option B — VS Code Live Server**
Right-click `index.html` → **Open with Live Server**  
(default: `http://127.0.0.1:5500`)

---

### 3 — Use the App

1. Open `index.html` and click **Get Started**
2. On `find.html`, select your optimization type, algorithm, origin, and destination
3. Click **Find Shortest Path** to view your route on the map
4. Click **Download Ticket** to save your flight summary as a PNG

---

## 🧠 Algorithm Guide

### Dijkstra's Algorithm
Explores the graph greedily using a min-priority queue. Guarantees the optimal path for non-negative weights. Best for standard distance or price optimization.

- ⚡ **Fast** — O((V + E) log V)
- ✅ Optimal for positive weights
- ❌ Does not handle negative weights (subsidized routes)

### Bellman-Ford Algorithm
Relaxes all edges V−1 times, making it robust to negative edge weights. Slightly slower but essential for routes with government subsidies or discount models.

- 🔄 **Reliable** — O(V × E)
- ✅ Handles negative weights
- ✅ Detects negative-weight cycles

| | Dijkstra | Bellman-Ford |
|---|---|---|
| Speed | ⚡ Faster | 🐢 Slower |
| Negative weights | ❌ | ✅ |
| Use case | Standard routes | Subsidized fares |

---

## 🗂️ Project Structure

```
airline-shortest-path/
│
├── backend/
│   ├── server.js             # Express server — serves airports & routes JSON
│   ├── data/
│   │   ├── airports.json     # 15 major Indian airports (code, name, coords)
│   │   └── edges.json        # 23 routes with distance & cost weights
│   └── package.json
│
└── frontend/
    ├── index.html            # Landing page
    ├── find.html             # Route finder UI
    ├── css/
    │   └── styles.css        # Dark theme, glassmorphism, animations
    └── js/
        ├── map.js            # Leaflet map + animated flight paths
        ├── dijkstra.js       # Dijkstra's algorithm
        ├── bellman-ford.js   # Bellman-Ford algorithm
        └── ticket.js         # PNG ticket export
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Maps | [Leaflet.js](https://leafletjs.com/) |
| Ticket export | HTML Canvas / `html2canvas` |
| Data | 15 Indian airports · 23 routes |

---

## 📌 Notes

- All distances and costs are **sample values** for demonstration purposes.
- Some routes carry **negative costs** intentionally, to showcase Bellman-Ford's subsidy handling.
- The backend only serves static JSON data; all pathfinding runs client-side in the browser.

---

## 📄 License

This project is licensed under the **MIT License**.

---

*Made by ISHIKA RAWAT*
