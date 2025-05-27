// Rutas generales de ejemplo para la API

const express = require('express');
const cors = require('cors');
const router = express.Router();

// Importar controladores
const someController = require('../controllers/index');

// Middleware global para CORS
router.use(cors());

// Definir rutas CRUD de ejemplo
router.get('/items', someController.getItems);           // Obtener todos los items
router.post('/items', someController.createItem);        // Crear un nuevo item
router.get('/items/:id', someController.getItemById);    // Obtener un item por ID
router.put('/items/:id', someController.updateItem);     // Actualizar un item por ID
router.delete('/items/:id', someController.deleteItem);  // Eliminar un item por ID

module.exports = router;