const express = require('express');
const cors = require('cors');
const router = express.Router();

// Importar controladores
const someController = require('../controllers/index');

// Middleware
router.use(cors());

// Definir rutas
router.get('/items', someController.getItems);
router.post('/items', someController.createItem);
router.get('/items/:id', someController.getItemById);
router.put('/items/:id', someController.updateItem);
router.delete('/items/:id', someController.deleteItem);

module.exports = router;