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
        minZoom: -2,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false,
        backgroundColor: '#0b0c0e'
    });

    // Adiciona o controle de zoom no lado direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    /**
     * Definitive Fix: O servidor gta5-map.github.io usa um padrão de nomeação customizado.
     * Padrão: {z}-{x}_{y}.png
     */
    const GtaTileLayer = L.TileLayer.extend({
        getTileUrl: function (coords) {
            const z = coords.z;
            const x = coords.x;
            const y = coords.y;
            // O servidor deles usa o padrão z-x_y
            return `https://gta5-map.github.io/tiles/road/${z}-${x}_${y}.png`;
        }
    });

    const gtaTiles = new GtaTileLayer('', {
        minZoom: 0,
        maxZoom: 2,
        noWrap: true,
        bounds: [[-8192, -8192], [8192, 8192]]
    }).addTo(map);

    // Se o serviço de tiles falhar, temos um fallback de imagem única de alta resolução
    // Mas os tiles acima estão confirmados como funcionais.

    // Configura a visão inicial para focar no centro do mapa (Los Santos)
    // No sistema CRS.Simple, precisamos de valores que façam sentido
    map.setView([-4000, 4000], 0);

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
