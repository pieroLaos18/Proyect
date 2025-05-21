<style src="@/assets/css/products.css"></style>
<template>
  <div class="dynamic-content">
    <h1>Productos</h1>
    <div class="products-header">
      <!-- Buscador -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar productos..."
        class="search-bar"
      />

      <!-- Filtro por categoría -->
      <select v-model="selectedCategory" class="category-filter">
        <option value="">Todas las categorías</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <!-- Botón para cambiar la vista -->
      <button
        class="toggle-view-btn"
        @click="viewMode = viewMode === 'cards' ? 'list' : 'cards'"
      >
        {{ viewMode === 'cards' ? 'Ver como Lista' : 'Ver como Tarjetas' }}
      </button>

      <!-- Botón para agregar productos -->
      <button @click="openAddProductModal" class="add-product-btn">
        Agregar Producto
      </button>
    </div>

    <!-- Lista de productos -->
    <div v-if="viewMode === 'cards'" class="products-list">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ 'low-stock': product.stock <= product.stock_min }"
      >
        <img
          :src="product.image || defaultProductImg"
          alt="Imagen del producto"
          class="product-image"
        />
        <h3>{{ product.name }}</h3>
        <div class="product-description">{{ product.description }}</div>
        <div class="product-price"><strong>Precio:</strong> S/{{ product.price }}</div>
        <div>
          <strong class="stock-label">Stock:</strong> {{ product.stock }}
          <span v-if="product.stock <= product.stock_min" class="stock-alert" title="Stock bajo">⚠️ Bajo stock</span>
        </div>
        <!-- Botones de acción -->
        <div class="product-actions">
          <button @click="editProduct(product)" class="edit-btn">Editar</button>
          <button @click="deleteProduct(product.id)" class="delete-btn">Eliminar</button>
        </div>
      </div>
    </div>

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
            :class="{ 'low-stock': product.stock <= product.stock_min }"
          >
            <td>
              <img :src="product.image || defaultProductImg" alt="Imagen" style="width: 60px; height: 60px; object-fit: contain;" />
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>S/{{ product.price }}</td>
            <td>{{ product.category }}</td>
            <td>
              {{ product.stock }}
              <span v-if="product.stock <= product.stock_min" class="stock-alert" title="Stock bajo">⚠️ Bajo stock</span>
            </td>
            <td>{{ product.stock_min }}</td>
            <td>{{ product.stock_max }}</td>
            <td>
              <button @click="editProduct(product)" class="edit-btn">Editar</button>
              <button @click="deleteProduct(product.id)" class="delete-btn">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar productos -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeAddProductModal">
      <div class="modal">
        <button class="close-btn" @click="closeAddProductModal">×</button>
        <h2>Agregar Producto</h2>
        <form @submit.prevent="isEditing ? updateProduct() : addProduct()">
          <div class="form-group">
            <label for="name">Nombre:</label>
            <input id="name" type="text" v-model="newProduct.name" required />
          </div>

          <div class="form-group">
            <label for="description">Descripción:</label>
            <textarea id="description" v-model="newProduct.description" required></textarea>
          </div>

          <div class="form-group">
            <label for="price">Precio de Venta:</label>
            <input id="price" type="number" v-model="newProduct.price" required />
          </div>

          <div class="form-group">
            <label for="purchasePrice">Precio de Compra:</label>
            <input
              id="purchasePrice"
              type="text"
              v-model="newProduct.purchasePrice"
              @input="validateDecimal('purchasePrice')"
              required
            />
          </div>

          <div class="form-group">
            <label for="category">Categoría:</label>
            <input id="category" type="text" v-model="newProduct.category" required />
          </div>

          <div class="form-group">
            <label for="stock">Stock:</label>
            <input id="stock" type="number" v-model="newProduct.stock" required />
          </div>

          <div class="form-group">
            <label for="stockMin">Stock Mínimo:</label>
            <input id="stockMin" type="number" v-model="newProduct.stockMin" required />
          </div>
          <div class="form-group">
            <label for="stockMax">Stock Máximo:</label>
            <input id="stockMax" type="number" v-model="newProduct.stockMax" required />
          </div>

          <div class="form-group">
            <label for="image">Imagen:</label>
            <input id="image" type="file" @change="handleImageUpload" accept="image/*" />
          </div>

          <!-- Vista previa de la imagen -->
          <div v-if="newProduct.imagePreview" class="image-preview">
            <img :src="newProduct.imagePreview" alt="Vista previa de la imagen" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button type="button" class="btn btn-secondary" @click="closeAddProductModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import defaultProductImg from '@/assets/images/default-product.png';

export default {
  data() {
    return {
      searchQuery: '', // Para el buscador
      selectedCategory: '', // Categoría seleccionada
      categories: [], // Categorías obtenidas dinámicamente
      isModalOpen: false, // Controla si el modal está abierto
      products: [], // Productos obtenidos de la base de datos
      newProduct: {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      },
      isEditing: false,
      editingProductId: null,
      viewMode: 'cards', // 'cards' o 'list'
    };
  },
  computed: {
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
    async fetchProducts() {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        this.products = response.data.map((product) => ({
          ...product,
          image: product.image
            ? (product.image.startsWith('/uploads/')
                ? `http://localhost:5000${product.image}`
                : product.image)
            : defaultProductImg,
        }));
        this.categories = [...new Set(response.data.map((product) => product.category))];
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    },
    openAddProductModal() {
      this.isModalOpen = true;
    },
    closeAddProductModal() {
      this.isModalOpen = false;
      this.isEditing = false;
      this.editingProductId = null;
      this.resetNewProduct();
    },
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

          // --- SOLUCIÓN: Asigna un nombre con extensión al archivo comprimido ---
          const ext = file.name.split('.').pop();
          const newFile = new File(
            [compressedFile],
            `compressed.${ext}`,
            { type: compressedFile.type }
          );
          this.newProduct.imageFile = newFile;
          // ----------------------------------------------------------------------

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
    async addProduct() {
      try {
        // Crear un objeto FormData
        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', parseFloat(this.newProduct.price));
        formData.append('purchase_price', parseFloat(this.newProduct.purchasePrice));
        formData.append('category', this.newProduct.category);
        formData.append('stock', parseInt(this.newProduct.stock, 10));
        formData.append('stock_min', this.newProduct.stockMin || 0);
        formData.append('stock_max', this.newProduct.stockMax || 0);

        // Si hay una imagen seleccionada, agregarla al FormData
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }

        console.log('Datos enviados:', formData); // Log para depurar

        // Enviar los datos al backend
        const response = await axios.post('http://localhost:5000/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Agregar el producto a la lista local
        const product = response.data;
        product.image = product.image && product.image.startsWith('/uploads/')
          ? `http://localhost:5000${product.image}`
          : (product.image || defaultProductImg);
        this.products.push(product);
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al agregar el producto:', error.response?.data || error.message);
      }
    },
    async updateProduct() {
      try {
        const formData = new FormData();
        formData.append('name', this.newProduct.name);
        formData.append('description', this.newProduct.description);
        formData.append('price', parseFloat(this.newProduct.price));
        formData.append('purchase_price', parseFloat(this.newProduct.purchasePrice));
        formData.append('category', this.newProduct.category);
        formData.append('stock', parseInt(this.newProduct.stock, 10));
        formData.append('stock_min', this.newProduct.stockMin || 0);
        formData.append('stock_max', this.newProduct.stockMax || 0);
        if (this.newProduct.imageFile) {
          formData.append('image', this.newProduct.imageFile);
        }
        await axios.put(
          `http://localhost:5000/api/products/${this.editingProductId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        this.fetchProducts();
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al actualizar el producto:', error.response?.data || error.message);
      }
    },
    resetNewProduct() {
      // Reinicia los campos del formulario
      this.newProduct = {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        stock: '',
        stockMin: '',
        stockMax: '',
        imageFile: null,
        imagePreview: null,
      };
    },
    editProduct(product) {
      this.isEditing = true;
      this.editingProductId = product.id;
      this.newProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        purchasePrice: product.purchase_price || product.purchasePrice || '',
        category: product.category,
        stock: product.stock,
        stockMin: product.stock_min,
        stockMax: product.stock_max,
        imageFile: null,
        imagePreview: product.image,
      };
      this.isModalOpen = true;
    },
    async deleteProduct(productId) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        this.fetchProducts();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    },
    validateDecimal(field) {
      // Reemplaza comas por puntos para manejar decimales
      this.newProduct[field] = this.newProduct[field]
        .replace(',', '.')
        .replace(/[^0-9.]/g, ''); // Permite solo números y puntos
    },
  },
  mounted() {
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