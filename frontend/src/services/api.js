import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth', // Cambia la URL base si es necesario
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;