<!-- Vista de Login principal, muestra el formulario de inicio de sesión -->

<template>
  <div class="login-view">
    <!-- Componente de formulario de login -->
    <LoginForm />
  </div>
</template>

<script>
// Importa el componente de formulario de login
import LoginForm from '../components/LoginForm.vue';

export default {
  // Registra el componente LoginForm
  components: {
    LoginForm,
  },
};
</script>

<style scoped>
/* Estilos para centrar la vista de login */
.login-view {
  text-align: center;
  margin-top: 50px;
}
</style>