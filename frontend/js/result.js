const BASE_URL = "http://localhost:5000";

let map, planeMarker, flightLine;
let airports = [], edges = [];

// --- Global Constants for Time Calculation ---
const AVERAGE_SPEED_KMPH = 800; // Average cruising speed of a passenger jet
const BUFFER_HOURS = 0.5; // 30 minutes for takeoff/landing procedures (non-stop)

// -----------------------------
// Helper UI: loading overlay
// -----------------------------
function showLoading() {
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'flex';
}
function hideLoading() {
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

// read params from URL (passed from find.html)
function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
        from: p.get('from'), // This is a STRING (e.g., "1")
        to: p.get('to'),     // This is a STRING (e.g., "3")
        ticketClass: p.get('class'),
        cost: p.get('cost'),
        date: p.get('date'),
        algorithm: p.get('algorithm') || 'dijkstra',
        weightType: p.get('weightType') || 'distance'
    };
}

// Fetch data from the external backend API
async function fetchData() {
    try {
        const [aRes, eRes] = await Promise.all([
            fetch(`${BASE_URL}/airports`),
            fetch(`${BASE_URL}/edges`)
        ]);
        airports = await aRes.json();
        edges = await eRes.json();
    } catch (err) {
        console.error("Backend Data Fetch Error:", err);
        alert('Could not load backend data. Make sure backend is running at http://localhost:5000');
        throw err;
    }
}

// Initialize the Leaflet map focused on the India region
function initMap() {
    map = L.map('map', { zoomControl: true }).setView([20, 78], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

// Helper to find airport object by ID
function getAirport(id) {
    return airports.find(a => String(a.id) === String(id));
}

// ======================== DSA Algorithms ========================

function dijkstra(src, dst, weightType) {
    const ids = airports.map(a => String(a.id));
    const dist = {}, used = {}, parent = {};
    const INF = Number.MAX_SAFE_INTEGER;

    ids.forEach(id => { dist[id] = INF; used[id] = false; parent[id] = null; });
    dist[src] = 0;

    for (let i = 0; i < ids.length; i++) {
        let v = null;
        for (let id of ids) {
            if (!used[id] && (v === null || dist[id] < dist[v])) v = id;
        }
        if (v === null || dist[v] === INF) break;
        used[v] = true;

        edges.forEach(e => {
            const u = String(e.u);
            const v_neighbor = String(e.v);
            let weight = (weightType === 'distance') ? e.w : e.cost;
            
            // Check edge in both directions (undirected graph)
            if (u === v) {
                if (!used[v_neighbor] && dist[v] !== INF && dist[v] + weight < dist[v_neighbor]) {
                    dist[v_neighbor] = dist[v] + weight;
                    parent[v_neighbor] = v;
                }
            }
            if (v_neighbor === v) {
                if (!used[u] && dist[v] !== INF && dist[v] + weight < dist[u]) {
                    dist[u] = dist[v] + weight;
                    parent[u] = v;
                }
            }
        });
    }

    if (dist[dst] === INF) return { path: [], finalWeight: 0 };

    const path = [];
    let cur = dst;
    while (cur !== null) {
        path.push(cur);
        cur = parent[cur];
    }
    path.reverse();

    if (path[0] !== src) return { path: [], finalWeight: 0 };

    return { path, finalWeight: Math.round(dist[dst]) };
}

function bellmanFord(src, dst, weightType) {
    const ids = airports.map(a => String(a.id));
    const dist = {}, parent = {};
    const INF = Number.MAX_SAFE_INTEGER;

    ids.forEach(id => { dist[id] = INF; parent[id] = null; });
    dist[src] = 0;

    const numVertices = ids.length;

    for (let i = 1; i < numVertices; i++) {
        edges.forEach(e => {
            const u = String(e.u);
            const v = String(e.v);
            let weight = (weightType === 'distance') ? e.w : e.cost;

            // Check edge in both directions
            if (dist[u] !== INF && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
            }
            if (dist[v] !== INF && dist[v] + weight < dist[u]) {
                dist[u] = dist[v] + weight;
                parent[u] = v;
            }
        });
    }

    // Check for negative weight cycles
    let hasNegativeCycle = false;
    edges.forEach(e => {
        const u = String(e.u);
        const v = String(e.v);
        let weight = (weightType === 'distance') ? e.w : e.cost;
        if (dist[u] !== INF && dist[u] + weight < dist[v]) {
            hasNegativeCycle = true;
        }
    });

    if (hasNegativeCycle) {
        console.error("Negative weight cycle detected! Path is unreliable.");
    }

    if (dist[dst] === INF) return { path: [], finalWeight: 0 };

    const path = [];
    let cur = dst;
    while (cur !== null) {
        path.push(cur);
        cur = parent[cur];
    }
    path.reverse();

    if (String(path[0]) !== String(src)) return { path: [], finalWeight: 0 };

    return { path, finalWeight: Math.round(dist[dst]) };
}

// ======================== TIME & DURATION ========================

function calculateDurationHours(path) {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const edge = edges.find(e =>
            (String(e.u) === String(path[i]) && String(e.v) === String(path[i+1]))
        );
        if (edge) totalDistance += edge.w;
    }

    if (totalDistance === 0 && path.length > 1) {
        const edge = edges.find(e =>
            (String(e.u) === String(path[0]) && String(e.v) === String(path[1]))
        );
        if (edge) totalDistance = edge.w;
    }

    const stops = Math.max(path.length - 2, 0);
    const totalBuffer = (stops + 1) * BUFFER_HOURS;
    return (totalDistance / AVERAGE_SPEED_KMPH) + totalBuffer;
}

function formatDuration(totalHours) {
    if (totalHours <= 0) {
        const singleEdgeHours = (450 / AVERAGE_SPEED_KMPH) + BUFFER_HOURS;
        if (totalHours <= 0 && totalHours > -5) return formatDuration(singleEdgeHours);
        // **FIXED**: Removed stray 's' character here
        else return '0 min';
    }
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    let parts = [];
    if (hours > 0) parts.push(`${hours} hr`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.join(' ');
}

function calculateArrivalTime(departureTime, totalHours) {
    const [depHour, depMinute] = departureTime.split(':').map(Number);
    const depTotalMinutes = depHour * 60 + depMinute;
    let durationMinutes = Math.round(totalHours * 60);
    if (durationMinutes <= 0) {
        const singleEdgeHours = (450 / AVERAGE_SPEED_KMPH) + BUFFER_HOURS;
        durationMinutes = Math.round(singleEdgeHours * 60);
    }
    const arrivalTotalMinutes = depTotalMinutes + durationMinutes;
    const arrivalMinute = arrivalTotalMinutes % 60;
    const arrivalHour = Math.floor(arrivalTotalMinutes / 60) % 24;
    const hourStr = String(arrivalHour).padStart(2, '0');
    const minuteStr = String(arrivalMinute).padStart(2, '0');
    return `${hourStr}:${minuteStr}`;
}

// ======================== MAP VISUALIZATION ========================

/**
 * Draw path on map. Accepts flag isSubsidy (boolean) to color route.
 */
async function drawPath(path, isSubsidy=false) {
    // Safety timeout - don't wait forever
    let waitCount = 0;
    while (airports.length === 0 && waitCount < 50) {
        await new Promise(r => setTimeout(r, 40));
        waitCount++;
    }

    if (airports.length === 0) {
        console.error('Airports data not loaded');
        return;
    }

    if (flightLine) map.removeLayer(flightLine);
    if (planeMarker) map.removeLayer(planeMarker);

    // build latlngs for directed edges
    const latlngs = path.map(id => {
        const a = getAirport(id);
        return [a.lat, a.lng];
    });

    // Choose color: green for subsidy, orange otherwise
    const lineColor = isSubsidy ? '#34d399' : '#f97316';

    flightLine = L.polyline(latlngs, {
        color: lineColor,
        weight: 6,
        opacity: 0.95,
        dashArray: '12 12',
        className: 'route-line'
    }).addTo(map);

    map.fitBounds(flightLine.getBounds().pad(0.5));

    // Add markers (bouncing)
    path.forEach((id, idx) => {
        const a = getAirport(id);
        const isEnd = (idx === 0 || idx === path.length - 1);

        const marker = L.circleMarker([a.lat, a.lng], {
            radius: isEnd ? 10 : 6,
            fillColor: isEnd ? '#1e3a8a' : '#3b82f6',
            color: '#ffffff',
            weight: 3,
            fillOpacity: 1
        }).addTo(map).bindPopup(`<b>${a.name}</b> ${idx===0? '(Origin)': idx===path.length-1? '(Destination)': '(Stop)'}`);
    });

    // Create plane DivIcon for glow & rotation
    const planeIcon = L.divIcon({
        className: 'plane-divicon',
        html: '<div class="plane-icon"></div>',
        iconSize: [34,34],
        iconAnchor: [17,17]
    });

    planeMarker = L.marker(latlngs[0], { icon: planeIcon }).addTo(map);

    // animate plane along points
    animatePlaneAlong(latlngs, 9000);
}

// Animate plane along latlngs (linear)
function animatePlaneAlong(latlngs, totalMs) {
    if (!planeMarker) return;
    const segments = latlngs.length - 1;
    if (segments <= 0) return;
    const msPerSegment = totalMs / segments;
    let segIndex = 0;

    function moveSegment() {
        if (segIndex >= segments) return;
        const start = latlngs[segIndex];
        const end = latlngs[segIndex + 1];
        const frames = Math.max(40, Math.round(msPerSegment / 16));
        let frame = 0;
        const deltaLat = (end[0] - start[0]) / frames;
        const deltaLng = (end[1] - start[1]) / frames;

        const step = () => {
            frame++;
            const lat = start[0] + deltaLat * frame;
            const lng = start[1] + deltaLng * frame;
            planeMarker.setLatLng([lat, lng]);

            // rotate plane toward next point
            const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;
            const el = planeMarker.getElement();
            if (el) {
                el.style.transform = `rotate(${angle}deg)`;
            }

            if (frame < frames) requestAnimationFrame(step);
            else {
                segIndex++;
                setTimeout(moveSegment, 160);
            }
        };
        requestAnimationFrame(step);
    }
    moveSegment();
}

// Populate the summary list in the result.html page
function updateUI(params, shortest) {
    const fromA = getAirport(params.from);
    const toA = getAirport(params.to);
    const stops = Math.max(shortest.path.length - 2, 0);

    // **FIXED**: Removed duplicate variable declaration
    const totalDurationHours = calculateDurationHours(shortest.path);
    const formattedDuration = formatDuration(totalDurationHours);
    const departureTime = '08:00'; // This is hardcoded
    const arrivalTime = calculateArrivalTime(departureTime, totalDurationHours);

    const finalWeight = shortest.finalWeight;

    // --- *** MODIFICATION START *** ---

    // 1. Determine final labels and values
    let weightDisplay, weightUnit;
    if (params.weightType === 'cost') {
        weightDisplay = finalWeight < 0 ? `-₹${Math.abs(finalWeight).toLocaleString()}` : `₹${finalWeight.toLocaleString()}`;
        weightUnit = "Lowest Cost";
    } else {
        weightDisplay = `${finalWeight.toLocaleString()} km`;
        weightUnit = "Shortest Distance";
    }

    // 2. Populate the Ticket
    document.getElementById('fromName').textContent = fromA.name;
    document.getElementById('toName').textContent = toA.name;
    document.getElementById('fromCode').textContent = fromA.id;
    document.getElementById('toCode').textContent = toA.id;
    document.getElementById('duration').textContent = formattedDuration;
    document.getElementById('stops').textContent = `${stops}`;
    document.getElementById('class').textContent = params.ticketClass || 'Economy';
    document.getElementById('date').textContent = params.date || '—';

    // 3. Set the SINGLE cost/distance value in the ticket's "cost" field
    document.getElementById('cost').textContent = weightDisplay;
    
    // Update ticket badge based on class
    const badge = document.getElementById('ticketBadge');
    if (params.ticketClass === 'business') badge.textContent = "BUSINESS";
    else if (params.ticketClass === 'first') badge.textContent = "FIRST";
    else badge.textContent = "ECONOMY";

    // 4. Populate the NEW tech-summary block
    document.getElementById('tech-algo').textContent = params.algorithm;
    document.getElementById('tech-min-type').textContent = weightUnit;
    document.getElementById('tech-departure').textContent = departureTime;
    document.getElementById('tech-arrival').textContent = arrivalTime;
    
    // --- *** MODIFICATION END *** ---
}

// ======================== THE MAIN FLOW ========================

async function main() {
    const params = getParams();
    console.log('🔍 Route Finder Started');
    console.log('Params:', params);

    if (!params.from || !params.to) {
        console.error('❌ No from/to params');
        document.getElementById('summaryCard').style.display = 'none';
        initMap();
        hideLoading();
        return;
    }

    showLoading();
    console.log('⏳ Loading overlay shown');
    
    try {
        await fetchData();
        console.log('✅ Data loaded:', airports.length, 'airports,', edges.length, 'edges');
    } catch (e) {
        console.error('❌ Fetch error:', e);
        document.getElementById('summaryCard').style.display = 'none';
        initMap();
        hideLoading();
        return;
    }

    initMap();
    console.log('🗺️ Map initialized');

    // Auto-switch logic
    const hasNegative = edges.some(e => e.cost < 0);
    if (params.weightType === 'cost' && hasNegative && params.algorithm === 'dijkstra') {
        alert("Negative cost detected. Dijkstra cannot handle negative weights.\nSwitching automatically to Bellman-Ford.");
        params.algorithm = 'bellman';
    }

    // Run algorithm
    console.log('🔄 Running', params.algorithm, 'algorithm...');
    let shortest;
    if (params.algorithm === 'bellman') {
        shortest = bellmanFord(params.from, params.to, params.weightType);
    } else {
        shortest = dijkstra(params.from, params.to, params.weightType);
    }
    console.log('📊 Algorithm result:', shortest);

    if (!shortest.path || shortest.path.length < 2) {
        console.error('❌ No path found!');
        alert('No path found between selected airports.');
        document.getElementById('summaryCard').style.display = 'none';
        hideLoading();
        return;
    }

    console.log('✅ Path found:', shortest.path);

    // Draw the path
    const isSubsidy = (params.weightType === 'cost' && shortest.finalWeight < 0);
    console.log('🎨 Drawing path, isSubsidy:', isSubsidy);
    await drawPath(shortest.path, isSubsidy);

    // Update UI
    console.log('📝 Updating UI...');
    updateUI(params, shortest);

    // hide loader
    console.log('✅ Done! Hiding loader');
    hideLoading();
}

window.addEventListener('load', () => {
    main().catch(err => {
        console.error(err);
        hideLoading();
    });

    // Theme toggle wiring - FIXED LOGIC
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        // Restore preference (default to dark theme)
        const saved = localStorage.getItem('theme') || 'dark';
        toggle.checked = saved === 'light'; // unchecked = dark, checked = light
        applyTheme(saved);

        toggle.addEventListener('change', () => {
            const theme = toggle.checked ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });
    }

    // Download ticket functionality
    const downloadBtn = document.getElementById('downloadTicket');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTicket);
    }
});

// Download ticket as image
function downloadTicket() {
    const summaryCard = document.getElementById('summaryCard');
    if (!summaryCard) {
        alert('No ticket to download!');
        return;
    }

    // Create a canvas from the summary card
    const canvas = document.createElement('canvas');
    const scale = 2; // Higher quality
    canvas.width = summaryCard.offsetWidth * scale;
    canvas.height = summaryCard.offsetHeight * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Set background
    ctx.fillStyle = '#071029';
    ctx.fillRect(0, 0, summaryCard.offsetWidth, summaryCard.offsetHeight);
    
    // Get ticket data
    const fromName = document.getElementById('fromName').textContent;
    const toName = document.getElementById('toName').textContent;
    const fromCode = document.getElementById('fromCode').textContent;
    const toCode = document.getElementById('toCode').textContent;
    const duration = document.getElementById('duration').textContent;
    const stops = document.getElementById('stops').textContent;
    const date = document.getElementById('date').textContent;
    const ticketClass = document.getElementById('class').textContent;
    const cost = document.getElementById('cost').textContent;
    const algorithm = document.getElementById('tech-algo').textContent;
    const minType = document.getElementById('tech-min-type').textContent;
    const departure = document.getElementById('tech-departure').textContent;
    const arrival = document.getElementById('tech-arrival').textContent;

    // Draw ticket text
    ctx.fillStyle = '#e4edff';
    ctx.font = 'bold 20px Poppins';
    ctx.fillText('✈️ Flight Ticket', 20, 40);
    
    ctx.font = '16px Poppins';
    ctx.fillStyle = '#c2d4ee';
    ctx.fillText(`${fromName} (${fromCode}) → ${toName} (${toCode})`, 20, 70);
    
    ctx.fillText(`Duration: ${duration} | Stops: ${stops}`, 20, 100);
    ctx.fillText(`Date: ${date} | Class: ${ticketClass}`, 20, 130);
    
    ctx.font = 'bold 24px Poppins';
    ctx.fillStyle = '#f97316';
    ctx.fillText(`Cost: ${cost}`, 20, 170);
    
    ctx.font = '14px Poppins';
    ctx.fillStyle = '#9fb8d8';
    ctx.fillText(`Algorithm: ${algorithm} | ${minType}`, 20, 210);
    ctx.fillText(`Departure: ${departure} | Arrival: ${arrival}`, 20, 235);
    
    ctx.font = '12px Poppins';
    ctx.fillStyle = '#64748b';
    ctx.fillText('© 2025 Airline Path Finder - Made by Ishu', 20, 270);

    // Download
    const link = document.createElement('a');
    link.download = `flight-ticket-${fromCode}-${toCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ======================== THEME FIX ========================
// This function handles theme switching between dark and light modes

function applyTheme(theme) {
    // Select the tech summary elements
    const techTitle = document.querySelector('.tech-title');
    const techRows = document.querySelectorAll('.tech-row span');
    const techRowsStrong = document.querySelectorAll('.tech-row strong');
    const summaryCard = document.querySelector('.flight-summary-card');

    if (theme === 'light') {
        // Light theme - use light background with dark text
        document.body.style.background = '#f4f6f8';
        document.body.style.color = '#0b1220';
        
        if (summaryCard) {
            summaryCard.style.background = 'rgba(255,255,255,0.95)';
            summaryCard.style.color = '#0b1220';
            summaryCard.style.border = '1px solid #e2e8f0';
        }

        // Update tech summary colors for light mode
        if (techTitle) {
            techTitle.style.color = '#1e3a8a';
        }
        techRows.forEach(span => {
            span.style.color = '#475569';
            span.style.opacity = '1';
        });
        techRowsStrong.forEach(strong => {
            strong.style.color = '#1e3a8a';
        });

    } else {
        // Dark theme (default) - reset to CSS defaults
        document.body.style.background = '';
        document.body.style.color = '';
        
        if (summaryCard) {
            summaryCard.style.background = '';
            summaryCard.style.color = '';
            summaryCard.style.border = '';
        }

        // Reset tech summary styles
        if (techTitle) {
            techTitle.style.color = '';
        }
        techRows.forEach(span => {
            span.style.color = '';
            span.style.opacity = '';
        });
        techRowsStrong.forEach(strong => {
            strong.style.color = '';
        });
    }
}
