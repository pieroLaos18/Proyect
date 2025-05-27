// Servicio para gestionar el token de autenticación en localStorage

// Guarda el token de autenticación
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Obtiene el token de autenticación
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Elimina el token de autenticación
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};