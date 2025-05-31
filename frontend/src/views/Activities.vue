<template>
  <div class="activities-page">
    <div class="activities-header glass">
      <div class="activities-header-icon">
        <i class="fas fa-history"></i>
      </div>
      <div>
        <h1>Historial de Actividades</h1>
        <p class="activities-desc">Consulta todas las acciones recientes del sistema.</p>
      </div>
    </div>
    <div class="activities-list glass">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="act in actividades" :key="act.id">
            <td>{{ new Date(act.fecha).toLocaleString() }}</td>
            <td>{{ act.descripcion }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="actividades.length === 0" class="no-data-msg">
        No hay actividades registradas.
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      actividades: [],
    };
  },
  mounted() {
    this.cargarActividades();
  },
  methods: {
    async cargarActividades() {
      try {
        const res = await axios.get('/api/actividades/todas');
        this.actividades = res.data;
      } catch (e) {
        this.actividades = [];
      }
    },
  },
};
</script>

<style src="@/assets/css/activities.css"></style>