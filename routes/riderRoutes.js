const express = require('express');
const riderController = require('./../controllers/riderControllers');
const riderAuthentication = require('./../controllers/riderAuthentication');

const router = express.Router();
router.post('/signup', riderAuthentication.signuprider);
router.post('/login', riderAuthentication.login);
router.post('/forgotPassword', riderAuthentication.forgetPassword);
// router.patch('/resetPassword', riderAuthentication.resetPassword);

router
  .route('/')
  .get(riderController.getAllRiders)
  .post(riderController.createRider);

router
  .route('/:id')
  .get(riderController.getRider)
  .patch(riderController.updateRider)
  .delete(riderController.deleteRider);

module.exports = router;
