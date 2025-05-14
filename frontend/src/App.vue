@import './assets/css/global.css';
<template>
  <div id="app">
    <!-- Ícono para cambiar de modo -->
    <div class="theme-toggle">
      <i :class="theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'" @click="toggleTheme"></i>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      theme: 'light',
    };
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  },
  methods: {
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme); // Asegúrate de que se aplique aquí
      localStorage.setItem('theme', theme);
    },
  },
};
</script>

