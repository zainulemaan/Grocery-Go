const express = require('express');
const orderControllers = require('./../controllers/orderControllers');

const router = express.Router();
router.get('/:userId', orderControllers.viewOrder);
router.get('/:userId/getAllOrders', orderControllers.getAllOrders);
router.get('/admin/Orders', orderControllers.getAllOrdersForAdmin);
router.post('/:userId/placeOrder', orderControllers.confirmOrder);
router.post('/:userId/cashondelivery', orderControllers.confirmOrderCashOnDel);
router.delete('/delete/:id', orderControllers.deleteOrder);
router.delete('/admin/delete/:id', orderControllers.adminDeleteOrder);
router.patch('/completeOrder/:id', orderControllers.completeOrder);
router.get('/admin/receipt/:id', orderControllers.generateReceipt);
module.exports = router;
