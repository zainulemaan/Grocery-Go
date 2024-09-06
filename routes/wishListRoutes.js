const express = require('express');
const WishListController = require('./../controllers/wishListController');

const router = express.Router();
router.post('/:userId/createWishList', WishListController.createWishList);
router.get('/:userId/getWishList', WishListController.getWishList);
router.delete('/:userId/wishlist/clear', WishListController.clearWishList);
module.exports = router;
