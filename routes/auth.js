const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/').get(userController.getUsers);
router.route('/login').post(userController.login);
router.route('/signup').post(userController.signup);
router.route('/logout').get(userController.logout);

module.exports = router;
