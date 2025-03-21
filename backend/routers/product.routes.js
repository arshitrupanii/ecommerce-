import express from 'express'
import { getallProduct, getfeaturedProducts, createProduct, deleteProduct, getRecommendation, getProductByCategory, toggleFeaturedProduct } from '../controllers/product.controller.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',protectRoute, adminRoute, getallProduct)
router.get('/featured', getfeaturedProducts)
router.get('/category/:category', getProductByCategory)
router.get('/recommendations', getRecommendation)
router.post('/',protectRoute, adminRoute, createProduct)
router.patch('/:id',protectRoute, adminRoute, toggleFeaturedProduct)
router.delete('/:id',protectRoute, adminRoute, deleteProduct)

export default router;