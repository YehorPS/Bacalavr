window.onload = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';  // Якщо токен не знайдено, перенаправляємо на сторінку входу
    return;
  }

  // Отримуємо ID пацієнта з параметра URL
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');  // Отримуємо ID пацієнта з параметра URL
  console.log("Patient ID from URL:", patientId);  // Логування ID пацієнта

  // Отримуємо інформацію про пацієнта
  const response = await fetch(`/api/doctor/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log("Patient Data:", data);  // Логування отриманих даних
  if (response.ok) {
    // Оновлюємо дані на сторінці
    document.getElementById('patientName').textContent = data.patient.fullName;
    document.getElementById('patientEmail').textContent = data.patient.email;
    document.getElementById('patientPhone').textContent = data.patient.phone || 'Не вказано';
    document.getElementById('patientPhoto').src = data.patient.photo || '/default-photo.jpg';

    // Виводимо медичну картку (якщо вона є)
    if (data.medicalRecord) {
      document.getElementById('patientDiagnosis').textContent = data.medicalRecord.diagnosis || 'Не вказано';
      document.getElementById('patientTreatment').textContent = data.medicalRecord.treatment || 'Не вказано';
    } else {
      document.getElementById('patientDiagnosis').textContent = 'Медична картка не знайдена';
      document.getElementById('patientTreatment').textContent = '';
      // Покажемо форму для створення медичної картки
      document.getElementById('createMedicalRecordForm').style.display = 'block';
    }
  } else {
    alert(data.message || 'Щось пішло не так');
  }
};

// Створення медичної картки
const createMedicalRecord = async () => {
  const token = localStorage.getItem('authToken');
  const patientId = new URLSearchParams(window.location.search).get('id');
  const diagnosis = document.getElementById('diagnosis').value;
  const treatment = document.getElementById('treatment').value;
  const surgery = document.getElementById('surgery').value;
  const healthComplaints = document.getElementById('healthComplaints').value;
  const vaccinations = document.getElementById('vaccinations').value;

  const response = await fetch(`/api/doctor/patient/${patientId}/medical-record`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      diagnoses: diagnosis,
      treatments: treatment,
      surgeries: surgery,
      healthComplaints: healthComplaints,
      vaccinations: vaccinations
    })
  });

  const data = await response.json();
  if (response.ok) {
    alert('Медичну картку успішно створено');
    window.location.reload();
  } else {
    alert(data.message || 'Щось пішло не так');
  }
};

// Додаємо обробник для форми
document.getElementById('createMedicalRecordButton').addEventListener('click', createMedicalRecord);
