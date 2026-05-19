import { Buffer } from 'buffer'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'
import './assets/styles/variables.css'
import { i18n } from './i18n'
import router from './router'
window.Buffer = Buffer

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')