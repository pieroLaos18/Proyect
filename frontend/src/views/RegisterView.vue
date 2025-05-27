<!-- Vista principal de registro, muestra el formulario de registro de usuario -->

<template>
  <div class="register-view">
    <!-- Componente de formulario de registro -->
    <RegisterForm />
  </div>
</template>

<script>
// Importa el componente de formulario de registro
import RegisterForm from '../components/RegisterForm.vue';

export default {
  // Registra el componente RegisterForm
  components: {
    RegisterForm,
  },
};
</script>

<style scoped>
/* Estilos para centrar la vista de registro */
.register-view {
  text-align: center;
  margin-top: 50px;
}
</style>