document.addEventListener('DOMContentLoaded', function () {
    const signInButton = document.getElementById('sign-header');
    const getStartedButton = document.getElementById('get-started');
    const signInBoxButton = document.getElementById('first-signin');
    const signupLink = document.getElementById('to-signup');
    const signupLink2 = document.getElementById('to-signupforgot');
    const loginLink = document.getElementById('to-login');
    const forgotpasswordLink = document.getElementById('to-forgot-password');
    const wrapper = document.getElementById('wrapper');
    const image = document.getElementById('triple-image');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotpasswordFrom = document.getElementById('forgot-password-form');
    const boxTextButton = document.getElementById('starter-page');

    // Function to show the login form
    function showLoginForm() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        forgotpasswordFrom.style.display = 'none';
        boxTextButton.style.display = 'none';
        wrapper.style.width = 400;
        wrapper.style.border='0.01em solid #514e4e';
        wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
        wrapper.style.height='466px';
        wrapper.style.width='400px';
        wrapper.style.margin='3% 2% 1% 9%';
        wrapper.style.padding='4% 7% 3% 7%';
        image.style.width='80%';
        image.style.height='80%';
    }

    // Function to show the signup form
    function showSignupForm() {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        forgotpasswordFrom.style.display = 'none';
        boxTextButton.style.display = 'none';
        wrapper.style.border='0.01em solid #514e4e';
        wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
        wrapper.style.height='450px';
        wrapper.style.width='400px';
        wrapper.style.margin='3% 2% 1% 9%';
        wrapper.style.padding='5% 7% 3% 7%';
        image.style.width='80%';
        image.style.height='80%';
    }

    // Function to show the forgot password form
    function showForgotpasswordForm() {
        forgotpasswordFrom.style.display = 'block';
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        boxTextButton.style.display = 'none';
        wrapper.style.border='0.01em solid #514e4e';
        wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
        wrapper.style.height='340px';
        wrapper.style.width='400px';
        wrapper.style.margin='3% 2% 1% 9%';
        wrapper.style.padding='12% 7% 3% 7%';
        image.style.width='80%';
        image.style.height='80%';
    }

    // Function to show the box with the 'Sign In' button
    function showBox() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        forgotpasswordFrom.style.display = 'none';
        boxTextButton.style.display = 'flex';
        wrapper.style.width = 600;
        wrapper.style.border='none';
        wrapper.style.boxShadow = 'none';
        wrapper.style.height='500px';
        wrapper.style.width='400px';
        wrapper.style.margin='2% 3% 2% 9%';
        wrapper.style.padding='3% 3% 3% 3%';
        image.style.width='85%';
        image.style.height='85%';
    }

    // Button Events
    signInButton.addEventListener('click', showLoginForm);
    getStartedButton.addEventListener('click', showSignupForm);
    signInBoxButton.addEventListener('click', showLoginForm);

    // Anchor Events
    signupLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent page reload
        showSignupForm();
    });
    signupLink2.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent page reload
        showSignupForm();
    });

    loginLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent page reload
        showLoginForm();
    });

    forgotpasswordLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent page reload
        showForgotpasswordForm();
    });

    // Initialize by showing the box with the "Sign in" button
    showBox();

    const togglePassword = document.getElementById('toggle-password');
    const passwordField = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        // Toggle password visibility
        if (passwordField.type === 'password') {
            passwordField.type = 'text';  // Show password
            togglePassword.classList.remove('fa-eye');
            togglePassword.classList.add('fa-eye-slash');  // Change icon to "eye-slash"
        } else {
            passwordField.type = 'password';  // Hide password
            togglePassword.classList.remove('fa-eye-slash');
            togglePassword.classList.add('fa-eye');  // Change icon back to "eye"
        }
    });
});