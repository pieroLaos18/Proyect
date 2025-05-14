<!-- filepath: frontend/src/views/LoginView.vue -->
<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue';

export default {
  components: {
    LoginForm,
  },
};
</script>

<style scoped>
.login-view {
  text-align: center;
  margin-top: 50px;
}
</style>