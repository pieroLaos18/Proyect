<!-- filepath: frontend/src/components/LoginForm.vue -->

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
    };
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

<style scoped>
/* Contenedor principal */
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color); /* Cambia según el tema */
}

/* Contenedor del formulario */
.login-container {
  background-color: var(--card-background-color);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  color: var(--text-color); /* Cambia según el tema */
}

.login-container h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--text-color); /* Cambia según el tema */
}

.login-container p {
  font-size: 0.9rem;
  margin-bottom: 20px;
  color: var(--text-color); /* Cambia según el tema */
}

.login-container a {
  color: var(--primary-color); /* Enlace dinámico */
  text-decoration: none;
}

.login-container a:hover {
  text-decoration: underline;
}

/* Estilo del formulario */
.form-group {
  margin-bottom: 15px;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: var(--input-background-color);
  border: 1px solid var(--input-border-color);
  border-radius: 5px;
  padding: 10px;
}

.input-container i {
  margin-right: 10px;
  color: var(--icon-color);
}

.input-container input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 1rem;
}

.input-container input::placeholder {
  color: var(--placeholder-color);
}

/* Botón */
.btn-login {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-login:hover {
  background-color: var(--primary-hover-color);
}

/* Enlace de "¿Olvidaste tu contraseña?" */
.forgot-password {
  margin-top: 15px;
}

.forgot-password a {
  color: var(--primary-color);
  font-size: 0.9rem;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}
</style>