
const express = require('express');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const patientController = require('../controllers/patientController');



router.get('/patient/:id', authMiddleware.verifyToken, doctorController.viewPatientProfile);

router.get('/dashboard', authMiddleware.verifyToken, doctorController.dashboard);


router.get('/patients', authMiddleware.verifyToken, doctorController.viewPatients);

router.get('/list', doctorController.getDoctorList);

router.post('/patient/:id/medical-record', authMiddleware.verifyToken, doctorController.createMedicalRecord);

router.post('/update-profile', authMiddleware.verifyToken, doctorController.updateProfile); 

router.get('/appointments', authMiddleware.verifyToken, doctorController.getAppointments);

router.get('/all', authMiddleware.verifyToken, doctorController.getAllDoctors);  
module.exports = router;