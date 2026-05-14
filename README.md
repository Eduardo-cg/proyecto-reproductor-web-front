# MusicApp

Aplicación web de streaming de música construida con Vue 3. Interfaz similar a Spotify con reproductor persistente, biblioteca de canciones, playlists y cambio de tema oscuro/claro.

## Tecnologías

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router** (navegación SPA)
- **Vue I18n** (internacionalización ES/EN)
- **Vite** (bundler y dev server)
- **HTML5 Audio API** (reproducción nativa)

## Funcionalidades

- **Reproductor persistente** — barra inferior fija con control de reproducción, progreso y volumen
- **Biblioteca de canciones** — explorar, buscar, añadir y eliminar tracks
- **Playlists** — crear, ver, añadir y quitar canciones
- **Autenticación** — registro e inicio de sesión con JWT
- **Cambio de tema** — modo oscuro/claro con persistencia en localStorage
- **Internacionalización** — español e inglés

## Rutas

| Ruta | Vista |
|------|-------|
| `/` | Home |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/library` | Biblioteca de canciones |
| `/playlist/:id` | Detalle de playlist |

## Scripts

```bash
npm run dev      # Inicia servidor de desarrollo (puerto 5173)
npm run build    # Compila para producción
npm run preview  # Previsualiza la compilación
```

## Backend

La app se conecta a una API REST en `http://localhost:8080/api`. El backend debe estar corriendo para que funcionen las funcionalidades de autenticación, biblioteca y playlists.
