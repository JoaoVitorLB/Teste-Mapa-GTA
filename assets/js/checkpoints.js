/**
 * GTA V Race Planner - Checkpoint Logic
 * Gerencia a criação, exclusão e visualização de checkpoints.
 */

let checkpoints = []; // { id, latlng, marker, gameCoords }
let polyline = null;

const cpListElement = document.getElementById('checkpoint-list');
const cpCountElement = document.getElementById('cp-count');
const distElement = document.getElementById('total-distance');

function addCheckpoint(latlng) {
    const id = Date.now();
    const gameCoords = mapToGameCoords(latlng);
    const cpNumber = checkpoints.length + 1;

    // Criar Marcador no Map
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<span>${cpNumber}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const marker = L.marker(latlng, { icon: icon, draggable: true }).addTo(map);

    // Objeto Checkpoint
    const checkpoint = {
        id: id,
        latlng: latlng,
        marker: marker,
        gameCoords: gameCoords
    };

    checkpoints.push(checkpoint);

    // Eventos do Marcador
    marker.on('dragend', function (e) {
        updateCheckpointPosition(id, e.target.getLatLng());
    });

    marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e); // Evita adicionar outro CP no clique
    });

    renderUI();
    updateRoute();
}

function removeCheckpoint(id) {
    const index = checkpoints.findIndex(cp => cp.id === id);
    if (index !== -1) {
        map.removeLayer(checkpoints[index].marker);
        checkpoints.splice(index, 1);

        // Reindexar números nos ícones
        checkpoints.forEach((cp, i) => {
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<span>${i + 1}</span>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            cp.marker.setIcon(icon);
        });

        renderUI();
        updateRoute();
    }
}

function updateCheckpointPosition(id, newLatlng) {
    const cp = checkpoints.find(c => c.id === id);
    if (cp) {
        cp.latlng = newLatlng;
        cp.gameCoords = mapToGameCoords(newLatlng);
        renderUI();
        updateRoute();
    }
}

function updateRoute() {
    if (polyline) {
        map.removeLayer(polyline);
    }

    if (checkpoints.length < 2) {
        distElement.innerText = '0.00 km';
        return;
    }

    const latlngs = checkpoints.map(cp => cp.latlng);
    polyline = L.polyline(latlngs, {
        color: '#fbd106',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10',
        lineJoin: 'round'
    }).addTo(map);

    // Calcular distância (aproximada no sistema de pixels)
    let pixels = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
        pixels += map.distance(latlngs[i], latlngs[i + 1]);
    }
    // Conversão arbitrária para "km" baseada na escala do mapa
    const km = (pixels / 500).toFixed(2);
    distElement.innerText = `${km} km`;
}

function renderUI() {
    cpCountElement.innerText = checkpoints.length;

    if (checkpoints.length === 0) {
        cpListElement.innerHTML = '<li class="empty-state">Clique no mapa para adicionar o primeiro checkpoint.</li>';
        return;
    }

    cpListElement.innerHTML = '';
    checkpoints.forEach((cp, index) => {
        const li = document.createElement('li');
        li.className = 'checkpoint-item';
        li.innerHTML = `
            <div class="cp-number">${index + 1}</div>
            <div class="cp-info">
                <div class="cp-name">Checkpoint ${index + 1}</div>
                <div class="cp-coords">X: ${cp.gameCoords.x} | Y: ${cp.gameCoords.y}</div>
            </div>
            <div class="cp-actions">
                <button class="action-btn" onclick="removeCheckpoint(${cp.id})">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        `;
        cpListElement.appendChild(li);
    });

    // Re-trigger Lucide icons for new elements
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Control Buttons
document.getElementById('clear-all').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover todos os checkpoints?')) {
        checkpoints.forEach(cp => map.removeLayer(cp.marker));
        checkpoints = [];
        if (polyline) map.removeLayer(polyline);
        renderUI();
        updateRoute();
    }
});

document.getElementById('export-json').addEventListener('click', () => {
    const data = checkpoints.map((cp, idx) => ({
        number: idx + 1,
        x: cp.gameCoords.x,
        y: cp.gameCoords.y,
        lat: cp.latlng.lat,
        lng: cp.latlng.lng
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'race-plan.json';
    a.click();
});
