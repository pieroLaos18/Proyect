<style src="@/assets/css/mainview.css"></style>
<style>
/* Estilos para el modal de notificaciones y botones de bajo stock */
.notification-modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notification-modal {
  background: #fff;
  color: #232323;
  border-radius: 10px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
}
.notification-modal h3 {
  margin-top: 0;
}
.notification-modal ul {
  margin: 1rem 0;
  padding-left: 1.2rem;
}
.notification-modal li {
  margin-bottom: 0.5rem;
}
@media (prefers-color-scheme: dark) {
  .notification-modal {
    background: #232323;
    color: #fff;
  }
}
.low-stock-btn {
  background: #ffcccc;
  color: #232323;
  border: 1px solid #ff3333;
  border-radius: 6px;
  padding: 0.5em 1em;
  margin-bottom: 0.5em;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s;
}
.low-stock-btn:hover {
  background: #ffb3b3;
}
.low-stock-btn.improved {
  display: flex;
  align-items: center;
  gap: 0.7em;
  background: linear-gradient(90deg, #ffeaea 60%, #ffd6d6 100%);
  color: #b10000;
  border: 2px solid #ff3333;
  border-radius: 8px;
  padding: 0.7em 1.2em;
  margin-bottom: 0.7em;
  font-size: 1.08em;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255,51,51,0.07);
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
}
.low-stock-btn.improved:hover {
  background: linear-gradient(90deg, #ffd6d6 60%, #ffeaea 100%);
  box-shadow: 0 4px 16px rgba(255,51,51,0.15);
  transform: translateY(-2px) scale(1.03);
}
.low-stock-icon {
  font-size: 1.3em;
  margin-right: 0.2em;
}
.low-stock-details {
  font-weight: 400;
  color: #b10000;
}
.low-stock-btn .min {
  color: #b10000;
  font-size: 0.97em;
}
</style>
<template>
  <div class="main-container">
    <!-- Overlay para cerrar el sidebar en pantallas pequeñas -->
    <div
      v-if="isSidebarVisible && isSmallScreen"
      class="overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar de navegación principal -->
    <aside :class="{ 'sidebar-hidden': !isSidebarVisible, 'sidebar-visible': isSidebarVisible }" class="sidebar">
      <div class="sidebar-header">
        <img :src="userImage || defaultImage" alt="Foto del usuario" class="user-image" />
      </div>
      <nav class="sidebar-menu">
        <ul>
          <li><router-link to="/main/dashboard"><i class="fas fa-home"></i> Escritorio</router-link></li>
          <li><router-link to="/main/products"><i class="fas fa-box"></i> Productos</router-link></li>
          <li><router-link to="/main/sales"><i class="fas fa-shopping-cart"></i> Ventas</router-link></li>
          <li><router-link to="/main/reports"><i class="fas fa-chart-line"></i> Reportes</router-link></li>
          <li><router-link to="/main/users"><i class="fas fa-users"></i> Usuarios</router-link></li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <div class="main-content">
      <header class="app-bar">
        <div class="left-section">
          <!-- Botón para mostrar/ocultar sidebar -->
          <button class="hamburger-btn" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <!-- Nombre del usuario -->
          <span class="user-name">{{ userName }}</span>
          <!-- Botón de notificaciones de stock bajo -->
          <button class="notification-btn" @click="openNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
          </button>
          <!-- Botón para cerrar sesión -->
          <button @click="logout" class="logout-btn">Cerrar Sesión</button>
        </div>
        <div class="right-section">
          <!-- Botón para cambiar tema claro/oscuro -->
          <div class="theme-toggle">
            <i :class="theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'" @click="toggleTheme"></i>
          </div>
        </div>
      </header>

      <!-- Renderizado de las vistas hijas -->
      <router-view></router-view>
    </div>

    <!-- Modal de inactividad por seguridad -->
    <div v-if="showInactivityModal" class="inactivity-modal-bg">
      <div class="inactivity-modal">
        <h2>¿Sigues ahí?</h2>
        <p>Por seguridad, tu sesión se cerrará pronto por inactividad.<br>
        Haz clic en "Seguir aquí" para continuar.</p>
        <button class="btn-primary" @click="confirmActivity">Seguir aquí</button>
      </div>
    </div>

    <!-- Modal de notificaciones de productos con bajo stock -->
    <div v-if="showNotifications" class="notification-modal-bg" @click.self="showNotifications = false">
      <div class="notification-modal">
        <h3>Alertas de Bajo Stock</h3>
        <ul v-if="lowStockProducts.length">
          <li v-for="prod in lowStockProducts" :key="prod.id">
            <button
              class="low-stock-btn improved"
              @click="goToEditProduct(prod.id)"
            >
              <span class="low-stock-icon">⚠️</span>
              <span>
                <strong>{{ prod.name }}</strong>
                <span class="low-stock-details">— Stock: {{ prod.stock }} <span class="min">(mínimo: {{ prod.stock_min }})</span></span>
              </span>
            </button>
          </li>
        </ul>
        <div v-else>
          No hay productos con bajo stock.
        </div>
        <button class="btn-primary" @click="showNotifications = false">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
// Importa la imagen de usuario por defecto
import defaultUserImage from '../assets/images/profile.png';

export default {
  data() {
    return {
      // Estado del sidebar (visible/oculto)
      isSidebarVisible: false,
      // Nombre del usuario actual
      userName: '',
      // Imagen del usuario actual
      userImage: '',
      // Imagen predeterminada si el usuario no tiene foto
      defaultImage: defaultUserImage,
      // Indica si la pantalla es pequeña (responsive)
      isSmallScreen: false,
      // Número de notificaciones de bajo stock
      notificationCount: 3,
      // Tema actual (light/dark)
      theme: 'light',
      // Timers para control de inactividad
      inactivityTimer: null,
      warningTimer: null,
      // Modal de inactividad visible
      showInactivityModal: false,
      // Límites de tiempo para inactividad y advertencia (ms)
      inactivityLimit: 10 * 60 * 1000, // 10 minutos
      warningLimit: 5 * 60 * 1000, // 5 minutos
      // Modal de notificaciones visible
      showNotifications: false,
      // Lista de productos con bajo stock
      lowStockProducts: [],
    };
  },
  created() {
    // Carga datos de usuario desde localStorage
    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.userImage = localStorage.getItem('userImage') || this.defaultImage;

    // Configura el tamaño de pantalla y tema
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);

    // Actualiza notificaciones de bajo stock al iniciar
    this.updateLowStockNotifications();
  },
  mounted() {
    // Inicia el control de inactividad
    this.resetInactivityTimer();
    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
    window.addEventListener('click', this.resetInactivityTimer);
  },
  beforeDestroy() {
    // Limpia el listener de resize
    window.removeEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    // Limpia listeners y timers de inactividad
    window.removeEventListener('mousemove', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    window.removeEventListener('click', this.resetInactivityTimer);
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.warningTimer);
  },
  methods: {
    // Muestra/oculta el sidebar
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    // Cierra el sidebar
    closeSidebar() {
      this.isSidebarVisible = false;
    },
    // Cierra sesión y limpia datos de usuario
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userImage');
      this.$router.push('/login');
    },
    // Verifica si la pantalla es pequeña para responsive
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 1024;
      if (!this.isSmallScreen) {
        this.isSidebarVisible = true;
      }
    },
    // Cambia el tema claro/oscuro
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    // Aplica el tema seleccionado
    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    // Reinicia el temporizador de inactividad
    resetInactivityTimer() {
      clearTimeout(this.inactivityTimer);
      clearTimeout(this.warningTimer);
      this.showInactivityModal = false;

      // Muestra advertencia a los 5 minutos
      this.warningTimer = setTimeout(() => {
        this.showInactivityModal = true;
      }, this.warningLimit);

      // Cierra sesión a los 10 minutos
      this.inactivityTimer = setTimeout(() => {
        this.logout();
      }, this.inactivityLimit);
    },
    // Confirma que el usuario sigue activo
    confirmActivity() {
      this.showInactivityModal = false;
      this.resetInactivityTimer();
    },
    // Abre el modal de notificaciones y actualiza productos con bajo stock
    async openNotifications() {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const products = await res.json();
        this.lowStockProducts = products.filter(p => p.stock <= p.stock_min);
        this.notificationCount = this.lowStockProducts.length;
        this.showNotifications = true;
      } catch (e) {
        this.lowStockProducts = [];
        this.notificationCount = 0;
        this.showNotifications = true;
      }
    },
    // Actualiza la lista de productos con bajo stock (sin mostrar modal)
    async updateLowStockNotifications() {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const products = await res.json();
        this.lowStockProducts = products.filter(p => p.stock <= p.stock_min);
        this.notificationCount = this.lowStockProducts.length;
      } catch (e) {
        this.lowStockProducts = [];
        this.notificationCount = 0;
      }
    },
    // Navega a la edición del producto seleccionado desde la notificación
    goToEditProduct(productId) {
      this.showNotifications = false;
      this.$router.push({ 
        path: '/main/products', 
        query: { edit: productId }
      });
    },
  },
};
</script>
