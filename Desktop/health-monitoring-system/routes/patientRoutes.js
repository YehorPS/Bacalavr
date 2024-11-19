const express = require('express');
const multer = require('multer');
const {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
  createAppointment 
} = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/patient-profile', verifyToken, getPatientProfile);
router.post('/create-profile', verifyToken, upload.single('photo'), createPatientProfile);
router.put('/update-profile', verifyToken, upload.single('photo'), updatePatientProfile);
router.post('/appointments', verifyToken, createAppointment);  // Використовуємо createAppointment тут

module.exports = router;
