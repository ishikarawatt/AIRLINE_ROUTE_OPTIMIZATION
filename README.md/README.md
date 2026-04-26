# Airline Shortest Path Finder

A modern, beautifully designed web application for finding optimal flight routes using Dijkstra's and Bellman-Ford algorithms.

## ✨ Features

- 🎨 **Modern Dark UI** with glassmorphism effects and smooth animations
- 🗺️ **Interactive Map** with animated flight paths using Leaflet
- 🎫 **Downloadable Tickets** - Save your flight summary as an image
- 🌓 **Theme Toggle** - Switch between dark and light modes
- 📊 **Two Algorithms** - Dijkstra (fast) and Bellman-Ford (handles negative weights)
- 💰 **Cost Optimization** - Find cheapest routes with subsidy support
- 📱 **Responsive Design** - Works on all screen sizes

## Setup

### Backend
1. Open terminal and go to `backend` folder.
2. Run:
```bash
npm install
npm start
```
Backend will run at `http://localhost:5000`

### Frontend
1. Serve `frontend` folder using Live Server (VS Code) or a static server:
```bash
cd frontend
npx serve
```
or use VS Code Live Server. Open the URL shown (e.g., `http://127.0.0.1:5000` for serve or `http://127.0.0.1:5500` for Live Server).

2. Go to `index.html` → click **Get Started** → Fill `find.html` → click **Find Shortest Path**.

## How It Works

1. **Select Optimization Type**: Choose to minimize by distance or cost
2. **Choose Algorithm**: 
   - Dijkstra: Faster, but doesn't work with negative weights
   - Bellman-Ford: Slower, but handles negative costs (subsidies)
3. **Pick Route**: Select origin and destination airports
4. **View Results**: See your optimized route on an interactive map
5. **Download Ticket**: Save your flight summary as a PNG image

## Technical Details

- **Backend**: Node.js + Express serves airport and route data
- **Frontend**: Vanilla HTML/CSS/JavaScript with Leaflet maps
- **Algorithms**: Dijkstra and Bellman-Ford for shortest path calculation
- **Data**: 15 major Indian airports with 23 routes

## Notes
- Backend serves airports and edges JSON.
- Frontend computes shortest path using selected algorithm and displays the route.
- All distances are sample values for demo/visualization.
- Some routes have negative costs to demonstrate Bellman-Ford algorithm capabilities.

## Made by Ishu 💙