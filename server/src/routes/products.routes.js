const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', productsController.list);
router.post('/', productsController.create);
router.get('/:id', productsController.getById);
router.put('/:id', productsController.update);

module.exports = router;
