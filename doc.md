# 🌊 Reproductor de WebCams de Playas de Galicia

Reproductor web que muestra en tiempo real las cámaras de varias playas de Galicia (España), usando streams HLS de [Camaramar](https://www.camaramar.com).

## 🎥 Cámaras incluidas

| Playa | ID |
|-------|-----|
| Aguieira | 17 |
| Furnas | 20 |
| Balieiros | 1 |
| Coroso | 103 |
| Perbes | 96 |
| Ézaro | 87 |
| Boiro | RTSP.me |

## 🚀 Demo

👉 [Ver en vivo](https://sudicas.github.io/webcam_playas/)

## 🛠️ Tecnologías

- [Bootstrap 4](https://getbootstrap.com/) - Framework CSS
- [HLS.js](https://github.com/video-dev/hls.js) - Reproducción de streams HLS
- [Cloudflare Workers](https://workers.cloudflare.com/) - Proxy CORS
- Vanilla JavaScript

## 📁 Estructura del proyecto

```
webcam-playas/
├── index.html      # Página principal
├── estilos.css     # Estilos personalizados
├── script.js       # Lógica de los reproductores
└── README.md       # Este archivo
```

## 🏃 Ejecución local

No necesitas ningún build tool. Solo abre `index.html` en tu navegador:

```bash
# Opción 1: Abrir directamente
open index.html

# Opción 2: Servidor local con Python
python3 -m http.server 8000
# Luego abre http://localhost:8000
```

## ⚙️ Cómo funciona

1. **Camaramar** sirve las cámaras con URLs HLS protegidas por tokens que expiran
2. El **Cloudflare Worker** actúa como proxy:
   - Recibe el ID de la webcam
   - Consulta el endpoint oficial: `https://www.camaramar.com/webcam/{id}/stream-url`
   - Devuelve la URL del stream con headers CORS
3. **HLS.js** reproduce el stream en el navegador

### Endpoint del proxy

```
https://dawn-rice-d477.sudicas.workers.dev/?webcam={ID}
```

**Respuesta:**

```json
{
  "error": false,
  "url": "https://622a10e8864f7.streamlock.net/live/31_coroso.stream/playlist.m3u8?...",
  "webcam": "103",
  "expires_at": 1787008397526
}
```

## 🔧 Configuración

### Cambiar el Worker (si creas el tuyo propio)

En `script.js`, modifica la primera línea:

```javascript
const PROXY_URL = "https://TU_WORKER.workers.dev";
```

### Añadir o quitar cámaras

Edita el array `cameras` en `script.js`:

```javascript
const cameras = [
  { id: 17, name: "Aguieira" },
  { id: 20, name: "Furnas" },
  // ... añade más aquí
];
```

## 🌐 Despliegue

### GitHub Pages

1. Sube el código a un repositorio de GitHub
2. Ve a **Settings → Pages**
3. Selecciona la rama `main` y carpeta `/ (root)`
4. Tu web estará en: `https://sudicas.github.io/webcam-playas/`

## 📜 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

## ⚠️ Aviso legal

Los streams de video son propiedad de [Camaramar](https://www.camaramar.com). Este proyecto solo muestra contenido público disponible en su web. Si eres el propietario de alguna cámara y deseas que sea eliminada, abre un issue.

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Haz un Fork del proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Añadir nueva cámara'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 🐛 Issues

Si encuentras algún problema, abre un [issue](https://github.com/sudicas/webcam-playas/issues) con:
- Descripción del problema
- Captura de pantalla
- Consola del navegador (F12 → Console)

## 🙏 Agradecimientos

- [Camaramar](https://www.camaramar.com) por las cámaras
- Comunidad de [HLS.js](https://github.com/video-dev/hls.js)

---

Hecho con ❤️ en Galicia
