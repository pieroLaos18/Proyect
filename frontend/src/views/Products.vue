<style src="@/assets/css/products.css"></style>

<template>
  <div class="dynamic-content products-page">
    <!-- Cabecera mejorada para Products.vue -->
    <div class="products-header glass sticky-header">
      <div class="products-header-title">
        <div class="products-header-icon">
          <i class="fas fa-boxes"></i>
        </div>
        <div>
          <h1>Productos</h1>
          <p class="products-desc">Gestión y control de inventario de productos.</p>
        </div>
      </div>
      <div class="products-header-controls">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar productos..."
          class="search-bar"
        />
        <select v-model="selectedCategory" class="category-filter">
          <option value="">Todas las categorías</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button
          class="toggle-view-btn"
          @click="viewMode = viewMode === 'cards' ? 'list' : 'cards'"
          :title="viewMode === 'cards' ? 'Ver como Lista' : 'Ver como Tarjetas'"
        >
          <i :class="viewMode === 'cards' ? 'fas fa-list' : 'fas fa-th-large'"></i>
        </button>
        <button class="btn-primary" @click="showProductModal = true">
          <i class="fas fa-plus"></i> 
        </button>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Mensaje si no hay productos -->
    <div v-else-if="filteredProducts.length === 0" class="no-products-msg">
      <i class="fas fa-box-open"></i>
      <p>No hay productos para mostrar.</p>
    </div>

    <!-- Vista de productos en tarjetas -->
    <div v-else-if="viewMode === 'cards'" class="products-list">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ 'low-stock': product.low_stock }"
      >
        <img
          :src="product.image || defaultProductImg"
          alt="Imagen del producto"
          class="product-image"
        />
        <h3>{{ product.name }}</h3>
        <div class="product-description">{{ product.description }}</div>
        <div class="product-meta">
          <span class="product-price">S/{{ product.price }}</span>
          <span class="product-category">{{ product.category }}</span>
        </div>
        <div class="product-stock-row">
          <span class="stock-label">Stock:</span> {{ product.stock }}
          <span v-if="product.low_stock" class="stock-alert" title="Stock bajo">⚠️ Bajo stock</span>
        </div>
        <div class="product-actions">
          <button @click="editProduct(product)" class="edit-btn" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button @click="deleteProduct(product.id)" class="delete-btn" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Vista de productos en tabla -->
    <div v-else class="products-table">
      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Stock Mín</th>
            <th>Stock Máx</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            :class="{ 'low-stock': product.low_stock }"
          >
            <td>
              <img :src="product.image || defaultProductImg" alt="Imagen" class="table-product-image" />
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>S/{{ product.price }}</td>
            <td>{{ product.category }}</td>
            <td>
              {{ product.stock }}
              <span v-if="product.low_stock" class="stock-alert" title="Stock bajo">⚠️ Bajo stock</span>
            </td>
            <td>{{ product.stock_min }}</td>
            <td>{{ product.stock_max }}</td>
            <td>
              <button @click="editProduct(product)" class="edit-btn" title="Editar">
                <i class="fas fa-pen"></i>
              </button>
              <button @click="deleteProduct(product.id)" class="delete-btn" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar producto -->
    <!-- Modal -->
    <div v-if="showProductModal" class="modal-bg" @click.self="closeProductModal">
      <div class="modal product-modal">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Editar Producto' : 'Agregar Producto' }}</h2>
          <button class="modal-close" @click="closeProductModal" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveProduct">
          <div class="form-group">
            <label>Nombre:</label>
            <div class="input-container">
              <i class="fas fa-tag"></i>
              <input v-model="form.name" placeholder="Nombre del producto" required />
            </div>
          </div>
          <div class="form-group">
            <label>Descripción:</label>
            <div class="input-container">
              <i class="fas fa-align-left"></i>
              <textarea v-model="form.description" placeholder="Descripción"></textarea>
            </div>
          </div>
          <div class="form-group">
            <label>Precio de venta:</label>
            <div class="input-container">
              <i class="fas fa-dollar-sign"></i>
              <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="Precio de venta" required />
            </div>
          </div>
          <div class="form-group">
            <label>Precio de compra:</label>
            <div class="input-container">
              <i class="fas fa-money-bill-wave"></i>
              <input v-model.number="form.purchase_price" type="number" min="0" step="0.01" placeholder="Precio de compra" required />
            </div>
          </div>
          <div class="form-group">
           <label for="category">Categoría:</label>
<input
  v-model="form.category"
  id="category"
  type="text"
  placeholder="Ingresa la categoría"
/>
          </div>
          <div class="form-group">
            <label>Marca:</label>
            <div class="input-container">
              <i class="fas fa-industry"></i>
              <input v-model="form.marca" placeholder="Marca" />
            </div>
          </div>
          <div class="form-group">
            <label>Unidad de medida:</label>
            <div class="input-container">
              <i class="fas fa-balance-scale"></i>
              <input v-model="form.unidad_medida" placeholder="Unidad de medida" />
            </div>
          </div>
          <div class="form-group">
            <label>Stock actual:</label>
            <div class="input-container">
              <i class="fas fa-warehouse"></i>
              <input v-model.number="form.stock" type="number" min="0" placeholder="Stock actual" required />
            </div>
          </div>
          <div class="form-group">
            <label>Stock mínimo:</label>
            <div class="input-container">
              <i class="fas fa-arrow-down"></i>
              <input v-model.number="form.stock_min" type="number" min="0" placeholder="Stock mínimo" />
            </div>
          </div>
          <div class="form-group">
            <label>Stock máximo:</label>
            <div class="input-container">
              <i class="fas fa-arrow-up"></i>
              <input v-model.number="form.stock_max" type="number" min="0" placeholder="Stock máximo" />
            </div>
          </div>
          <div class="form-group">
            <label>Imagen:</label>
            <div class="input-container">
              <i class="fas fa-image"></i>
              <input type="file" @change="onImageChange" accept="image/*" />
            </div>
          </div>
          <div class="form-group">
            <label>Activo:</label>
            <div class="input-container">
              <i class="fas fa-toggle-on"></i>
              <select v-model="form.activo">
                <option :value="1">Activo</option>
                <option :value="0">Suspendido</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary big-btn">
              <i class="fas fa-save"></i> Guardar
            </button>
            <button type="button" @click="closeProductModal" class="btn-anular big-btn">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="products-background-decor"></div>
  </div>
</template>

<script>
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import defaultProductImg from '@/assets/images/default-product.png';

export default {
  data() {
    return {
      // Buscador de productos
      searchQuery: '',
      // Categoría seleccionada para filtrar
      selectedCategory: '',
      // Lista de categorías únicas
      categories: [],
      // Controla si el modal está abierto
      isModalOpen: false,
      // Lista de productos obtenidos de la base de datos
      products: [],
      // Datos del producto nuevo o en edición
      newProduct: {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        marca: '',           // <-- nuevo campo
        unidad_medida: '',   // <-- nuevo campo
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      },
      // Estado de edición
      isEditing: false,
      editingProductId: null,
      // Modo de vista: 'cards' o 'list'
      viewMode: 'cards',
      defaultProductImg, // <-- agrega aquí
      // Estado de carga
      loading: false,
      // Controla la visibilidad del modal de producto
      showProductModal: false,
      editingProduct: null, // <--- AGREGA ESTA LÍNEA
      // Datos del formulario del producto
      form: {
        name: '',
        description: '',
        price: null,
        purchasePrice: null,
        category: '',
        marca: '',
        unidad_medida: '',
        stock: null,
        stockMin: null,
        stockMax: null,
      },
    };
  },
  computed: {
    // Filtra productos según búsqueda y categoría
    filteredProducts() {
      return this.products.filter((product) => {
        const matchesSearchQuery = product.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchesCategory =
          this.selectedCategory === '' || product.category === this.selectedCategory;
        return matchesSearchQuery && matchesCategory;
      });
    },
  },
  methods: {
    // Obtiene los productos desde la API
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        this.products = response.data.map((product) => ({
          ...product,
          image: product.image
            ? (product.image.startsWith('/uploads/')
                ? `${import.meta.env.VITE_API_URL}${product.image}`
                : product.image)
            : defaultProductImg,
        }));
        this.categories = [...new Set(response.data.map((product) => product.category))];
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      } finally {
        this.loading = false;
      }
    },
    // Abre el modal para agregar producto
    openAddProductModal() {
      this.isModalOpen = true;
    },
    // Cierra el modal y resetea el formulario
    closeAddProductModal() {
      this.isModalOpen = false;
      this.isEditing = false;
      this.editingProductId = null;
      this.resetNewProduct();
    },
    // Maneja la carga y compresión de la imagen
    async handleImageUpload(event) {
      const file = event.target.files[0];
      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (file) {
        if (file.size > maxSize) {
          alert('La imagen es demasiado pesada. El tamaño máximo permitido es de 2 MB.');
          return;
        }

        try {
          const options = {
            maxSizeMB: 1, // Tamaño máximo en MB después de la compresión
            maxWidthOrHeight: 800, // Dimensiones máximas
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // Asigna un nombre con extensión al archivo comprimido
          const ext = file.name.split('.').pop();
          const newFile = new File(
            [compressedFile],
            `compressed.${ext}`,
            { type: compressedFile.type }
          );
          this.newProduct.imageFile = newFile;

          // Crear una vista previa de la imagen
          const reader = new FileReader();
          reader.onload = (e) => {
            this.newProduct.imagePreview = e.target.result; // Vista previa
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('Error al comprimir la imagen:', error);
        }
      }
    },
    // Agrega un nuevo producto usando FormData
    async addProduct() {
      try {
        // Validar campos obligatorios
        if (
          !this.newProduct.name ||
          !this.newProduct.description ||
          !this.newProduct.price ||
          !this.newProduct.purchasePrice ||
          !this.newProduct.category ||
          !this.newProduct.marca ||
          !this.newProduct.unidad_medida ||
          !this.newProduct.stock ||
          !this.newProduct.stockMin
        ) {
          alert('Por favor, completa todos los campos obligatorios.');
          return;
        }

        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', this.newProduct.price ? Number(this.newProduct.price) : 0);
        formData.append('purchase_price', this.newProduct.purchasePrice ? Number(this.newProduct.purchasePrice) : 0);
        formData.append('category', this.newProduct.category);
        formData.append('marca', this.newProduct.marca); // nuevo
        formData.append('unidad_medida', this.newProduct.unidad_medida); // nuevo
        formData.append('stock', this.newProduct.stock ? Number(this.newProduct.stock) : 0);
        formData.append('stock_min', this.newProduct.stockMin ? Number(this.newProduct.stockMin) : 0);
        formData.append('stock_max', this.newProduct.stockMax ? Number(this.newProduct.stockMax) : 0);

        // Si hay una imagen seleccionada, agregarla al FormData
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }

        // Enviar los datos al backend
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });

        // Agregar el producto a la lista local
        const product = response.data;
        product.image = product.image && product.image.startsWith('/uploads/')
          ? `${import.meta.env.VITE_API_URL}${product.image}`
          : (product.image || defaultProductImg);
        this.products.push(product);
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al agregar el producto:', error.response?.data || error.message);
      }
    },
    // Actualiza un producto existente
    async updateProduct() {
      try {
        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', this.newProduct.price ? Number(this.newProduct.price) : 0);
        formData.append('purchase_price', this.newProduct.purchasePrice ? Number(this.newProduct.purchasePrice) : 0);
        formData.append('category', this.newProduct.category);
        formData.append('marca', this.newProduct.marca); // nuevo
        formData.append('unidad_medida', this.newProduct.unidad_medida); // nuevo
        formData.append('stock', this.newProduct.stock ? Number(this.newProduct.stock) : 0);
        formData.append('stock_min', this.newProduct.stockMin ? Number(this.newProduct.stockMin) : 0);
        formData.append('stock_max', this.newProduct.stockMax ? Number(this.newProduct.stockMax) : 0);
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }
        const token = localStorage.getItem('authToken');
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${this.editingProductId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
        this.fetchProducts();
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al actualizar el producto:', error.response?.data || error.message);
      }
    },
    // Reinicia los campos del formulario de producto
    resetNewProduct() {
      this.newProduct = {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        marca: '',           // <-- nuevo campo
        unidad_medida: '',   // <-- nuevo campo
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      };
    },
    // Abre el modal para editar un producto existente
    editProduct(product) {
      this.editingProduct = product;
      this.form = { ...product };
      this.showProductModal = true;
    },
    // Elimina un producto por ID
    async deleteProduct(productId) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchProducts();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    },
    // Valida y formatea campos decimales (por ejemplo, precio de compra)
    validateDecimal(field) {
      // Reemplaza comas por puntos para manejar decimales
      this.newProduct[field] = this.newProduct[field]
        .replace(',', '.')
        .replace(/[^0-9.]/g, ''); // Permite solo números y puntos
    },
    // Cierra el modal de producto
    closeProductModal() {
      this.showProductModal = false;
      this.editingProduct = null;
      this.resetForm();
    },
    // Abre el modal de producto (agregar o editar)
    openProductModal(product = null) {
      if (product) {
        this.editingProduct = product;
        this.form = { ...product };
      } else {
        this.editingProduct = null;
        this.resetForm(); // Limpia el formulario
      }
      this.showProductModal = true;
    },
    // Reinicia los campos del formulario
    resetForm() {
      this.form = {
        name: '',
        description: '',
        price: null,
        purchasePrice: null,
        category: '',
        marca: '',
        unidad_medida: '',
        stock: null,
        stockMin: null,
        stockMax: null,
      };
    },
    // Guarda el producto (nuevo o editado)
    async saveProduct() {
      try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('description', this.form.description);
        formData.append('price', this.form.price ? Number(this.form.price) : 0);
        formData.append('purchase_price', this.form.purchasePrice ? Number(this.form.purchasePrice) : 0);
        formData.append('category', this.form.category);
        formData.append('marca', this.form.marca);
        formData.append('unidad_medida', this.form.unidad_medida);
        formData.append('stock', this.form.stock ? Number(this.form.stock) : 0);
        formData.append('stock_min', this.form.stockMin ? Number(this.form.stockMin) : 0);
        formData.append('stock_max', this.form.stockMax ? Number(this.form.stockMax) : 0);
        formData.append('activo', this.form.activo ?? 1);

        // Adjunta la imagen si fue seleccionada
        if (this.form.imageFile) {
          formData.append('image', this.form.imageFile);
        }

        if (this.editingProduct && this.editingProduct.id) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/products/${this.editingProduct.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/products`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
        this.showProductModal = false;
        this.fetchProducts();
      } catch (err) {
        console.error('Error al guardar el producto:', err.response?.data || err);
      }
    },
    // Agregar producto
    async agregarProducto() {
      const token = localStorage.getItem('authToken');
      await axios.post('/api/products', this.form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },

    // Editar producto
    async editarProducto() {
      const token = localStorage.getItem('authToken');
      await axios.put(`/api/products/${this.editingProduct.id}`, this.form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.imageFile = file;
      }
    },
  },
  mounted() {
    // Al montar, obtiene productos y verifica si hay que editar alguno por query
    this.fetchProducts().then(() => {
      const editId = this.$route.query.edit;
      if (editId) {
        const product = this.products.find(p => p.id == editId);
        if (product) {
          this.editProduct(product);
        }
      }
    });
  },
};
</script>
