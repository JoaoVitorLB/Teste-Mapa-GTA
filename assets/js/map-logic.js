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
    // Usamos L.CRS.Simple para um sistema de coordenadas plano (pixels)
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: MapConfig.MIN_ZOOM,
        maxZoom: MapConfig.MAX_ZOOM,
        zoomControl: false // Vamos colocar no lado direito depois
    });

    // Adiciona o controle de zoom no lado direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Como não temos tiles offline aqui, usaremos um ImageOverlay ou Tiles públicos se disponíveis
    // Para este exemplo, usaremos uma técnica de "Infinite Background" ou uma imagem única grande
    const mapBounds = [[0, 0], [MapConfig.MAP_HEIGHT, MapConfig.MAP_WIDTH]];
    
    // Tentar usar tiles de um repositório conhecido da comunidade GTA V
    const tileLayer = L.tileLayer('https://s.rsg.sc/sc/images/games/GTAV/map/atlas/{z}/{x}/{y}.jpg', {
        attribution: 'Map data &copy; Rockstar Games',
        noWrap: true,
        bounds: mapBounds
    });

    // Se os tiles do Social Club falharem (eles mudam as vezes), temos o fallback da imagem única
    // L.imageOverlay('assets/images/gta-map.jpg', mapBounds).addTo(map);
    
    tileLayer.addTo(map);
    map.fitBounds(mapBounds);
    map.setView([3000, 4000], MapConfig.INITIAL_ZOOM);

    // Evento de clique para adicionar checkpoint
    map.on('click', function(e) {
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
