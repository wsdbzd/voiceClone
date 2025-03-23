import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './route/index.js' // 导入路由配置
import axios from "axios";

// 设置 Axios 默认后端地址
axios.defaults.baseURL = "http://localhost:5000/";

const app = createApp(App)
app.config.globalProperties.$axios = axios; // 将 axios 挂载到 Vue 实例
app.use(createPinia())
app.use(router) // 使用路由
app.mount('#app')
