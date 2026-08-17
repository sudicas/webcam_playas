// URL de tu proxy de Cloudflare Worker
const PROXY_URL = "https://dawn-rice-d477.sudicas.workers.dev";

// Configuración de las cámaras CON EL ORDEN QUE QUIERES
const cameras = [
  { id: 17, name: "Aguieira" },
  { id: 20, name: "Furnas" },
  { id: 1, name: "Balieiros" },
  { id: 103, name: "Coroso" },
  { id: 96, name: "Perbes" },
  { id: 87, name: "Ézaro" },
  { src: "https://rtsp.me/embed/yRzN62a5/", type: "iframe", name: "Boiro" }
];

// Función para obtener la URL del stream a través del proxy
async function getStreamUrl(webcamId) {
  try {
    const response = await fetch(
      `${PROXY_URL}?webcam=${webcamId}&t=${Date.now()}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return data.url;
  } catch (error) {
    console.error(`Error obteniendo stream para webcam ${webcamId}:`, error);
    return null;
  }
}

// Función para obtener el nombre de la cámara
function getCameraName(camera) {
  if (camera.name) return camera.name;
  if (camera.src && camera.src.includes("rtsp.me/embed/")) {
    const parts = camera.src.replace(/\/$/, "").split("/");
    return "Cámara " + parts[parts.length - 1].toUpperCase();
  }
  return "Cámara en Vivo";
}

// PASO 1: Crear TODOS los contenedores de video PRIMERO (en orden síncrono)
const playersContainer = document.getElementById("players-container");
const videoElements = [];

cameras.forEach((camera, index) => {
  const col = document.createElement("div");
  col.classList.add("col-md-6", "col-lg-3");

  const fieldset = document.createElement("fieldset");
  fieldset.classList.add("fieldset-container");

  const legend = document.createElement("legend");
  legend.classList.add("fieldset-legend");
  legend.textContent = getCameraName(camera);
  legend.style.paddingLeft = "10px";
  legend.style.paddingRight = "10px";

  fieldset.appendChild(legend);
  col.appendChild(fieldset);

  const playerContainer = document.createElement("div");
  playerContainer.id = `player${index + 1}`;
  fieldset.appendChild(playerContainer);

  // Renderizado según tipo
  if (camera.type === "iframe") {
    const iframe = document.createElement("iframe");
    iframe.src = camera.src;
    iframe.style.width = "100%";
    iframe.style.height = "250px";
    iframe.style.border = "none";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("scrolling", "no");
    playerContainer.appendChild(iframe);
  } else {
    const video = document.createElement("video");
    video.id = `video-player${index + 1}`;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.style.width = "100%";

    // Mensaje de carga
    const loadingMsg = document.createElement("p");
    loadingMsg.style.color = "#fff";
    loadingMsg.style.textAlign = "center";
    loadingMsg.textContent = "Cargando stream...";

    playerContainer.appendChild(loadingMsg);
    playerContainer.appendChild(video);

    // Guardar referencia para actualizar después
    videoElements.push({ video, playerContainer, camera, index });
  }

  // AÑADIR AL DOM INMEDIATAMENTE (en orden)
  playersContainer.appendChild(col);
});

// PASO 2: Cargar los streams en paralelo y actualizar los videos
videoElements.forEach(async ({ video, playerContainer, camera, index }) => {
  const streamUrl = await getStreamUrl(camera.id);

  // Eliminar mensaje de carga
  const loadingMsg = playerContainer.querySelector("p");
  if (loadingMsg) loadingMsg.remove();

  if (streamUrl) {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch((e) => console.log("Autoplay bloqueado:", e));
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch((e) => console.log("Autoplay bloqueado:", e));
      });
    }
  } else {
    playerContainer.innerHTML =
      "<p style='color: red; text-align: center;'>Error cargando stream</p>";
  }
});
