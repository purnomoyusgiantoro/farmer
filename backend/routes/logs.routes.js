const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', logsController.getAllLogs);
router.post('/', logsController.createLog);

module.exports = router;
