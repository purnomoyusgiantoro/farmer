const express = require('express');
const router = express.Router();
const orgController = require('../controllers/org.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', orgController.getAllOrgNodes);
router.post('/', orgController.createOrgNode);
router.put('/:id', orgController.updateOrgNode);
router.delete('/:id', orgController.deleteOrgNode);

module.exports = router;
