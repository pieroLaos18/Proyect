@import './assets/css/global.css';
import 'vue-datepicker-next/index.css';

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

<style>
#app {
  min-height: 100vh;
  background: var(--background-color, #f8fafd);
  transition: background 0.3s;
  position: relative;
}

/* Ícono de cambio de tema */
.theme-toggle {
  position: fixed;
  top: 22px;
  right: 32px;
  z-index: 3000;
  background: var(--card-bg, #fff);
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(67,206,162,0.13);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.theme-toggle:hover {
  background: var(--primary, #43cea2);
  box-shadow: 0 4px 18px rgba(67,206,162,0.18);
}

.theme-toggle i {
  font-size: 1.7rem;
  color: var(--primary, #43cea2);
  transition: color 0.2s;
}

.theme-toggle:hover i {
  color: #fff;
}

@media (max-width: 600px) {
  .theme-toggle {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }
  .theme-toggle i {
    font-size: 1.3rem;
  }
}
</style>

