<template>
  <div class="main-container">
    <!-- Overlay para cerrar el sidebar -->
    <div
      v-if="isSidebarVisible && isSmallScreen"
      class="overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
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

    <!-- Main Content -->
    <div class="main-content">
      <header class="app-bar">
        <div class="left-section">
          <button class="hamburger-btn" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <span class="user-name">{{ userName }}</span>
          <button class="notification-btn">
            <i class="fas fa-bell"></i>
            <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
          </button>
          <button @click="logout" class="logout-btn">Cerrar Sesión</button>
        </div>
        <div class="right-section">
          <div class="theme-toggle">
            <i :class="theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'" @click="toggleTheme"></i>
          </div>
        </div>
      </header>

      <!-- Contenido dinámico -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import defaultUserImage from '../assets/images/profile.png';

export default {
  data() {
    return {
      isSidebarVisible: false, // Sidebar oculto por defecto en pantallas pequeñas
      userName: '', // Inicializa el nombre del usuario vacío
      userImage: '', // URL de la imagen del usuario
      defaultImage: defaultUserImage, // Imagen predeterminada local
      isSmallScreen: false, // Detecta si la pantalla es pequeña
      notificationCount: 3, // Número de notificaciones (ejemplo)
      theme: 'light', // Tema actual
    };
  },
  created() {
    console.log('Cargando MainView...');
    console.log('userName:', localStorage.getItem('userName'));
    console.log('userImage:', localStorage.getItem('userImage'));

    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.userImage = localStorage.getItem('userImage') || this.defaultImage;

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    closeSidebar() {
      this.isSidebarVisible = false;
    },
    logout() {
      // Elimina los datos del usuario de localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userImage');

      // Redirige al login
      this.$router.push('/login');
    },
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 600;
      if (!this.isSmallScreen) {
        this.isSidebarVisible = true; // Sidebar siempre visible en pantallas grandes
      }
    },
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
  },
};
</script>

<style scoped>
/* Variables de tema */
:root {
  --primary-color: #4a90e2; /* Azul profesional */
  --secondary-color: #34495e; /* Gris oscuro */
  --background-color: #f5f7fa; /* Fondo claro */
  --text-color: #ffffff; /* Texto blanco para contraste */
  --card-background-color: #ffffff; /* Fondo de tarjetas */
  --accent-color: #e74c3c; /* Rojo para acentos */
}

[data-theme='dark'] {
  --primary-color: #1abc9c; /* Verde profesional */
  --secondary-color: #1e272e; /* Fondo oscuro */
  --background-color: #1e272e; /* Fondo oscuro */
  --text-color: #ecf0f1; /* Texto claro */
  --card-background-color: #2f3640; /* Fondo de tarjetas oscuro */
  --accent-color: #e74c3c; /* Rojo para acentos */
}

/* Contenedor principal */
.main-container {
  display: flex;
  height: 100vh;
  background-color: var(--background-color);
  font-family: 'Roboto', sans-serif;
  overflow: hidden; /* Evita que el contenido del sidebar se desborde */
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  z-index: 999; /* Debajo del sidebar */
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: var(--primary-color); /* Fondo igual al app bar */
  color: var(--text-color); /* Texto dinámico */
  padding: 1rem;
  position: fixed;
  z-index: 1000; /* Asegura que el sidebar esté por encima del contenido */
  height: 100%;
  left: 0;
  top: 0;
  transform: translateX(-100%); /* Oculto por defecto */
  transition: transform 0.3s ease-in-out, visibility 0.3s ease-in-out;
  visibility: hidden; /* Oculta el contenido del sidebar */
  overflow: hidden; /* Oculta cualquier contenido desbordado */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2); /* Sombra para darle profundidad */
}

.sidebar-visible {
  transform: translateX(0); /* Muestra el sidebar */
  visibility: visible; /* Muestra el contenido del sidebar */
}

/* Imagen del usuario */
.user-image {
  width: 100px; /* Tamaño de la imagen */
  height: 100px; /* Tamaño de la imagen */
  border-radius: 50%; /* Hace que la imagen sea circular */
  border: 5px solid; /* Borde de la imagen */
  border-image: linear-gradient(135deg, #004d40, #00695c) 1; /* Borde con degradado verde oscuro */
  object-fit: cover; /* Asegura que la imagen se ajuste correctamente */
  object-position: center; /* Centra la imagen dentro del contenedor */
  display: block; /* Asegura que la imagen sea un bloque */
  background-color: transparent; /* Asegúrate de que no haya fondo */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Sombra para darle profundidad */
}

/* Contenedor de la imagen del usuario */
.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  overflow: hidden; /* Oculta cualquier contenido desbordado */
  background-color: transparent; /* Asegúrate de que no haya fondo */
  border: none; /* Elimina cualquier borde */
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu ul li {
  margin: 1rem 0;
}

.sidebar-menu ul li a {
  display: flex; /* Alinea el ícono y el texto horizontalmente */
  align-items: center; /* Centra verticalmente el ícono y el texto */
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-menu ul li a i {
  margin-right: 10px; /* Espacio entre el ícono y el texto */
  font-size: 1.2rem; /* Tamaño del ícono */
}

.sidebar-menu ul li a:hover {
  background: linear-gradient(135deg, #004d40, #00695c); /* Fondo degradado al pasar el cursor */
  color: white; /* Cambia el color del texto */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
}

.sidebar-menu ul li a:hover i {
  color: white; /* Cambia el color del ícono al pasar el cursor */
}

.sidebar-menu ul li a::after {
  content: '';
  display: block;
  width: 0;
  height: 3px;
  background-color: var(--accent-color);
  transition: width 0.3s ease;
  margin-top: 5px;
}

.sidebar-menu ul li a:hover::after {
  width: 100%; /* Subrayado animado */
}

.sidebar-menu ul li a.active {
  background: linear-gradient(135deg, #004d40, #00695c); /* Fondo degradado para el enlace activo */
  color: white;
  font-weight: bold;
}

.sidebar-menu ul li a.active i {
  color: white; /* Ícono blanco para el enlace activo */
}

.sidebar-menu ul li a.active::after {
  width: 100%; /* Subrayado completo para el enlace activo */
}

.sidebar-menu ul li .router-link-active {
  background: linear-gradient(135deg, #004d40, #00695c); /* Fondo degradado */
  color: white; /* Texto blanco */
  font-weight: bold;
}

@media (min-width: 601px) {
  .sidebar {
    position: relative; /* Cambia a relativo en pantallas grandes */
    transform: translateX(0); /* Asegura que esté visible */
    visibility: visible;
    box-shadow: none; /* Elimina la sombra */
  }

  .main-content {
    margin-left: 250px; /* Ajusta el margen para coincidir con el ancho del Sidebar */
  }
}

@media (max-width: 600px) {
  .sidebar {
    position: fixed; /* Sidebar fijo en pantallas pequeñas */
    transform: translateX(-100%); /* Oculto por defecto */
    visibility: hidden;
  }

  .sidebar-visible {
    transform: translateX(0); /* Muestra el Sidebar */
    visibility: visible;
  }

  .main-content {
    margin-left: 0; /* Elimina el margen en pantallas pequeñas */
  }
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0; /* Elimina el margen del sidebar por defecto */
  transition: margin-left 0.3s ease-in-out;
}

/* App Bar */
.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  height: 70px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Espacio entre los elementos */
}

.hamburger-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: none; /* Oculto por defecto */
}

@media (max-width: 600px) {
  .hamburger-btn {
    display: block; /* Visible solo en pantallas pequeñas */
  }
}

.user-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px 15px;
  border-radius: 20px;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--accent-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Espacio entre los elementos */
}

/* Botón de cambio de tema */
.theme-toggle i {
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
}

.theme-toggle i:hover {
  transform: scale(1.1);
  color: var(--accent-color);
}

/* Botón de notificación */
.notification-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  position: relative; /* Necesario para posicionar la insignia */
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  transform: scale(1.1);
  color: var(--accent-color);
}

/* Insignia de notificación */
.notification-badge {
  position: absolute;
  top: 0; /* Ajusta la posición vertical */
  right: 0; /* Ajusta la posición horizontal */
  transform: translate(50%, -50%); /* Centra la insignia en la esquina superior derecha */
  background-color: var(--accent-color);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Sobrescribe las variables globales con un selector más específico */
.main-container {
  --primary-color: #004d40; /* Verde azulino oscuro */
  --primary-gradient: linear-gradient(135deg, #004d40, #00695c); /* Degradado verde azulino */
}

/* Sidebar */
.sidebar {
  background: var(--primary-gradient); /* Aplica el degradado */
  color: var(--text-color);
}

/* App Bar */
.app-bar {
  background: var(--primary-gradient); /* Aplica el degradado */
  color: var(--text-color);
}

/* Contenedor del contenido dinámico */
.dynamic-content {
  padding-left: 20px; /* Espacio adicional entre el texto y el Sidebar */
}
</style>