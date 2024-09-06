const express = require('express');
const router = express.Router();
const contactUsController = require('./../controllers/contactUsControllers');
router.post('/:userId/ContactUs', contactUsController.createContactUs);
router.get('/getAllContactUs', contactUsController.getAllContactUs);
router.get('/getPendingCount', contactUsController.countPendingComplaints);
router.get('/searchcomplaints', contactUsController.searchComplaints);
router.patch('/:id/solved', contactUsController.markComplaintAsSolved);
module.exports = router;
