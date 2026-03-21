// script to create an authority user using the Firebase Admin SDK
// Run this with: node scripts/create-authority.js

const admin = require("firebase-admin");
const path = require("path");

// Point to the secure credentials file we ignored in git
const serviceAccountPath = path.resolve(__dirname, "../dotslash-de720-firebase-adminsdk-fbsvc-90bf9bae61.json");

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("❌ Failed to load Service Account Key. Make sure it exists at the root:", error.message);
  process.exit(1);
}

const createAuthorityUser = async () => {
  const email = "authority@ecoroute.ai";
  const password = "EcoRouteAdmin2026!";
  const displayName = "Minister of Transport & Ecology";

  try {
    console.log(`⏳ Creating Authority User: ${email}...`);
    
    // 1. Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
    });

    // 2. Assign the Custom Claim (Role-Based Access Control)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "authority" });

    console.log("✅ Success! Authority User created.");
    console.log("--------------------------------------------------");
    console.log(`👤 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🛡️ Role:    authority`);
    console.log("--------------------------------------------------");
    console.log("You can now build the Login UI and sign in with these credentials!");

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️ User ${email} already exists. Attempting to force the authority claim anyway...`);
      try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: "authority" });
        console.log("✅ Custom claim 'authority' attached to existing user.");
      } catch (err) {
        console.error("❌ Failed to update existing user:", err);
      }
    } else {
      console.error("❌ Error creating user:", error);
    }
  }
};

createAuthorityUser();
