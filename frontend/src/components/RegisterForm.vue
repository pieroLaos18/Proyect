<!-- Componente de formulario de registro de usuario -->

<style scoped src="@/assets/css/registerform.css"></style>

<template>
  <div class="page-container">
    <!-- Panel izquierdo con texto o imagen -->
    <div class="left-panel">
      <div class="image-content">
        <h2>¡Bienvenido!</h2>
        <p>Únete a nuestra comunidad y disfruta de una experiencia moderna y segura.</p>
      </div>
    </div>
    <!-- Panel derecho con el formulario de registro -->
    <div class="right-panel">
      <div class="register-container glass">
        <div class="register-header">
          <div class="register-logo">
            <i class="fas fa-user-plus"></i>
          </div>
          <h1>Registrarse</h1>
        </div>
        <p>
          ¿Ya tienes una cuenta?
          <router-link to="/login">Inicia sesión aquí</router-link>.
        </p>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input type="text" id="firstName" v-model="nombre" placeholder="Ingresa tu nombre" required />
            </div>
          </div>
          <div class="form-group">
            <label for="lastName">Apellido</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input type="text" id="lastName" v-model="apellido" placeholder="Ingresa tu apellido" required />
            </div>
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-container">
              <i class="fas fa-envelope"></i>
              <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
            </div>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-container">
              <i class="fas fa-lock"></i>
              <input type="password" id="password" v-model="password" placeholder="Crea una contraseña" required />
            </div>
          </div>
          <div class="form-group">
            <label for="address">Dirección</label>
            <div class="input-container">
              <i class="fas fa-map-marker-alt"></i>
              <input type="text" id="address" v-model="direccion" placeholder="Ingresa tu dirección" required />
            </div>
          </div>
          <button type="submit" class="btn-register enhanced-btn">Registrarse</button>
        </form>
        <p v-if="success" class="success">{{ success }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// Importa el servicio de API para registrar usuarios
import api from '../services/api';

export default {
  data() {
    return {
      // Campos del formulario de registro
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      direccion: '',
      // Mensaje de éxito
      success: null,
      // Mensaje de error
      error: null,
    };
  },
  methods: {
    // Maneja el envío del formulario de registro
    async handleRegister() {
      try {
        const response = await api.post('/auth/register', {
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
