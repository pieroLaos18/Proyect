<!-- filepath: frontend/src/components/RegisterForm.vue -->

<style src="@/assets/css/registerform.css"></style>
<template>
  <div class="page-container">
    <div class="left-panel">
      <!-- Aquí va el texto o imagen, por ejemplo: -->
      <div class="image-content">
        <h2>Lorem Ipsum is simply</h2>
        <p>Texto descriptivo o imagen aquí...</p>
      </div>
    </div>
    <div class="right-panel">
      <!-- Aquí va tu formulario de registro -->
      <div class="register-container">
        <h1>Registrarse</h1>
        <p>Si ya tienes una cuenta, <router-link to="/login">inicia sesión aquí</router-link>.</p>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="firstName">Nombre:</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input type="text" id="firstName" v-model="nombre" placeholder="Ingresa tu nombre" required />
            </div>
          </div>
          <div class="form-group">
            <label for="lastName">Apellido:</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input type="text" id="lastName" v-model="apellido" placeholder="Ingresa tu apellido" required />
            </div>
          </div>
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
              <input type="password" id="password" v-model="password" placeholder="Crea una contraseña" required />
            </div>
          </div>
          <div class="form-group">
            <label for="address">Dirección:</label>
            <div class="input-container">
              <i class="fas fa-map-marker-alt"></i>
              <input type="text" id="address" v-model="direccion" placeholder="Ingresa tu dirección" required />
            </div>
          </div>
          <button type="submit" class="btn-register">Registrarse</button>
        </form>
        <p v-if="success" class="success">{{ success }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      direccion: '',
      success: null, // Variable para el mensaje de éxito
      error: null, // Variable para el mensaje de error
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await api.post('/register', {
          correo_electronico: this.email,
          password: this.password,
          nombre: this.nombre,
          apellido: this.apellido,
          direccion: this.direccion,
        });
        console.log('Registro exitoso:', response.data);

        // Mostrar mensaje de éxito
        this.success = 'Registro exitoso. Redirigiendo al inicio de sesión...';
        this.error = null;

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        // Mostrar mensaje de error
        this.error = error.response?.data?.message || 'Error al registrarse';
        this.success = null;
      }
    },
  },
};
</script>


