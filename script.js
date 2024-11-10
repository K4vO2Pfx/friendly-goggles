const supabaseUrl = 'https://ebatwqemjtmgtvkoefgn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXR3cWVtanRtZ3R2a29lZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMzg0MzYsImV4cCI6MjA0NjcxNDQzNn0.GYWU0KOrYlgQjd5X7evMR3yujzKqanM4Ojbl7Y4oNBY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initialisierung und Laden der Karte
document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([52.52, 13.4050], 12); // Beispielkoordinaten

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Kameradaten abrufen
    const cameraData = await fetchCameraData();
    displayCamerasOnMap(cameraData);
    displayCameraList(cameraData);
});

// Beispiel für die Funktion zum Abrufen der Kameradaten
async function fetchCameraData() {
    const { data, error } = await supabase
        .from('cameras') // Tabellenname in Supabase
        .select('*');
    if (error) console.error("Fehler beim Abrufen der Daten:", error);
    return data;
}

// Beispiel für die Funktion zum Anzeigen der Kameras auf der Karte
function displayCamerasOnMap(cameraData) {
    cameraData.forEach(camera => {
        const marker = L.marker([camera.latitude, camera.longitude]).addTo(map);
        marker.bindPopup(`<strong>${camera.name}</strong><br>${camera.remarks || ""}`);
    });
}
