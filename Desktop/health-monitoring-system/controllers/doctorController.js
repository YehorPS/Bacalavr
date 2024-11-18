const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { ObjectId } = require('mongoose').Types;  // Підключаємо ObjectId з mongoose


  // Для серверного декодування токену

  exports.dashboard = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Отримуємо токен з заголовка
    if (!token) {
      return res.status(403).json({ message: 'Токен не надано' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'secretKey');  // Перевіряємо та декодуємо токен
      const doctorId = decodedToken.id;  // Отримуємо ID лікаря з токену
      const doctor = await User.findById(doctorId);
  
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({ message: 'Лікар не знайдений' });
      }
  
      res.json({ doctor });
    } catch (error) {
      return res.status(500).json({ message: 'Помилка при перевірці токену', error });
    }
  };
  


exports.viewPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні пацієнтів', error });
  }
};


exports.viewPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;  // Отримуємо ID пацієнта з параметра URL

    // Логування ID пацієнта
    console.log("Received Patient ID from URL:", patientId);

    // Перевірка на валідність ObjectId
    if (!ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Невірний формат ID пацієнта' });
    }

    // Пошук пацієнта по ID
    const patient = await User.findById(patientId); 

    // Якщо пацієнта не знайдено або роль не пацієнт
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Пацієнт не знайдений' });
    }

    // Логування даних пацієнта
    console.log('Patient found:', patient);

    // Отримуємо медичну картку пацієнта
    let medicalRecord = await MedicalRecord.findOne({ user: patient._id });

    // Якщо медичну картку не знайдено, перевіряємо, чи потрібно створити нову
    if (!medicalRecord && req.query.createRecord === 'true') {
      // Створюємо нову медичну картку
      medicalRecord = new MedicalRecord({
        user: patient._id,
        // Вказуємо інші значення за замовчуванням, якщо потрібно
        diagnosis: 'Не вказано',
        treatment: 'Не вказано',
      });

      await medicalRecord.save();
      console.log('New medical record created:', medicalRecord);
      return res.status(201).json({ message: 'Медична картка створена', medicalRecord });
    }

    // Якщо медична картка знайдена, повертаємо дані пацієнта та медичної картки
    res.json({ patient, medicalRecord });
  } catch (error) {
    console.error('Error while fetching patient profile:', error);
    res.status(500).json({ message: 'Помилка при отриманні профілю пацієнта', error });
  }
};






exports.updateProfile = async (req, res) => {
  const { email, phone, specialty, photo } = req.body;

  try {
    const doctor = await User.findById(req.user.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Лікар не знайдений' });
    }

    if (email) doctor.email = email;
    if (phone) doctor.phone = phone;
    if (specialty) doctor.specialty = specialty;
    if (photo) doctor.photo = photo;

    await doctor.save();
    res.json({ message: 'Профіль успішно оновлено', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при оновленні профілю', error });
  }
};
exports.viewPatientRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ user: req.params.id });
    if (!record) {
      return res.status(404).json({ message: 'Медична картка не знайдена' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні медичної картки', error });
  }
};
exports.createMedicalRecord = async (req, res) => {
  try {
    const { diagnoses, treatments, surgeries, healthComplaints, vaccinations } = req.body;

    const record = new MedicalRecord({
      user: req.params.id,
      diagnoses,
      treatments,
      surgeries,
      healthComplaints,
      vaccinations,
      doctorComments: [`Запис створено лікарем ${req.user.fullName}`],
    });

    await record.save();
    res.status(201).json({ message: 'Запис успішно створено', record });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при створенні запису', error });
  }
};



exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' });  // Фільтруємо за роллю "doctor"
    res.json(doctors);  // Відправляємо список лікарів
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні лікарів', error });
  }
};
