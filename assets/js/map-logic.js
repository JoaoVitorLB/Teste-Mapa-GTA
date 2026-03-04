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
    // Definimos o sistema de coordenadas simples para um mapa de imagem
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,  // Permitir dar mais zoom out
        maxZoom: 4,
        zoomControl: false,
        attributionControl: false
    });

    // Adiciona o controle de zoom no lado direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Bounds baseados no tamanho da imagem (8192x8192)
    const mapBounds = [[0, 0], [MapConfig.MAP_HEIGHT, MapConfig.MAP_WIDTH]];

    // URL de uma imagem de alta resolução do mapa do GTA V (Atlas Style)
    // Usamos uma versão hospedada no GitHub/Community para maior estabilidade
    const mapImageUrl = 'https://media.githubusercontent.com/media/Gamer-Mao/GTA5-Map-Tiles/master/mapStyles/style1/map.png';
    // Fallback caso a anterior falhe: 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png'

    const image = L.imageOverlay(mapImageUrl, mapBounds, {
        opacity: 1.0,
        interactive: true // Permite cliques na imagem
    }).addTo(map);

    // Ajusta o mapa para os limites da imagem
    map.fitBounds(mapBounds);

    // Define a visão inicial no centro da ilha (aproximadamente)
    map.setView([4500, 4000], -1);

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
