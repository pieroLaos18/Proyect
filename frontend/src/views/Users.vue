<style src="@/assets/css/users.css"></style>

<template>
  <div class="dynamic-content">
    <h1 class="users-title">Usuarios</h1>
    <p class="users-desc">Gestión de usuarios registrados en el sistema.</p>

    <div class="users-actions">
      <!-- Aquí puedes agregar botones para agregar usuarios si lo deseas -->
      <!-- <button class="btn-primary" @click="showForm = true">Agregar Usuario</button> -->
    </div>

    <!-- Tabla de usuarios -->
    <div class="users-table-section">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button class="btn-ver" @click="editUser(user)">Editar</button>
              <button class="btn-ver" @click="deleteUser(user.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" style="text-align:center;">No hay usuarios registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <div v-if="showForm" class="modal-bg" @click.self="cancelForm">
      <div class="modal">
        <h2>{{ editingUser ? 'Editar Rol de Usuario' : 'Agregar Usuario' }}</h2>
        <form @submit.prevent="saveUser">
          <label>Nombre:</label>
          <input v-model="form.name" placeholder="Nombre" required :readonly="!!editingUser" />
          <label>Email:</label>
          <input v-model="form.email" placeholder="Email" required :readonly="!!editingUser" />
          <label>Rol:</label>
          <select v-model="form.role">
            <option>Administrador</option>
            <option>Usuario</option>
          </select>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Guardar</button>
            <button type="button" @click="cancelForm" class="btn-ver">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// Importa axios para llamadas HTTP
import axios from 'axios';

export default {
  data() {
    return {
      // Lista de usuarios
      users: [],
      // Controla la visibilidad del modal de usuario
      showForm: false,
      // Usuario en edición (null si es nuevo)
      editingUser: null,
      // Datos del formulario de usuario
      form: {
        name: '',
        email: '',
        role: 'Usuario'
      }
    };
  },
  created() {
    // Carga los usuarios al iniciar el componente
    this.fetchUsers();
  },
  methods: {
    // Obtiene la lista de usuarios desde la API
    async fetchUsers() {
      try {
        const response = await axios.get('/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },
    // Abre el modal para editar un usuario
    editUser(user) {
      this.editingUser = user;
      this.form = { ...user };
      this.showForm = true;
    },
    // Elimina un usuario por ID
    async deleteUser(id) {
      try {
        await axios.delete(`/api/users/${id}`);
        this.fetchUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    },
    // Guarda los cambios del usuario (solo rol)
    async saveUser() {
      if (this.editingUser) {
        try {
          await axios.put(`/api/users/${this.editingUser.id}`, { role: this.form.role });
          this.fetchUsers();
        } catch (error) {
          console.error('Error al actualizar usuario:', error);
        }
      }
      this.cancelForm();
    },
    // Cancela y cierra el formulario/modal
    cancelForm() {
      this.showForm = false;
      this.editingUser = null;
      this.form = { name: '', email: '', role: 'Usuario' };
    }
  }
};
</script>