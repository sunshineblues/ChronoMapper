// script.js
let map;
let markers = [];
let allEvents = [];

// Initialize the map
function initMap() {
    map = L.map('map').setView([30, 10], 2);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// Category color mapping
function getCategoryColor(category) {
    const categoryColors = {
        'Assassination': '#FF0000', // Red
        'Invasion': '#0000FF',      // Blue
        'Attack': '#FFA500',        // Orange
        'Battle': '#008000',        // Green
        'Political': '#800080',     // Purple
        'Armistice': '#00A6A6',     // Teal
        'Evacuation': '#8B4513'     // Brown
    };
    return categoryColors[category?.trim()] || '#808080'; // Default: gray
}

// Create custom marker
function createCustomMarker(event) {
    const color = getCategoryColor(event.Category);
    
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
    
    return customIcon;
}

// Create popup content
function createPopupContent(event) {
    return `
        <div class="popup-title">${event.Event}</div>
        <div class="popup-date">${new Date(event.Date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</div>
        <div class="popup-description">${event.Description}</div>
    `;
}

// Add markers to map
function addMarkersToMap(events) {document.getElementById('event-count').textContent =
    `Showing ${events.length} of ${allEvents.length} events`;
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    events.forEach(event => {
        const lat = parseFloat(event.Latitude);
        const lon = parseFloat(event.Longitude);
        
        if (!isNaN(lat) && !isNaN(lon)) {
            const icon = createCustomMarker(event);
            const marker = L.marker([lat, lon], { icon })
                .addTo(map)
                .bindPopup(createPopupContent(event), {
                    maxWidth: 300,
                    className: 'custom-popup'
                });
            
            markers.push(marker);
        }
    });
}

// Filter events by category
function filterByCategory(category) {
    const maxYear = parseInt(document.getElementById('year-range').value);

    let filteredEvents = allEvents.filter(event => {
        const eventYear = new Date(event.Date).getFullYear();

        const matchesYear = eventYear <= maxYear;
        const matchesCategory = category === 'all' || event.Category === category;

        return matchesYear && matchesCategory;
    });

    addMarkersToMap(filteredEvents);
}

// Filter events by year
function filterByYear(maxYear) {
    const filteredEvents = allEvents.filter(event => {
        const eventYear = new Date(event.Date).getFullYear();
        return eventYear <= maxYear;
    });
    
    const categoryFilter = document.getElementById('category-filter').value;
    if (categoryFilter !== 'all') {
        const finalEvents = filteredEvents.filter(event => event.Category === categoryFilter);
        addMarkersToMap(finalEvents);
    } else {
        addMarkersToMap(filteredEvents);
    }
}

// Load and parse CSV data
function loadData() {
    Papa.parse("world_war_events.csv", {
        download: true,
        header: true,
        complete: function(results) {
            allEvents = results.data.filter(event => 
                event.Event && event.Latitude && event.Longitude
            );
            
            addMarkersToMap(allEvents);
            
            // Set up event listeners
            document.getElementById('category-filter').addEventListener('change', function(e) {
                filterByCategory(e.target.value);
            });
            
            document.getElementById('year-range').addEventListener('input', function(e) {
                const year = e.target.value;
                document.getElementById('year-display').textContent = year;
                filterByYear(parseInt(year));
            });
            document.getElementById('show-all').addEventListener('click', function() {
                document.getElementById('year-range').value = 1945;
                document.getElementById('year-display').textContent = '1945';
                document.getElementById('category-filter').value = 'all';
                addMarkersToMap(allEvents);
            });
        },
        error: function(error) {
            console.error("Error loading CSV:", error);
            alert("Error loading event data. Please make sure world_war_events.csv is in the same directory.");
        }
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadData();
});
