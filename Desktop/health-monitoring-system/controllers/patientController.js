// controllers/patientController.js

const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

// Отримання профілю пацієнта
// controllers/patientController.js

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Отримання профілю пацієнта для userId: ${userId}`);

    // Шукаємо профіль користувача
    const profile = await PatientProfile.findOne({ userId }).populate('userId');
    if (!profile) {
      console.log(`Розширений профіль пацієнта не знайдено для userId: ${userId}`);
      return res.status(404).json({ message: 'Профіль пацієнта не знайдено' });
    }

    // Отримуємо email з пов'язаного користувача
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Додаємо email до відповіді
    const profileWithUser = {
      ...profile.toObject(),
      user: {
        email: user.email,
      }
    };

    res.status(200).json(profileWithUser);
  } catch (error) {
    console.error('Помилка при отриманні профілю пацієнта:', error);
    res.status(500).json({ message: 'Помилка при отриманні профілю пацієнта' });
  }
};


/// Створення профілю пацієнта
const createPatientProfile = async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, rank, photo } = req.body;
    const userId = req.user.id;

    // Перевіряємо, чи вже існує профіль для користувача
    const existingProfile = await PatientProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Профіль для цього користувача вже існує' });
    }

    const newProfile = new PatientProfile({
      userId,
      fullName,
      phone,
      dateOfBirth,
      rank,
      photo,
    });
    await newProfile.save();

    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Помилка при створенні профілю пацієнта:', error);
    res.status(500).json({ message: 'Помилка при створенні профілю пацієнта' });
  }
};



// Оновлення профілю пацієнта
const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, dateOfBirth, rank } = req.body;

    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { userId },
      { fullName, phone, dateOfBirth, rank },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Профіль пацієнта не знайдено' });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Помилка при оновленні профілю пацієнта:', error);
    res.status(500).json({ message: 'Помилка при оновленні профілю пацієнта' });
  }
};

module.exports = {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
};
