window.onload = () => {
    const token = localStorage.getItem('authToken');
    const patientId = new URLSearchParams(window.location.search).get('id'); // Отримуємо ID пацієнта з URL
  
    document.getElementById('createRecordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const diagnoses = document.getElementById('diagnoses').value;
      const treatments = document.getElementById('treatments').value;
      const surgeries = document.getElementById('surgeries').value;
      const healthComplaints = document.getElementById('healthComplaints').value;
      const vaccinations = document.getElementById('vaccinations').value;
  
      const response = await fetch(`/api/doctor/create-patient-record/${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ diagnoses, treatments, surgeries, healthComplaints, vaccinations })
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Медична картка створена успішно!');
        window.location.href = `/profile.html?id=${patientId}`; // Повертаємось до профілю пацієнта
      } else {
        alert(data.message || 'Щось пішло не так');
      }
    });
  };
  