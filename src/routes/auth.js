const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const {authenticate} = require('../middleware/auth');


//Logic
router.post('/register', authController.Register);
router.post('/login', authController.Login);
router.post('/logout', authController.Logout);


router.get('/me' , authenticate , authController.getMe);
module.exports = router;
