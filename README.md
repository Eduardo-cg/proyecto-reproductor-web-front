# FonoPort - Frontend

Aplicación web de streaming y biblioteca de música construida con Vue 3 y TypeScript. Interfaz inspirada en Spotify con reproductor persistente, sistema de carga de archivos con extracción automática de metadatos, cola de reproducción, múltiples temas y soporte para dos idiomas.

---

## Tabla de contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Rutas (Vue Router)](#rutas-vue-router)
- [Componentes](#componentes)
- [Composables](#composables)
- [Sistema de estado](#sistema-de-estado)
- [Servicios API](#servicios-api)
- [Sistema de temas](#sistema-de-temas)
- [Internacionalización](#internacionalización)
- [Scripts](#scripts)
- [Variables de entorno](#variables-de-entorno)
- [Docker](#docker)
- [Backend](#backend)

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Vue 3 | ^3.5.35 | Framework frontend (Composition API + `<script setup>`) |
| TypeScript | ^6.0.3 | Tipado estático |
| Vue Router | ^5.1.0 | Navegación SPA con HTML5 history mode |
| Vue I18n | ^11.4.4 | Internacionalización ES/EN |
| Vite | ^8.0.16 | Bundler y dev server |
| HTML5 Audio API | Nativa | Reproducción de audio en el navegador |
| Media Session API | Nativa | Controles en pantalla de bloqueo / barra de notificaciones |
| SortableJS | ^1.15.7 | Drag & drop para reordenar |
| music-metadata | ^11.12.3 | Extracción de metadatos de archivos de audio en el cliente |
| buffer | ^6.0.3 | Polyfill de Buffer para browser |

**Herramientas de desarrollo:**

| Paquete | Versión | Uso |
|---|---|---|
| @vitejs/plugin-vue | ^6.0.7 | Plugin de Vue para Vite |
| vue-tsc | ^3.3.3 | Verificación de tipos Vue |
| ESLint + eslint-plugin-vue | ^10.4.1 / ^10.9.1 | Linting |
| @typescript-eslint | ^8.60.0 | Reglas ESLint para TypeScript |
| @eslint/js | ^10.0.1 | Reglas ESLint core |
| @types/node | ^25.9.1 | Tipos de Node.js |
| @types/sortablejs | ^1.15.9 | Tipos de SortableJS |
| @vue/tsconfig | ^0.9.1 | Configuración tsconfig para Vue |
| typescript-eslint | ^8.60.0 | Integración TypeScript + ESLint |

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
- Extracción automática de metadatos (título, artista, álbum, carátula, duración) con `music-metadata`
- Edición individual por archivo, incluida la portada (click en el cover del preview abre el selector de imagen)
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
- Español (por defecto) e Inglés
- Persistencia de idioma en `localStorage`
- 147 claves de traducción cubriendo toda la aplicación

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
│   │       ├── LibraryView.vue           # Contenedor de biblioteca (pestañas)
│   │       ├── LoginView.vue             # Formulario de inicio de sesión
│   │       ├── NotFoundView.vue          # Página 404
│   │       ├── RegisterView.vue          # Formulario de registro
│   │       ├── SettingsView.vue          # Página de configuración
│   │       └── TracksView.vue            # Tabla de tracks con filtros
│   │
│   ├── composables/
│   │   ├── useAlbumsList.ts              # Estado singleton de lista de álbumes
│   │   ├── useArtistsList.ts             # Estado singleton de lista de artistas
│   │   ├── useTracksList.ts              # Estado singleton de lista de tracks
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
│       ├── utils.ts                      # formatDuration, formatFileSize, arrayBufferToBase64,
│                                          # titleFromFile, extractCover (CoverExtraction)
│       └── mediaSession.ts               # Integración Media Session API
│
├── .env.development                      # Variables de entorno (dev)
├── .env.production                       # Variables de entorno (prod)
├── vite.config.ts                        # Configuración de Vite
├── tsconfig.json                         # Configuración de TypeScript
├── eslint.config.js                      # Configuración de ESLint
├── Dockerfile                            # Build multi-etapa (Node + Nginx)
├── nginx.conf                            # Configuración de Nginx
├── package.json
└── README.md
```

---

## Rutas (Vue Router)

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

| Componente | Ubicación | Descripción |
|---|---|---|
| `PlayerBar.vue` | `components/player/` | Barra inferior fija con info del track, controles (prev/play-pause/next), barra de progreso con seek y tooltip, control de volumen, toggle de cola y enlace a ajustes |
| `QueuePanel.vue` | `components/player/` | Panel deslizable con lista de reproducción, reordenamiento con drag & drop, reproducción desde cualquier índice, botón para limpiar cola, redimensionable por arrastre |

### Modales de carga

| Componente | Ubicación | Descripción |
|---|---|---|
| `UploadModal.vue` | `components/modals/` | Contenedor con 3 pestañas (Canciones/Álbum/Artista) que delega a los sub-modales |
| `UploadSongsModal.vue` | `components/modals/` | Carga múltiple de canciones con drag & drop, extracción de metadatos, edición individual (incluye cambio de portada por archivo en el preview), selector global de artistas |
| `UploadAlbumModal.vue` | `components/modals/` | Creación/edición de álbum con cover, artista, fecha y lista de tracks reordenable con SortableJS |
| `UploadArtistModal.vue` | `components/modals/` | Creación/edición de artista con nombre e imagen con vista previa |
| `ArtistSelector.vue` | `components/modals/` | Selector multi-select de artistas con búsqueda, reordenamiento y creación inline |

### Vistas

| Componente | Ubicación | Descripción |
|---|---|---|
| `HomeView.vue` | `components/views/` | Landing page con hero y tarjeta de features |
| `LoginView.vue` | `components/views/` | Formulario de login con campos username/password |
| `RegisterView.vue` | `components/views/` | Formulario de registro con campos nombre/email/password |
| `LibraryView.vue` | `components/views/` | Contenedor con pestañas Tracks/Álbumes/Artistas y botón "Agregar" |
| `TracksView.vue` | `components/views/` | Tabla paginada de tracks con búsqueda, filtros combinados, ordenamiento y acciones (play/cola/descargar/editar/info/eliminar) |
| `AlbumsView.vue` | `components/views/` | Lista de álbumes con filas expandibles para tracks, acciones por álbum y por track individual |
| `ArtistsView.vue` | `components/views/` | Grid responsivo de tarjetas de artista con búsqueda, expandible para ver tracks y álbumes |
| `ArtistExpanded.vue` | `components/views/` | Panel expandido dentro de ArtistsView con tracks y albums paginados del artista |
| `SettingsView.vue` | `components/views/` | Configuración con secciones: Cuenta (info + barra de almacenamiento), Apariencia (tema + modo oscuro), Idioma, Modo de streaming |
| `NotFoundView.vue` | `components/views/` | Página 404 con enlace al inicio |

### Componentes comunes

| Componente | Ubicación | Descripción |
|---|---|---|
| `AppLogo.vue` | `components/common/` | Logo SVG + nombre de la marca, enlace al inicio |
| `CombinedFilter.vue` | `components/common/` | Filtro combinado con pestañas de Artista, Álbum y Orden |
| `ConfirmDialog.vue` | `components/common/` | Diálogo modal de confirmación con variante peligrosa y estado de carga |
| `DarkModeToggle.vue` | `components/common/` | Toggle oscuro/claro con iconos de sol/luna |
| `LanguageSwitcher.vue` | `components/common/` | Toggle ES/EN con grupo de botones |
| `Pagination.vue` | `components/common/` | Navegación paginada con selector de tamaño (10/20/50/100) |
| `StorageBar.vue` | `components/common/` | Barra de progreso de almacenamiento con colores por nivel de uso |
| `ThemeSwitcher.vue` | `components/common/` | Grid 2x2 de selector de temas con vista previa de colores |

### Iconos

| Componente | Ubicación | Descripción |
|---|---|---|
| `Icon.vue` | `components/icons/` | Componente SVG con 30+ iconos (play, pause, prev, next, volume, queue, settings, close, search, trash, plus, info, upload, drag, chevron, check, moon, sun, logout, music, album, artist, edit, download, sort, etc.) |

---

## Composables

| Composable | Ubicación | Descripción |
|---|---|---|
| `useTheme` | `composables/useTheme.ts` | Gestión de tema y modo oscuro. Estado singleton compartido. Persiste en `localStorage`. Aplica clases CSS al elemento `<html>`. |
| `useStreamingMode` | `composables/useStreamingMode.ts` | Modo de streaming: `RANGE` (HTTP Range requests) o `BLOB` (descarga completa). Persiste en `localStorage`. |
| `useTracksList` | `composables/useTracksList.ts` | Estado singleton compartido de la lista de tracks: paginación, búsqueda con debounce, filtros por artista/álbum, orden. Consumido por `TracksView`. |
| `useAlbumsList` | `composables/useAlbumsList.ts` | Estado singleton de la lista de álbumes: paginación, búsqueda, filtros por artista, orden, mapa `albumId -> tracks[]` para filas expandidas. Consumido por `AlbumsView`. |
| `useArtistsList` | `composables/useArtistsList.ts` | Estado singleton de la lista de artistas: paginación, búsqueda con debounce, ID expandido. Consumido por `ArtistsView`. |

> La integración con **Media Session API** vive en `utils/mediaSession.ts` (no es un composable: expone `initMediaSession(audio)` que se llama una vez desde `playerStore`).

---

## Sistema de estado

La aplicación utiliza **`reactive()` de Vue directamente** (sin Pinia ni Vuex). Los stores son módulos singleton con estado a nivel de módulo.

### `authStore.ts`

| Estado | Tipo | Descripción |
|---|---|---|
| `user` | `UserInfo \| null` | Usuario autenticado actual |
| `token` | `string \| null` | Token JWT |
| `isAuthenticated` | `boolean` | Indica si hay sesión activa |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error |

**Métodos:** `init()`, `login()`, `register()`, `logout()`, `isAdmin()`, `getRoleName()`

### `playerStore.ts`

| Estado | Tipo | Descripción |
|---|---|---|
| `currentTrack` | `TrackDTO \| null` | Track reproduciendo actualmente |
| `isPlaying` | `boolean` | Estado de reproducción |
| `volume` | `number` | Volumen (0-1) |
| `position` | `number` | Posición actual en segundos |
| `duration` | `number` | Duración total en segundos |
| `queue` | `TrackDTO[]` | Cola de reproducción |
| `backQueue` | `TrackDTO[]` | Cola de tracks anteriores |

**Métodos:** `playTrack()`, `play()`, `pause()`, `togglePlay()`, `seek()`, `setVolume()`, `mute()`, `playNext()`, `playPrevious()`, `addToQueue()`, `removeFromQueue()`, `reorderQueue()`, `clearQueue()`, `playFromQueue()`, `restoreLastTrack()`

---

## Servicios API

Todos los servicios usan `fetch()` nativo (sin axios). Autenticación vía Bearer token en headers.

### Auth (`services/auth.ts`)

| Función | Método | Endpoint | Descripción |
|---|---|---|---|
| `login(username, password)` | POST | `/auth/login` | Inicio de sesión, retorna token + usuario |
| `register(username, email, password)` | POST | `/auth/register` | Registro, retorna token + usuario |
| `getMe()` | GET | `/auth/me` | Informacion del usuario actual |

### Tracks (`services/tracks.ts`)

| Función | Método | Endpoint | Descripción |
|---|---|---|---|
| `getTracks(page, size, search, artistIds, albumIds, sortBy, sortDirection)` | GET | `/tracks` | Listado paginado con filtros |
| `getTrack(id)` | GET | `/tracks/:id` | Un track |
| `getTrackCount()` | GET | `/tracks/count` | Cantidad total de tracks |
| `uploadTrack(...)` | POST | `/tracks` | Cargar track (FormData) |
| `updateTrack(id, ...)` | PUT | `/tracks/:id` | Actualizar track (FormData) |
| `deleteTrack(id)` | DELETE | `/tracks/:id` | Eliminar track |
| `getStreamUrl(id)` | - | `/tracks/:id/stream?token=` | URL de streaming (token en query) |
| `getTrackStreamBlob(id)` | GET | `/tracks/:id/stream` | Stream como Blob |
| `downloadTrack(id)` | GET | `/tracks/:id/download` | Descargar archivo |
| `downloadAlbumZip(id)` | GET | `/albums/:id/download` | Descargar álbum como ZIP |
| `downloadArtistZip(id)` | GET | `/artists/:id/download` | Descargar artista como ZIP |

### Albums (`services/albums.ts`)

| Función | Método | Endpoint | Descripción |
|---|---|---|---|
| `getAlbums(page, size, search, artistIds, sortBy, sortDirection)` | GET | `/albums` | Listado paginado |
| `getAlbum(id)` | GET | `/albums/:id` | Album con tracks |
| `createAlbum(...)` | POST | `/albums` | Crear álbum |
| `updateAlbum(id, ...)` | PUT | `/albums/:id` | Actualizar álbum |
| `deleteAlbum(id)` | DELETE | `/albums/:id` | Eliminar álbum |
| `uploadAlbumTrack(albumId, ...)` | POST | `/albums/:id/tracks` | Cargar track a álbum |
| `reorderAlbumTracks(albumId, trackIds)` | PUT | `/albums/:id/tracks/reorder` | Reordenar tracks |
| `deleteAlbumTrack(albumId, trackId)` | DELETE | `/albums/:id/tracks/:trackId` | Eliminar track de álbum |

### Artists (`services/artists.ts`)

| Función | Método | Endpoint | Descripción |
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

| Función | Método | Endpoint | Descripción |
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

- **Idiomas:** Español (`es`, por defecto) e Inglés (`en`, fallback)
- **Persistencia:** Idioma guardado en `localStorage` con la clave `locale`
- **Configuración:** `vue-i18n` en modo Composition API (`legacy: false`)
- **147 claves de traducción** (EN y ES idénticas, 0 discrepancias) organizadas en namespaces:

| Namespace | Contenido | Claves |
|---|---|---|
| `nav` | Navegación | 2 |
| `home` | Página de inicio (con interpolación `{appName}`) | 17 |
| `auth` | Formularios de login/registro | 11 |
| `library` | Gestión de tracks, álbumes, artistas, carga, búsqueda, filtros, orden, almacenamiento | 67 |
| `confirm` | Diálogos de eliminación (con interpolación de `{item}`, `{tracks}`, `{albums}`) | 7 |
| `pagination` | Navegación paginada | 1 |
| `player` | Controles del reproductor (con interpolacion `{current}`, `{total}`) | 12 |
| `common` | Acciones compartidas | 7 |
| `settings` | Configuración (cuenta, apariencia, temas, idioma, streaming, almacenamiento; `themes.*` anidadas: warp/midnight/forest/ocean/retro) | 20 |
| `notfound` | Página 404 | 3 |
| **Total** | | **147** |

---

## Scripts

```bash
npm run dev          # Inicia servidor de desarrollo (puerto 5173)
npm run build        # Verifica tipos y compila para producción
npm run build:prod   # Compila explícitamente en modo producción
npm run type-check   # Verifica tipos sin compilar
npm run lint         # Ejecuta ESLint sobre src/
npm run lint:fix     # ESLint con auto-corrección
npm run preview      # Previsualiza la compilación de producción
```

---

## Variables de Entorno

| Variable | Default local/dev | Obligatoria en prod | Descripción |
|---|---|---|---|
| `VITE_API_URL` | `/api` (Docker) / `http://localhost:8080/api` (IDE) | – | URL del API para el build del frontend |

**Archivos de configuración:**
- `.env.development` - Variables para `npm run dev` (consumido por Vite fuera de Docker)
- `.env.production` - Plantilla para builds con Vite fuera de Docker

**Constantes globales** (definidas en `vite.config.ts`):
- `global` = `globalThis` (polyfill para `music-metadata`)

> **Nota:** `APP_NAME` está hardcodeado en `src/config.ts` y no es una variable de build-time. Si en el futuro se necesita variabilizar, exponer vía `define` en `vite.config.ts` + `VITE_APP_NAME` en `.env.development`.

### Mapa: dónde se setea cada variable → dónde se lee

| Variable | Fuentes posibles (en orden de prioridad) | Lectura |
|----------|------------------------------------------|---------|
| `VITE_API_URL` | `docker-compose.yml` (base, build arg con default `/api`), `docker-compose.dev.yml` (override: `http://localhost:8080/api`), `docker-compose.prod.yml` (override: `/api`), `.env.development` (dev local sin Docker) | `src/services/utils.ts:4` → exportada como `API_URL` y consumida por todos los `services/*.ts` |

El resto de variables del proyecto (`DB_*`, `JWT_SECRET`, `CORS_ORIGINS`, `SPRING_PROFILES_ACTIVE`, `CADDY_DOMAIN`) se gestionan en el backend y están documentadas en el [README.md de la raíz](../README.md).

---

## Docker

### Archivos Docker

| Archivo | Propósito |
|---|---|
| `docker-compose.yml` | Base: definición común de servicios |
| `docker-compose.local.yml` | Local: solo PostgreSQL, apps en el host con IDE |
| `docker-compose.dev.yml` | Dev: stack completo dockerizado |
| `docker-compose.prod.yml` | Prod: stack completo + Caddy con TLS automático |
| `infra/caddy/Caddyfile` | Reverse proxy con HTTPS automático |
| `back_proyecto/Dockerfile` | Multi-stage: Maven build → JRE 21 Alpine |
| `front_proyecto/Dockerfile` | Multi-stage: Node 22 build → Nginx Alpine |
| `front_proyecto/nginx.conf` | SPA fallback, proxy `/api/` → backend, gzip, caché inmutable |

### Comandos

Desde la raíz del proyecto (`ProyectoDAW/`):

| Entorno | Comando |
|---|---|
| `local` | `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres` |
| `dev` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` |
| `prod` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |

### Dockerfile (multi-etapa)

**Etapa 1 - Build (Node 22 Alpine):**
1. Instala dependencias
2. Compila la aplicación con `VITE_API_URL` como argumento de build

**Etapa 2 - Serve (Nginx Alpine):**
1. Copia los archivos compilados
2. Sirve con Nginx usando configuración personalizada

### nginx.conf

- Headers de seguridad: `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `Referrer-Policy strict-origin-when-cross-origin`, **`Permissions-Policy`** (deniega `geolocation`/`microphone`/`camera`), **`Content-Security-Policy`** estricta (default `self`; `media-src` permite `blob:` para el reproductor)
- Compresion gzip (text/css/json/js/svg)
- Caché inmutable 1 año en `/assets/` (`Cache-Control: public, immutable`)
- `index.html` con `Cache-Control: no-cache, no-store, must-revalidate` para forzar revalidación
- Proxy reverso `/api/` -> `http://backend:8080` con **`proxy_request_buffering off`** y **`proxy_buffering off`** para no bufferizar streams de audio ni descargas ZIP
- Timeouts 300s en `proxy_read_timeout`/`proxy_send_timeout`/`client_body_timeout` para uploads grandes
- `client_max_body_size 500M` aplicado global y en `location /api/`
- SPA fallback: `try_files $uri $uri/ /index.html`

---

## Backend

La aplicación se conecta a una API REST. El backend **debe estar corriendo** para que funcionen:

- Autenticación (login, registro, sesión)
- Biblioteca de tracks (CRUD, búsqueda, filtros)
- Álbumes (CRUD, tracks, reordenamiento, descarga ZIP)
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

**Nota sobre streaming:** Para el modo Range, el token JWT se pasa como parámetro de query (`?token=...`) porque el elemento `<audio>` de HTML5 no soporta headers personalizados. Se recomienda HTTPS en producción para mitigar esto.

---

## Documentación relacionada

- Volver al [índice principal](../README.md)
- Ver también: [Backend README](../back_proyecto/README.md)
