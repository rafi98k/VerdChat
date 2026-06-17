const express = require('express');
const router = express.Router();
const path = require('path');
const Controller = require('../controllers/pageController.js');
const {authenticate} = require('../middleware/auth');
//Pages
router.get('/register', Controller.showRegister);
router.get('/login', Controller.showLogin);
router.get('',authenticate,Controller.showMain);



module.exports = router;