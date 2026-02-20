import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

// v-focus directive: auto-focuses element on mount
app.directive('focus', {
  mounted(el: HTMLElement) {
    el.focus()
  },
})

app.mount('#app')
