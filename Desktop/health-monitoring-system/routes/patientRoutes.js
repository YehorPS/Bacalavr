const express = require('express');
const multer = require('multer');
const { getPatientProfile, createPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Налаштування для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Вказуємо директорію для збереження файлів
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Маршрути
router.get('/patient-profile', verifyToken, getPatientProfile);
router.post('/create-profile', verifyToken, upload.single('photo'), createPatientProfile);
router.put('/update-profile', verifyToken, upload.single('photo'), updatePatientProfile);

module.exports = router;
