// Servicio para gestionar los productos usando la API REST
import axios from 'axios';

// URL base de la API de productos
const API_URL = 'http://localhost:5000/api/products'; // Ajusta la URL según tu backend

export default {
  // Obtiene todos los productos
  getAll() {
    return axios.get(API_URL);
  },
  // Actualiza un producto por su ID
  update(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  },
  // Puedes agregar más métodos si los necesitas (getById, create, etc.)
};