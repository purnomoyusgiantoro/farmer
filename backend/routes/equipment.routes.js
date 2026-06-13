const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', equipmentController.getAllEquipment);
router.post('/', equipmentController.createEquipment);
router.put('/:id', equipmentController.updateEquipment);

router.get('/rentals', equipmentController.getAllRentals);
router.post('/rentals', equipmentController.createRental);
router.put('/rentals/:id', equipmentController.updateRentalStatus);

module.exports = router;
