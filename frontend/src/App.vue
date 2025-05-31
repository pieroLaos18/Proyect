<template>
  <div id="app">
    <!-- Sidebar/Navbar SOLO si está autenticado -->
    <router-view />
  </div>
</template>

<script>
// Importa los estilos globales y de terceros aquí
import './assets/css/global.css';
import 'vue-datepicker-next/index.css';

// Componente principal de la aplicación
export default {
  name: 'App',
  data() {
    return {
      // Tema actual (light/dark)
      theme: 'light',
    };
  },
  computed: {
    currentUserRole() {
      return localStorage.getItem('userRole');
    },
    isAuthenticated() {
      return !!localStorage.getItem('authToken');
    }
  },
  mounted() {
    // Al montar, aplica el tema guardado en localStorage o el tema claro por defecto
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  },
  methods: {
    // Aplica el tema seleccionado y lo guarda en localStorage
    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
  },
};
</script>
