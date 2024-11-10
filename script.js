// Supabase Verbindung
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebatwqemjtmgtvkoefgn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXR3cWVtanRtZ3R2a29lZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMzg0MzYsImV4cCI6MjA0NjcxNDQzNn0.GYWU0KOrYlgQjd5X7evMR3yujzKqanM4Ojbl7Y4oNBY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCameraData() {
    const { data, error } = await supabase
        .from('your_table_name')
        .select('*');
    if (error) console.error("Fehler beim Abrufen der Daten:", error);
    return data;
}

document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([52.52, 13.4050], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const cameraData = await fetchCameraData();

    cameraData.forEach(camera => {
        const marker = L.marker([camera.latitude, camera.longitude]).addTo(map);
        marker.bindPopup(`<strong>${camera.name}</strong><br>${camera.remarks || ""}`);
        const angle = camera.angle;
        const fov = camera.fieldOfView;
        const length = 100;
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
    cameraList.innerHTML = '';
    cameraData.forEach(camera => {
        const listItem = document.createElement('li');
        listItem.textContent = camera.name;
        listItem.addEventListener('click', () => {
            map.setView([camera.latitude, camera.longitude], 15);
        });
        cameraList.appendChild(listItem);
    });
}

document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCameras = cameraData.filter(camera =>
        camera.name.toLowerCase().includes(searchTerm)
    );
    displayCameraList(filteredCameras);
});

document.getElementById('camera-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCamera = {
        name: document.getElementById('camera-name').value,
        longitude: parseFloat(document.getElementById('camera-longitude').value),
        latitude: parseFloat(document.getElementById('camera-latitude').value),
        angle: parseFloat(document.getElementById('camera-angle').value),
        fieldOfView: parseFloat(document.getElementById('camera-fov').value),
        remarks: document.getElementById('camera-remarks').value,
    };

    const { data, error } = await supabase
        .from('your_table_name')
        .insert([newCamera]);

    if (error) {
        console.error("Fehler beim Hinzufügen der Kamera:", error);
    } else {
        console.log("Kamera hinzugefügt:", data);
        location.reload();
    }
});

map.on('click', function (e) {
    document.getElementById('camera-longitude').value = e.latlng.lng;
    document.getElementById('camera-latitude').value = e.latlng.lat;
});
