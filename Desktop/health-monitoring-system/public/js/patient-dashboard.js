window.onload = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login.html'; // Якщо токен не знайдено, перенаправляємо на сторінку входу
      return;
    }
  
    const patientName = document.getElementById('patientName');
    const patientEmail = document.getElementById('patientEmail');
    const patientPhone = document.getElementById('patientPhone');
    const patientRank = document.getElementById('patientRank');
    const patientPhoto = document.getElementById('patientPhoto');
    const editProfileForm = document.getElementById('editProfileForm');
    const historyList = document.getElementById('historyList');
    const doctorList = document.getElementById('doctorList');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeBtn = document.getElementsByClassName('close-btn')[0];
  
    // Відкриваємо модальне вікно
    editProfileBtn.onclick = function() {
      modal.style.display = 'block';
    }
  
    // Закриваємо модальне вікно
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    }
  
    // Закриваємо модальне вікно, якщо користувач натискає за межами вікна
    window.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    }
  
    // Отримуємо дані пацієнта
    const response = await fetch('/api/patient/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    const data = await response.json();
    if (response.ok) {
      // Оновлюємо дані на сторінці
      patientName.textContent = data.patient.fullName;
      patientEmail.textContent = data.patient.email;
      patientPhone.textContent = data.patient.phone || 'Не вказано';
      patientRank.textContent = data.patient.rank || 'Не вказано';
      patientPhoto.src = data.patient.photo || '/default-photo.jpg';
  
      // Завантажуємо історію хвороб
      const history = data.patient.medicalHistory || [];
      history.forEach(record => {
        const li = document.createElement('li');
        li.textContent = `Діагноз: ${record.diagnosis}, Лікування: ${record.treatment}`;
        historyList.appendChild(li);
      });
  
      // Завантажуємо список лікарів
      const doctors = await fetch('/api/doctor/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const doctorsData = await doctors.json();
      doctorsData.forEach(doctor => {
        const li = document.createElement('li');
        li.textContent = `${doctor.fullName} (${doctor.specialty})`;
        li.addEventListener('click', () => {
          window.location.href = `/doctor-profile.html?id=${doctor._id}`;
        });
        doctorList.appendChild(li);
      });
    } else {
      alert(data.message || 'Щось пішло не так');
    }
  
    // Обробка форми редагування профілю
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  const rank = document.getElementById('editRank').value;
  const photo = document.getElementById('photoInput').files[0];

  let photoData = null;
  if (photo) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      photoData = e.target.result;  // Фото у форматі Base64
      await updateProfile({ email, phone, rank, photo: photoData });
    };
    reader.readAsDataURL(photo); // Читаємо фото
  } else {
    await updateProfile({ email, phone, rank, photo: photoData });
  }
});

async function updateProfile({ email, phone, rank, photo }) {
  const token = localStorage.getItem('authToken');
  const res = await fetch('/api/patient/update-profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, phone, rank, photo })
  });

  const result = await res.json();
  if (res.ok) {
    alert('Профіль успішно оновлено');
    window.location.reload();  // Перезавантажуємо сторінку для відображення оновлених даних
  } else {
    alert(result.message || 'Щось пішло не так');
  }
}
  };
  