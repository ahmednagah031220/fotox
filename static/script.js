
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

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


  const confPass = document.getElementById('confirmPass');
  const Pass = document.getElementById('pass');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const forgotpasswordFrom = document.getElementById('forgot-password-form');
  const boxTextButton = document.getElementById('starter-page');
  const googleSignInButton = document.getElementById("googleSignInButton");
  const googlelogInButton = document.getElementById("googlelogInButton");
  const rememberMe = document.getElementById("rememberMe").checked;
  // Function to show the login form
  function showLoginForm() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    forgotpasswordFrom.style.display = 'none';
    boxTextButton.style.display = 'none';
    wrapper.style.width = 400;
    wrapper.style.border = '0.01em solid #514e4e';
    wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
    wrapper.style.height = '550px';
    wrapper.style.width = '410px';
    wrapper.style.margin = '1% 0% 1% 9%';
    wrapper.style.padding = '5% 7% 5% 7%';
    image.style.width = '80%';
    image.style.height = '80%';
  }

  // Function to show the signup form
  function showSignupForm() {
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    forgotpasswordFrom.style.display = 'none';
    boxTextButton.style.display = 'none';
    wrapper.style.border = '0.01em solid #514e4e';
    wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
    wrapper.style.height = '550px';
    wrapper.style.width = '410px';
    wrapper.style.margin = '1% 0% 1% 9%';
    wrapper.style.padding = '5% 7% 5% 7%';
    image.style.width = '80%';
    image.style.height = '80%';
  }

  // Function to show the forgot password form
  function showForgotpasswordForm() {
    forgotpasswordFrom.style.display = 'block';
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    boxTextButton.style.display = 'none';
    wrapper.style.border = '0.01em solid #514e4e';
    wrapper.style.boxShadow = '0.5px 0.5px 0.5px 0.5px rgb(69, 68, 68) inset';
    wrapper.style.height = '550px';
    wrapper.style.width = '410px';
    wrapper.style.margin = '1% 0% 1% 9%';
    wrapper.style.padding = '5% 7% 5% 7%';
    image.style.width = '80%';
    image.style.height = '80%';
  }

  // Function to show the box with the 'Sign In' button
  function showBox() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotpasswordFrom.style.display = 'none';
    boxTextButton.style.display = 'flex';
    wrapper.style.width = 600;
    wrapper.style.border = 'none';
    wrapper.style.boxShadow = 'none';
    wrapper.style.height = '550px';
    wrapper.style.width = '410px';
    image.style.width = '85%';
    image.style.height = '85%';
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






  // Backend
  /////////////////////////////////////////

  document.getElementById("sign").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(this);

    if (confPass.value === Pass.value) {
      const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      };
      try {
        const response = await fetch("/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "CSRF-Token": Cookies.get("XSRF-TOKEN"), // Append CSRF Token
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
          if (errorData.error === 'The email address is already in use by another account.') {
            showLoginForm();
          }

        } else {
          const successData = await response.json();
          alert(`Success: User created with UID ${successData.uid}`);

        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while signing up.");
      }

    } else {
      alert("Password Don't Match!!")
    }

  });


  document.getElementById("login").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(this);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": Cookies.get("XSRF-TOKEN"), // Append CSRF Token
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        if (errorData.error === '1') {
          showSignupForm();
        }

      } else {
        const successData = await response.json();
        alert(`Success: Logged in`);
        window.location.href = 'index_n,i';

      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while logging in.");
    }
  });






  // rest password

  document.getElementById("reset").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(this);
    const data = {
      email: formData.get("email"),
    };

    try {
      const response = await fetch("/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": Cookies.get("XSRF-TOKEN"), // Append CSRF Token
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);


      } else {
        const successData = await response.json();
        alert(`Success: Link has been sent`);

      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred while resetting password.");
    }
  });





  // sign in with google and client utilization


  const firebaseConfig = {
    apiKey: "AIzaSyCfUc3IqvU-GF_M8VPLhutF0K15WGVu35A",
    authDomain: "fotox-c09f7.firebaseapp.com",
    projectId: "fotox-c09f7",
    storageBucket: "fotox-c09f7.firebasestorage.app",
    messagingSenderId: "879587849698",
    appId: "1:879587849698:web:57b2afdd196586785535bb"
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Sign in with Google


  const googleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // Get the user's ID token

      // Send the token to your backend for further processing
      const response = await fetch("/googleSignInButton", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": Cookies.get("XSRF-TOKEN"),
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Successfully signed up with Google!");
        window.location.href = 'index_n,i';
      } else {
        console.error(data.error);
        alert("Failed to sign up with Google: " + data.message);
      }
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      alert("Google sign-in failed: " + error.message);
    }
  }


  googleSignInButton.addEventListener("click", async () => {
    await googleAuth();

  });
  googlelogInButton.addEventListener("click", async () => {
    await googleAuth();

  });


});


