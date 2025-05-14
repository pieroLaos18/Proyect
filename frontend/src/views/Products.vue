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

      <!-- Botón para agregar productos -->
      <button @click="openAddProductModal" class="add-product-btn">
        Agregar Producto
      </button>
    </div>

    <!-- Lista de productos -->
    <div class="products-list">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
      >
        <img :src="product.image" alt="Imagen del producto" class="product-image" />
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p><strong>Precio:</strong> ${{ product.price }}</p>

        <!-- Botones de acción -->
        <div class="product-actions">
          <button @click="editProduct(product)" class="edit-btn">Editar</button>
          <button @click="deleteProduct(product.id)" class="delete-btn">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar productos -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal">
        <h2>Agregar Producto</h2>
        <form @submit.prevent="addProduct">
          <label>Nombre:</label>
          <input type="text" v-model="newProduct.name" required />

          <label>Descripción:</label>
          <textarea v-model="newProduct.description" required></textarea>

          <label>Precio de Venta:</label>
          <input type="number" v-model="newProduct.price" required />

          <label>Precio de Compra:</label>
          <input type="number" v-model="newProduct.purchasePrice" required />

          <label>Categoría:</label>
          <input type="text" v-model="newProduct.category" required />

          <label>Stock:</label>
          <input type="number" v-model="newProduct.stock" required />

          <label>Imagen:</label>
          <input type="file" @change="handleImageUpload" accept="image/*" />

          <!-- Vista previa de la imagen -->
          <div v-if="newProduct.imagePreview" class="image-preview">
            <img :src="newProduct.imagePreview" alt="Vista previa de la imagen" />
          </div>

          <button type="submit">Guardar</button>
          <button type="button" @click="closeAddProductModal">Cancelar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchQuery: '', // Para el buscador
      selectedCategory: '', // Categoría seleccionada
      categories: ['Electrónica', 'Ropa', 'Hogar', 'Juguetes', 'Libros'], // Ejemplo de categorías
      isModalOpen: false, // Controla si el modal está abierto
      products: [
        // Ejemplo de productos iniciales
        {
          id: 1,
          name: 'Producto 1',
          description: 'Descripción del producto 1',
          price: 100,
          category: 'Electrónica',
          image: 'https://via.placeholder.com/150',
        },
        {
          id: 2,
          name: 'Producto 2',
          description: 'Descripción del producto 2',
          price: 200,
          category: 'Ropa',
          image: 'https://via.placeholder.com/150',
        },
      ],
      newProduct: {
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        category: '',
        stock: '',
        image: '',
        imagePreview: null,
      },
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
        const response = await axios.get('http://localhost:3000/products');
        this.products = response.data;
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    },
    openAddProductModal() {
      this.isModalOpen = true;
    },
    closeAddProductModal() {
      this.isModalOpen = false;
      this.resetNewProduct();
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newProduct.imagePreview = e.target.result; // Guarda la vista previa
          this.newProduct.image = file; // Guarda el archivo para su uso posterior
        };
        reader.readAsDataURL(file);
      }
    },
    async addProduct() {
      try {
        const response = await axios.post('http://localhost:3000/products', this.newProduct);
        this.products.push(response.data);
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al agregar el producto:', error);
      }
    },
    async updateProduct() {
      try {
        await axios.put(`http://localhost:3000/products/${this.newProduct.id}`, this.newProduct);
        this.fetchProducts();
        this.closeAddProductModal();
      } catch (error) {
        console.error('Error al actualizar el producto:', error);
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
        image: '',
        imagePreview: '', // Reinicia la vista previa
      };
    },
    editProduct(product) {
      // Abre el modal con los datos del producto para editar
      this.newProduct = { ...product, imagePreview: product.image };
      this.isModalOpen = true;
    },
    async deleteProduct(productId) {
      try {
        await axios.delete(`http://localhost:3000/products/${productId}`);
        this.fetchProducts();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    },
  },
};
</script>

<style>
:root {
  --background-color: #ffffff;
  --text-color: #000000;
  --input-background: #f0f0f0;
  --input-text-color: #000000;
  --card-background: #ffffff;
  --card-border: #ccc;
  --button-background: #004d40;
  --button-hover: #00695c;
}

[data-theme="dark"] {
  --background-color: #1e1e1e;
  --text-color: #ffffff;
  --input-background: #2e2e2e;
  --input-text-color: #ffffff;
  --card-background: #2e2e2e;
  --card-border: #444;
  --button-background: #004d40;
  --button-hover: #00695c;
}

.dynamic-content {
  padding: 20px;
}

.products-header {
  display: flex;
  flex-wrap: wrap; /* Permite que los elementos se ajusten en varias líneas */
  justify-content: space-between;
  align-items: center;
  gap: 15px; /* Espaciado entre los elementos */
  margin-bottom: 20px;
}

.search-bar,
.category-filter {
  flex: 1; /* Ocupan el mismo espacio disponible */
  min-width: 250px; /* Ancho mínimo para evitar que se reduzcan demasiado */
}

.add-product-btn {
  flex-shrink: 0; /* Evita que el botón se reduzca */
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px; /* Bordes redondeados */
}

.search-bar {
  background-color: var(--input-background);
  color: var(--input-text-color);
  border: 1px solid var(--card-border);
  padding: 12px;
  font-size: 16px;
  border-radius: 8px; /* Bordes redondeados */
  width: 100%; /* Ocupa todo el espacio disponible */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.search-bar:focus {
  box-shadow: 0 0 5px var(--button-hover); /* Resalta el buscador al enfocarlo */
  border-color: var(--button-hover); /* Cambia el color del borde */
  outline: none;
}

.category-filter {
  background-color: var(--input-background);
  color: var(--input-text-color);
  border: 1px solid var(--card-border);
  padding: 12px;
  font-size: 16px;
  border-radius: 8px; /* Bordes redondeados */
  width: 100%; /* Ocupa todo el espacio disponible */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.category-filter:focus {
  box-shadow: 0 0 5px var(--button-hover); /* Resalta el filtro al enfocarlo */
  border-color: var(--button-hover); /* Cambia el color del borde */
  outline: none;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Ajusta el ancho mínimo */
  gap: 20px; /* Espaciado entre las tarjetas */
}

.product-card {
  background-color: var(--card-background);
  color: var(--text-color);
  border: 1px solid var(--card-border);
  border-radius: 10px; /* Bordes más redondeados */
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Sombra más suave */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px); /* Efecto de elevación */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
}

.product-image {
  background-color: var(--card-border);
  border-radius: 8px;
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 15px;
}

.product-card h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.product-card p {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.edit-btn,
.delete-btn {
  padding: 8px 15px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn {
  background-color: #00695c; /* Verde oscuro */
  color: white;
}

.edit-btn:hover {
  background-color: #004d40; /* Verde más oscuro */
}

.delete-btn {
  background-color: #d32f2f; /* Rojo */
  color: white;
}

.delete-btn:hover {
  background-color: #b71c1c; /* Rojo más oscuro */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 25px;
  border-radius: 10px; /* Bordes más redondeados */
  width: 450px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Sombra más elegante */
}

.modal h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
  color: var(--text-color);
}

.modal form label {
  display: block;
  margin-top: 15px;
  font-weight: bold;
  color: var(--text-color);
}

.modal form input,
.modal form textarea {
  background-color: var(--input-background);
  color: var(--input-text-color);
  border: 1px solid var(--card-border);
  border-radius: 5px;
  padding: 10px;
  margin-top: 5px;
  width: 100%;
  font-size: 14px;
}

.modal form button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.modal form button[type='submit'] {
  background-color: var(--button-background);
  color: white;
  transition: background-color 0.3s ease;
}

.modal form button[type='submit']:hover {
  background-color: var(--button-hover);
}

.modal form button[type='button'] {
  background-color: #555;
  color: white;
  margin-left: 10px;
  transition: background-color 0.3s ease;
}

.modal form button[type='button']:hover {
  background-color: #777;
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column; /* Cambia a diseño vertical */
    align-items: stretch; /* Asegura que los elementos ocupen todo el ancho */
  }

  .add-product-btn {
    width: 100%; /* Botón ocupa todo el ancho en pantallas pequeñas */
    text-align: center;
  }
}

@media (max-width: 480px) {
  .search-bar,
  .category-filter {
    font-size: 14px; /* Reduce el tamaño del texto */
    padding: 8px; /* Reduce el relleno */
  }

  .add-product-btn {
    font-size: 14px; /* Reduce el tamaño del texto del botón */
    padding: 8px 15px; /* Ajusta el relleno */
  }
}
</style>