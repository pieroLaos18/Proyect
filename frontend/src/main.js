import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/global.css'; // Importa el archivo CSS global
import '@fortawesome/fontawesome-free/css/all.css';
import router from './router'; // Importa el router

createApp(App).use(router).mount('#app'); // Usa el router en la aplicación
