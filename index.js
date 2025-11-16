// index.js

const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase Admin init (Render.env থেকে নিচ্ছে)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process
      .env
      .FIREBASE_PRIVATE_KEY
      .replace(/\\n/g, "\n"), // \n ফিক্স করার জন্য
  }),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();

// Simple health check
app.get("/", (req, res) => {
  res.json({ ok: true, message: "cloudfs-backend running" });
});

// উদাহরণ: ইউজারের ডাটা লিখা
// POST /write/user123   body: { "value": "hello" }
app.post("/write/:userId", async (req, res) => {
  const userId = req.params.userId;
  const value = req.body.value;

  if (typeof value === "undefined") {
    return res.status(400).json({ error: "value is required" });
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

// উদাহরণ: ইউজারের ডাটা পড়া
// GET /read/user123
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

// Render এর PORT থাকলে সেটাই, নাহলে 10000
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
