const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Змінив ref на 'User', бо пацієнти зберігаються в моделі User
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Змінив ref на 'User', бо лікарі зберігаються в моделі User
  dateTime: { type: Date, required: true },
  reason: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
