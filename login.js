// SevaSetu — Login page logic

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Check if user is already logged in
function checkAuth() {
  const userData = localStorage.getItem('sevasetu_user');
  if (userData) {
    // User is already logged in, redirect to landing page
    window.location.href = 'landing.html';
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  hideMessages();
  
  // Disable button
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  
  // Basic validation
  if (!email || !password) {
    showError('Please enter both email and password.');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In →';
    return;
  }
  
  try {
    // Call login API
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Login failed
      showError(data.error || 'Invalid email or password. Please try again.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In →';
      return;
    }
    
    // Login successful
    showSuccess('✅ Login successful! Redirecting...');
    
    // Store user data in localStorage
    localStorage.setItem('sevasetu_user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      city: data.city,
      points: data.points,
      badges: data.badges
    }));
    
    // Redirect to landing page after a short delay
    setTimeout(() => {
      window.location.href = 'landing.html';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showError('Network error. Please check your connection and try again.');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In →';
  }
});

// Initialize - check if already logged in
checkAuth();

