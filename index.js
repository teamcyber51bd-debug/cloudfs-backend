// index.js

const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase Admin init
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();

// Test route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "cloudfs-backend running" });
});

// ⭐ GET দিয়ে write করার জন্য route (Sketchware + browser friendly)
app.get("/write/:userId", async (req, res) => {
  const userId = req.params.userId;
  const value = req.query.value;

  if (!value) {
    return res.json({ error: "value is required" });
  }

  try {
    await db.ref("users/" + userId).set({
      value,
      updatedAt: Date.now(),
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Firebase write failed" });
  }
});

// ⭐ GET দিয়ে read
app.get("/read/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const snap = await db.ref("users/" + userId).once("value");
    res.json({ success: true, data: snap.val() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Firebase read failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
