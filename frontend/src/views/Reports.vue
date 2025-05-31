<style src="@/assets/css/reports.css"></style>

<template>
  <div class="dynamic-content reports-modern">
    <div class="reports-background-decor"></div>
    <div class="reports-header-card glass">
      <div class="reports-header-title">
        <div class="reports-header-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div>
          <h1 class="reports-title">Reportes</h1>
          <p class="reports-desc">Visualización y exportación de reportes de ventas.</p>
        </div>
      </div>
    </div>
    <div class="filters reports-filters-card">
      <div class="filters-row">
        <label>
          <span>Desde:</span>
          <input type="date" v-model="fromDate" />
        </label>
        <label>
          <span>Hasta:</span>
          <input type="date" v-model="toDate" />
        </label>
        <button class="btn-primary" @click="fetchReport">
          <i class="fas fa-search"></i> Generar
        </button>
      </div>
      <div class="filters-row export-row">
        <button class="btn-secondary" @click="exportCSV" :disabled="!reportData.length">
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <button class="btn-success" @click="exportExcel" :disabled="!reportData.length">
          <i class="fas fa-file-excel"></i> Excel
        </button>
        <button class="btn-warning" @click="exportPDF" :disabled="!reportData.length">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
      </div>
    </div>
    <div class="reports-table-section">
      <table class="reports-table" v-if="reportData.length">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportData" :key="item.id">
            <td>{{ item.date }}</td>
            <td>{{ item.product }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              <span class="total-badge">S/ {{ item.total }}</span>
            </td>
            <td>{{ item.usuario }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data-text">No hay datos para mostrar.</p>
    </div>
  </div>
</template>

<script>
// Importa librerías para exportar reportes
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      // Fechas para filtrar el reporte
      fromDate: '',
      toDate: '',
      // Datos del reporte
      reportData: []
    }
  },
  methods: {
    // Obtiene los datos del reporte desde la API
    async fetchReport() {
      try {
        let url = `${import.meta.env.VITE_API_URL}/api/reports/by-date`;
        const params = [];
        if (this.fromDate) params.push(`from=${this.fromDate}`);
        if (this.toDate) params.push(`to=${this.toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) throw new Error('Error al obtener los datos');
        const data = await response.json();
        console.log('Respuesta del backend:', data);
        this.reportData = data.map(item => ({
          id: item.id,
          date: item.fecha,
          product: item.product,
          quantity: item.cantidad,
          total: item.total,
          usuario: item.usuario
        }));
      } catch (error) {
        alert('No se pudieron cargar los reportes.');
        this.reportData = [];
      }
    },
    // Exporta el reporte a CSV
    exportCSV() {
      const headers = ['Fecha', 'Producto', 'Cantidad', 'Total', 'Usuario'];
      const rows = this.reportData.map(item => [
        item.date, item.product, item.quantity, item.total, item.usuario
      ]);
      let csvContent = headers.join(',') + '\n' +
        rows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'reporte.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // Exporta el reporte a Excel
    exportExcel() {
      const ws = XLSX.utils.json_to_sheet(this.reportData.map(item => ({
        Fecha: item.date,
        Producto: item.product,
        Cantidad: item.quantity,
        Total: item.total,
        Usuario: item.usuario
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      XLSX.writeFile(wb, "reporte.xlsx");
    },
    // Exporta el reporte a PDF
    exportPDF() {
      const doc = new jsPDF();
      doc.text("Reporte de Ventas", 14, 10);
      autoTable(doc, {
        head: [['Fecha', 'Producto', 'Cantidad', 'Total', 'Usuario']],
        body: this.reportData.map(item => [
          item.date, item.product, item.quantity, item.total, item.usuario
        ]),
        startY: 20
      });
      doc.save('reporte.pdf');
    }
  }
}
</script>