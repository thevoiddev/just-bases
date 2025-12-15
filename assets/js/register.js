const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  try {
    const response = await api.register(firstName, lastName, email, password, confirmPassword);
    api.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    window.location.href = './dashboard.html';
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = 'block';
  }
});
