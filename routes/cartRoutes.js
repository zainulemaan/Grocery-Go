const express = require('express');
const cartController = require('./../controllers/cartController');
const authenticationController = require('./../controllers/authenticationControllers');

const router = express.Router();
router.post('/:userId/addToCart', cartController.addItemToCart);
router.post('/:userId/EmptyCart', cartController.emptyCart);
router.post('/:userId/remove-items', cartController.updateItemQuantity);
router.get('/:userId', cartController.getCart);
router.get('/:userId/getCartCount', cartController.getCartCount);
module.exports = router;
