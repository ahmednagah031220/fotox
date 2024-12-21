const axios = require("axios");
const admin = require("firebase-admin");

class User {
    constructor(uid, displayName, email, idToken, refreshToken) {
        this.uid = uid; // User's unique ID
        this.displayName = displayName || "No Display Name"; // User's display name
        this.email = email; // User's email
        this.idToken = idToken; // Firebase ID token
        this.refreshToken = refreshToken; // Firebase refresh token
    }

    // Create a new user
    static async signup(username, email, password) {
        try {
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: username,
            });

            return new User(userRecord.uid, userRecord.displayName, userRecord.email);
        } catch (error) {
            throw new Error("Error creating user: " + error.message + email);
        }
    }

    /**
     * Logs in the user with email and password.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @param {boolean} rememberMe - Whether to remember the user session.
     * @returns {User} - An instance of the User class.
     */
    static async login(email, password, rememberMe) {
        try {
            // Authenticate using Firebase REST API
            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
                {
                    email,
                    password,
                    returnSecureToken: true,
                }
            );

            const { idToken, refreshToken, localId } = response.data;

            // Retrieve user info (display name, email, etc.)
            const userInfoResponse = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
                {
                    idToken,
                }
            );

            const user = userInfoResponse.data.users[0];

            return new User(
                localId,
                user.displayName,
                user.email,
                idToken,
                refreshToken
            );
        } catch (error) {
            console.error("Error logging in:", error.response?.data || error.message);
            throw new Error("Login failed. Please check your email and password.");
        }
    }

    static async resetPassword(email) {
        if (!email) {
            throw new Error("Email is required for password reset.");
        }

        try {
            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
                {
                    requestType: "PASSWORD_RESET",
                    email: email,
                }
            );

            if (response.data && response.data.email) {
                return `Password reset email sent to ${response.data.email}`;
            } else {
                throw new Error("Failed to send password reset email. Please try again.");
            }
        } catch (error) {
            console.error("Error sending password reset email:", error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || "An error occurred while resetting password.");
        }
    }

    /**
     * Creates a session for the user and sets cookies.
     * @param {Object} res - Express response object.
     * @param {boolean} rememberMe - Whether to remember the user session.
     */
    async createSession(res, rememberMe) {
        const expiresIn = rememberMe
            ? 60 * 60 * 24 * 5 * 1000 // 5 days for "Remember Me"
            : 60 * 60 * 2 * 1000; // 2 hours for regular session

        try {
            // Create a secure session cookie
            const sessionCookie = await admin
                .auth()
                .createSessionCookie(this.idToken, { expiresIn });

            // Set cookies for session and user details
            res.cookie("session", sessionCookie, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true,
            });

            res.cookie("uid", this.uid, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true,
            });

            res.cookie("uname", this.displayName, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true,
            });

            console.log("Session created for user:", this.uid);
        } catch (error) {
            console.error("Error creating session:", error.message);
            throw new Error("Failed to create session.");
        }
    }

    /**
     * Logs out the user by clearing the session cookie.
     * @param {Object} res - Express response object.
     */
    static logout(res) {
        res.clearCookie("session");
        res.clearCookie("uid");
        res.clearCookie("uname");
        console.log("User logged out.");
    }

    /**
     * Fetches user details by UID.
     * @param {string} uid - User's unique ID.
     * @returns {Object} - User details.
     */
    static async getUserByUid(uid, idToken = null) {
        try {
            const userRecord = await admin.auth().getUser(uid); // Fetch user metadata

            // Return a User instance with idToken if provided
            return new User(
                userRecord.uid,
                userRecord.displayName || "No Display Name",
                userRecord.email,
                idToken // Pass the idToken
            );
        } catch (error) {
            console.error("Error fetching user by UID:", error.message);
            throw new Error("User not found.");
        }
    }
}

module.exports = User;