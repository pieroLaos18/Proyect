<!-- filepath: frontend/src/components/LoginForm.vue -->
<style src="@/assets/css/loginform.css"></style>
<template>
  <div class="page-container">
    <div class="login-container">
      <h1>Iniciar Sesión</h1>
      <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>.</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico:</label>
          <div class="input-container">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <div class="input-container">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
          </div>
        </div>
        <button type="submit" class="btn-login">Iniciar Sesión</button>
<p v-if="error" class="login-error">{{ error }}</p>
<p class="forgot-password">
  <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '', // <--- agrega esto
    };
  },
  watch: {
    email() { this.error = ''; },
    password() { this.error = ''; }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          correo_electronico: this.email,
          password: this.password,
        });

        // Guarda el token en localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userId', response.data.user.id);

        // Redirige al dashboard
        this.$router.push('/main/dashboard');
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
      }
    },
  },
};
</script>
