<div align="center">

<br/>

```
  ✈  AIRLINE SHORTEST PATH FINDER
```

### Find the fastest, cheapest flight routes across India — instantly.

*Powered by Dijkstra's & Bellman-Ford · Interactive Leaflet map · Downloadable ticket*

<br/>

![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Maps-Leaflet.js-199900?style=flat-square&logo=leaflet&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

<br/>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Algorithms](#-algorithms-explained)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
- [Project Structure](#-project-structure)
- [Tech Stack](#️-tech-stack)
- [Data](#-data)
- [Notes](#-notes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**Airline Shortest Path Finder** is a full-stack web application that models the Indian airline network as a weighted graph and finds the most optimal route between any two airports — minimizing either **cost** or **distance**.

The app features a modern dark glassmorphism UI, a live interactive Leaflet map with animated flight paths, support for subsidized (negative-cost) routes via Bellman-Ford, and the ability to download your route as a printable flight ticket.

> All pathfinding runs **client-side in the browser** — the backend only serves static airport and route data as JSON.

---

## 🎬 Live Demo

```
1. cd backend && npm install && npm start     →  API at http://localhost:5000
2. cd frontend && npx serve                  →  App at http://localhost:3000
```

Then open `index.html` → click **Get Started** → select your route → click **Find Shortest Path**.

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 🗺️ | **Interactive Map** | Animated flight paths drawn on Leaflet.js with real Indian airport coordinates |
| 🧠 | **Two Algorithms** | Dijkstra (fast) and Bellman-Ford (handles subsidized/negative-cost routes) |
| 💰 | **Dual Optimization** | Choose to minimize by **cost** (₹) or **distance** (km) |
| 🎫 | **Downloadable Ticket** | Export your full route summary as a PNG image |
| 🌓 | **Theme Toggle** | Switch between a rich dark and a crisp light mode |
| 🎨 | **Glassmorphism UI** | Modern frosted-glass card design with smooth CSS animations |
| 📱 | **Fully Responsive** | Adapts cleanly to mobile, tablet, and desktop screens |
| ⚡ | **Client-Side Compute** | No backend round-trips for pathfinding — blazing fast responses |

---

## 🧠 Algorithms Explained

### ⚡ Dijkstra's Algorithm — *Fast & Optimal*

Dijkstra's works by always expanding the **lowest-cost unvisited node** first, using a min-priority queue. It greedily builds the optimal path outward from the source airport.

**When to use:** Standard routes where all fares are positive.

```
Time complexity:  O((V + E) log V)
Space complexity: O(V)
Handles negative weights: ✗ No
Guaranteed optimal: ✓ Yes (non-negative graphs)
```

**How it works, step by step:**
1. Set source airport cost = 0, all others = ∞
2. Push source into a min-heap (priority queue)
3. Pop lowest-cost airport, relax all its outgoing edges
4. If a cheaper path to a neighbor is found, update and push it
5. Repeat until the destination airport is popped

---

### 🔄 Bellman-Ford Algorithm — *Robust & Flexible*

Bellman-Ford iterates through **all edges V−1 times**, progressively relaxing costs. This makes it immune to negative edge weights — perfect for modelling government subsidies or special discounts.

**When to use:** Routes with negative costs (subsidized fares, promotional discounts).

```
Time complexity:  O(V × E)
Space complexity: O(V)
Handles negative weights: ✓ Yes
Detects negative cycles: ✓ Yes
```

**How it works, step by step:**
1. Initialize all airport costs to ∞ (source = 0)
2. For each of V−1 iterations, relax every edge
3. If `cost[u] + weight(u,v) < cost[v]`, update `cost[v]`
4. On the V-th pass, if any edge still relaxes → negative cycle detected

---

### 📊 Side-by-Side Comparison

| Property | Dijkstra's | Bellman-Ford |
|---|---|---|
| **Speed** | ⚡ Fast | 🐢 Slower |
| **Negative weights** | ❌ Not supported | ✅ Fully supported |
| **Negative cycle detection** | ❌ No | ✅ Yes |
| **Best for** | Standard routes | Subsidized fares |
| **Time complexity** | O((V+E) log V) | O(V × E) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- A static file server: VS Code Live Server extension, or `npx serve`

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ishikarawatt/AIRLINE_ROUTE_OPTIMIZATION.git
cd AIRLINE_ROUTE_OPTIMIZATION
```

---

### Step 2 — Start the Backend

```bash
cd backend
npm install       # install Express and dependencies
npm start         # starts the API server
```

```
✓ Backend running at: http://localhost:5000
  GET /airports  →  returns list of 15 airports
  GET /edges     →  returns 23 route edges
```

---

### Step 3 — Serve the Frontend

**Option A — using `npx serve` (recommended)**
```bash
cd frontend
npx serve
# Open the URL shown in your terminal, e.g. http://localhost:3000
```

**Option B — using VS Code Live Server**
1. Open the `frontend` folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Default URL: `http://127.0.0.1:5500`

---

## 🧭 How to Use

```
[ index.html ]  →  click "Get Started"
      ↓
[ find.html ]
  1. Select optimization type   →  Cost (₹) or Distance (km)
  2. Select algorithm           →  Dijkstra or Bellman-Ford
  3. Pick origin airport        →  e.g. Delhi (DEL)
  4. Pick destination airport   →  e.g. Mumbai (BOM)
  5. Click "Find Shortest Path" →  route appears on the map
  6. Click "Download Ticket"    →  saves a PNG of your itinerary
```

### Example Output

```
Route:         DEL → LKO → BOM
Total cost:    ₹ 3,240
Total distance: 1,892 km
Algorithm:     Dijkstra's  |  Nodes explored: 8  |  Time: < 1ms
```

---

## 🗂️ Project Structure

```
AIRLINE_ROUTE_OPTIMIZATION/
│
├── backend/
│   ├── server.js              ← Express server — serves airports & edges as JSON
│   ├── package.json           ← Backend dependencies (express, cors)
│   └── data/
│       ├── airports.json      ← 15 Indian airports: code, name, lat, lon
│       └── edges.json         ← 23 route edges: src, dst, cost, distance
│
└── frontend/
    ├── index.html             ← Landing page with "Get Started" CTA
    ├── find.html              ← Main route-finder interface
    │
    ├── css/
    │   └── styles.css         ← Dark theme, glassmorphism, animations, responsive
    │
    └── js/
        ├── dijkstra.js        ← Dijkstra's algorithm (priority queue implementation)
        ├── bellman-ford.js    ← Bellman-Ford algorithm (edge relaxation)
        ├── map.js             ← Leaflet map setup + animated polyline flight paths
        └── ticket.js          ← html2canvas PNG export for flight ticket
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js + Express | Serves airport and route JSON data |
| **Frontend** | Vanilla HTML/CSS/JS | UI, algorithm logic, user interaction |
| **Maps** | Leaflet.js | Interactive map with animated flight paths |
| **Ticket export** | html2canvas | Converts the route summary to a PNG image |
| **Styling** | Custom CSS | Glassmorphism dark theme, responsive layout |

---

## 📦 Data

The app ships with hand-crafted sample data covering 15 major Indian airports:

| Code | City | Code | City |
|---|---|---|---|
| DEL | New Delhi | BOM | Mumbai |
| BLR | Bengaluru | MAA | Chennai |
| CCU | Kolkata | HYD | Hyderabad |
| PNQ | Pune | AMD | Ahmedabad |
| COK | Kochi | GOI | Goa |
| LKO | Lucknow | JAI | Jaipur |
| PAT | Patna | IXC | Chandigarh |
| NAG | Nagpur | | |

**23 routes** connect these airports, some carrying **negative costs** to demonstrate Bellman-Ford's subsidy handling. All values are sample figures for visualization purposes only.

---

## 📌 Notes

- **Sample data only** — distances and costs are not real fares. They exist to demonstrate algorithm behavior across a realistic network topology.
- **Negative costs** — select Bellman-Ford when your chosen route includes subsidized legs. Dijkstra's will produce incorrect results on negative-weight edges.
- **Client-side pathfinding** — the backend is a simple data API. All graph construction and shortest-path computation happens in the browser via vanilla JS.
- **No database** — airports and routes are static JSON files, making the project zero-config to run.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/add-new-airport

# 3. Commit your changes
git commit -m "feat: add Srinagar airport and routes"

# 4. Push to your branch
git push origin feature/add-new-airport

# 5. Open a Pull Request
```

**Ideas for contributions:**
- Add more airports or real fare data
- Implement A\* algorithm as a third option
- Add a stops/layover filter
- Integrate a real flights API

---

## 📄 License

This project is licensed under the **MIT License** — use it freely for personal or commercial projects.

---

<div align="center">

Made by ISHIKA RAWAT
*Graph theory meets clean design.*

</div>
