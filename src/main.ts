import { Buffer } from 'buffer'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/components/auth.css'
import './assets/styles/components/modal.css'
import './assets/styles/components/pagination.css'
import './assets/styles/components/selector.css'
import './assets/styles/components/states.css'
import './assets/styles/components/toolbar.css'
import './assets/styles/components/track-list.css'
import './assets/styles/components/upload.css'
import './assets/styles/global.css'
import './assets/styles/themes/forest.css'
import './assets/styles/themes/midnight.css'
import './assets/styles/themes/ocean.css'
import './assets/styles/themes/retro.css'
import './assets/styles/themes/warp.css'
import './assets/styles/variables.css'
import { i18n } from './i18n'
import router from './router'
window.Buffer = Buffer

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const app = createApp(App)
app.config.errorHandler = (err, _instance, info) => {
  console.error('Unhandled error:', err, info)
}
app.use(router)
app.use(i18n)
app.mount('#app')