# MusicApp

Aplicación web de streaming de música construida con Vue 3. Interfaz similar a Spotify con reproductor persistente, biblioteca de canciones y álbumes, sistema de carga de archivos, cola de reproducción y cambio de tema oscuro/claro.

## Tecnologías

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router** (navegación SPA)
- **Vue I18n** (internacionalización ES/EN con persistencia en localStorage)
- **Vite** (bundler y dev server)
- **HTML5 Audio API** (reproducción nativa)
- **Media Session API** (controles en pantalla de bloqueo)
- **SortableJS** (drag & drop reorder)
- **music-metadata-browser** (extracción de metadatos del lado cliente)

## Funcionalidades

- **Autenticación** — registro e inicio de sesión con JWT (persistencia en localStorage)
- **Reproductor persistente** — barra inferior fija con play/pause, anterior/siguiente, progreso seekeable, volumen y mute
- **Cola de reproducción** — panel deslizable con lista de reproducción, agregar/remover canciones
- **Biblioteca de canciones** — listado paginado con búsqueda cliente, reproducción, info y eliminación
- **Álbumes** — listado paginado con expansión para ver tracks, reproducción completa y eliminación
- **Artistas** — selector multi-columna con búsqueda, drag-to-reorder y creación inline
- **Carga de archivos** — modal con 3 pestañas:
  - **Canciones**: subida múltiple con extracción automática de metadatos, edición por archivo y "apply to all"
  - **Álbum**: creación de álbum con carga secuencial de tracks y reordenamiento
  - **Artista**: formulario simple con imagen
- **Cambio de tema** — modo oscuro/claro con persistencia en localStorage
- **Internacionalización** — español e inglés con persistencia en localStorage

## Rutas

| Ruta | Vista | Auth |
|------|-------|------|
| `/` | Home | No |
| `/login` | Inicio de sesión | Solo invitados |
| `/register` | Registro | Solo invitados |
| `/library` | Biblioteca (tracks/álbumes) | Sí |
| `/settings` | Configuración (tema, idioma, cuenta) | No |

## Componentes principales

| Componente | Descripción |
|---|---|
| `PlayerBar.vue` | Reproductor persistente con controles, progreso y volumen |
| `QueuePanel.vue` | Panel de cola de reproducción |
| `TracksView.vue` | Tabla de tracks con paginación y búsqueda |
| `AlbumsView.vue` | Lista de álbumes expandibles |
| `UploadModal.vue` | Modal contenedor de los 3 tipos de carga |
| `UploadSongsModal.vue` | Carga múltiple de canciones con metadatos |
| `UploadAlbumModal.vue` | Carga de álbum con tracks |
| `UploadArtistModal.vue` | Creación de artista |
| `ArtistSelector.vue` | Selector multi-columna con drag-to-reorder |
| `Pagination.vue` | Paginador con selector de tamaño de página |
| `ThemeSwitcher.vue` | Toggle oscuro/claro |
| `LanguageSwitcher.vue` | Selector ES/EN |

## Scripts

```bash
npm run dev      # Inicia servidor de desarrollo (puerto 5173)
npm run build    # Compila para producción
npm run preview  # Previsualiza la compilación
```

## Backend

La app se conecta a una API REST en `http://localhost:8080/api`. El backend debe estar corriendo para que funcionen autenticación, biblioteca, álbumes y artistas.

Endpoints utilizados: `/auth/**`, `/tracks/**`, `/albums/**`, `/artists/**`.
