<style src="@/assets/css/sales.css"></style>
<template>
  <div class="dynamic-content">
    <h1 class="sales-title">Ventas</h1>
    <p class="sales-desc">Gestión de ventas realizadas en el sistema.</p>

    <!-- Notificación personalizada -->
    <div v-if="notificacion.visible" class="notificacion-error">
      <span>{{ notificacion.mensaje }}</span>
      <button @click="notificacion.visible = false" class="cerrar-notificacion">&times;</button>
    </div>

    <div class="sales-actions">
      <button class="btn-primary" @click="modalNuevaVenta = true">+ Registrar Venta</button>
      <input class="sales-search" v-model="busqueda" placeholder="Buscar por cliente o producto..." />
    </div>

    <div class="sales-table-section">
      <table class="sales-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasFiltradas" :key="venta.id" :class="{ 'venta-anulada': venta.anulada }">
            <td>{{ venta.id }}</td>
            <td>{{ venta.fecha }}</td>
            <td>{{ venta.cliente }}</td>
            <td>
              <ul>
                <li v-for="prod in venta.productos" :key="prod.id">
                  {{ prod.name }} <span v-if="prod.cantidad">x{{ prod.cantidad }}</span>
                </li>
              </ul>
            </td>
            <td>S/ {{ venta.total }}</td>
            <td>
              <div class="acciones-btns">
                <button class="btn-ver" @click="abrirDetalle(venta)">Ver</button>
                <button
                  v-if="!venta.anulada"
                  class="btn-anular"
                  @click="abrirModalAnulacion(venta)"
                >Anular</button>
                <span v-else class="venta-anulada-label">Anulada</span>
              </div>
            </td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="6" style="text-align:center;">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nueva Venta -->
    <div v-if="modalNuevaVenta" class="modal-bg" @click.self="modalNuevaVenta = false">
      <div class="modal modal-venta">
        <h2>Nueva Venta</h2>
        <form @submit.prevent="registrarVenta">
          <label>Cliente:</label>
          <input v-model="nueva.cliente" required />

          <div class="producto-row">
            <div style="flex:2;">
              <label>Buscar producto:</label>
              <input
                v-model="productoBuscado"
                placeholder="Buscar producto..."
                @input="filtrarProductos"
                list="lista-productos"
              />
              <datalist id="lista-productos">
                <option
                  v-for="prod in productosFiltrados"
                  :key="prod.id"
                  :value="prod.name"
                />
              </datalist>
            </div>
            <div style="flex:1;">
              <label>Cantidad:</label>
              <input v-model.number="productoTemp.cantidad" type="number" min="1" placeholder="Cantidad" />
            </div>
            <div style="flex:1;">
              <label>Precio:</label>
              <input :value="productoSeleccionado ? productoSeleccionado.precio : ''" readonly />
            </div>
            <button
              type="button"
              class="btn-primary agregar-btn"
              @click="agregarProducto"
              :disabled="!productoSeleccionado || productoTemp.cantidad < 1"
            >Agregar</button>
          </div>

          <!-- Tabla de productos agregados -->
          <table v-if="nueva.productos.length" class="sales-table" style="min-width:700px">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prod, idx) in nueva.productos" :key="idx">
                <td>{{ prod.name }}</td>
                <td>{{ prod.cantidad }}</td>
                <td>S/ {{ prod.precio }}</td>
                <td>S/ {{ (prod.cantidad * prod.precio).toFixed(2) }}</td>
                <td>
                  <button type="button" class="btn-ver" @click="eliminarProducto(idx)">Quitar</button>
                </td>
              </tr>
            </tbody>
          </table>

          <label>Subtotal:</label>
          <input :value="subtotal.toFixed(2)" readonly />

          <label>Impuesto ({{ impuestoPorcentaje }}%):</label>
          <input :value="impuesto" readonly />

          <label>Total:</label>
          <input :value="totalConImpuesto" readonly />

          <label>Método de Pago:</label>
          <select v-model="metodoPago">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otros">Otros</option>
          </select>
          <input v-if="metodoPago === 'otros'" v-model="otrosMetodoPago" placeholder="Especifique el método" />

          <div class="modal-actions">
            <button type="submit" class="btn-primary">Guardar</button>
            <button type="button" @click="modalNuevaVenta = false" class="btn-ver">Cancelar</button>
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
              <!-- Puedes poner aquí tu logo si tienes -->
              <!-- <img src="/logo.png" alt="Logo" /> -->
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
          <div class="boleta-footer">
            ¡Gracias por su compra!
          </div>
        </div>
        <!-- Botones fuera del div boleta-contenido -->
        <button class="btn-imprimir no-print" @click="imprimirBoleta">
          🖨️ Imprimir Boleta
        </button>
        <button class="btn-imprimir no-print" @click="descargarBoletaPDF">
          🖨️ Descargar Boleta PDF
        </button>
        <small class="no-print" style="color:#43cea2;display:block;margin-top:4px;">
          Sugerencia: Guarde el archivo como <b>boleta-venta-{{detalleVenta.id}}.pdf</b>
        </small>
        <div class="modal-actions no-print">
          <button @click="modalDetalle = false" class="btn-ver">Cerrar</button>
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
          <button class="btn-primary" @click="anularVenta">Confirmar</button>
          <button class="btn-ver" @click="cerrarModalAnulacion">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import salesService from '@/services/sales';
import productsService from '@/services/products'; // <--- Importa el servicio
import { jsPDF } from "jspdf";

export default {
  data() {
    return {
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
    };
  },
  async mounted() {
    await this.fetchVentas();
    await this.fetchProductos(); // <--- Llama aquí
  },
  computed: {
    ventasFiltradas() {
      if (!this.busqueda) return this.ventas;
      const b = this.busqueda.toLowerCase();
      return this.ventas.filter(
        v =>
          v.cliente.toLowerCase().includes(b) ||
          v.productos.some(p => (p.name || '').toLowerCase().includes(b))
      );
    },
    subtotal() {
      return this.nueva.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
    },
    impuesto() {
      return (this.subtotal * this.impuestoPorcentaje / 100).toFixed(2);
    },
    totalConImpuesto() {
      return (parseFloat(this.subtotal) + parseFloat(this.impuesto)).toFixed(2);
    },
    totalProductos() {
      return this.nueva.productos
        .reduce((sum, p) => sum + (p.cantidad * p.precio), 0)
        .toFixed(2);
    },
  },
  watch: {
    productoBuscado(val) {
      this.filtrarProductos();
      const prod = this.productosDisponibles.find(p => (p.name || '').toLowerCase() === (val || '').toLowerCase());
      this.productoSeleccionado = prod || null;
    }
  },
  methods: {
    async fetchVentas() {
      try {
        const res = await salesService.getAll();
        this.ventas = res.data;
      } catch (e) {
        alert('Error al cargar ventas');
      }
    },
    async fetchProductos() {
      try {
        const res = await productsService.getAll();
        this.productosDisponibles = res.data;
      } catch (e) {
        alert('Error al cargar productos');
      }
    },
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
          console.log('Producto original:', productoOriginal);
          if (productoOriginal) {
            const nuevoStock = productoOriginal.stock - prod.cantidad;
            console.log(`Actualizando producto ${prod.id} a stock ${nuevoStock}`);
            await productsService.update(prod.id, {
              name: productoOriginal.name,
              description: productoOriginal.description,
              price: productoOriginal.price,
              purchase_price: productoOriginal.purchase_price,
              category: productoOriginal.category,
              stock: nuevoStock,
              stock_min: productoOriginal.stock_min,   // <--- Agrega esto
              stock_max: productoOriginal.stock_max,   // <--- Y esto
              image: productoOriginal.image // si tu backend lo requiere
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
    async abrirDetalle(venta) {
      try {
        const res = await salesService.getById(venta.id);
        // Normaliza el campo precio para evitar NaN
        this.detalleVenta = {
          ...res.data,
          productos: (res.data.productos || []).map(p => ({
            ...p,
            precio: p.precio !== undefined ? p.precio : p.price // usa precio o price
          }))
        };
        this.modalDetalle = true;
      } catch (e) {
        alert('Error al obtener detalle');
      }
    },
    agregarProducto() {
      if (this.productoSeleccionado && this.productoTemp.cantidad > 0) {
        this.nueva.productos.push({
          id: this.productoSeleccionado.id,
          name: this.productoSeleccionado.name,
          cantidad: this.productoTemp.cantidad,
          precio: this.productoSeleccionado.price,
        });
        this.productoBuscado = "";
        this.productoSeleccionado = null;
        this.productoTemp = { cantidad: 1 };
      }
    },
    eliminarProducto(idx) {
      this.nueva.productos.splice(idx, 1);
    },
    filtrarProductos() {
      const b = (this.productoBuscado || '').toLowerCase();
      this.productosFiltrados = this.productosDisponibles.filter(p =>
        (p.name || '').toLowerCase().includes(b)
      );
    },
    mostrarNotificacion(msg) {
      this.notificacion.mensaje = msg;
      this.notificacion.visible = true;
      setTimeout(() => {
        this.notificacion.visible = false;
      }, 3500); // Se oculta automáticamente después de 3.5s
    },
    abrirModalAnulacion(venta) {
      this.ventaAAnular = venta;
      this.motivoAnulacion = '';
    },
    cerrarModalAnulacion() {
      this.ventaAAnular = null;
      this.motivoAnulacion = '';
    },
    async anularVenta() {
      if (!this.motivoAnulacion.trim()) {
        this.mostrarNotificacion('Debe ingresar un motivo de anulación.');
        return;
      }
      try {
        await salesService.anular(this.ventaAAnular.id, { motivo: this.motivoAnulacion });
        this.mostrarNotificacion('Venta anulada correctamente');
        await this.fetchVentas();
        this.$emit('actualizar-dashboard'); // Si usas eventos
        this.cerrarModalAnulacion();
      } catch (e) {
        this.mostrarNotificacion('Error al anular venta');
      }
    },
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
