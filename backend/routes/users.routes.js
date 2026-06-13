const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUserStatus);

module.exports = router;
