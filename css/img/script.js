const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const googleLoginButton = document.getElementById('google-login');
const loginForm = document.getElementById('login-form');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

googleLoginButton.addEventListener('click', () => {
    // Simulate Google Login (Replace with actual Google Auth code)
    alert('Simulating Google Login.  You would integrate with the Google API here.');
    // After successful Google login, you would typically:
    // 1. Send the Google Auth token to your backend for verification.
    // 2. Receive a user object from your backend.
    // 3. Store the user object in local storage or a cookie.
    // 4. Redirect the user to the main application page.
    simulateSuccessfulLogin('google'); // Simulate successful login for now
});

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation (you should do more robust validation on the backend)
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Simulate Email/Password Authentication (Replace with actual backend call)
    // In a real application, you would send the email and password to your backend
    // for authentication.  The backend would verify the credentials and return a
    // user object or an error message.
    if (email === 'test@example.com' && password === 'password') {
        simulateSuccessfulLogin('email'); // Simulate successful login
    } else {
        alert('Invalid email or password.');
    }
});

function simulateSuccessfulLogin(method) {
    // This is a placeholder for actual login logic.
    // In a real application, you would:
    // 1. Store the user object in local storage or a cookie.
    // 2. Redirect the user to the main application page.
    alert(`Simulated successful login with ${method}.  You would now redirect to the main app.`);
    // window.location.href = '/main-app'; // Replace with your actual main app URL
}