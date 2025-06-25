const express = require('express');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');
const controller = require('../controllers/productController');
const pool = require('../config/db');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/destacados', controller.getDestacados);
router.get('/filter/:field/:value', controller.filterBy);
router.post('/', authenticate, upload.single('image'), controller.add);
router.put('/:id', authenticate, upload.single('image'), controller.update);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
