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
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue'; // Agrega esta línea
import Activities from '../views/Activities.vue'; // Agrega esta línea

// Definición de rutas de la aplicación
const routes = [
  { path: '/', redirect: '/main' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordForm },
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
      { path: 'actividades', name: 'Activities', component: Activities, meta: { requiresAuth: true } }, // <--- NUEVO
    ]
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/components/ResetPasswordForm.vue')
  }
];

// Crea la instancia de Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegación global para proteger rutas y redirigir según autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  // Redirigir /main a la ruta hija correcta según el rol
  if (to.path === '/main') {
    if (userRole === 'cajero') {
      next('/main/sales');
      return;
    }
    if (userRole === 'almacenero') {
      next('/main/products');
      return;
    }
    if (userRole === 'supervisor' || userRole === 'admin') {
      next('/main/dashboard');
      return;
    }
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
    return;
  }

  // Si el usuario está autenticado e intenta ir a login o register, redirígelo al dashboard
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/main/dashboard');
    return;
  }

  // Control de acceso por rol
  if (userRole === 'cajero') {
    // Cajero solo puede acceder a ventas
    if (to.path !== '/main/sales' && to.path !== '/main') {
      next('/main/sales');
      return;
    }
  } else if (userRole === 'almacenero') {
    // Almacenero solo puede acceder a productos
    if (to.path !== '/main/products' && to.path !== '/main') {
      next('/main/products');
      return;
    }
  } else if (userRole === 'supervisor') {
    // Supervisor puede acceder a dashboard, productos, ventas y reportes
    const allowed = [
      '/main/dashboard',
      '/main/products',
      '/main/sales',
      '/main/reports',
      '/main'
    ];
    if (!allowed.includes(to.path)) {
      next('/main/dashboard');
      return;
    }
  } else if (userRole === 'admin') {
    // Admin puede acceder a todo, no se restringe
  }

  next();
});

export default router;