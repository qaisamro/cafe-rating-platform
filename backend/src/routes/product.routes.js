const express = require('express');
const router = express.Router();
const { getProductsByCafe, addProduct, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { auth, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/upload', auth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.json({ imageUrl: `/uploads/products/${req.file.filename}` });
});

router.get('/', getAllProducts);

router.get('/:id', getProductById);
router.get('/cafe/:cafeId', getProductsByCafe);

router.post('/', auth, authorize('admin', 'owner'), createProduct);
router.put('/:id', auth, authorize('admin', 'owner'), updateProduct);
router.delete('/:id', auth, authorize('admin', 'owner'), deleteProduct);

module.exports = router;
