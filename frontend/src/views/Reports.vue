<style src="@/assets/css/reports.css"></style>

<template>
  <div class="dynamic-content">
    <h1>Reportes</h1>
    <p>Visualización de reportes.</p>
    <div class="filters">
      <label>Desde: <input type="date" v-model="fromDate" /></label>
      <label>Hasta: <input type="date" v-model="toDate" /></label>
      <button @click="fetchReport">Generar</button>
      <button @click="exportCSV" :disabled="!reportData.length">Exportar CSV</button>
      <button @click="exportExcel" :disabled="!reportData.length">Exportar Excel</button>
      <button @click="exportPDF" :disabled="!reportData.length">Exportar PDF</button>
    </div>
    <table v-if="reportData.length">
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
          <td>{{ item.total }}</td>
          <td>{{ item.usuario }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay datos para mostrar.</p>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      fromDate: '',
      toDate: '',
      reportData: []
    }
  },
  methods: {
    async fetchReport() {
      try {
        let url = '/api/reports/by-date';
        const params = [];
        if (this.fromDate) params.push(`from=${this.fromDate}`);
        if (this.toDate) params.push(`to=${this.toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener los datos');
        const data = await response.json();
        this.reportData = data.map(item => ({
          id: item.id,
          date: item.fecha,         // Cambia 'fecha' a 'date'
          product: item.product,
          quantity: item.cantidad,  // Cambia 'cantidad' a 'quantity'
          total: item.total,
          usuario: item.usuario // Nuevo campo
        }));
      } catch (error) {
        alert('No se pudieron cargar los reportes.');
        this.reportData = [];
      }
    },
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
