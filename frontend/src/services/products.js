// Servicio para gestionar los productos usando la API REST
import axios from 'axios';

// URL base de la API de productos
const API_URL = `${import.meta.env.VITE_API_URL}/api/products`; // Usar variable de entorno

export default {
  // Obtiene todos los productos
  getAll() {
    return axios.get(API_URL);
  },
  // Actualiza un producto por su ID
  update(id, data) {
    const token = localStorage.getItem('authToken');
    return axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  // Puedes agregar más métodos si los necesitas (getById, create, etc.)
};