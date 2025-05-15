document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormElement'); // Selecciona el formulario de login
    const registerForm = document.getElementById('registerFormElement'); // Selecciona el formulario de registro

    // Manejo del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir el envío del formulario
            const formData = new FormData(loginForm);
            const response = await fetch('http://localhost:3005/login', {
                method: 'POST',
                body: new URLSearchParams(formData)
            });
            if (response.redirected) {
                window.location.href = response.url; // Redirigir si hay respuesta
            } else {
                alert('Login failed'); // Notificar error
            }
        });
    }

    // Manejo del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir el envío del formulario
            const formData = new FormData(registerForm);
            const response = await fetch('http://localhost:3005/register', {
                method: 'POST',
                body: new URLSearchParams(formData)
            });
            if (response.redirected) {
                window.location.href = response.url; // Redirigir si hay respuesta
            } else {
                alert('Registration failed'); // Notificar error
            }
        });
    }
});