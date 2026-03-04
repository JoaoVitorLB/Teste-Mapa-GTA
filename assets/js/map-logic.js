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
        minZoom: 1,
        maxZoom: 6,
        zoomControl: false,
        attributionControl: false
    });

    // Adiciona o controle de zoom no lado direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Servidor de Tiles Oficial da Rockstar (Social Club)
    // Este é o mais estável e garantido
    const tileUrl = 'https://s.rsg.sc/sc/images/games/GTAV/map/atlas/{z}/{x}/{y}.jpg';

    L.tileLayer(tileUrl, {
        minZoom: 1,
        maxZoom: 6,
        noWrap: true,
        bounds: [[-512, 0], [0, 512]] // Limites aproximados para o zoom inicial
    }).addTo(map);

    // Centraliza o mapa em Los Santos
    // No Zoom 1, o mapa tem 512x512 pixels. [-256, 256] é o centro aproximado.
    map.setView([-256, 256], 2);

    // Força o Leaflet a recalcular o tamanho do container após o carregamento
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

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
