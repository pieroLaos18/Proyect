<style src="@/assets/css/mainview.css"></style>
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
        <div class="sidebar-logo">
          <i class="fas fa-cash-register"></i>
          Sales System
        </div>
      </div>
      <div class="sidebar-user">
        <img :src="userImage || defaultImage" alt="Foto del usuario" class="user-image" />
        <span class="sidebar-username">{{ userName }}</span>
        <span class="sidebar-role">{{ currentUserRole }}</span>
      </div>
      <nav class="sidebar-menu">
        
        <ul>
          <!-- Escritorio: solo admin y supervisor -->
          <li v-if="['admin', 'supervisor'].includes(currentUserRole)">
            <router-link to="/main/dashboard"><i class="fas fa-home"></i> Escritorio</router-link>
          </li>
          <!-- Productos: admin, supervisor, almacenero -->
          <li v-if="['admin', 'supervisor', 'almacenero'].includes(currentUserRole)">
            <router-link to="/main/products"><i class="fas fa-box"></i> Productos</router-link>
          </li>
          <!-- Ventas: admin, supervisor, cajero -->
          <li v-if="['admin', 'supervisor', 'cajero'].includes(currentUserRole)">
            <router-link to="/main/sales">
              <i class="fas fa-cash-register"></i> Ventas
            </router-link>
          </li>
          <!-- Reportes: admin, supervisor -->
          <li v-if="['admin', 'supervisor'].includes(currentUserRole)">
            <router-link to="/main/reports"><i class="fas fa-chart-line"></i> Reportes</router-link>
          </li>
          <!-- Usuarios: solo admin -->
          <li v-if="currentUserRole === 'admin'">
            <router-link to="/main/users"><i class="fas fa-users"></i> Usuarios</router-link>
          </li>
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
          <!-- Título de la página -->
          <span class="page-title">{{ pageTitle || 'Panel Principal' }}</span>
        </div>
        <div class="right-section">
          <!-- Botón de notificaciones de stock bajo -->
          <button class="notification-btn" @click="openNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
          </button>
          <!-- Botón para cambiar tema claro/oscuro -->
          <div class="theme-toggle">
            <i :class="theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'" @click="toggleTheme"></i>
          </div>
          <!-- Menú desplegable de usuario -->
          <div class="user-dropdown">
            <img :src="userImage || defaultImage" class="user-avatar" />
            <span class="user-name">{{ userName }}</span>
            <!-- Botón para cerrar sesión -->
            <button @click="logout" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>
      <div class="dashboard-inner">
        <!-- Renderizado de las vistas hijas -->
        <router-view @set-title="setPageTitle"></router-view>
      </div>
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

    <!-- Toast de notificación de bajo stock -->
    <div v-if="toastVisible" class="low-stock-toast">
      <i class="fas fa-exclamation-triangle"></i>
      {{ toastMessage }}
    </div>

    <div v-if="toast.show" class="custom-toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import defaultUserImage from '../assets/images/profile.png';
import axios from 'axios';

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
      notificationInterval: null, // <--- Agrega esta línea
      toastVisible: false,
      toastMessage: '',
      pageTitle: '',
      lastActivity: Date.now(),
      warningShown: false,
      logoutTimer: null,
      toast: {
        show: false,
        message: '',
        timeout: null,
      },
    };
  },
  computed: {
    currentUserRole() {
      return (localStorage.getItem('userRole') || '').toLowerCase();
    }
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

    // Actualiza notificaciones cada 30 segundos
    this.notificationInterval = setInterval(this.updateLowStockNotifications, 30000);
  },
  mounted() {
    this.resetInactivityTimer();
    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
    window.addEventListener('click', this.resetInactivityTimer);
    this.activeCheckInterval = setInterval(() => {
      this.updateUserActivity();
    }, 60000);
    // Agrega esta línea para verificar si el usuario sigue activo cada minuto
    this.userActiveInterval = setInterval(() => {
      this.checkUserActive();
    }, 1000);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    window.removeEventListener('click', this.resetInactivityTimer);
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.warningTimer);
    clearInterval(this.notificationInterval);
    clearInterval(this.activeCheckInterval);
    // Limpia también el nuevo intervalo
    clearInterval(this.userActiveInterval);
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
    async logout() {
      try {
        const token = localStorage.getItem('authToken');
        await axios.post('/api/users/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // Ignora error si ocurre
      }
      localStorage.clear();
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
      this.startInactivityTimers();
      if (this.showInactivityModal) {
        this.showInactivityModal = false;
      }
    },
    startInactivityTimers() {
      this.warningTimer = setTimeout(() => {
        this.showInactivityModal = true;
        this.warningShown = true;
      }, this.warningLimit);
      this.inactivityTimer = setTimeout(() => {
        this.logout();
        this.showToast('Sesión cerrada por inactividad.');
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const products = await res.json();
        const lowStock = products.filter(p => p.stock <= p.stock_min);
        // Mostrar toast solo si antes no había notificaciones y ahora sí
        if (this.notificationCount === 0 && lowStock.length > 0) {
          this.notificationCount = lowStock.length;
          this.lowStockProducts = lowStock;
          this.showLowStockToast();
        } else {
          this.notificationCount = lowStock.length;
          this.lowStockProducts = lowStock;
        }
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
    // Muestra un toast de notificación de bajo stock
    showLowStockToast() {
      this.toastMessage = `¡Atención! Hay ${this.notificationCount} producto(s) con bajo stock.`;
      this.toastVisible = true;
      setTimeout(() => {
        this.toastVisible = false;
      }, 4000);
    },
    // Establece el título de la página
    setPageTitle(title) {
      this.pageTitle = title;
    },
    async checkUserActive() {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        if (!userId || !token) return;
        const res = await axios.get(`/api/users/${userId}/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.active === false) {
          localStorage.clear();
          this.$router.push('/login');
          this.showToast('Tu usuario ha sido desactivado.');
        }
        // Si está activo, no hagas nada
      } catch (e) {
        // Si hay error de red, NO cierres la sesión
        // Opcional: puedes mostrar un mensaje pequeño o ignorar
        // console.warn('No se pudo verificar el estado del usuario.');
      }
    },
    async updateUserActivity() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        await axios.post('/api/users/activity', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // Ignora errores de red
      }
    },
    showToast(message, duration = 3000) {
      this.toast.message = message;
      this.toast.show = true;
      clearTimeout(this.toast.timeout);
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, duration);
    },
  },
};
</script>
