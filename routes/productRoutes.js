const express = require('express');
const productController = require('../controllers/productControllers');
const authenticationController = require('./../controllers/authenticationControllers');
const riderAuthentication = require('./../controllers/riderAuthentication');

const router = express.Router();

// router.param('id', productController.checkID);
router.route('/Top-10-cheap').get(productController.getAllProducts);

router.get('/search', productController.searchProducts);
router.get(
  '/getPersonalizedProducts',
  productController.getPersonalizedRecommendations,
);

router.route('/productss-stats').get(productController.getProductStats);
router.route('/below500-Products').get(productController.below500Products);
router
  .route('/bakery-dairy-Products')
  .get(authenticationController.protect, productController.getDairyProducts);
router
  .route('/fruits-vegetables-Products')
  .get(productController.getFruitProducts);
router.route('/breakfast-Products').get(productController.getBreakFastProducts);
router.route('/Meat-Seafood-Products').get(productController.getMeatProducts);
router
  .route('/Stationery-Products')
  .get(productController.getStationeryProducts);
router.route('/Snacks-Products').get(productController.getSnacksProducts);
router.route('/Babycare-Products').get(productController.getBabyCareProducts);
router.route('/Petcare-Products').get(productController.getPetcareProducts);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    productController.uploadProductPhotos,
    authenticationController.protect,
    productController.createProduct,
  );
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.uploadProductPhotos, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
