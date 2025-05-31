<style src="@/assets/css/users.css"></style>

<template>
  <div class="dynamic-content users-modern">
    <div class="users-background-decor"></div>
    <!-- Cabecera mejorada -->
    <div class="users-header-card glass">
      <div class="users-header-title">
        <div class="users-header-icon">
          <i class="fas fa-users"></i>
        </div>
        <div>
          <h1 class="users-title">Usuarios</h1>
          <p class="users-desc">Gestión de usuarios registrados en el sistema.</p>
        </div>
      </div>
      <!-- Botón para agregar usuario (opcional) -->
      <!-- <button class="btn-primary" @click="showForm = true">
        <i class="fas fa-user-plus"></i> Agregar Usuario
      </button> -->
    </div>

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
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="'role-badge role-' + user.role">{{ user.role }}</span>
            </td>
            <td>
              <button
                class="btn-ver"
                @click="editUser(user)"
                v-if="currentUserRole === 'admin'"
                title="Editar"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-anular"
                @click="deleteUser(user.id)"
                v-if="currentUserRole === 'admin'"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" style="text-align:center;">No hay usuarios registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <div v-if="showForm" class="modal-bg" @click.self="cancelForm">
      <div class="modal user-modal">
        <div class="modal-header">
          <div class="modal-icon user-modal-icon">
            <i class="fas fa-user-cog"></i>
          </div>
          <h2>{{ editingUser ? 'Editar Rol de Usuario' : 'Agregar Usuario' }}</h2>
          <button class="modal-close" @click="cancelForm" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nombre:</label>
            <div class="input-container">
              <i class="fas fa-user"></i>
              <input v-model="form.name" placeholder="Nombre" required :readonly="!!editingUser" />
            </div>
          </div>
          <div class="form-group">
            <label>Email:</label>
            <div class="input-container">
              <i class="fas fa-envelope"></i>
              <input v-model="form.email" placeholder="Email" required :readonly="!!editingUser" />
            </div>
          </div>
          <div class="form-group">
            <label>Rol:</label>
            <div class="input-container">
              <i class="fas fa-user-tag"></i>
              <select v-model="form.role">
                <option value="admin">Administrador</option>
                <option value="supervisor">Supervisor</option>
                <option value="cajero">Cajero</option>
                <option value="almacenero">Almacenero</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary big-btn">
              <i class="fas fa-save"></i> Guardar
            </button>
            <button type="button" @click="cancelForm" class="btn-ver big-btn">
              <i class="fas fa-times"></i> Cancelar
            </button>
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
      },
      currentUserEmail: localStorage.getItem('userEmail') || '',
      currentUserRole: localStorage.getItem('userRole') || ''
    };
  },
  created() {
    // Carga los usuarios al iniciar el componente
    this.fetchUsers();
  },
  computed: {
    filteredUsers() {
      return this.users.filter(u => u.email !== this.currentUserEmail);
    }
  },
  methods: {
    // Obtiene la lista de usuarios desde la API
    async fetchUsers() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.users = response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('No tienes permisos para ver los usuarios.');
        }
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
        const token = localStorage.getItem('authToken');
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    },
    // Guarda los cambios del usuario (solo rol)
    async saveUser() {
      if (this.editingUser) {
        try {
          const token = localStorage.getItem('authToken');
          await axios.put(
            `/api/users/${this.editingUser.id}`,
            { role: this.form.role },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
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