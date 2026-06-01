# FonoPort

Aplicación web de streaming y biblioteca de música construida con Vue 3 y TypeScript. Interfaz inspirada en Spotify con reproductor persistente, sistema de carga de archivos con extracción automática de metadatos, cola de reproducción, múltiples temas y soporte para dos idiomas.

---

## Tabla de contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Caracteristicas](#características)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas](#rutas)
- [Componentes](#componentes)
- [Composables](#composables)
- [Sistema de estado](#sistema-de-estado)
- [Servicios API](#servicios-api)
- [Sistema de temas](#sistema-de-temas)
- [Internacionalizacion](#internacionalización)
- [Scripts](#scripts)
- [Variables de entorno](#variables-de-entorno)
- [Docker](#docker)
- [Backend](#backend)

---

## Stack Tecnológico

| Tecnologia | Version | Uso |
|---|---|---|
| Vue 3 | ^3.5.34 | Framework frontend (Composition API + `<script setup>`) |
| TypeScript | ^6.0.3 | Tipado estático |
| Vue Router | ^5.0.7 | Navegación SPA con HTML5 history mode |
| Vue I18n | ^11.4.2 | Internacionalización ES/EN |
| Vite | ^8.0.13 | Bundler y dev server |
| HTML5 Audio API | Nativa | Reproduccion de audio en el navegador |
| Media Session API | Nativa | Controles en pantalla de bloqueo / barra de notificaciones |
| SortableJS | ^1.15.7 | Drag & drop para reordenar |
| music-metadata-browser | ^2.5.11 | Extracción de metadatos de archivos de audio en el cliente |
| buffer | ^6.0.3 | Polyfill de Buffer para browser |

**Herramientas de desarrollo:**

| Paquete | Version | Uso |
|---|---|---|
| @vitejs/plugin-vue | ^6.0.6 | Plugin de Vue para Vite |
| vue-tsc | ^3.3.3 | Verificación de tipos Vue |
| ESLint + eslint-plugin-vue | ^10.4.1 / ^10.9.1 | Linting |
| @typescript-eslint | ^8.60.0 | Reglas ESLint para TypeScript |
| @eslint/js | ^10.0.1 | Reglas ESLint core |
| @types/node | ^25.9.1 | Tipos de Node.js |
| @types/sortablejs | ^1.15.9 | Tipos de SortableJS |
| @vue/tsconfig | ^0.9.1 | Configuración tsconfig para Vue |
| typescript-eslint | ^8.60.0 | Integracion TypeScript + ESLint |

---

## Características

### Autenticación
- Registro e inicio de sesión con JWT
- Persistencia de sesión en `localStorage`
- Guard de rutas para proteger rutas autenticadas
- Roles de usuario: `ADMIN` y `STANDARD` (con límites de almacenamiento diferentes)

### Reproductor de audio
- Barra inferior fija con controles: play/pause, anterior/siguiente
- Barra de progreso con seek (arrastrable con tooltip de tiempo)
- Control de volumen con botón de mute
- Restauración del último track al recargar la página
- Atajos de teclado: Espacio para play/pause
- Integración con Media Session API (controles en notificaciones del sistema operativo)

### Cola de reproducción
- Panel deslizable desde la parte inferior
- Reordenamiento con drag & drop (SortableJS)
- Agregar/remover canciones individuales
- Reproducir desde cualquier posición de la cola
- Botón para limpiar toda la cola

### Biblioteca de canciones
- Tabla paginada con búsqueda con debounce (300ms)
- Filtros combinados por artista y álbum
- Ordenamiento por título, artista, álbum, duración
- Operaciones: reproducir, agregar a cola, descargar, editar, ver info, eliminar
- Vista expandible con detalles del track (fecha de lanzamiento, tamaño de archivo)

### Álbumes
- Listado paginado con filas expandibles para ver tracks
- Crear álbum con carga de tracks y reordenamiento
- Editar álbum: agregar, eliminar y reordenar tracks
- Reproducir álbum completo (agrega todos los tracks a la cola)
- Descarga como ZIP
- Eliminación con advertencia

### Artistas
- Grid responsivo de tarjetas con imagen, nombre y contadores
- Búsqueda con debounce
- Vista expandible con tracks y álbumes del artista (paginados independientemente)
- Crear/editar artista con imagen
- Descarga como ZIP
- Eliminación con advertencia de contenido

### Carga de archivos
- Modal contenedor con 3 pestañas:

**Canciones:**
- Carga múltiple con drag & drop
- Extracción automática de metadatos (título, artista, álbum, carátula, duración)
- Edición individual por archivo
- Selector global de artistas con "apply to all"
- Búsqueda automática de artistas en el backend por nombre embebido

**Álbum:**
- Creación de álbum con portada, nombre, artista y fecha
- Carga secuencial de tracks con metadatos
- Reordenamiento con drag & drop (SortableJS)
- Modo edición: agregar, eliminar y reordenar tracks existentes

**Artista:**
- Formulario con nombre e imagen
- Vista previa de imagen

### Sistema de temas
- 5 temas: Warp (por defecto), Midnight, Forest, Ocean, Retro
- Modo oscuro y claro por tema
- Persistencia en `localStorage`
- CSS custom properties para cada tema

### Internacionalización
- Espanol (por defecto) e Ingles
- Persistencia de idioma en `localStorage`
- 133 claves de traduccion cubriendo toda la aplicacion

### Otros
- Tema oscuro/claro con persistencia
- Barra de almacenamiento con indicador de uso (normal, advertencia >=70%, crítico >=90%)
- Modos de streaming: Range (HTTP Range requests) y Blob (descarga completa)
- Confirmaciones de eliminación con diálogo modal
- Página 404 personalizada

---

## Estructura del Proyecto

```
front_proyecto/
├── index.html                           # Archivo HTML de entrada de Vite
├── env.d.ts                             # Declaraciones de tipos para Vite y APP_NAME
├── DESIGN.md                            # Documento de sistema de diseño (Warp-inspired)
├── public/
├── src/
│   ├── App.vue                            # Componente raiz
│   ├── main.ts                            # Punto de entrada
│   ├── config.ts                          # Constantes (APP_NAME)
│   │
│   ├── assets/
│   │   └── styles/
│   │       ├── global.css                 # Reset y estilos base
│   │       ├── variables.css              # Variables CSS globales
│   │       ├── components/
│   │       │   ├── auth.css               # Estilos de autenticación
│   │       │   ├── modal.css              # Estilos de modales
│   │       │   ├── selector.css           # Estilos de selectores
│   │       │   ├── states.css             # Estados de carga/vacío
│   │       │   ├── toolbar.css            # Estilos de barra de herramientas
│   │       │   ├── track-list.css         # Estilos de lista de tracks
│   │       │   └── upload.css             # Estilos de zona de carga
│   │       └── themes/
│   │           ├── index.ts               # Registro de temas
│   │           ├── warp.css               # Tema Warp (por defecto)
│   │           ├── midnight.css           # Tema Midnight
│   │           ├── forest.css             # Tema Forest
│   │           ├── ocean.css              # Tema Ocean
│   │           └── retro.css              # Tema Retro
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppLogo.vue               # Logo + nombre de marca
│   │   │   ├── CombinedFilter.vue        # Filtro combinado (artista/álbum/orden)
│   │   │   ├── ConfirmDialog.vue         # Diálogo de confirmación
│   │   │   ├── DarkModeToggle.vue        # Toggle oscuro/claro
│   │   │   ├── FilterSelector.vue        # Selector multi-select genérico
│   │   │   ├── LanguageSwitcher.vue       # Selector ES/EN
│   │   │   ├── Pagination.vue            # Paginador con selector de tamaño
│   │   │   ├── StorageBar.vue            # Barra de uso de almacenamiento
│   │   │   └── ThemeSwitcher.vue         # Selector de temas
│   │   ├── icons/
│   │   │   └── Icon.vue                  # Componente de iconos SVG (30+ iconos)
│   │   ├── modals/
│   │   │   ├── ArtistSelector.vue        # Selector multi-select de artistas
│   │   │   ├── UploadAlbumModal.vue      # Modal de carga de álbum
│   │   │   ├── UploadArtistModal.vue     # Modal de carga de artista
│   │   │   ├── UploadModal.vue           # Modal contenedor (pestañas)
│   │   │   └── UploadSongsModal.vue      # Modal de carga de canciones
│   │   ├── player/
│   │   │   ├── PlayerBar.vue             # Barra inferior del reproductor
│   │   │   └── QueuePanel.vue            # Panel de cola de reproducción
│   │   └── views/
│   │       ├── AlbumsView.vue            # Lista de álbumes expandibles
│   │       ├── ArtistExpanded.vue        # Vista expandida de artista
│   │       ├── ArtistsView.vue           # Grid de artistas
│   │       ├── HomeView.vue              # Página de inicio
│   │       ├── LibraryView.vue           # Contenedor de biblioteca (pestanas)
│   │       ├── LoginView.vue             # Formulario de inicio de sesión
│   │       ├── NotFoundView.vue          # Página 404
│   │       ├── RegisterView.vue          # Formulario de registro
│   │       ├── SettingsView.vue          # Página de configuración
│   │       └── TracksView.vue            # Tabla de tracks con filtros
│   │
│   ├── composables/
│   │   ├── useMediaSession.ts            # Integración Media Session API
│   │   ├── useStreamingMode.ts           # Modo de streaming (Range/Blob)
│   │   └── useTheme.ts                   # Gestión de temas y modo oscuro
│   │
│   ├── i18n/
│   │   ├── index.ts                      # Configuración de vue-i18n
│   │   ├── en.json                       # Traducciones en inglés
│   │   └── es.json                       # Traducciones en español
│   │
│   ├── router/
│   │   └── index.ts                      # Definición de rutas y guards
│   │
│   ├── services/
│   │   ├── api.ts                        # Fachada unificada de la API
│   │   ├── albums.ts                     # CRUD de álbumes
│   │   ├── artists.ts                    # CRUD de artistas
│   │   ├── auth.ts                       # Autenticación (login, register, me)
│   │   ├── storage.ts                    # Uso de almacenamiento
│   │   ├── tracks.ts                     # CRUD de tracks + streaming
│   │   └── utils.ts                      # Utilidades HTTP (headers, manejo de respuestas)
│   │
│   ├── stores/
│   │   ├── authStore.ts                  # Estado de autenticación
│   │   └── playerStore.ts                # Estado del reproductor
│   │
│   ├── types/
│   │   ├── index.ts                      # Re-exportación de todos los tipos
│   │   ├── album.ts                      # Tipos de álbum
│   │   ├── artist.ts                     # Tipos de artista
│   │   ├── auth.ts                       # Tipos de autenticación
│   │   ├── common.ts                     # Tipos comunes (PageResponse)
│   │   ├── storage.ts                    # Tipos de almacenamiento
│   │   ├── theme.ts                      # Tipos de tema
│   │   └── track.ts                      # Tipos de track
│   │
│   └── utils/
│       └── utils.ts                      # formatDuration, formatFileSize
│
├── .env.development                      # Variables de entorno (dev)
├── .env.production                       # Variables de entorno (prod)
├── .env.example                          # Plantilla de variables de entorno
├── vite.config.ts                        # Configuración de Vite
├── tsconfig.json                         # Configuracion de TypeScript
├── eslint.config.js                      # Configuracion de ESLint
├── Dockerfile                            # Build multi-etapa (Node + Nginx)
├── nginx.conf                            # Configuracion de Nginx
├── package.json
└── README.md
```

---

## Rutas

| Ruta | Vista | Auth | Descripción |
|------|-------|------|-------------|
| `/` | `HomeView` | No | Página de inicio con hero y enlace a la biblioteca |
| `/login` | `LoginView` | Solo invitados | Formulario de inicio de sesión |
| `/register` | `RegisterView` | Solo invitados | Formulario de registro |
| `/library` | `LibraryView` | Requerida | Biblioteca con pestañas: Tracks / Álbumes / Artistas |
| `/settings` | `SettingsView` | No | Configuración: cuenta, tema, idioma, modo de streaming |
| `/:pathMatch(.*)*` | `NotFoundView` | No | Página 404 |

**Guards de navegación:**
- Rutas con `meta.requiresAuth`: redirigen a `/login` si no hay sesión activa
- Rutas con `meta.guest`: redirigen a `/library` si ya hay sesión activa
- La autenticación se verifica directamente en `localStorage` (no depende del orden de inicialización del store)

---

## Componentes

### Reproductor

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `PlayerBar.vue` | `components/player/` | Barra inferior fija con info del track, controles (prev/play-pause/next), barra de progreso con seek y tooltip, control de volumen, toggle de cola y enlace a ajustes |
| `QueuePanel.vue` | `components/player/` | Panel deslizable con lista de reproducción, reordenamiento con drag & drop, reproducción desde cualquier índice, botón para limpiar cola, redimensionable por arrastre |

### Modales de carga

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `UploadModal.vue` | `components/modals/` | Contenedor con 3 pestanas (Canciones/Album/Artista) que delega a los sub-modales |
| `UploadSongsModal.vue` | `components/modals/` | Carga multiple de canciones con drag & drop, extraccion de metadatos, edicion individual, selector global de artistas |
| `UploadAlbumModal.vue` | `components/modals/` | Creacion/edicion de album con cover, artista, fecha y lista de tracks reordenable con SortableJS |
| `UploadArtistModal.vue` | `components/modals/` | Creacion/edicion de artista con nombre e imagen con vista previa |
| `ArtistSelector.vue` | `components/modals/` | Selector multi-select de artistas con busqueda, reordenamiento y creacion inline |

### Vistas

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `HomeView.vue` | `components/views/` | Landing page con hero y tarjeta de features |
| `LoginView.vue` | `components/views/` | Formulario de login con campos username/password |
| `RegisterView.vue` | `components/views/` | Formulario de registro con campos nombre/email/password |
| `LibraryView.vue` | `components/views/` | Contenedor con pestanas Tracks/Albumes/Artistas y boton "Agregar" |
| `TracksView.vue` | `components/views/` | Tabla paginada de tracks con busqueda, filtros combinados, ordenamiento y acciones (play/cola/descargar/editar/info/eliminar) |
| `AlbumsView.vue` | `components/views/` | Lista de albumes con filas expandibles para tracks, acciones por album y por track individual |
| `ArtistsView.vue` | `components/views/` | Grid responsivo de tarjetas de artista con busqueda, expandible para ver tracks y albums |
| `ArtistExpanded.vue` | `components/views/` | Panel expandido dentro de ArtistsView con tracks y albums paginados del artista |
| `SettingsView.vue` | `components/views/` | Configuracion con secciones: Cuenta (info + barra de almacenamiento), Apariencia (tema + modo oscuro), Idioma, Modo de streaming |
| `NotFoundView.vue` | `components/views/` | Pagina 404 con enlace al inicio |

### Componentes comunes

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `AppLogo.vue` | `components/common/` | Logo SVG + nombre de la marca, enlace al inicio |
| `CombinedFilter.vue` | `components/common/` | Filtro combinado con pestanas de Artista, Album y Orden |
| `ConfirmDialog.vue` | `components/common/` | Dialogo modal de confirmacion con variante peligrosa y estado de carga |
| `DarkModeToggle.vue` | `components/common/` | Toggle oscuro/claro con iconos de sol/luna |
| `FilterSelector.vue` | `components/common/` | Dropdown multi-select generico con busqueda |
| `LanguageSwitcher.vue` | `components/common/` | Toggle ES/EN con grupo de botones |
| `Pagination.vue` | `components/common/` | Navegacion paginada con selector de tamano (10/20/50/100) |
| `StorageBar.vue` | `components/common/` | Barra de progreso de almacenamiento con colores por nivel de uso |
| `ThemeSwitcher.vue` | `components/common/` | Grid 2x2 de selector de temas con vista previa de colores |

### Iconos

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `Icon.vue` | `components/icons/` | Componente SVG con 30+ iconos (play, pause, prev, next, volume, queue, settings, close, search, trash, plus, info, upload, drag, chevron, check, moon, sun, logout, music, album, artist, edit, download, sort, etc.) |

---

## Composables

| Composable | Ubicacion | Descripcion |
|---|---|---|
| `useTheme` | `composables/useTheme.ts` | Gestion de tema y modo oscuro. Estado singleton compartido. Persiste en `localStorage`. Aplica clases CSS al elemento `<html>`. |
| `useStreamingMode` | `composables/useStreamingMode.ts` | Modo de streaming: `RANGE` (HTTP Range requests) o `BLOB` (descarga completa). Persiste en `localStorage`. |
| `useMediaSession` | `composables/useMediaSession.ts` | Integracion con Media Session API. Configura acciones de play/pause/prev/next/seekto. Actualiza metadata del sistema. Atajo de teclado: Espacio para play/pause. |

---

## Sistema de estado

La aplicacion utiliza **`reactive()` de Vue directamente** (sin Pinia ni Vuex). Los stores son modulos singleton con estado a nivel de modulo.

### `authStore.ts`

| Estado | Tipo | Descripcion |
|---|---|---|
| `user` | `UserInfo \| null` | Usuario autenticado actual |
| `token` | `string \| null` | Token JWT |
| `isAuthenticated` | `boolean` | Indica si hay sesion activa |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error |

**Metodos:** `init()`, `login()`, `register()`, `logout()`, `isAdmin()`, `getRoleName()`

### `playerStore.ts`

| Estado | Tipo | Descripcion |
|---|---|---|
| `currentTrack` | `TrackDTO \| null` | Track reproduciendo actualmente |
| `isPlaying` | `boolean` | Estado de reproduccion |
| `volume` | `number` | Volumen (0-1) |
| `position` | `number` | Posicion actual en segundos |
| `duration` | `number` | Duracion total en segundos |
| `queue` | `TrackDTO[]` | Cola de reproduccion |
| `backQueue` | `TrackDTO[]` | Cola de tracks anteriores |

**Metodos:** `playTrack()`, `play()`, `pause()`, `togglePlay()`, `seek()`, `setVolume()`, `mute()`, `playNext()`, `playPrevious()`, `addToQueue()`, `removeFromQueue()`, `reorderQueue()`, `clearQueue()`, `playFromQueue()`, `restoreLastTrack()`

---

## Servicios API

Todos los servicios usan `fetch()` nativo (sin axios). Autenticacion via Bearer token en headers.

### Auth (`services/auth.ts`)

| Funcion | Metodo | Endpoint | Descripcion |
|---|---|---|---|
| `login(username, password)` | POST | `/auth/login` | Inicio de sesion, retorna token + usuario |
| `register(username, email, password)` | POST | `/auth/register` | Registro, retorna token + usuario |
| `getMe()` | GET | `/auth/me` | Informacion del usuario actual |

### Tracks (`services/tracks.ts`)

| Funcion | Metodo | Endpoint | Descripcion |
|---|---|---|---|
| `getTracks(page, size, search, artistIds, albumIds, sortBy, sortDirection)` | GET | `/tracks` | Listado paginado con filtros |
| `getTrack(id)` | GET | `/tracks/:id` | Un track |
| `getTrackCount()` | GET | `/tracks/count` | Cantidad total de tracks |
| `uploadTrack(...)` | POST | `/tracks` | Subir track (FormData) |
| `updateTrack(id, ...)` | PUT | `/tracks/:id` | Actualizar track (FormData) |
| `deleteTrack(id)` | DELETE | `/tracks/:id` | Eliminar track |
| `getStreamUrl(id)` | - | `/tracks/:id/stream?token=` | URL de streaming (token en query) |
| `getTrackStreamBlob(id)` | GET | `/tracks/:id/stream` | Stream como Blob |
| `downloadTrack(id)` | GET | `/tracks/:id/download` | Descargar archivo |
| `downloadAlbumZip(id)` | GET | `/albums/:id/download` | Descargar album como ZIP |
| `downloadArtistZip(id)` | GET | `/artists/:id/download` | Descargar artista como ZIP |

### Albums (`services/albums.ts`)

| Funcion | Metodo | Endpoint | Descripcion |
|---|---|---|---|
| `getAlbums(page, size, search, artistIds, sortBy, sortDirection)` | GET | `/albums` | Listado paginado |
| `getAlbum(id)` | GET | `/albums/:id` | Album con tracks |
| `createAlbum(...)` | POST | `/albums` | Crear album |
| `updateAlbum(id, ...)` | PUT | `/albums/:id` | Actualizar album |
| `deleteAlbum(id)` | DELETE | `/albums/:id` | Eliminar album |
| `uploadAlbumTrack(albumId, ...)` | POST | `/albums/:id/tracks` | Subir track a album |
| `reorderAlbumTracks(albumId, trackIds)` | PUT | `/albums/:id/tracks/reorder` | Reordenar tracks |
| `deleteAlbumTrack(albumId, trackId)` | DELETE | `/albums/:id/tracks/:trackId` | Eliminar track de album |

### Artists (`services/artists.ts`)

| Funcion | Metodo | Endpoint | Descripcion |
|---|---|---|---|
| `getArtists(page, size, search)` | GET | `/artists` | Listado paginado |
| `getArtistsList(page, size, search)` | GET | `/artists/list` | Lista plana para selectores |
| `getAlbumsList(artistIds, page, size, search)` | GET | `/albums/list` | Lista plana de albumes para selectores |
| `getArtist(id)` | GET | `/artists/:id` | Un artista |
| `createArtist(name, image)` | POST | `/artists` | Crear artista |
| `updateArtist(id, name, image)` | PUT | `/artists/:id` | Actualizar artista |
| `deleteArtist(id)` | DELETE | `/artists/:id` | Eliminar artista |
| `getArtistTracks(id, page, size)` | GET | `/artists/:id/tracks` | Tracks del artista |
| `getArtistAlbums(id, page, size)` | GET | `/artists/:id/albums` | Albumes del artista |
| `downloadArtist(id)` | GET | `/artists/:id/download` | Descargar artista como ZIP |

### Storage (`services/storage.ts`)

| Funcion | Metodo | Endpoint | Descripcion |
|---|---|---|---|
| `getStorageUsage()` | GET | `/auth/storage` | Uso de almacenamiento (usedBytes, limitBytes, availableBytes, roleName) |

---

## Sistema de temas

5 temas disponibles, cada uno con variantes clara y oscura definidas con CSS custom properties:

| Tema | Acento (Claro) | Acento (Oscuro) | Icono |
|---|---|---|---|
| **Warp** (por defecto) | `#2b2622` (marron oscuro) | `#f7f5f0` (blanco hueso) | `sun` |
| **Midnight** | `#2c3e6b` (azul marino) | `#7a9fd4` (azul claro) | `moon` |
| **Forest** | `#2d5a2d` (verde) | `#6aaa6a` (verde claro) | `music` |
| **Ocean** | `#1a6a8a` (turquesa) | `#4ab0d4` (azul cielo) | `album` |
| **Retro** | `#8a6a3a` (sepia) | `#c8a86a` (dorado) | `artist` |

**Variables CSS por tema:** `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-alpha`, `--border`, `--color-scheme`

**Persistencia:** Tema seleccionado y modo oscuro se guardan en `localStorage` con las claves `theme` y `darkMode`.

---

## Internacionalización

- **Idiomas:** Espanol (`es`, por defecto) e Ingles (`en`, fallback)
- **Persistencia:** Idioma guardado en `localStorage` con la clave `locale`
- **Configuracion:** `vue-i18n` en modo Composition API (`legacy: false`)
- **133 claves de traduccion** organizadas en namespaces:

| Namespace | Contenido |
|---|---|
| `nav` | Navegacion |
| `home` | Pagina de inicio (con interpolacion `{appName}`) |
| `auth` | Formularios de login/registro |
| `library` | Gestion de tracks, albumes, artistas, carga, busqueda, filtros, orden, almacenamiento |
| `confirm` | Dialogos de eliminacion (con interpolacion de `{item}`, `{tracks}`, `{albums}`) |
| `pagination` | Navegacion paginada |
| `player` | Controles del reproductor (con interpolacion `{current}`, `{total}`) |
| `common` | Acciones compartidas |
| `settings` | Configuracion (cuenta, apariencia, temas, idioma, streaming, almacenamiento) |
| `notfound` | Pagina 404 |

---

## Scripts

```bash
npm run dev          # Inicia servidor de desarrollo (puerto 5173)
npm run build        # Verifica tipos y compila para produccion
npm run build:prod   # Compila explicitamente en modo produccion
npm run type-check   # Verifica tipos sin compilar
npm run lint         # Ejecuta ESLint sobre src/
npm run lint:fix     # ESLint con auto-correccion
npm run preview      # Previsualiza la compilacion de produccion
```

---

## Variables de Entorno

| Variable | Descripcion | Desarrollo | Produccion |
|---|---|---|---|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:8080/api` | `https://api.tudominio.com/api` |

**Archivos de configuracion:**
- `.env.development` - Variables para `npm run dev`
- `.env.production` - Variables para `npm run build:prod`
- `.env.example` - Plantilla con comentarios

**Constantes globales** (definidas en `vite.config.ts`):
- `APP_NAME` = `'FonoPort'` (disponible como variable global en tiempo de compilacion)
- `global` = `globalThis` (polyfill para `music-metadata-browser`)

---

## Docker

### Dockerfile (multi-etapa)

**Etapa 1 - Build (Node 22 Alpine):**
1. Instala dependencias
2. Compila la aplicacion con `VITE_API_URL` como argumento de build

**Etapa 2 - Serve (Nginx Alpine):**
1. Copia los archivos compilados
2. Sirve con Nginx usando configuracion personalizada

### nginx.conf

- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, etc.)
- Compresion gzip
- Cache inmutable de 1 ano para `/assets/`
- Proxy reverso: `/api/` -> `http://backend:8080`
- SPA fallback: `try_files $uri $uri/ /index.html`
- `client_max_body_size 500M` para cargas grandes

### Comandos

```bash
# Build
docker build -t fonopart-front .

# Ejecutar
docker run -p 80:80 -e VITE_API_URL=http://backend:8080/api fonopart-front
```

---

## Backend

La aplicacion se conecta a una API REST. El backend **debe estar corriendo** para que funcionen:

- Autenticacion (login, registro, sesion)
- Biblioteca de tracks (CRUD, busqueda, filtros)
- Albumes (CRUD, tracks, reordenamiento, descarga ZIP)
- Artistas (CRUD, tracks, albums, descarga ZIP)
- Almacenamiento (uso de espacio)

**URL por defecto:** `http://localhost:8080/api`

**Endpoints utilizados:**

| Prefijo | Servicios |
|---|---|
| `/auth/` | login, register, me, storage |
| `/tracks/` | CRUD, stream, download |
| `/albums/` | CRUD, tracks, reorder, download |
| `/artists/` | CRUD, tracks, albums, download |

**Nota sobre streaming:** Para el modo Range, el token JWT se pasa como parametro de query (`?token=...`) porque el elemento `<audio>` de HTML5 no soporta headers personalizados. Se recomienda HTTPS en produccion para mitigar esto.
