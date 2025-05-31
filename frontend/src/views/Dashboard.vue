<style src="@/assets/css/dashboard.css"></style>

<template>
  <div class="dashboard-background-decor"></div>
  <div class="dashboard-main">
    <!-- Cabecera visual -->
    <div class="dashboard-header glass">
      <div class="dashboard-header-title">
        <div class="dashboard-header-icon">
          <i class="fas fa-tachometer-alt"></i>
        </div>
        <div>
          <h1 class="dashboard-title">Panel Principal</h1>
          <p class="dashboard-desc">Resumen y análisis de tu sistema de ventas.</p>
        </div>
      </div>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="dashboard-cards">
      <div class="card ventas">
        <div class="card-icon ventas"><i class="fas fa-cash-register"></i></div>
        <div>
          <div class="card-label">Ventas Hoy</div>
          <div class="card-value">{{ resumenVentas.hoy }}</div>
        </div>
      </div>
      <div class="card mes">
        <div class="card-icon mes"><i class="fas fa-calendar-alt"></i></div>
        <div>
          <div class="card-label">Ventas Mes</div>
          <div class="card-value">{{ resumenVentas.mes }}</div>
        </div>
      </div>
      <div class="card usuarios">
        <div class="card-icon usuarios"><i class="fas fa-users"></i></div>
        <div>
          <div class="card-label">Usuarios Activos</div>
          <div class="card-value">{{ resumenUsuarios.activos }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-sections-flex">
      <!-- Productos destacados -->
      <div class="dashboard-section glass">
        <h2 class="section-title"><i class="fas fa-star"></i> Productos Destacados</h2>
        <ul class="productos-list">
          <li v-for="prod in productosDestacados" :key="prod.id">
            <span class="producto-nombre">{{ prod.name }}</span>
            <span class="producto-vendidos">{{ prod.vendidos }} vendidos</span>
            <span class="producto-stock">Stock: {{ prod.stock }}</span>
          </li>
        </ul>
      </div>

      <!-- Últimas actividades -->
      <div class="dashboard-section glass">
        <h2 class="section-title"><i class="fas fa-history"></i> Últimas Actividades</h2>
        <ul class="actividades-list">
          <li v-for="act in ultimasActividades.slice(0, 5)" :key="act.id">
            <span class="actividad-fecha">{{ act.fecha }}</span>
            <span class="actividad-desc">{{ act.descripcion }}</span>
          </li>
        </ul>
        <button class="ver-todas-btn" @click="abrirTodasActividades">
          Ver todas
        </button>
      </div>
    </div>

    <!-- Gráfica de métodos de pago -->
    <div class="dashboard-section glass">
      <h2 class="section-title"><i class="fas fa-coins"></i> Métodos de Pago</h2>
      <div class="pie-chart-container">
        <Pie
          v-if="metodosPago.length"
          :data="chartDataMetodosPago"
          :options="{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 18, font: { size: 15 } } } }
          }"
        />
        <div v-else class="no-data-msg">
          <em>No hay datos de métodos de pago.</em>
        </div>
      </div>
    </div>

    <!-- Gráfico de barras de ventas por día -->
    <div class="dashboard-section glass">
      <h2 class="section-title"><i class="fas fa-chart-bar"></i> Ventas por Día</h2>
      <div class="bar-chart-container">
        <Bar
          v-if="ventasPorDia.length"
          :data="chartDataVentasPorDia"
          :options="{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { color: '#1F3B4D' } }, x: { ticks: { color: '#1F3B4D' } } }
          }"
        />
        <div v-else class="no-data-msg">
          <em>No hay datos de ventas para mostrar.</em>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Pie, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default {
  emits: ['setTitle'],
  components: { Pie, Bar },
  data() {
    return {
      resumenVentas: { hoy: 0, mes: 0 },
      resumenUsuarios: { activos: 0 },
      productosDestacados: [],
      ultimasActividades: [],
      ventasPorDia: [],
      ventasPorDiaAnterior: [],
      fechaInicio: '',
      fechaFin: '',
      metodosPago: [],
      activityInterval: null,
      usuariosActivosInterval: null, // <--- NUEVO
    };
  },
  mounted() {
    this.cargarResumenVentas();
    this.cargarResumenUsuarios();
    this.cargarProductosDestacados();
    this.cargarUltimasActividades();
    this.cargarVentasPorDia();
    this.cargarVentasPorDiaAnterior();
    this.cargarMetodosPago();
    // Elimina esta línea:
    // this.activityInterval = setInterval(this.actualizarActividad, 2 * 60 * 1000);
    // Elimina también el clearInterval en beforeUnmount
  },
  beforeUnmount() {
    // Elimina esta línea:
    // clearInterval(this.activityInterval);
    clearInterval(this.usuariosActivosInterval);
  },
  computed: {
    chartDataMetodosPago() {
      return {
        labels: this.metodosPago.map(m => m.metodo_pago || 'Sin especificar'),
        datasets: [{
          data: this.metodosPago.map(m => Number(m.total)),
          backgroundColor: ['#4f8cff', '#ffb347', '#ff6961', '#77dd77', '#f49ac2', '#a890fe', '#ffd700'],
        }]
      };
    },
    chartDataVentasPorDia() {
      return {
        labels: this.ventasPorDia.map(v => v.dia),
        datasets: [{
          label: 'Ventas',
          data: this.ventasPorDia.map(v => v.total),
          backgroundColor: '#4f8cff',
          borderRadius: 8,
          barThickness: 32,
        }]
      };
    }
  },
  methods: {
    // Obtiene el resumen de ventas (hoy y mes)
    async cargarResumenVentas() {
      try {
        const res = await axios.get('/api/sales/resumen');
        console.log('Resumen ventas:', res.data); // Para depuración
        this.resumenVentas = res.data;
      } catch (e) {
        console.error('Error al cargar resumen de ventas', e);
      }
    },
    // Obtiene el resumen de usuarios activos
    async cargarResumenUsuarios() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('/api/users/activos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.resumenUsuarios = res.data;
      } catch (e) {
        console.error('Error al cargar usuarios activos', e);
      }
    },
    // Obtiene los productos destacados
    async cargarProductosDestacados() {
      try {
        const res = await axios.get('/api/products/destacados');
        this.productosDestacados = res.data;
      } catch (e) {
        console.error('Error al cargar productos destacados', e);
      }
    },
    // Obtiene las últimas actividades
    async cargarUltimasActividades() {
      try {
        const res = await axios.get('/api/actividades/todas');
        this.ultimasActividades = res.data;
      } catch (e) {
        console.error('Error al cargar últimas actividades', e);
      }
    },
    // Obtiene las ventas por día para la gráfica
    async cargarVentasPorDia() {
      try {
        const res = await axios.get('/api/sales/ventas-por-dia');
        this.ventasPorDia = res.data;
        console.log('Ventas por día:', this.ventasPorDia); // Para debug
      } catch (error) {
        console.error('Error al cargar ventas por día:', error);
      }
    },
    async cargarVentasPorDiaAnterior() {
      try {
        const res = await axios.get('/api/sales/ventas-por-dia-anterior');
        this.ventasPorDiaAnterior = res.data;
      } catch (error) {
        console.error('Error al cargar ventas semana anterior:', error);
      }
    },
    // Obtiene los métodos de pago
    async cargarMetodosPago() {
      const res = await axios.get('/api/sales/metodos-pago');
      this.metodosPago = res.data;
    },
    // Calcula la altura de cada barra en la gráfica de ventas
    calcularAlturaBarra(total) {
      if (!this.ventasPorDia.length) return 0;
      const maxVenta = Math.max(...this.ventasPorDia.map(v => v.total));
      if (maxVenta === 0) return 0;
      const altura = (total / maxVenta) * 100;
      return total === 0 ? 4 : altura; // Altura mínima para que se vea la barra aunque no haya ventas
    },
    // Calcula el crecimiento porcentual de ventas entre la semana actual y la anterior
    calcularCrecimientoSemana() {
      const actual = this.ventasPorDia.reduce((sum, v) => sum + v.total, 0);
      const anterior = this.ventasPorDiaAnterior.reduce((sum, v) => sum + v.total, 0);
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return (((actual - anterior) / anterior) * 100).toFixed(1);
    },
    abrirTodasActividades() {
      this.$router.push('/main/actividades');
    },
    async logout() {
      try {
        await axios.post('/api/users/logout');
      } catch (e) {
        // Ignora error si ocurre
      }
      localStorage.clear();
      this.$router.push('/login');
    }
  },
};
</script>

