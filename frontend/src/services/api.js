// Servicio de configuración base de Axios para las peticiones a la API

import axios from 'axios';

// Crea una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL base para todas las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;