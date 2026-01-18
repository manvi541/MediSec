const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// 1. ENVIRONMENT VARIABLE CHECK
const serviceAccountKey = process.env.FIREBASE_KEY;
if (!serviceAccountKey) {
    console.error("CRITICAL ERROR: FIREBASE_KEY environment variable is not set.");
    process.exit(1);
}

// 2. FIREBASE INITIALIZATION (DATABASE ONLY)
try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase (Firestore) initialized successfully");
} catch (error) {
    console.error("❌ Failed to parse FIREBASE_KEY:", error);
    process.exit(1);
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- HELPER FUNCTION ---
const getCollection = async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- API ENDPOINTS ---

// Team Members
app.get('/api/team', async (req, res) => {
    try {
        const team = await getCollection('team');
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team' });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        // No images/multer here—just saving text data to Firestore
        const docRef = await db.collection('team').add(req.body);
        res.status(201).json({ id: docRef.id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error saving member' });
    }
});

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await getCollection('projects');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Events
app.get('/api/events', async (req, res) => {
    try {
        const events = await getCollection('events');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Generic Delete
app.delete('/api/:collection/:id', async (req, res) => {
    try {
        await db.collection(req.params.collection).doc(req.params.id).delete();
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// --- SERVE FRONTEND ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is live on Port ${PORT}`);
});
