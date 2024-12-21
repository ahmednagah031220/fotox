const Replicate = require("replicate");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer")
const path = require("path");
const fs = require("fs");
const axios = require("axios"); // Add Axios for HTTP requests
const User = require("./models/User");
const serviceAccount = require("./admin-key.json");

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://server-auth-41acc.firebaseio.com",
});

const db = admin.firestore();

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 4000;
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

// Sign up 
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.signup(username, email, password);
    res.status(201).json({ message: "User signed up successfully", uid: user.uid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login 
app.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.login(email, password, rememberMe);
    await user.createSession(res, rememberMe);

    res.status(200).json({
      message: "Login successful",
      uid: user.uid,
      displayName: user.displayName,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// sign in with google

app.post("/googleSignInButton", async (req, res) => {
  const { idToken, rememberMe } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    // Step 1: Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;


    // Step 2: Use the User class to check if the user exists or create a new one
    let user;
    try {
      user = await User.getUserByUid(uid, idToken);  // Fetch the user if they exist
    } catch (error) {
      if (error.message.includes("User not found")) {
        // If user doesn't exist, create a new one
        user = new User(uid, name, email);
        await admin.auth().createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: picture,
        });

        // Optionally store additional user information in Firestore
        const db = admin.firestore();
        await db.collection("users").doc(user.uid).set({
          email: user.email,
          name: user.displayName,
          picture,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        throw error;
      }
    }

    // Step 3: Create a session for the user
    await user.createSession(res, rememberMe);

    // Step 4: Respond with user details
    res.status(200).json({
      message: "Successfully signed up with Google",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
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

// reset password

app.post("/reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const message = await User.resetPassword(email);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error in password reset:", error.message);
    res.status(500).json({
      message: "Failed to send password reset email",
      error: error.message,
    });
  }
});

// logout 
app.post("/logout", (req, res) => {
  User.logout(res);
  res.status(200).json({ message: "Successfully logged out" });
});

const checkAuth = async (req, res, next) => {
  const sessionCookie = req.cookies.session || ""; // Retrieve session cookie

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = await User.getUserByUid(decodedClaims.uid);
    next()
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res.redirect("/"); // Redirect to login page if not authenticated
  }
};

const checkAuthAndRedirect = async (req, res, next) => {
  const sessionCookie = req.cookies.session || "";

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = await User.getUserByUid(decodedClaims.uid);
    // Redirect to "/dashboard" if authenticated
    res.redirect("index_n,i");
  } catch (error) {
    // Redirect to login if no session is found
    res.render("index.html");
  }
};

app.get("/", checkAuthAndRedirect);

app.get("/likes", checkAuth, async (req, res) => {
  res.render("likes.html");
});
app.get("/fotox", checkAuth, function (req, res) {
  res.render("fotox.html");
});
app.get("/index_i", checkAuth, function (req, res) {
  res.render("index_i.html");
});
app.get("/index_n,i", checkAuth, function (req, res) {
  res.render("index_n,i.html");
});
app.get("/index_n", checkAuth, function (req, res) {
  res.render("index_n.html");
});
app.get("/about-us", checkAuth, function (req, res) {
  res.render("about-us.html");
});



app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});



const replicate = new Replicate({
  auth: `${process.env.REPLICATE_API_KEY}`, // API token from environment
});

async function getModelVersion(owner, modelName) {
  try {
    const response = await axios.get(
      `https://api.replicate.com/v1/models/${owner}/${modelName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        },
      }
    );

    const model = response.data;

    // Extract the latest version details
    const latestVersionId = model.latest_version.id;
    console.log(`Model: ${modelName}, Owner: ${owner}`);
    console.log(`Latest Version ID: ${latestVersionId}`);

    return latestVersionId;
  } catch (error) {
    console.error("Error fetching model version:", error.response?.data || error.message);
    throw new Error("Failed to fetch model version");
  }
}

// SSE Endpoint to stream progress
app.post("/replicatepredict", async (req, res) => {
  const { prompt, seed } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    // Step 1: Start a prediction using the Replicate API
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-1.1-pro", // Replace with correct model version ID
      input: {
        prompt: prompt,
        prompt_upsampling: true,
      },
    });

    // Return the prediction ID and status
    return res.status(200).json({
      id: prediction.id,
      status: prediction.status,
    });
  } catch (error) {
    console.error("Error starting prediction:", error.message);
    return res.status(500).json({
      error: "Failed to start prediction",
      details: error.message,
    });
  }
});

app.post("/replicatePersonalpredict", async (req, res) => {
  const { prompt, modelname } = req.body;
  const uid = req.cookies.uid;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }


  try {
    // Query the Firestore collection
    const querySnapshot = await db
      .collection("trainings") // Replace with your collection name
      .where("name", "==", modelname)
      .where("userid", "==", uid)
      .get();

    // Check if the query returned any documents
    if (querySnapshot.empty) {
      console.log("No matching documents found.");
      return null;
    }

    // Extract the uniqueId from the first matching document
    const uniqueId = querySnapshot.docs[0].data().uniqueId;

    modeln = `${uniqueId}_${modelname}`;

    try {
      const versionId = await getModelVersion(process.env.OWNER_NAME, modeln);
      console.log(`Fetched version ID: ${versionId}`);
      try {
        const response = await axios.post(
          "https://api.replicate.com/v1/predictions",
          {
            version: versionId,
            input: {
              "prompt": `${prompt} TOKTRIG`
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const predictionId = response.data.id;

        // Return the prediction ID and status
        return res.status(200).json({
          id: predictionId,
          status: response.data.status,
        });
      } catch (error) {
        console.error("Error starting prediction:", error.message);
        return res.status(500).json({
          error: "Failed to start prediction",
          details: error.message,
        });
      }
    } catch (error) {
      console.error(error.message);
    }
  } catch (error) {
    console.error("Error querying Firestore:", error);
    throw error;
  }
});

app.get("/replicate/progress", async (req, res) => {
  const { predictionId } = req.query;

  if (!predictionId) {
    return res.status(400).json({ error: "Prediction ID is required." });
  }

  try {
    // Retrieve prediction status using the prediction ID
    const prediction = await replicate.predictions.get(predictionId);
    // Send the prediction status back to the client
    res.status(200).json({
      status: prediction.status,
      output: prediction.output || null, // Output URL if completed
      prompt: prediction.input.prompt || null, // Input prompt, if available
    });
  } catch (error) {
    console.error("Error fetching prediction status:", error.message);
    res.status(500).json({
      error: "Failed to fetch prediction status",
      details: error.message,
    });
  }
});

// persnoal images

async function fetchNamesByUserId(req, res, next) {
  const uid = req.cookies.uid; // Retrieve UID from cookies

  if (!uid) {
    return res.status(401).send({ error: "Unauthorized: UID not found in cookies" });
  }

  try {
    // Query Firestore for documents with the same UID
    const querySnapshot = await db.collection("trainings").where("userid", "==", uid).get();


    if (querySnapshot.empty) {
      req.names = []; // Pass an empty array if no matches found
    } else {
      // Map document data to an array of names
      req.names = querySnapshot.docs.map((doc) => doc.data().name);
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error fetching names:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Use the middleware in a route
app.get("/fetch-names", fetchNamesByUserId, (req, res) => {
  res.status(200).send({ names: req.names }); // Send the names as a JSON response
});

// Configure multer for file upload
const upload = multer({ dest: "uploads/" }); // Temporary folder for uploaded files


function generateUniqueId(length = 10) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let randomPart = "";

  // Generate random characters
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters[randomIndex];
  }

  // Incorporate the current timestamp
  const timestamp = Date.now().toString(36); // Convert timestamp to base 36 for compactness

  // Combine random characters and timestamp
  return `${randomPart}${timestamp}`;
}

app.post("/per_req", upload.single("uploadedFile"), async (req, res) => {
  const { per_prompt } = req.body;
  const file = req.file;
  const uid = req.cookies.uid;
  const uniqueId = generateUniqueId(8);


  if (!per_prompt || !file) {
    return res.status(400).send({ error: "Missing required fields: name or file" });
  }

  try {
    // Check if the name exists in Firestore
    const query = db.collection("trainings").where("name", "==", per_prompt);
    const querySnapshot = await query.get();

    if (!querySnapshot.empty) {
      return res.status(400).send({ error: "Name already exists in the database" });
    }

    // If the name doesn't exist, proceed with file handling
    const oldPath = file.path; // Temporary file path
    const newFileName = `${file.filename}.zip`; // Append .zip extension


    const newPath = "https://d.benlotus.com/snapsynopsis/2024-12-19_P3xFzg/images_1.zip" // path.join(__dirname, "uploads", newFileName);

    // Rename the file to have a .zip extension
    // fs.rename(oldPath, newPath, async (err) => {
    //   if (err) {
    //     console.error("Error renaming file:", err);
    //     return res.status(500).send({ error: "Failed to save file as .zip" });
    //   }

    //   console.log(`File saved as: ${newPath}`);

    //   // Save the name in Firestore
    //   await db.collection("trainings").add({ name: per_prompt , userid: uid});

    //   console.log(`File uploaded and saved as .zip successfully ${newPath}`);
    // });
    try {
      // 1. Create the Replicate model
      const replicateModelName = `${uniqueId}_${per_prompt}`;
      const replicateResponse = await axios.post(
        "https://api.replicate.com/v1/models",
        {
          owner: process.env.OWNER_NAME, // Replace with your owner username
          name: replicateModelName,
          description: `Model for user ${uid} and name ${per_prompt}`,
          visibility: "public",
          hardware: "gpu-a100-large",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (replicateResponse.status !== 201) {
        console.error("Failed to create Replicate model:", replicateResponse.data);
        return res.status(500).send({ error: "Failed to create Replicate model" });
      }

      console.log("Replicate model created successfully:", replicateResponse.data);

      // 2. Create the Hugging Face repository
      const huggingFaceRepoName = `${uniqueId}_${per_prompt}`;
      const huggingFaceResponse = await axios.post(
        "https://huggingface.co/api/repos/create",
        {
          name: huggingFaceRepoName,
          private: false, // Set to true if you want the repository to be private
          type: "model",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (huggingFaceResponse.status !== 200) {
        console.error("Failed to create Hugging Face repository:", huggingFaceResponse.data);
        return res.status(500).send({ error: "Failed to create Hugging Face repository" });
      }

      console.log("Hugging Face repository created successfully:", huggingFaceResponse.data);
      let trainingId = "";
      // 3. Train the model on the zip file
      try {

        const training = await replicate.trainings.create(
          "ostris",
          "flux-dev-lora-trainer",
          "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
          {
            // You need to create a model on Replicate that will be the destination for the trained version.
            destination: `${process.env.OWNER_NAME}/${replicateModelName}`,
            input: {
              steps: 1000,
              hf_token: process.env.HUGGINGFACE_API_KEY,
              lora_rank: 16,
              optimizer: "adamw8bit",
              batch_size: 1,
              hf_repo_id: `kareemmazrou/${huggingFaceRepoName}`,
              resolution: "512,768,1024",
              trigger_word: "TOKTRIG",
              autocaption: true,
              input_images: newPath,
              learning_rate: 0.0004,
              caption_dropout_rate: 0.05,
              cache_latents_to_disk: false,
            }
          }
        );

        // Reload training status in a loop
        console.log("Training status:", training.status);
        trainingId = training.id; // Extract the training ID

      } catch (error) {
        console.error("Error starting training:", error);
        res.status(500).send({ error: "Failed to start training" });
      }



      // Save the name in Firestore
      await db.collection("trainings").add({ name: per_prompt, userid: uid, uniqueId: uniqueId });

      res.status(200).send({
        message: `Model created, repository created, and training started successfully , id : ${trainingId}`,
        training_id: trainingId

      });
    } catch (error) {
      console.error("Error during the process:", error);
      res.status(500).send({ error: "An error occurred during the process" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get('/training_status/:trainingId', async (req, res) => {
  const { trainingId } = req.params;

  try {
    const response = await axios.get(`https://api.replicate.com/v1/trainings/${trainingId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
      },
    });

    const training = response.data;

    // Parse the response for relevant details
    res.status(200).send({
      status: training.status,
      progressLogs: training.logs
    });
  } catch (error) {
    console.error('Error fetching training status:', error.response?.data || error.message);
    res.status(500).send({ error: 'Failed to fetch training status' });
  }
});

// Endpoint to handle likes
app.post("/like", async (req, res) => {
  const uid = req.cookies.uid;
  const { outputUrl, prompt, isLiked } = req.body;

  if (!outputUrl || !prompt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const likesCollection = db.collection("likes");
    const querySnapshot = await likesCollection
      .where("uid", "==", uid)
      .where("outputUrl", "==", outputUrl)
      .where("prompt", "==", prompt)
      .get();

    if (isLiked) {
      // If the user liked the image and it's not already liked
      if (querySnapshot.empty) {
        await likesCollection.add({
          uid,
          outputUrl,
          prompt,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.status(200).json({ message: "Image liked successfully" });
      } else {
        return res.status(200).json({ message: "Image already liked" });
      }
    } else {
      // If the user unliked the image
      querySnapshot.forEach(async (doc) => {
        await likesCollection.doc(doc.id).delete();
      });

      console.log(querySnapshot.empty)
      return res.status(200).json({ message: "Image unliked successfully" });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get_likes", checkAuth, async (req, res) => {
  try {
    const likesCollection = db.collection("likes");
    const querySnapshot = await likesCollection.where("uid", "==", req.user.uid).get();

    const likes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      outputUrl: doc.data().outputUrl,
      prompt: doc.data().prompt,
      timestamp: doc.data().timestamp,
    }));

    res.status(200).json({
      uname: req.user.displayName, // Include uname in the response
      likes: likes,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch likes", error: error.message });
  }
});

