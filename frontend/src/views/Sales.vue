<style src="@/assets/css/sales.css"></style>

<template>
  <div class="dynamic-content sales-modern">
    <div class="sales-background-decor"></div>
    <div class="sales-header-card">
      <div class="sales-header-title">
        <div class="sales-header-icon">
          <i class="fas fa-cash-register"></i>
        </div>
        <div>
          <h1 class="sales-title">Ventas</h1>
          <p class="sales-desc">Gestión de ventas realizadas en el sistema.</p>
        </div>
      </div>
      <button class="btn-primary" @click="modalNuevaVenta = true">
        <i class="fas fa-plus"></i> Registrar Venta
      </button>
    </div>

    <div class="sales-actions">
      <input class="sales-search" v-model="busqueda" placeholder="Buscar por cliente o producto..." />
    </div>

    <!-- Tabla de ventas -->
    <div class="sales-table-section modern-table-card">
      <table class="sales-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasFiltradas" :key="venta.id" :class="{ 'venta-anulada': venta.anulada }">
            <td>{{ venta.id }}</td>
            <td>{{ venta.fecha }}</td>
            <td>{{ venta.cliente }}</td>
            <td><span class="total-badge">S/ {{ venta.total }}</span></td>
            <td>
              <div class="acciones-btns">
                <button class="btn-ver" @click="abrirDetalle(venta)">
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="!venta.anulada"
                  class="btn-anular"
                  @click="abrirModalAnulacion(venta)"
                  title="Anular"
                >
                  <i class="fas fa-ban"></i>
                </button>
                <span v-else class="venta-anulada-label">Anulada</span>
              </div>
            </td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="5" style="text-align:center;">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nueva Venta -->
    <div v-if="modalNuevaVenta" class="modal-bg" @click.self="modalNuevaVenta = false">
      <div class="modal modal-venta">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h2>Nueva Venta</h2>
          <button class="modal-close" @click="modalNuevaVenta = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="registrarVenta">
          <div class="form-group">
            <label for="cliente">Cliente</label>
            <input id="cliente" v-model="nueva.cliente" required placeholder="Nombre del cliente" />
          </div>
          <div class="form-group">
            <label for="producto">Producto</label>
            <select id="producto" v-model="productoSeleccionado">
              <option disabled value="">Selecciona un producto</option>
              <option v-for="p in productosDisponibles" :key="p.id" :value="p">{{ p.name }}</option>
            </select>
            <button type="button" class="agregar-btn" @click="agregarProducto">
              <i class="fas fa-plus"></i> Agregar
            </button>
          </div>
          <div class="productos-lista">
            <div v-for="(prod, idx) in nueva.productos" :key="idx" class="producto-row">
              <span>{{ prod.nombre }}</span>
              <input type="number" v-model.number="prod.cantidad" min="1" />
              <span>${{ prod.precio }}</span>
              <button type="button" @click="eliminarProducto(idx)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="modal-totales">
            <span>Subtotal: <b>${{ subtotal }}</b></span>
            <span>Impuesto: <b>${{ impuesto }}</b></span>
            <span>Total: <b>${{ totalConImpuesto }}</b></span>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Registrar Venta</button>
            <button type="button" class="btn-anular" @click="modalNuevaVenta = false">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalle Venta -->
    <div v-if="modalDetalle" class="modal-bg" @click.self="modalDetalle = false">
      <div class="modal" id="detalle-venta-modal">
        <div id="boleta-contenido">
          <div class="boleta-header">
            <div>
              <h2 class="boleta-title">Boleta Electrónica</h2>
              <div class="boleta-id">N° {{ detalleVenta.id }}</div>
            </div>
            <div class="boleta-logo">
              <!-- Logo aquí si lo tienes -->
            </div>
          </div>
          <div class="boleta-info">
            <div><b>Fecha:</b> {{ detalleVenta.fecha }}</div>
            <div><b>Cliente:</b> {{ detalleVenta.cliente }}</div>
          </div>
          <table class="boleta-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in detalleVenta.productos" :key="prod.id">
                <td>{{ prod.name }}</td>
                <td>{{ prod.cantidad }}</td>
                <td>S/ {{ (prod.cantidad * prod.precio).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="boleta-total">
            <b>Total:</b> S/ {{ detalleVenta.total }}
          </div>
          <div v-if="detalleVenta.anulada" class="anulada-info" style="color:red; margin-top:10px;">
            <b>Venta anulada</b>
            <div v-if="detalleVenta.motivo_anulacion">
              <b>Motivo:</b> {{ detalleVenta.motivo_anulacion }}
            </div>
          </div>
          <div class="boleta-footer" v-if="!detalleVenta.anulada">
            ¡Gracias por su compra!
          </div>
        </div>
        <button
          class="btn-imprimir no-print"
          @click="imprimirBoleta"
          v-if="!detalleVenta.anulada"
        >
          <i class="fas fa-print"></i> Imprimir Boleta
        </button>
        <button
          class="btn-imprimir no-print"
          @click="descargarBoletaPDF"
          v-if="!detalleVenta.anulada"
        >
          <i class="fas fa-file-pdf"></i> Descargar Boleta PDF
        </button>
        <small
          class="no-print"
          style="color:#43cea2;display:block;margin-top:4px;"
          v-if="!detalleVenta.anulada"
        >
          Sugerencia: Guarde el archivo como <b>boleta-venta-{{detalleVenta.id}}.pdf</b>
        </small>
        <div class="modal-actions no-print">
          <button @click="modalDetalle = false" class="btn-ver">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Anulación Venta -->
    <div v-if="ventaAAnular" class="modal-bg" @click.self="cerrarModalAnulacion">
      <div class="modal">
        <h3>Anular Venta N° {{ ventaAAnular.id }}</h3>
        <label>Motivo de anulación:</label>
        <textarea v-model="motivoAnulacion" required style="width:100%;min-height:60px;"></textarea>
        <div class="modal-actions">
          <button class="btn-primary" @click="anularVenta">
            <i class="fas fa-check"></i> Confirmar
          </button>
          <button class="btn-ver" @click="cerrarModalAnulacion">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    </div>

    <p v-if="!resumenVentas" class="loading-text">Cargando ventas...</p>
  </div>
</template>

<script>
// Importa servicios y librerías necesarias
import salesService from '@/services/sales';
import productsService from '@/services/products';
import { jsPDF } from "jspdf";

export default {
  data() {
    return {
      // Filtros y datos de ventas
      busqueda: "",
      ventas: [],
      modalNuevaVenta: false,
      modalDetalle: false,
      detalleVenta: {},
      nueva: {
        cliente: "",
        productos: [],
        total: null,
      },
      productoTemp: {
        cantidad: 1,
      },
      productoBuscado: "",
      productosFiltrados: [],
      productoSeleccionado: null,
      notificacion: {
        visible: false,
        mensaje: "",
      },
      impuestoPorcentaje: 18, // IGV o el impuesto que uses
      metodoPago: 'efectivo',
      otrosMetodoPago: '',
      ventaAAnular: null,
      motivoAnulacion: '',
      resumenVentas: null, // o [] o {} según lo que necesites
    };
  },
  async mounted() {
    // Carga ventas y productos al iniciar
    await this.fetchVentas();
    await this.fetchProductos();
  },
  computed: {
    // Filtra ventas por cliente o producto
    ventasFiltradas() {
      if (!this.busqueda) return this.ventas;
      const b = this.busqueda.toLowerCase();
      return this.ventas.filter(
        v =>
          v.cliente.toLowerCase().includes(b) ||
          v.productos.some(p => (p.name || '').toLowerCase().includes(b))
      );
    },
    // Calcula subtotal de la venta actual
    subtotal() {
      return this.nueva.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
    },
    // Calcula el impuesto de la venta actual
    impuesto() {
      return (this.subtotal * this.impuestoPorcentaje / 100).toFixed(2);
    },
    // Calcula el total con impuesto
    totalConImpuesto() {
      return (parseFloat(this.subtotal) + parseFloat(this.impuesto)).toFixed(2);
    },
    // Total de productos en la venta actual
    totalProductos() {
      return this.nueva.productos
        .reduce((sum, p) => sum + (p.cantidad * p.precio), 0)
        .toFixed(2);
    },
  },
  watch: {
    // Actualiza productos filtrados y seleccionados al buscar
    productoBuscado(val) {
      this.filtrarProductos();
      const prod = this.productosDisponibles.find(p => (p.name || '').toLowerCase() === (val || '').toLowerCase());
      this.productoSeleccionado = prod || null;
    }
  },
  methods: {
    // Obtiene todas las ventas desde el servicio
    async fetchVentas() {
      try {
        const res = await salesService.getAll();
        this.ventas = res.data || [];
      } catch (e) {
        alert('Error al cargar ventas');
      } finally {
        this.resumenVentas = true; // <-- Esto oculta el mensaje
      }
    },
    // Obtiene todos los productos desde el servicio
    async fetchProductos() {
      try {
        const res = await productsService.getAll();
        this.productosDisponibles = res.data;
      } catch (e) {
        alert('Error al cargar productos');
      }
    },
    // Registra una nueva venta y actualiza stock
    async registrarVenta() {
      if (!this.nueva.cliente || this.nueva.productos.length === 0) return;

      // Validar stock antes de registrar
      for (const prod of this.nueva.productos) {
        const productoOriginal = this.productosDisponibles.find(p => p.id === prod.id);
        if (productoOriginal && prod.cantidad > productoOriginal.stock) {
          this.mostrarNotificacion(`No hay suficiente stock para "${productoOriginal.name}". Disponible: ${productoOriginal.stock}`);
          return;
        }
      }

      try {
        const userId = localStorage.getItem('userId');
        const nuevaVenta = {
          cliente: this.nueva.cliente,
          productos: this.nueva.productos,
          subtotal: this.subtotal,
          impuesto: this.impuesto,
          total: this.totalConImpuesto,
          user_id: userId,
          metodo_pago: this.metodoPago === 'otros' ? this.otrosMetodoPago : this.metodoPago
        };
        await salesService.create(nuevaVenta);

        // Actualizar stock de cada producto vendido
        for (const prod of this.nueva.productos) {
          const productoOriginal = this.productosDisponibles.find(p => p.id === prod.id);
          if (productoOriginal) {
            const nuevoStock = productoOriginal.stock - prod.cantidad;
            await productsService.update(prod.id, {
              name: productoOriginal.name,
              description: productoOriginal.description,
              price: productoOriginal.price,
              purchase_price: productoOriginal.purchase_price,
              category: productoOriginal.category,
              marca: productoOriginal.marca, // <-- agrega esto
              unidad_medida: productoOriginal.unidad_medida, // <-- y esto
              stock: nuevoStock,
              stock_min: productoOriginal.stock_min,
              stock_max: productoOriginal.stock_max,
              image: productoOriginal.image
            });
          }
        }

        this.$root.$emit('actualizarLowStock');
        await this.fetchVentas();
        await this.fetchProductos();
        this.nueva = { cliente: "", productos: [], total: null };
        this.productoTemp = { cantidad: 1 };
        this.modalNuevaVenta = false;
      } catch (e) {
        console.error('Error real al registrar venta:', e);
        alert('Error al registrar venta');
      }
    },
    // Abre el modal de detalle de venta
    async abrirDetalle(venta) {
      try {
        const res = await salesService.getById(venta.id);
        // Normaliza el campo precio para evitar NaN
        this.detalleVenta = {
          ...res.data,
          productos: (res.data.productos || []).map(p => ({
            ...p,
            precio: p.precio !== undefined ? p.precio : p.price
          }))
        };
        this.modalDetalle = true;
      } catch (e) {
        alert('Error al obtener detalle');
      }
    },
    // Agrega un producto a la venta actual
    agregarProducto() {
      if (this.productoSeleccionado && this.productoTemp.cantidad > 0) {
        // Busca si el producto ya está en la lista
        const idx = this.nueva.productos.findIndex(
          p => p.id === this.productoSeleccionado.id
        );
        if (idx !== -1) {
          // Si ya existe, suma la cantidad
          this.nueva.productos[idx].cantidad += Number(this.productoTemp.cantidad);
        } else {
          // Si no existe, lo agrega
          this.nueva.productos.push({
            id: this.productoSeleccionado.id,
            name: this.productoSeleccionado.name,
            cantidad: Number(this.productoTemp.cantidad),
            precio: this.productoSeleccionado.price,
          });
        }
        this.productoBuscado = "";
        this.productoSeleccionado = null;
        this.productoTemp = { cantidad: 1 };
      }
    },
    // Elimina un producto de la venta actual
    eliminarProducto(idx) {
      this.nueva.productos.splice(idx, 1);
    },
    // Filtra productos disponibles según búsqueda
    filtrarProductos() {
      const b = (this.productoBuscado || '').toLowerCase();
      this.productosFiltrados = this.productosDisponibles.filter(p =>
        (p.name || '').toLowerCase().includes(b)
      );
    },
    // Muestra una notificación personalizada
    mostrarNotificacion(msg) {
      this.notificacion.mensaje = msg;
      this.notificacion.visible = true;
      setTimeout(() => {
        this.notificacion.visible = false;
      }, 3500);
    },
    // Abre el modal para anular una venta
    abrirModalAnulacion(venta) {
      this.ventaAAnular = venta;
      this.motivoAnulacion = '';
    },
    // Cierra el modal de anulación
    cerrarModalAnulacion() {
      this.ventaAAnular = null;
      this.motivoAnulacion = '';
    },
    // Anula una venta y actualiza la lista
    async anularVenta() {
      if (!this.motivoAnulacion.trim()) {
        this.mostrarNotificacion('Debe ingresar un motivo de anulación.');
        return;
      }
      try {
        await salesService.anular(this.ventaAAnular.id, { motivo: this.motivoAnulacion });
        this.mostrarNotificacion('Venta anulada correctamente');
        await this.fetchVentas();
        this.$emit('actualizar-dashboard');
        this.cerrarModalAnulacion();
      } catch (e) {
        this.mostrarNotificacion('Error al anular venta');
      }
    },
    // Imprime la boleta de la venta
    imprimirBoleta() {
      const contenido = document.getElementById('boleta-contenido').innerHTML;
      const ventana = window.open('', '', 'width=800,height=600');
      ventana.document.write(`
        <html>
          <head>
            <title>Boleta Electrónica</title>
            <link rel="stylesheet" href="/src/assets/css/sales.css">
            <style>
              body { font-family: Arial, sans-serif; margin: 2rem; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f0f0f0; }
            </style>
          </head>
          <body>
            ${contenido}
          </body>
        </html>
      `);
      ventana.document.close();
      ventana.focus();
      ventana.print();
    },
    // Descarga la boleta de la venta como PDF
    descargarBoletaPDF() {
      const doc = new jsPDF();
      const venta = this.detalleVenta;
      let y = 15;

      doc.setFontSize(18);
      doc.text("Boleta Electrónica", 105, y, { align: "center" });
      y += 10;
      doc.setFontSize(12);
      doc.text(`N° ${venta.id}`, 105, y, { align: "center" });
      y += 10;
      doc.text(`Fecha: ${venta.fecha}`, 15, y);
      y += 7;
      doc.text(`Cliente: ${venta.cliente}`, 15, y);
      y += 10;

      doc.text("Productos:", 15, y);
      y += 7;
      venta.productos.forEach((prod) => {
        doc.text(
          `- ${prod.name} (x${prod.cantidad}) - S/ ${(prod.cantidad * prod.precio).toFixed(2)}`,
          20,
          y
        );
        y += 7;
      });

      y += 5;
      doc.setFontSize(14);
      doc.text(`Total: S/ ${venta.total}`, 15, y);

      y += 15;
      doc.setFontSize(12);
      doc.text("¡Gracias por su compra!", 105, y, { align: "center" });

      // Nombre del archivo personalizado
      doc.save(`boleta-venta-${venta.id}.pdf`);
    },
  },
};
</script>