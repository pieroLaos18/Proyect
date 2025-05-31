<style scoped src="@/assets/css/resetpasswordform.css"></style>
<template>
  <div class="reset-page-container">
    <div class="reset-background-decor"></div>
    <div class="reset-container glass">
      <div class="reset-header">
        <div class="reset-logo">
          <i class="fas fa-key"></i>
        </div>
        <h2>Restablecer contraseña</h2>
      </div>
      <form @submit.prevent="handleReset">
        <label for="password">Nueva contraseña:</label>
        <div class="reset-input-container">
          <i class="fas fa-lock"></i>
          <input
            type="password"
            v-model="password"
            required
            placeholder="Nueva contraseña"
            autocomplete="new-password"
          />
        </div>
        <button type="submit" class="reset-btn enhanced-btn">Restablecer</button>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <button class="login-link" @click="goToLogin">Ir al inicio de sesión</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      password: '',
      message: '',
      error: '',
      token: ''
    };
  },
  mounted() {
    this.token = this.$route.params.token;
  },
  methods: {
    async handleReset() {
      this.message = '';
      this.error = '';
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${this.token}`, {
          password: this.password
        });
        this.message = '¡Contraseña restablecida! Ahora puedes iniciar sesión.';
        this.password = '';
      } catch (err) {
        this.error = err.response?.data?.message || 'No se pudo restablecer la contraseña.';
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

