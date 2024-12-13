const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = require("./admin-key.json");

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://server-auth-41acc.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 3000;
const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
res.cookie("XSRF-TOKEN", req.csrfToken());
next();
});

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Create a new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: username,
      });
  
  
      res.status(201).json({
        message: "User signed up successfully",
        uid: userRecord.uid,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating user",
        error: error.message,
      });
    }
  });

// Login 

const axios = require("axios"); // Add Axios for HTTP requests

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Use Firebase REST API to verify email and password
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCfUc3IqvU-GF_M8VPLhutF0K15WGVu35A`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    const { idToken, refreshToken, localId } = response.data;

    // Optional: Create a session cookie for the user
    const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 days
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      message: "Login successful",
      uid: localId,
      idToken,
      refreshToken,
      
    });

  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    res.status(401).json({
      message: "Invalid email or password",
      error: error.response?.data?.error?.message || "Authentication failed",
    });
  }


});


const checkAuth = async (req, res, next) => {
  const sessionCookie = req.cookies.session || ""; // Retrieve session cookie

  try {
    // Verify session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

    // Attach user information to the request
    req.user = decodedClaims;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res.redirect("/"); // Redirect to login page if not authenticated
  }
};

const checkAuthAndRedirect = async (req, res, next) => {
  const sessionCookie = req.cookies.session || "";

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

    req.user = decodedClaims;
    // Redirect to "/dashboard" if authenticated
    res.redirect("/index_n,i");
  } catch (error) {
    // Redirect to login if no session is found
    res.redirect("/login");
  }
};



// Middleware to handle logout
const logoutMiddleware = (req, res) => {
  // Clear the session cookie
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict", // Adjust based on your needs
  });

  res.status(200).json({ message: "Successfully logged out" });
};


app.get("/", checkAuthAndRedirect);


app.get("/likes", checkAuth, function (req, res) {
res.render("likes.html");
});
app.get("/fotox", checkAuth, function (req, res) {
res.render("fotox.html");
});
app.get("/index_i", checkAuth,  function (req, res) {
res.render("index_i.html");
});
app.get("/index_n,i", checkAuth,  function (req, res) {
res.render("index_n,i.html");
});
app.get("/index_n", checkAuth,  function (req, res) {
res.render("index_n.html");
});

app.post("/logout", logoutMiddleware);




app.listen(PORT, () => {
console.log(`Listening on http://localhost:${PORT}`);
});





// reset password


app.post("/reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Send password reset email using Firebase REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCfUc3IqvU-GF_M8VPLhutF0K15WGVu35A`,
      {
        requestType: "PASSWORD_RESET",
        email: email,
      }
    );

    // Check for success message in the response
    if (response.data && response.data.email) {
      res.status(200).json({
        message: `Password reset email sent to ${response.data.email}`,
      });
    } else {
      res.status(500).json({
        message: "Failed to send password reset email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error sending password reset email:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to send password reset email",
      error: error.response?.data?.error?.message || "An error occurred",
    });
  }
});



// sign in with google

app.post("/googleSignInButton", async (req, res) => {
    const { idToken } = req.body;
  
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }
  
    try {
      // Verify the ID token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;
  
      // Check if the user already exists in Firebase Authentication
      let userRecord;
      try {
        userRecord = await admin.auth().getUser(uid);
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          // If user doesn't exist, create a new one
          userRecord = await admin.auth().createUser({
            uid,
            email,
            displayName: name,
            photoURL: picture,
          });
  
          // Optionally store additional user information in Firestore
          const db = admin.firestore();
          await db.collection("users").doc(uid).set({
            email,
            name,
            picture,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          throw error;
        }
      }

          // Optional: Create a session cookie for the user
    const expiresIn = 60 * 60 * 24 * 1 * 1000; // 5 days
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });
  
      res.status(200).json({
        message: "Successfully signed up with Google",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      });
    } catch (error) {
      console.error("Error verifying Google ID token:", error.message);
      res.status(500).json({
        message: "Failed to sign up with Google",
        error: error.message,
      });
    }
  });
  
