const BASE_URL = "http://localhost:5000";

// Fallback price if no direct flight is found or if minimizing distance
const FALLBACK_PRICE = 5000; 

// Global variables to store our graph data
let airports = [];
let edges = [];

/**
 * Sets the minimum date on the date picker to today and max date to 1 year from now.
 * Prevents selecting past dates or too far future dates.
 */
function setDatePickerMinDate() {
    const dateInput = document.getElementById('dateSelect');
    if (!dateInput) return;

    // Get today's date in IST (India Standard Time)
    const now = new Date();
    // Adjust for India's timezone (GMT+5:30)
    const offset = 5.5 * 60; // 330 minutes
    const localTime = now.getTime();
    const localOffset = now.getTimezoneOffset() * 60000; // local offset in milliseconds
    const utc = localTime + localOffset;
    const ist = utc + (3600000 * 5.5); // 5.5 hours in milliseconds
    
    const todayIST = new Date(ist);
    
    // Format as YYYY-MM-DD
    const year = todayIST.getFullYear();
    const month = String(todayIST.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(todayIST.getDate()).padStart(2, '0');
    
    const todayStr = `${year}-${month}-${day}`;
    
    // Set min date to today
    dateInput.min = todayStr;
    dateInput.value = todayStr; // Set default value to today
    
    // Set max date to 1 year from now
    const maxDate = new Date(ist);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const maxYear = maxDate.getFullYear();
    const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0');
    const maxDay = String(maxDate.getDate()).padStart(2, '0');
    dateInput.max = `${maxYear}-${maxMonth}-${maxDay}`;
}

/**
 * Fetches airport AND edge data from the backend.
 * Populates the dropdown menus.
 */
async function loadDataAndSetup() {
  try {
    // API Consumer Role: Fetch BOTH city list and edge list
    const [airportRes, edgeRes] = await Promise.all([
        fetch(`${BASE_URL}/airports`),
        fetch(`${BASE_URL}/edges`)
    ]);
    
    if (!airportRes.ok || !edgeRes.ok) throw new Error(`HTTP error!`);

    airports = await airportRes.json();
    edges = await edgeRes.json(); // Store edges globally

    const fromSelect = document.getElementById('fromCity');
    const toSelect = document.getElementById('toCity');
    
    // Clear any existing options
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    airports.forEach(apt => {
      // Data Modeling: Create options using the airport ID (for DSA) and name (for UI)
      const o1 = document.createElement('option');
      o1.value = apt.id;
      o1.text = `${apt.name} (${apt.id})`; // e.g., "Indira Gandhi (Delhi) (1)"
      fromSelect.appendChild(o1);

      const o2 = document.createElement('option');
      o2.value = apt.id;
      o2.text = `${apt.name} (${apt.id})`;
      toSelect.appendChild(o2);
    });

    // Set default selections
    if (airports.length >= 2) {
      fromSelect.selectedIndex = 0; // Default to first airport
      toSelect.selectedIndex = 1;   // Default to second airport
    }
    
    // After data is loaded, update the price
    updatePricePreview();

  } catch (err) {
    console.error("Error loading data:", err);
    alert('Could not load airport or edge data. Ensure backend is running (http://localhost:5000) and reachable.');
  }
}

/**
 * Updates the price preview dynamically based on the selected route and class.
 */
function updatePricePreview() {
    const from = document.getElementById('fromCity').value;
    const to = document.getElementById('toCity').value;
    const cls = document.getElementById('classSelect').value;
    const weightType = document.getElementById('weightType').value;

    let baseCost = FALLBACK_PRICE; // Start with fallback

    if (weightType === 'distance') {
        // If minimizing distance, just show a generic estimate, as price isn't the priority
        baseCost = FALLBACK_PRICE; 
    } else {
        // If minimizing cost, try to find a direct flight cost
        const directFlight = edges.find(
            e => (String(e.u) === from && String(e.v) === to) || 
                 (String(e.v) === from && String(e.u) === to)
        );

        if (directFlight && directFlight.cost !== undefined) {
            // Use the real cost from our graph data
            baseCost = directFlight.cost; 
        } else {
            // No direct flight, use a higher fallback (signals an indirect route)
            baseCost = FALLBACK_PRICE * 1.5; 
        }
    }
    
    // Apply class multiplier
    let finalPrice = baseCost;
    if (cls === 'business') finalPrice = Math.round(baseCost * 2.6);
    else if (cls === 'first') finalPrice = Math.round(baseCost * 4.5);

    // Handle negative cost display
    const costDisplay = document.getElementById('ticketCostDisplay');
    const costHidden = document.getElementById('ticketCostHidden');
    
    if (finalPrice < 0) {
        costDisplay.textContent = `-₹${Math.abs(finalPrice).toLocaleString()} (Subsidized)`;
        costDisplay.style.color = '#34d399'; // Green for subsidy
    } else {
        costDisplay.textContent = `₹${finalPrice.toLocaleString()}`;
        costDisplay.style.color = '#f97316'; // Orange for regular price
    }
    
    // Store the raw numeric value to be passed to the next page
    costHidden.value = finalPrice;
}

// --- Event Listeners ---

// 1. Update price when any of the 4 relevant fields change
document.getElementById('fromCity').addEventListener('change', updatePricePreview);
document.getElementById('toCity').addEventListener('change', updatePricePreview);
document.getElementById('classSelect').addEventListener('change', updatePricePreview);
document.getElementById('weightType').addEventListener('change', updatePricePreview);


// 2. Handle form submission (The transition to result.html)
document.getElementById('findBtn').addEventListener('click', (e)=>{
  e.preventDefault(); // Stop the form from submitting normally
  
  // Capture all inputs
  const from = document.getElementById('fromCity').value;
  const to = document.getElementById('toCity').value;
  const ticketClass = document.getElementById('classSelect').value;
  const date = document.getElementById('dateSelect').value || '';
  const cost = document.getElementById('ticketCostHidden').value || ''; // Get from hidden field
  
  const weightType = document.getElementById('weightType').value;
  const algorithm = document.getElementById('algorithm').value;
  
  // --- VALIDATION CHECKS ---
  if (!from || !to) { 
    alert('Please select both origin and destination.'); 
    return; // Stop execution
  }
  if (from === to) { 
    alert('Origin and destination must be different.'); 
    return; // Stop execution
  }
  if (!date) { 
    alert('Please select a departure date.'); 
    return; // Stop execution
  }
  
  // --- SPECIAL VALIDATION FOR ALGORITHMS ---
  if (weightType === 'cost' && algorithm === 'dijkstra') {
      const confirmRun = confirm(
          "WARNING: Dijkstra's algorithm may give an INCORRECT result for 'Cost', as our cost graph contains negative weights (subsidies).\n\n" +
          "It is HIGHLY recommended to use Bellman-Ford for 'Cost' minimization.\n\n" +
          "Do you want to proceed anyway?"
      );
      if (!confirmRun) {
          return; // Stop if user cancels
      }
  }

  // Package data and redirect (State Transfer)
  const params = new URLSearchParams({ 
      from, 
      to, 
      class: ticketClass, 
      date, 
      cost, // Pass the calculated cost
      weightType, // Add to URL
      algorithm   // Add to URL
  });
  
  window.location.href = `result.html?${params.toString()}`;
});

// --- Initialization ---
// Run setup tasks when the window is loaded
window.addEventListener('load', async () => {
    setDatePickerMinDate(); // Set today as the minimum date
    await loadDataAndSetup(); // Fetch data, populate dropdowns, and set initial price
});