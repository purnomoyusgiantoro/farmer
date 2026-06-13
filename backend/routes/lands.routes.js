const express = require('express');
const router = express.Router();
const landsController = require('../controllers/lands.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', landsController.getAllLands);
router.post('/', landsController.createLand);
router.put('/:id', landsController.updateLandData);
router.patch('/:id/status', landsController.updateLandStatus);

module.exports = router;
