// Import necessary modules
const express = require('express');
const path = require('path');
const admin = require('firebase-admin'); // Firebase Admin SDK for server-side access

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
// This ensures your HTML, CSS, and client-side JS are delivered to the browser
app.use(express.static(path.join(__dirname, 'public')));

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: For production, store your service account key securely as an environment variable.
// On Render, you would set an environment variable named FIREBASE_SERVICE_ACCOUNT_KEY
// and paste the entire JSON content of your Firebase service account key file into it.
// Make sure to replace the placeholder below with the actual environment variable.
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        // Exit process or handle error appropriately if Firebase init fails
        process.exit(1);
    }
} else {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Firebase Admin SDK not initialized.');
    // For local development without the env var, you might load a local key file:
    // const serviceAccount = require('./path/to/your/serviceAccountKey.json');
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore(); // Get Firestore instance

// --- API Endpoints for Projects ---

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projectsRef = db.collection('projects');
        const snapshot = await projectsRef.get();
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
});

// POST a new project
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = req.body;
        // Basic validation
        if (!newProject.title || !newProject.description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }
        // newProject.imageUrl will come as a URL string
        // newProject.fileUrl will come as a Base64 string for the uploaded file
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Failed to add project', error: error.message });
    }
});

// PUT (update) an existing project by ID
app.put('/api/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const updatedData = req.body;
        // updatedData.imageUrl will be a URL string
        // updatedData.fileUrl will be a Base64 string if a new file was uploaded, otherwise it will be the old one
        await db.collection('projects').doc(projectId).update(updatedData);
        res.json({ message: 'Project updated successfully', id: projectId });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Failed to update project', error: error.message });
    }
});

// DELETE a project by ID
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        await db.collection('projects').doc(projectId).delete();
        res.json({ message: 'Project deleted successfully', id: projectId });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Failed to delete project', error: error.message });
    }
});

// --- API Endpoints for Blog Posts (similar to projects) ---

// GET all blog posts
app.get('/api/blogs', async (req, res) => {
    try {
        const blogsRef = db.collection('blogPosts');
        const snapshot = await blogsRef.get();
        const blogPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(blogPosts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch blog posts', error: error.message });
    }
});

// POST a new blog post
app.post('/api/blogs', async (req, res) => {
    try {
        const newBlogPost = req.body;
        if (!newBlogPost.title || !newBlogPost.excerpt) {
            return res.status(400).json({ message: 'Title and excerpt are required.' });
        }
        // newBlogPost.imageUrl will come as a URL string
        const docRef = await db.collection('blogPosts').add(newBlogPost);
        res.status(201).json({ id: docRef.id, ...newBlogPost });
    } catch (error) {
        console.error('Error adding blog post:', error);
        res.status(500).json({ message: 'Failed to add blog post', error: error.message });
    }
});

// PUT (update) an existing blog post by ID
app.put('/api/blogs/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        const updatedData = req.body;
        // updatedData.imageUrl will be a URL string
        await db.collection('blogPosts').doc(blogId).update(updatedData);
        res.json({ message: 'Blog post updated successfully', id: blogId });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ message: 'Failed to update blog post', error: error.message });
    }
});

// DELETE a blog post by ID
app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        await db.collection('blogPosts').doc(blogId).delete();
        res.json({ message: 'Blog post deleted successfully', id: blogId });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
    }
});

// --- API Endpoints for Team Members (similar to projects) ---

// GET all team members
app.get('/api/team', async (req, res) => {
    try {
        const teamRef = db.collection('teamMembers');
        const snapshot = await teamRef.get();
        const teamMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(teamMembers);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ message: 'Failed to fetch team members', error: error.message });
    }
});

// POST a new team member
app.post('/api/team', async (req, res) => {
    try {
        const newTeamMember = req.body;
        if (!newTeamMember.name || !newTeamMember.title) {
            return res.status(400).json({ message: 'Name and title are required.' });
        }
        // newTeamMember.imageUrl will come as a URL string
        const docRef = await db.collection('teamMembers').add(newTeamMember);
        res.status(201).json({ id: docRef.id, ...newTeamMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ message: 'Failed to add team member', error: error.message });
    }
});

// PUT (update) an existing team member by ID
app.put('/api/team/:id', async (req, res) => {
    try {
        const memberId = req.params.id;
        const updatedData = req.body;
        // updatedData.imageUrl will be a URL string
        await db.collection('teamMembers').doc(memberId).update(updatedData);
        res.json({ message: 'Team member updated successfully', id: memberId });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Failed to update team member', error: error.message });
    }
});

// DELETE a team member by ID
app.delete('/api/team/:id', async (req, res) => {
    try {
        const memberId = req.params.id;
        await db.collection('teamMembers').doc(memberId).delete();
        res.json({ message: 'Team member deleted successfully', id: memberId });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Failed to delete team member', error: error.message });
    }
});


// Catch-all for any other routes not defined, serves index.html
// This is important for single-page applications where client-side routing is used
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
