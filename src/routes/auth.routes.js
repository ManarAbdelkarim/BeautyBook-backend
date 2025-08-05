const express = require('express');
const router = express.Router();
const { register, login, resetPassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.put('/set-password/:id', resetPassword)

module.exports = router;
