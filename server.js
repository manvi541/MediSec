const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

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
        storageBucket: serviceAccount.project_id + '.appspot.com'
    });
} catch (error) {
    console.error("Failed to parse FIREBASE_KEY. Ensure it's a properly formatted JSON string.", error);
    process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Helper function to read from Firestore
const getCollection = async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper function to upload file to Firebase Storage
const uploadFileToFirebase = async (file) => {
    if (!file) return null;

    const fileName = `team_profiles/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
            console.error('Error uploading to Firebase Storage:', error);
            reject(new Error('Upload failed'));
        });

        blobStream.on('finish', async () => {
            // Make the file publicly accessible
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await getCollection('projects');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const newProject = req.body;
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('projects').doc(id).update(req.body);
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(404).json({ message: 'Project not found' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('projects').doc(id).delete();
        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(404).json({ message: 'Project not found' });
    }
});

// Blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await getCollection('blogs');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/blogs', async (req, res) => {
    try {
        const newBlog = req.body;
        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog });
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('blogs').doc(id).update(req.body);
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(404).json({ message: 'Blog not found' });
    }
});

app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('blogs').doc(id).delete();
        res.status(200).json({ message: 'Blog deleted' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(404).json({ message: 'Blog not found' });
    }
});

// Team
app.get('/api/team', async (req, res) => {
    try {
        const team = await getCollection('team');
        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/team', upload.single('image'), async (req, res) => {
    try {
        const newMember = req.body;
        // Upload image to Firebase Storage if a file is present
        if (req.file) {
            newMember.image = await uploadFileToFirebase(req.file);
        }

        const docRef = await db.collection('team').add(newMember);
        res.status(201).json({ id: docRef.id, ...newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/team/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMember = req.body;

        // Upload image to Firebase Storage if a new file is present
        if (req.file) {
            updatedMember.image = await uploadFileToFirebase(req.file);
        }

        await db.collection('team').doc(id).update(updatedMember);
        res.json({ id, ...updatedMember });
    } catch (error) => {
        console.error('Error updating team member:', error);
        res.status(404).json({ message: 'Team member not found' });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('team').doc(id).delete();
        res.status(200).json({ message: 'Team member deleted' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(404).json({ message: 'Team member not found' });
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
