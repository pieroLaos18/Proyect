// Configuración de rutas de Vue Router para la aplicación

import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import Dashboard from '../views/Dashboard.vue';
import Products from '../views/Products.vue';
import Sales from '../views/Sales.vue';
import Reports from '../views/Reports.vue';
import Users from '../views/Users.vue';
import Login from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue'; // Importa el componente de registro

// Definición de rutas de la aplicación
const routes = [
  { path: '/', redirect: '/main' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/main',
    name: 'MainView',
    component: MainView,
    meta: { requiresAuth: true }, // Ruta protegida, requiere autenticación
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
      { path: 'products', name: 'Products', component: Products, meta: { requiresAuth: true } },
      { path: 'sales', name: 'Sales', component: Sales, meta: { requiresAuth: true } },
      { path: 'reports', name: 'Reports', component: Reports, meta: { requiresAuth: true } },
      { path: 'users', name: 'Users', component: Users, meta: { requiresAuth: true } },
    ]
  },
];

// Crea la instancia de Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegación global para proteger rutas y redirigir según autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  }
  // Si el usuario está autenticado e intenta ir a login o register, redirígelo al dashboard
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/main/dashboard');
  }
  else {
    next();
  }
});

export default router;