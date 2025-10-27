const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, institutionController.getProfile);
router.post('/profile', authenticate, institutionController.createProfile);
router.put('/profile', authenticate, institutionController.updateProfile);

module.exports = router;