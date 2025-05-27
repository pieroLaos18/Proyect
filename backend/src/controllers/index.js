// Rutas principales para productos y usuarios (controladores)

import { Router } from 'express';
import * as productController from '../controllers/productController';
import * as userController from '../controllers/userController';

const router = Router();

// Rutas de productos
router.get('/products', productController.getAllProducts);         // Obtener todos los productos
router.get('/products/:id', productController.getProductById);     // Obtener producto por ID
router.post('/products', productController.createProduct);         // Crear producto
router.put('/products/:id', productController.updateProduct);      // Actualizar producto por ID
router.delete('/products/:id', productController.deleteProduct);   // Eliminar producto por ID

// Rutas de usuarios
router.get('/users', userController.getAllUsers);                  // Obtener todos los usuarios
router.get('/users/:id', userController.getUserById);              // Obtener usuario por ID
router.post('/users', userController.createUser);                  // Crear usuario
router.put('/users/:id', userController.updateUser);               // Actualizar usuario por ID
router.delete('/users/:id', userController.deleteUser);            // Eliminar usuario por ID

export default router;