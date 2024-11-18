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
    const editProfileForm = document.getElementById('editProfileForm');
    const patientsList = document.getElementById('patientsList');
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
  
    // Отримуємо дані лікаря
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
      doctorPhoto.src = data.doctor.photo || '/default-photo.jpg'; // Виведення фото лікаря
  
      // Завантажуємо пацієнтів
      const patients = await fetch('/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const patientsData = await patients.json();
      patientsData.forEach(patient => {
        const li = document.createElement('li');
        li.textContent = `${patient.fullName} (${patient.email})`;
        li.addEventListener('click', () => {
          window.location.href = `/profile.html?id=${patient._id}`; // Передаємо ID пацієнта
        });
        patientsList.appendChild(li);
      });
    } else {
      alert(data.message || 'Щось пішло не так');
    }
  
    // Обробка форми редагування профілю
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('editEmail').value;
      const phone = document.getElementById('editPhone').value;
      const specialty = document.getElementById('editSpecialty').value;
      const photo = document.getElementById('photoInput').files[0];
  
      let photoData = null;
      if (photo) {
        const reader = new FileReader();
        reader.onload = async function(e) {
          photoData = e.target.result;  // Фото у форматі Base64
          await updateProfile({ email, phone, specialty, photo: photoData });
        };
        reader.readAsDataURL(photo); // Читаємо фото
      } else {
        await updateProfile({ email, phone, specialty, photo: photoData });
      }
    });
  
    async function updateProfile({ email, phone, specialty, photo }) {
      const res = await fetch('/api/doctor/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, phone, specialty, photo })
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('Профіль успішно оновлено');
        modal.style.display = 'none';  // Закриваємо модальне вікно після успішного оновлення
        window.location.reload();  // Перезавантажуємо сторінку для відображення оновлених даних
      } else {
        alert(result.message || 'Щось пішло не так');
      }
    }
  };
  