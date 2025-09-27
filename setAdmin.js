// setAdmin.js
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Load service account key
const serviceAccount = JSON.parse(fs.readFileSync("./spvb-service-account.json", "utf8"));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

// 👉 Replace this with the UID you copied from Firebase Console
const uid = "Pu9TEF57rMTS5wCSBtBhxjpspCn2";

async function makeAdmin() {
  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`✅ User ${uid} is now an admin!`);
  } catch (err) {
    console.error("❌ Error setting admin claim:", err);
  }
}

makeAdmin();