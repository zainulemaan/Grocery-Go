const express = require('express');
const myProfileController = require('./../controllers/myProfileController');

const router = express.Router();
// router.get
router.get('/:userId', myProfileController.getProfile);

module.exports = router;
