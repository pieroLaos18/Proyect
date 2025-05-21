import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products'; // Ajusta la URL según tu backend

export default {
  getAll() {
    return axios.get(API_URL);
  },
  update(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  },
  // Puedes agregar más métodos si los necesitas (getById, create, etc.)
};