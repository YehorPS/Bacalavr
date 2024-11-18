// controllers/patientController.js
const User = require('../models/User');

exports.getPatientDashboard = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Пацієнт не знайдений' });
    }
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні даних пацієнта', error });
  }
};
exports.updateProfile = async (req, res) => {
    const { email, phone, rank, photo } = req.body;
    
    try {
      const patient = await User.findById(req.user.id); // отримуємо пацієнта за його id з токена
      
      if (!patient || patient.role !== 'patient') {
        return res.status(404).json({ message: 'Пацієнт не знайдений' });
      }
      
      // Оновлюємо дані пацієнта
      if (email) patient.email = email;
      if (phone) patient.phone = phone;
      if (rank) patient.rank = rank;
      if (photo) patient.photo = photo;
      
      await patient.save();
      res.json({ message: 'Профіль успішно оновлено', patient });
    } catch (error) {
      res.status(500).json({ message: 'Помилка при оновленні профілю', error });
    }
  };