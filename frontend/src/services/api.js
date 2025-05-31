// Servicio de configuración base de Axios para las peticiones a la API

import axios from 'axios';

// Crea una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // URL base para todas las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a cada petición
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpia la sesión y redirige al login
      localStorage.clear();
      window.location.href = '/login'; // O usa tu router si prefieres
    }
    return Promise.reject(error);
  }
);

export default api;