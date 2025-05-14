import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import Dashboard from '../views/Dashboard.vue';
import Products from '../views/Products.vue';
import Sales from '../views/Sales.vue';
import Reports from '../views/Reports.vue';
import Users from '../views/Users.vue';
import Login from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue'; // Importa el componente de registro

const routes = [
  { path: '/', redirect: '/main' }, // Redirige a /main por defecto
  { path: '/login', name: 'Login', component: Login }, // Ruta para Login
  { path: '/register', name: 'Register', component: Register }, // Ruta para Register
  { path: '/main', name: 'MainView', component: MainView, 
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'products', name: 'Products', component: Products },
      { path: 'sales', name: 'Sales', component: Sales },
      { path: 'reports', name: 'Reports', component: Reports },
      { path: 'users', name: 'Users', component: Users },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Verifica si hay un token

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else {
    next(); // Permite el acceso
  }
});

export default router;