window.onload = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html'; // Якщо токен не знайдено, перенаправляємо на сторінку входу
    return;
  }

  try {
    const response = await fetch('/api/patient/patient-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      // Якщо профіль не знайдено, відкриваємо модальне вікно для створення профілю
      document.getElementById('createProfileModal').style.display = 'block';
      return;
    }

    const data = await response.json();
    if (response.ok) {
      // Заповнюємо дані профілю
      document.getElementById('patientName').textContent = data.fullName;
      document.getElementById('patientEmail').textContent = data.user.email; // Переконайтеся, що використовується шлях до email користувача
      document.getElementById('patientPhone').textContent = data.phone || 'Не вказано';
      document.getElementById('patientDOB').textContent = data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'Не вказано';
      document.getElementById('patientRank').textContent = data.rank || 'Не вказано';
      document.getElementById('patientPhoto').src = data.photo || '/default-photo.jpg';

      // Зберігаємо patientId в локальному сховищі для подальшого використання
      localStorage.setItem('patientId', data._id);
    } else {
      alert(data.message || 'Помилка під час завантаження профілю');
    }
  } catch (error) {
    console.error('Помилка під час завантаження профілю:', error);
  }

  // Завантаження списку лікарів для запису на прийом
  await loadDoctors();

  // Додаємо обробник для форми запису до лікаря
  const appointmentForm = document.getElementById('appointmentForm');
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createAppointment();
  });
};

// Обробник для кнопки редагування профілю
document.getElementById('editProfileBtn').addEventListener('click', () => {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    // Заповнюємо поля модальної форми редагування
    document.getElementById('editFullName').value = document.getElementById('patientName').textContent;
    document.getElementById('editPhone').value = document.getElementById('patientPhone').textContent;
    const dobText = document.getElementById('patientDOB').textContent;
    document.getElementById('editDOB').value = dobText !== 'Не вказано' ? new Date(dobText).toISOString().split('T')[0] : '';
    document.getElementById('editRank').value = document.getElementById('patientRank').textContent;

    modal.style.display = 'block';
  }
});

// Закриття модального вікна
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
  });
});

// Оновлення профілю
document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('authToken');
  const fullName = document.getElementById('editFullName').value;
  const phone = document.getElementById('editPhone').value;
  const dateOfBirth = document.getElementById('editDOB').value;
  const rank = document.getElementById('editRank').value;
  const photoInput = document.getElementById('photoInput').files[0];

  let photoBase64 = null;
  if (photoInput) {
    photoBase64 = await convertToBase64(photoInput);
  }

  const data = {
    fullName,
    phone,
    dateOfBirth,
    rank,
    photo: photoBase64,
  };

  try {
    const response = await fetch('/api/patient/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      alert('Профіль успішно оновлено');
      window.location.reload(); // Оновлюємо сторінку для відображення змін
    } else {
      alert(result.message || 'Помилка при оновленні профілю');
    }
  } catch (error) {
    console.error('Помилка при оновленні профілю:', error);
  }
});

// Функція для конвертації файлу у base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Завантаження списку лікарів для вибору
async function loadDoctors() {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('/api/doctor/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const doctors = await response.json();
      const doctorSelect = document.getElementById('doctorSelect');
      doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor._id;
        option.textContent = `${doctor.fullName} (${doctor.specialty})`;
        doctorSelect.appendChild(option);
      });
    } else {
      alert('Помилка під час завантаження списку лікарів');
    }
  } catch (error) {
    console.error('Помилка під час завантаження списку лікарів:', error);
  }
}

async function createAppointment() {
  const token = localStorage.getItem('authToken');
  const doctorId = document.getElementById('doctorSelect').value;  // Лікар ID
  const appointmentDate = document.getElementById('appointmentDate').value;  // Дата та час прийому
  const reason = document.getElementById('reason').value;  // Причина прийому

  // Додаємо логування для перевірки значень
  console.log("Лікар ID:", doctorId);
  console.log("Дата прийому:", appointmentDate);
  console.log("Причина:", reason);

  if (!doctorId || !appointmentDate || !reason) {
    alert("Будь ласка, заповніть усі поля.");
    return;
  }

  try {
    const response = await fetch('/api/patient/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        doctorId,
        appointmentDate,
        reason
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Запис успішно створено');
      window.location.reload();  // Перезавантаження сторінки для відображення нових даних
    } else {
      console.error('Помилка сервера:', data.message);
      alert(data.message || 'Щось пішло не так');
    }
  } catch (error) {
    console.error('Помилка при створенні запису:', error);
  }
}







