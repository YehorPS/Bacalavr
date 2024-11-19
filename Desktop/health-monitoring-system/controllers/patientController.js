
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Отримання профілю пацієнта для userId: ${userId}`);

    
    const profile = await PatientProfile.findOne({ userId }).populate('userId');
    if (!profile) {
      console.log(`Розширений профіль пацієнта не знайдено для userId: ${userId}`);
      return res.status(404).json({ message: 'Профіль пацієнта не знайдено' });
    }

    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    
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
const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;  // ID пацієнта береться з токену, який вже розшифрований
    const { doctorId, appointmentDate, reason } = req.body;  // Отримуємо дані з тіла запиту

    // Додаємо логування, щоб переконатися, що всі значення отримані
    console.log('Дані, отримані з тіла запиту:', req.body);
    console.log('ID пацієнта з токену:', patientId);

    if (!doctorId || !appointmentDate || !reason) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    // Створюємо новий запис
    const appointment = new Appointment({
      patientId,   // Додаємо ID пацієнта автоматично
      doctorId,    // ID лікаря приходить з форми
      dateTime: appointmentDate, // Переконайтеся, що ви використовуєте ім'я поля, яке відповідає схемі
      reason,
    });

    // Зберігаємо запис у базі даних
    await appointment.save();
    res.status(201).json({ message: 'Запис до лікаря успішно створено', appointment });
  } catch (error) {
    console.error('Помилка при створенні запису:', error);
    res.status(500).json({ message: 'Помилка при створенні запису', error });
  }
};

const createPatientProfile = async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, rank, photo } = req.body;
    const userId = req.user.id;

    
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
  createAppointment
};
