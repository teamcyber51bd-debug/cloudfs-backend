const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "YOUR_FIREBASE_DATABASE_URL"
});

const app = express();
app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.send("CloudFS Backend Running");
});

// Read Data from Firebase
app.get("/read/:path", async (req, res) => {
    const path = req.params.path;
    const data = await admin.database().ref(path).once("value");
    res.send(data.val());
});

// Write Data to Firebase
app.post("/write/:path", async (req, res) => {
    const path = req.params.path;
    await admin.database().ref(path).set(req.body);
    res.send({ status: "success" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
