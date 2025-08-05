const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Data file paths
const dataPaths = {
    projects: path.join(dataDir, 'projects.json'),
    blogs: path.join(dataDir, 'blogs.json'),
    team: path.join(dataDir, 'team.json')
};

// Initialize empty data files if they don't exist
Object.values(dataPaths).forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
});

// Helper function to read data from JSON files
const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading data from ${filePath}:`, error);
        return [];
    }
};

// Helper function to write data to JSON files
const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
    }
};

// --- API Endpoints ---

// Projects
app.get('/api/projects', (req, res) => {
    const projects = readData(dataPaths.projects);
    res.json(projects);
});

app.post('/api/projects', (req, res) => {
    const projects = readData(dataPaths.projects);
    const newProject = { id: uuidv4(), ...req.body };
    projects.push(newProject);
    writeData(dataPaths.projects, projects);
    res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    let projects = readData(dataPaths.projects);
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
        projects[index] = { id, ...req.body };
        writeData(dataPaths.projects, projects);
        res.json(projects[index]);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    let projects = readData(dataPaths.projects);
    projects = projects.filter(p => p.id !== id);
    writeData(dataPaths.projects, projects);
    res.status(200).json({ message: 'Project deleted' });
});

// Blogs
app.get('/api/blogs', (req, res) => {
    const blogs = readData(dataPaths.blogs);
    res.json(blogs);
});

app.post('/api/blogs', (req, res) => {
    const blogs = readData(dataPaths.blogs);
    const newBlog = { id: uuidv4(), ...req.body };
    blogs.push(newBlog);
    writeData(dataPaths.blogs, blogs);
    res.status(201).json(newBlog);
});

app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    let blogs = readData(dataPaths.blogs);
    const index = blogs.findIndex(b => b.id === id);
    if (index !== -1) {
        blogs[index] = { id, ...req.body };
        writeData(dataPaths.blogs, blogs);
        res.json(blogs[index]);
    } else {
        res.status(404).json({ message: 'Blog not found' });
    }
});

app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    let blogs = readData(dataPaths.blogs);
    blogs = blogs.filter(b => b.id !== id);
    writeData(dataPaths.blogs, blogs);
    res.status(200).json({ message: 'Blog deleted' });
});

// Team
app.get('/api/team', (req, res) => {
    const team = readData(dataPaths.team);
    res.json(team);
});

app.post('/api/team', (req, res) => {
    const team = readData(dataPaths.team);
    const newMember = { id: uuidv4(), ...req.body };
    team.push(newMember);
    writeData(dataPaths.team, team);
    res.status(201).json(newMember);
});

app.put('/api/team/:id', (req, res) => {
    const { id } = req.params;
    let team = readData(dataPaths.team);
    const index = team.findIndex(m => m.id === id);
    if (index !== -1) {
        team[index] = { id, ...req.body };
        writeData(dataPaths.team, team);
        res.json(team[index]);
    } else {
        res.status(404).json({ message: 'Team member not found' });
    }
});

app.delete('/api/team/:id', (req, res) => {
    const { id } = req.params;
    let team = readData(dataPaths.team);
    team = team.filter(m => m.id !== id);
    writeData(dataPaths.team, team);
    res.status(200).json({ message: 'Team member deleted' });
});

// Serve the HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
