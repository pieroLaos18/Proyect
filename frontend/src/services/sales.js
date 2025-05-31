// Servicio para gestionar las ventas usando la API REST
import axios from 'axios';

// URL base de la API de ventas
const API_URL = `${import.meta.env.VITE_API_URL}/api/sales`;

export default {
  // Obtiene todas las ventas
  getAll() {
    return axios.get(API_URL);
  },
  // Obtiene una venta por su ID
  getById(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  // Crea una nueva venta
  create(data) {
    const token = localStorage.getItem('authToken');
    return axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  // Anula una venta por su ID
  anular(id, data) {
    const token = localStorage.getItem('authToken');
    return axios.put(`${API_URL}/anular/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};