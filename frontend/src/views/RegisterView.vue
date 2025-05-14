<!-- filepath: frontend/src/views/RegisterView.vue -->
<template>
  <div class="register-view">
    <RegisterForm />
  </div>
</template>

<script>
import RegisterForm from '../components/RegisterForm.vue';

export default {
  components: {
    RegisterForm,
  },
};
</script>

<style scoped>
.register-view {
  text-align: center;
  margin-top: 50px;
}
</style>