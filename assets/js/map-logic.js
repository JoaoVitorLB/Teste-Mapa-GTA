/**
 * GTA V Race Planner - Map Logic
 * Responsável por inicializar o mapa e gerenciar o sistema de coordenadas.
 */

const MapConfig = {
    // Dimensões da imagem do mapa do GTA V (Alta resolução)
    MAP_WIDTH: 8192,
    MAP_HEIGHT: 8192,
    // URL de um mapa público do GTA V (Estilo Atlas/Satélite)
    MAP_URL: 'https://gtav-map.github.io/map-tiles/mapStyles/style1/{z}/{x}/{y}.png',
    MIN_ZOOM: 0,
    MAX_ZOOM: 5,
    INITIAL_ZOOM: 2
};

let map;
let markers = [];
let routeLines = null;

function initMap() {
    // Definimos o sistema de coordenadas simples
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 3,
        zoomControl: false,
        attributionControl: false
    });

    // Adiciona o controle de zoom no lado direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Servidor de Tiles do RageMP (Extremamente estável)
    // Estilo Atlas - se este falhar, o problema é 100% o protocolo file:/// bloqueando o carregamento
    const tileUrl = 'https://tiles.rage.mp/gtav_atlas/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
        minZoom: -3,
        maxZoom: 3,
        minNativeZoom: 0,
        maxNativeZoom: 5,
        noWrap: true,
        bounds: [[-8192, -8192], [8192, 8192]]
    }).addTo(map);

    // Centraliza em Los Santos (Coordenadas relativas do sistema simples)
    map.setView([-1000, 1000], -1);

    // Evento de clique para adicionar checkpoint
    map.on('click', function (e) {
        addCheckpoint(e.latlng);
    });
}


// Converte coordenadas do mapa (Leaflet) para coordenadas "estimadas" do jogo GTA V
// Isso é uma aproximação baseada no centro do mapa ser 0,0
function mapToGameCoords(latlng) {
    const gameX = (latlng.lng - 4000) * 1.5;
    const gameY = (latlng.lat - 3000) * 1.5;
    return { x: gameX.toFixed(2), y: gameY.toFixed(2) };
}

// Inicializa quando o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Toggle sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});
