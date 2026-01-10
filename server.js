// --- PROJECTS POST (Modified to handle file uploads like Team) ---
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        const newProject = req.body;
        if (req.file) {
            const fileName = `projects/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
            const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
            newProject.image = url; // Save the Firebase URL
        }
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TEAM POST (Already correct in your file) ---
app.post('/api/team', upload.single('image'), async (req, res) => {
    try {
        const newMember = req.body;
        if (req.file) {
            const fileName = `team/${Date.now()}-${req.file.originalname}`;
            const file = bucket.file(fileName);
            await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
            const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
            newMember.image = url;
        }
        const docRef = await db.collection('team').add(newMember);
        res.status(201).json({ id: docRef.id, ...newMember });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
