import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 引入Element Plus
import ElementPlus from 'element-plus'
// 引入Element Plus的样式
import 'element-plus/dist/index.css'
app.use(ElementPlus)  // 使用Element Plus

app.mount('#app')
