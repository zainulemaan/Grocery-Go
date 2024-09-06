const express = require('express');
const reviewsController = require('./../controllers/reviewsController');

const router = express.Router();
// router.get
router.post('/:userId/createReview', reviewsController.createReview);
router.get('/getAllReviews', reviewsController.getAllReveiws);
router.get('/:id', reviewsController.getReview);
router.get('/:userId/getByUserId', reviewsController.getReviewsByUser);
router.get('/:productId/getByProductId', reviewsController.getReviewsByProduct);
// router.delete('/:id/deleteReview', reviewsController.deleteReview);
router.delete('/:id', reviewsController.deleteReview);

module.exports = router;
