document.addEventListener('DOMContentLoaded', () => {
    // Supabase-Konfiguration und Initialisierung
    const supabaseUrl = 'https://ebatwqemjtmgtvkoefgn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXR3cWVtanRtZ3R2a29lZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMzg0MzYsImV4cCI6MjA0NjcxNDQzNn0.GYWU0KOrYlgQjd5X7evMR3yujzKqanM4Ojbl7Y4oNBY';

    // Prüfen, ob die Supabase-Bibliothek geladen wurde
    if (typeof supabase !== 'undefined') {
        const supabase = supabase.createClient(supabaseUrl, supabaseKey);

        // Funktion zum Abrufen der Kameradaten von Supabase
        async function fetchCameraData() {
            try {
                const { data, error } = await supabase
                    .from('cameras') // Tabellenname anpassen
                    .select('*');
                if (error) {
                    console.error("Fehler beim Abrufen der Daten:", error);
                    return [];
                }
                return data;
            } catch (error) {
                console.error("Allgemeiner Fehler beim Abrufen der Kameradaten:", error);
                return [];
            }
        }

        // Initialisierung und Laden der Karte
        const map = L.map('map').setView([52.52, 13.4050], 12); // Beispielkoordinaten für Berlin
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Kameradaten abrufen und auf der Karte anzeigen
        fetchCameraData().then(cameraData => {
            displayCamerasOnMap(cameraData, map);
            displayCameraList(cameraData, map);
        });

        // Ereignislistener für die Suchfunktion
        document.getElementById('search').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCameras = cameraData.filter(camera =>
                camera.name.toLowerCase().includes(searchTerm)
            );
            displayCameraList(filteredCameras, map);
        });

        // Ereignislistener für das Hinzufügen einer neuen Kamera
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

            // Kamera zur Datenbank hinzufügen und Karte aktualisieren
            const { data, error } = await supabase.from('cameras').insert([newCamera]);
            if (error) {
                console.error("Fehler beim Hinzufügen der Kamera:", error);
            } else {
                console.log("Kamera hinzugefügt:", data);
                location.reload(); // Seite neu laden, um die Kamera anzuzeigen
            }
        });

        // Klick auf die Karte: Koordinaten für neue Kamera setzen
        map.on('click', function (e) {
            document.getElementById('camera-longitude').value = e.latlng.lng;
            document.getElementById('camera-latitude').value = e.latlng.lat;
        });
    } else {
        console.error("Supabase konnte nicht geladen werden. Überprüfen Sie das CDN-Script.");
    }
});

// Funktion zur Anzeige der Kameras auf der Karte
function displayCamerasOnMap(cameraData, map) {
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
}

// Funktion zur Anzeige der Kameraliste
function displayCameraList(cameraData, map) {
    const cameraList = document.getElementById('camera-items');
    cameraList.innerHTML = ''; // Liste leeren
    cameraData.forEach(camera => {
        const listItem = document.createElement('li');
        listItem.textContent = camera.name;
        listItem.addEventListener('click', () => {
            map.setView([camera.latitude, camera.longitude], 15);
        });
        cameraList.appendChild(listItem);
    });
}
