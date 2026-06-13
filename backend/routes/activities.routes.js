const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activities.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', activitiesController.getAllActivities);
router.post('/', activitiesController.createActivity);

module.exports = router;
