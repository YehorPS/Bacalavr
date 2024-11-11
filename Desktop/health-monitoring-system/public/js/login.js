// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      window.location.href = '/dashboard.html';
    } else {
      alert(data.message || 'Невірні дані');
    }
  });
  