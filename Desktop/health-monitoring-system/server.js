
require('dotenv').config();
const patientRoutes = require('./routes/patientRoutes'); 
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
app.use(express.static('public')); 

// Встановлення статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

// Збільшення ліміту для великих запитів
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Підключення до MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Використовуємо маршрути для API
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Помилки
app.use(errorMiddleware);

// Повертаємо HTML файли для доступу до сторінок
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.use('/api/doctor', doctorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
// Стартуємо сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
