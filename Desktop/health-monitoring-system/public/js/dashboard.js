window.onload = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html'; // Якщо токен не знайдено, перенаправляємо на сторінку входу
    return;
  }

  // Отримуємо елементи для оновлення на сторінці
  const doctorName = document.getElementById('doctorName');
  const doctorEmail = document.getElementById('doctorEmail');
  const doctorPhone = document.getElementById('doctorPhone');
  const doctorSpecialty = document.getElementById('doctorSpecialty');
  const doctorPhoto = document.getElementById('doctorPhoto');
  const patientsList = document.getElementById('patientsList');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const editProfileCloseBtn = document.querySelector('#editProfileModal .close-btn');
  const appointmentModal = document.getElementById('appointmentModal');
  const appointmentCloseBtn = document.getElementById('appointmentCloseBtn');
  const calendarEl = document.getElementById('calendar');

  // Відкриваємо модальне вікно для редагування профілю
  editProfileBtn.onclick = function () {
    editProfileModal.style.display = 'block';
  };

  // Закриваємо модальне вікно для редагування профілю
  editProfileCloseBtn.onclick = function () {
    editProfileModal.style.display = 'none';
  };

  // Закриваємо модальне вікно для запису
  appointmentCloseBtn.onclick = function () {
    appointmentModal.style.display = 'none';
  };

  // Закриваємо будь-яке модальне вікно, якщо користувач натискає за межами вікна
  window.onclick = function (event) {
    if (event.target === editProfileModal) {
      editProfileModal.style.display = 'none';
    } else if (event.target === appointmentModal) {
      appointmentModal.style.display = 'none';
    }
  };

  // Завантаження даних лікаря та пацієнтів
  try {
    const response = await fetch('/api/doctor/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      // Оновлюємо дані на сторінці лікаря
      doctorName.textContent = data.doctor.fullName;
      doctorEmail.textContent = data.doctor.email;
      doctorPhone.textContent = data.doctor.phone || 'Не вказано';
      doctorSpecialty.textContent = data.doctor.specialty || 'Не вказано';
      doctorPhoto.src = data.doctor.photo || '/default-photo.jpg';

      // Завантаження пацієнтів
      const patientsResponse = await fetch('/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const patientsData = await patientsResponse.json();
      if (patientsResponse.ok) {
        patientsData.forEach(patient => {
          const li = document.createElement('li');
          li.textContent = `${patient.fullName} (${patient.email})`;
          li.addEventListener('click', () => {
            window.location.href = `/profile.html?id=${patient._id}`;
          });
          patientsList.appendChild(li);
        });
      }

      // Завантаження записів до лікаря
      const appointments = await loadAppointments();
      if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          locale: 'uk',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek'
          },
          events: appointments,
          eventClick: function (info) {
            // Відкриваємо модальне вікно при натисканні на запис
            const eventData = info.event.extendedProps;
            document.getElementById('appointmentPatientName').textContent = `Пацієнт: ${eventData.patientFullName}`;
            document.getElementById('appointmentPhone').textContent = `Телефон: ${eventData.patientPhone}`;
            document.getElementById('appointmentReason').textContent = `Причина: ${eventData.reason}`;
            document.getElementById('appointmentPhoto').src = eventData.patientPhoto || '/default-photo.jpg';

            appointmentModal.style.display = 'block';
          }
        });

        calendar.render();
      }
    } else {
      alert(data.message || 'Щось пішло не так');
    }
  } catch (error) {
    console.error('Помилка при завантаженні даних лікаря:', error);
  }

  // Функція для отримання записів до лікаря
  async function loadAppointments() {
    try {
      const response = await fetch('/api/doctor/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.appointments && data.appointments.length > 0) {
        return data.appointments.map(appointment => ({
          title: `${appointment.patientId.fullName} - ${appointment.reason}`,
          start: new Date(appointment.dateTime).toISOString(),
          end: new Date(new Date(appointment.dateTime).getTime() + 30 * 60 * 1000).toISOString(),
          patientFullName: appointment.patientId.fullName,
          patientPhone: appointment.patientId.phone || 'Не вказано',
          patientPhoto: appointment.patientId.photo || '/default-photo.jpg',
          reason: appointment.reason
        }));
      } else {
        console.warn('Записи не знайдено або дані порожні');
        return [];
      }
    } catch (error) {
      console.error('Помилка під час завантаження записів до лікаря:', error);
      return [];
    }
  }
};
