// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');

// Маршрут для отримання інформації про пацієнта
router.get('/dashboard', authMiddleware.verifyToken, patientController.getPatientDashboard);
router.post('/update-profile', authMiddleware.verifyToken, patientController.updateProfile);
module.exports = router;
