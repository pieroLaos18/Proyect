<style scoped src="@/assets/css/forgotpasswordform.css"></style>

<template>
  <div class="forgot-page-container">
    <div class="forgot-background-decor"></div>
    <div class="forgot-container glass">
      <div class="forgot-header">
        <div class="forgot-logo">
          <i class="fas fa-unlock-alt"></i>
        </div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p class="forgot-subtitle">Te enviaremos un enlace para restablecerla</p>
      </div>
      <form @submit.prevent="handleForgot">
        <label for="email">Correo electrónico</label>
        <div class="forgot-input-container">
          <i class="fas fa-envelope"></i>
          <input type="email" v-model="email" required placeholder="Ingresa tu correo" />
        </div>
        <button type="submit" class="forgot-btn">Enviar enlace</button>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <div class="forgot-extra-links">
        <router-link to="/login">Volver a iniciar sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      email: '',
      message: '',
      error: ''
    };
  },
  methods: {
    async handleForgot() {
      this.message = '';
      this.error = '';
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: this.email });
        this.message = 'Revisa tu correo para restablecer tu contraseña.';
      } catch (err) {
        this.error = err.response?.data?.message || 'No se pudo enviar el correo.';
      }
    }
  }
};
</script>