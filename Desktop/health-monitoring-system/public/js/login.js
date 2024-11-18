document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    
    localStorage.setItem('authToken', data.token);

    
    const decodedToken = jwt_decode(data.token); 

    
    if (decodedToken.role === 'doctor') {
      window.location.href = '/dashboard.html';  
    } else if (decodedToken.role === 'patient') {
      window.location.href = '/patient-dashboard.html';  
    }
  } else {
    alert(data.message || 'Щось пішло не так');
  }
});
