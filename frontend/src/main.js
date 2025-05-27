// Importa Vue y la función para crear la aplicación
import { createApp } from 'vue';

// Importa el componente principal de la aplicación
import App from './App.vue';

// Importa los estilos globales de la aplicación
import './assets/css/global.css';

// Importa los estilos de FontAwesome para iconos
import '@fortawesome/fontawesome-free/css/all.css';

// Importa los estilos del componente de selector de fecha
import 'vue-datepicker-next/index.css';

// Importa el router para la navegación entre vistas
import router from './router';

// Crea la aplicación Vue, usa el router y móntala en el elemento con id 'app'
createApp(App)
  .use(router)
  .mount('#app');
