const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const multer = require('multer');

// Configure multer for in-memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
});

// Check if Firebase service account key is provided via environment variable
const serviceAccountKey = process.env.FIREBASE_KEY;
if (!serviceAccountKey) {
    console.error("FIREBASE_KEY environment variable is not set. Please provide the JSON key for your Firebase service account.");
    process.exit(1);
}

// Initialize Firebase Admin SDK
try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Ensure this env variable is set
    });
} catch (error) {
    console.error("Failed to parse FIREBASE_KEY. Ensure it's a properly formatted JSON string.", error);
    process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Helper function to read from Firestore
const getCollection = async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await getCollection('projects');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const newProject = req.body;
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('projects').doc(id).update(req.body);
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(404).json({ message: 'Project not found', error: error.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('projects').doc(id).delete();
        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(404).json({ message: 'Project not found', error: error.message });
    }
});

// Blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await getCollection('blogs');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.post('/api/blogs', async (req, res) => {
    try {
        const newBlog = req.body;
        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog });
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.put('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('blogs').doc(id).update(req.body);
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(404).json({ message: 'Blog not found', error: error.message });
    }
});

app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('blogs').doc(id).delete();
        res.status(200).json({ message: 'Blog deleted' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(404).json({ message: 'Blog not found', error: error.message });
    }
});

// Team
app.get('/api/team', async (req, res) => {
    try {
        const team = await getCollection('team');
        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Events
app.get('/api/events', async (req, res) => {
    try {
        const events = await getCollection('events');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.post('/api/events', upload.single('image'), async (req, res) => {
    try {
        const newEvent = req.body;

        if (req.file) {
            const fileName = `events/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });
            newEvent.image = url;
        }

        const docRef = await db.collection('events').add(newEvent);
        res.status(201).json({ id: docRef.id, ...newEvent });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.put('/api/events/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEvent = req.body;

        if (req.file) {
            const fileName = `events/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });
            updatedEvent.image = url;
        }

        await db.collection('events').doc(id).update(updatedEvent);
        res.json({ id, ...updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(404).json({ message: 'Event not found', error: error.message });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('events').doc(id).delete();
        res.status(200).json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(404).json({ message: 'Event not found', error: error.message });
    }
});

app.post('/api/team', upload.single('image'), async (req, res) => {
    try {
        const newMember = req.body;

        if (req.file) {
            const fileName = `team-members/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491', // A very far-future date
            });
            newMember.image = url;
        }

        const docRef = await db.collection('team').add(newMember);
        console.log(`Team member added with ID: ${docRef.id}`);
        res.status(201).json({ id: docRef.id, ...newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.put('/api/team/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMember = req.body;

        if (req.file) {
            const fileName = `team-members/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491', // A very far-future date
            });
            updatedMember.image = url;
        }

        await db.collection('team').doc(id).update(updatedMember);
        res.json({ id, ...updatedMember });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(404).json({ message: 'Team member not found', error: error.message });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('team').doc(id).delete();
        res.status(200).json({ message: 'Team member deleted' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(404).json({ message: 'Team member not found', error: error.message });
    }
});

// Serve the HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
