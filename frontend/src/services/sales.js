// Servicio para gestionar las ventas usando la API REST
import axios from 'axios';

// URL base de la API de ventas
const API_URL = 'http://localhost:5000/api/sales';

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
    return axios.post(API_URL, data);
  },
  // Anula una venta por su ID
  anular(id, data) {
    return axios.put(`${API_URL}/anular/${id}`, data);
  }
};