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
    const patientId = req.params.id;

    if (!ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Невірний формат ID пацієнта' });
    }

    const patient = await User.findById(patientId);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Пацієнт не знайдений' });
    }

    const medicalRecords = await MedicalRecord.find({ user: patient._id });

    res.json({ patient, medicalRecords });
  } catch (error) {
    console.error('Error while fetching patient profile:', error);
    res.status(500).json({ message: 'Помилка при отриманні профілю пацієнта', error });
  }
};

exports.updatePatientProfileByDoctor = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const patientId = req.params.id;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Пацієнт не знайдений' });
    }

    // Оновлення полів
    if (fullName) patient.fullName = fullName;
    if (phone) patient.phone = phone;
    if (email) patient.email = email;

    await patient.save();
    res.status(200).json({ message: 'Профіль пацієнта успішно оновлено', patient });
  } catch (error) {
    console.error('Помилка при оновленні профілю пацієнта:', error);
    res.status(500).json({ message: 'Помилка при оновленні профілю пацієнта' });
  }
};
exports.getDoctorList = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, 'fullName specialty'); // Отримуємо всіх лікарів
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Помилка під час отримання списку лікарів:', error);
    res.status(500).json({ message: 'Помилка під час отримання списку лікарів' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    // Перевірка, чи є користувач авторизованим та має відповідний ID
    const doctorId = req.user.id;

    if (!doctorId) {
      return res.status(400).json({ message: 'Не вдалося знайти ідентифікатор лікаря' });
    }

    // Отримуємо записи, де доктор відповідає ідентифікатору
    const appointments = await Appointment.find({ doctorId }).populate('patientId', 'fullName email phone');

    if (!appointments.length) {
      return res.status(404).json({ message: 'Записи не знайдено' });
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Помилка при отриманні записів до лікаря:', error);
    res.status(500).json({ message: 'Помилка при отриманні записів', error });
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

    // Логування для перевірки вхідних даних
    console.log("Шукаємо медичний запис для користувача з ID:", req.params.id);

    // Знайти існуючу медичну картку пацієнта за ID користувача
    let record = await MedicalRecord.findOne({ user: req.params.id });

    // Логування результатів пошуку
    console.log("Знайдений запис:", record);

    // Логування для перевірки інформації про лікаря
    if (req.user) {
      console.log("Інформація про лікаря:", req.user.fullName);
    } else {
      console.log("Інформація про лікаря не знайдена в `req.user`");
    }

    // Перевіряємо, чи існує лікар та його повне ім'я
    const doctorName = req.user && req.user.fullName ? req.user.fullName : 'Лікар (ім\'я не знайдено)';

    if (record) {
      // Якщо медичний запис знайдено, додаємо нові значення до масивів
      if (diagnoses) {
        record.diagnoses.push(diagnoses);
      }
      if (treatments) {
        record.treatments.push(treatments);
      }
      if (surgeries) {
        record.surgeries.push(surgeries);
      }
      if (healthComplaints) {
        record.healthComplaints.push(healthComplaints);
      }
      if (vaccinations) {
        record.vaccinations.push(vaccinations);
      }

      // Додаємо новий коментар лікаря, використовуючи `req.user.fullName`
      record.doctorComments.push(`Запис створено лікарем ${doctorName}`);

      // Зберегти оновлений запис
      await record.save();
      res.status(200).json({ message: 'Запис успішно оновлено', record });
    } else {
      // Якщо запис не знайдено, створюємо новий
      record = new MedicalRecord({
        user: req.params.id,
        diagnoses: diagnoses ? [diagnoses] : [],
        treatments: treatments ? [treatments] : [],
        surgeries: surgeries ? [surgeries] : [],
        healthComplaints: healthComplaints ? [healthComplaints] : [],
        vaccinations: vaccinations ? [vaccinations] : [],
        doctorComments: [`Запис створено лікарем ${doctorName}`]
      });

      await record.save();
      res.status(201).json({ message: 'Новий медичний запис створено', record });
    }

  } catch (error) {
    console.error('Помилка при створенні або оновленні запису:', error);
    res.status(500).json({ message: 'Помилка при створенні або оновленні запису', error });
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
