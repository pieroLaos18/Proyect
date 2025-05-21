<style src="@/assets/css/dashboard.css"></style>
<template>
  <div class="dynamic-content">
    <h1 class="dashboard-title">Escritorio</h1>
    <div class="dashboard-cards">
      <div class="card">
        <div class="card-icon ventas"><i class="fas fa-cash-register"></i></div>
        <h2>Ventas Hoy</h2>
        <p class="card-value">S/ {{ Number(resumenVentas.hoy) || 0 }}</p>
      </div>
      <div class="card">
        <div class="card-icon mes"><i class="fas fa-calendar-alt"></i></div>
        <h2>Ventas Mes</h2>
        <p class="card-value">S/ {{ Number(resumenVentas.mes) || 0 }}</p>
      </div>
      <div class="card">
        <div class="card-icon usuarios"><i class="fas fa-users"></i></div>
        <h2>Usuarios Activos</h2>
        <p class="card-value">{{ resumenUsuarios.activos }}</p>
      </div>
    </div>

    <div class="dashboard-section">
      <h2 class="section-title">Productos Destacados</h2>
      <ul class="productos-list">
        <li v-for="producto in productosDestacados" :key="producto.id">
          <span class="producto-nombre">{{ producto.name }}</span>
          <span class="producto-vendidos">Vendidos: {{ producto.vendidos }}</span>
          <span class="producto-stock">Stock: {{ producto.stock }}</span>
        </li>
      </ul>
    </div>
    <div class="dashboard-section">
      <h2 class="section-title">Gráfica de Ventas (Últimos 7 días)</h2>
      <div class="chart-placeholder">
        <div class="bar-chart-sim">
          <div
            class="bar-group"
            v-for="(venta, idx) in ventasPorDia"
            :key="venta.dia"
          >
            <div
              class="bar"
              :style="{ height: calcularAlturaBarra(venta.total) + '%' }"
              :title="venta.dia + ': S/ ' + venta.total"
            ></div>
            <span class="bar-label">{{ venta.dia.slice(0,3) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <h2 class="section-title">Últimas Actividades</h2>
      <ul class="actividades-list">
        <li v-for="actividad in ultimasActividades" :key="actividad.id">
          <span class="actividad-desc">{{ actividad.descripcion }}</span>
          <span class="actividad-fecha">{{ actividad.fecha }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      resumenVentas: {
        hoy: 0,
        mes: 0,
      },
      resumenUsuarios: {
        activos: 0,
      },
      productosDestacados: [],
      ultimasActividades: [],
      ventasPorDia: [], // <-- nuevo
    };
  },
  mounted() {
    this.cargarResumenVentas();
    this.cargarResumenUsuarios();
    this.cargarProductosDestacados();
    this.cargarUltimasActividades();
    this.cargarVentasPorDia(); // <-- nuevo
  },
  methods: {
    async cargarResumenVentas() {
      try {
        const res = await axios.get('/api/sales/resumen');
        console.log('Resumen ventas:', res.data); // <-- agrega esto
        this.resumenVentas = res.data;
      } catch (e) {
        console.error('Error al cargar resumen de ventas', e);
      }
    },
    async cargarResumenUsuarios() {
      try {
        const res = await axios.get('/api/users/activos');
        this.resumenUsuarios = res.data;
      } catch (e) {
        console.error('Error al cargar usuarios activos', e);
      }
    },
    async cargarProductosDestacados() {
      try {
        const res = await axios.get('/api/products/destacados');
        this.productosDestacados = res.data;
      } catch (e) {
        console.error('Error al cargar productos destacados', e);
      }
    },
    async cargarUltimasActividades() {
      try {
        const res = await axios.get('/api/actividades/ultimas');
        this.ultimasActividades = res.data;
      } catch (e) {
        console.error('Error al cargar últimas actividades', e);
      }
    },
    async cargarVentasPorDia() {
      try {
        const res = await axios.get('/api/sales/ventas-por-dia');
        this.ventasPorDia = res.data;
      } catch (e) {
        console.error('Error al cargar ventas por día', e);
      }
    },
    calcularAlturaBarra(total) {
      const maxVenta = Math.max(...this.ventasPorDia.map(v => v.total));
      return (total / maxVenta) * 100;
    },
  },
};
</script>

