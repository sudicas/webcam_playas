// URL de tu proxy de Cloudflare Worker
const PROXY_URL = "https://dawn-rice-d477.sudicas.workers.dev";

// Configuración de las cámaras
const cameras = [
  { id: 17, name: "Aguieira", location: "Porto do Son" },
  { id: 20, name: "Furnas", location: "Porto do Son" },
  { id: 1, name: "Balieiros", location: "Ribeira" },
  { id: 103, name: "Coroso", location: "Ribeira" },
  { id: 96, name: "Perbes", location: "Miño" },
  { id: 87, name: "Ézaro", location: "Dumbría" },
  { id: 42, name: "Ladeira", location: "Corrubedo" },
  { src: "https://rtsp.me/embed/yRzN62a5/", type: "iframe", name: "Boiro", location: "Boiro" }
];

const cams_number = cameras.length.toString();
document.querySelectorAll('.cams_number').forEach(elemento => {
  elemento.innerHTML = cams_number;
});

// Devuelve la URL del playlist HLS a través del Worker
function getStreamUrl(webcamId) {
  return `${PROXY_URL}/hls/${webcamId}/playlist.m3u8?t=${Date.now()}`;
}

function createCameraCard(camera, index) {
  const card = document.createElement('div');
  card.className = 'camera-card';

  const isIframe = camera.type === 'iframe';

  card.innerHTML = `
    <div class="camera-header">
      <div class="camera-title">
        <div class="camera-icon">
          <i class="bi bi-camera-video-fill"></i>
        </div>
        <div>
          <div class="camera-name">${camera.name}</div>
          <div class="camera-location">
            <i class="bi bi-geo-alt"></i> ${camera.location || 'Galicia'}
          </div>
        </div>
      </div>
      <div class="live-badge">En vivo</div>
    </div>
    <div class="camera-video" id="player-${index}">
      ${isIframe
        ? `<iframe src="${camera.src}" allowfullscreen scrolling="no"></iframe>`
        : `
          <div class="video-loading">
            <div class="spinner"></div>
            <span>Conectando...</span>
          </div>
          <video controls autoplay muted playsinline></video>
        `
      }
    </div>
  `;

  return card;
}

// Crear todas las cards primero (mantiene el orden)
const playersContainer = document.getElementById('players-container');
const videoElements = [];

cameras.forEach((camera, index) => {
  const card = createCameraCard(camera, index);
  playersContainer.appendChild(card);

  if (camera.type !== 'iframe') {
    videoElements.push({
      card,
      camera,
      video: card.querySelector('video'),
      loading: card.querySelector('.video-loading')
    });
  }
});

// Cargar streams en paralelo
videoElements.forEach(({ card, camera, video, loading }) => {
  const streamUrl = getStreamUrl(camera.id);

  if (loading) loading.remove();

  if (Hls.isSupported()) {
    let hls = new Hls({
      liveSyncDurationCount: 3,
      manifestLoadingMaxRetry: 6,
      manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 6,
      fragLoadingMaxRetry: 6
    });

    const attach = () => {
      const url = `${PROXY_URL}/hls/${camera.id}/playlist.m3u8?t=${Date.now()}`;
      hls.loadSource(url);
      hls.attachMedia(video);
    };

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(e => console.log('Autoplay bloqueado:', e));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.warn(`HLS fatal en cámara ${camera.id}, recargando…`, data);
        hls.destroy();
        setTimeout(() => {
          hls = new Hls({
            liveSyncDurationCount: 3,
            manifestLoadingMaxRetry: 6,
            manifestLoadingRetryDelay: 1000,
            levelLoadingMaxRetry: 6,
            fragLoadingMaxRetry: 6
          });
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          attach();
        }, 2000);
      }
    });

    attach();

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari nativo
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(e => console.log('Autoplay bloqueado:', e));
    });

  } else {
    const videoContainer = card.querySelector('.camera-video');
    videoContainer.innerHTML = `
      <div class="video-error">
        <i class="bi bi-wifi-off"></i>
        <span>Cámara no disponible</span>
      </div>
    `;
  }
});
