import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebatwqemjtmgtvkoefgn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXR3cWVtanRtZ3R2a29lZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMzg0MzYsImV4cCI6MjA0NjcxNDQzNn0.GYWU0KOrYlgQjd5X7evMR3yujzKqanM4Ojbl7Y4oNBY'; // Ersetzen Sie hier mit dem echten Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCameraData() {
    const { data, error } = await supabase
        .from('cameras') // Tabellenname von Supabase
        .select('*');
    if (error) console.error("Fehler beim Abrufen der Daten:", error);
    return data;
}

document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([52.52, 13.4050], 12); // Startkoordinaten für Berlin

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const cameraData = await fetchCameraData();

    // Kameramarker hinzufügen
    cameraData.forEach(camera => {
        const marker = L.marker([camera.latitude, camera.longitude]).addTo(map);
        marker.bindPopup(`<strong>${camera.name}</strong><br>${camera.remarks || ""}`);

        // Kameraausrichtung und Sichtfeld als Kegel hinzufügen
        const angle = camera.angle;
        const fov = camera.fieldOfView;
        const length = 100; // Länge des Kegels in Metern

        const direction = L.semiCircle([camera.latitude, camera.longitude], {
            radius: length,
            startAngle: angle - fov / 2,
            stopAngle: angle + fov / 2,
            color: "blue"
        }).addTo(map);
    });

    displayCameraList(cameraData);
});

async function displayCameraList(cameraData) {
    const cameraList = document.getElementById('camera-items');
    cameraList.innerHTML = ''; // Liste leeren
    cameraData.forEach(camera => {
        const listItem = document.createElement('li');
        listItem.textContent = camera.name;
        listItem.addEventListener('click',
