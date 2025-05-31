<!-- Componente de formulario de inicio de sesión -->

<style scoped src="@/assets/css/loginform.css"></style>

<template>
  <div class="page-container">
    <div class="background-decor"></div>
    <div class="login-container glass">
      <div class="login-header">
        <div class="login-logo enhanced-logo">
          <i class="fas fa-store"></i>
        </div>
        <h1>Bienvenido</h1>
        <p class="subtitle">Inicia sesión para continuar</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <div class="input-container enhanced-input">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="input-container enhanced-input">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-login enhanced-btn">Iniciar Sesión</button>
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <div class="extra-links">
          <a href="/forgot-password" class="forgot-password">¿Olvidaste tu contraseña?</a>
          <span>·</span>
          <a href="/register" class="register-link">Crear cuenta</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
// Importa axios para realizar la petición de login
import axios from 'axios';

export default {
  data() {
    return {
      // Correo electrónico del usuario
      email: '',
      // Contraseña del usuario
      password: '',
      // Mensaje de error para mostrar en el formulario
      error: '',
    };
  },
  watch: {
    // Limpia el error al modificar el email o la contraseña
    email() { this.error = ''; },
    password() { this.error = ''; }
  },
  methods: {
    // Maneja el envío del formulario de login
    async handleLogin() {
      try {
        // Realiza la petición de login a la API
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          correo_electronico: this.email,
          password: this.password,
        });

        // Agrega este log para ver qué trae el usuario:
        console.log('Usuario recibido:', response.data.user);

        // Guarda el token y datos del usuario en localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userRole', response.data.user.rol.toLowerCase());

        // Redirige según el rol
        const rol = response.data.user.rol?.toLowerCase();
        if (rol === 'admin' || rol === 'supervisor') {
          this.$router.push('/main/dashboard');
        } else if (rol === 'cajero') {
          this.$router.push('/main/sales');
        } else if (rol === 'almacenero') {
          this.$router.push('/main/products');
        } else {
          this.$router.push('/main/dashboard'); // Fallback
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
      }
    },
  },
};
</script>
