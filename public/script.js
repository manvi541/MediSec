document.addEventListener('DOMContentLoaded', () => {

// --- API Call Functions (Communicating with server.js) ---
const fetchData = async (endpoint) => {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        return [];
    }
};

// Consolidated function to fetch and display team members
async function loadTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;

    try {
        const members = await fetchData('team');
        
        // Clear the container (Removes Jane Doe/John Smith)
        container.innerHTML = '';

        if (members.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members found.</p>';
            return;
        }

        // Build cards for each member
        members.forEach(member => {
            const memberCard = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                    <img src="${member.image || 'images/default-avatar.png'}" 
                         alt="${member.name}" 
                         class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-[#00acc1] font-medium">${member.title || member.role || 'Team Member'}</p>
                    <p class="mt-2 text-gray-600 text-sm">${member.bio || ''}</p>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', memberCard);
        });
    } catch (error) {
        console.error("Error rendering team members:", error);
    }
}

// MAIN INITIALIZATION: Runs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load the team members immediately
    loadTeamMembers();

    // --- Add New Member Form Logic ---
    const teamForm = document.getElementById('add-team-member-form');
    if (teamForm) {
        teamForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('name', document.getElementById('new-member-name').value);
            formData.append('title', document.getElementById('new-member-title').value);
            formData.append('bio', document.getElementById('new-member-bio').value);

            const imageFile = document.getElementById('new-member-image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const response = await fetch('/api/team', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Team member added successfully!');
                    teamForm.reset();
                    // This re-runs the loader so the new person appears without a manual refresh
                    loadTeamMembers(); 
                }
            } catch (error) {
                console.error("Error adding member:", error);
            }
        });
    }
});

// Run loadTeamMembers as soon as the website opens
document.addEventListener('DOMContentLoaded', loadTeamMembers);

// Function to handle the form submission in the Admin Panel
const teamForm = document.getElementById('add-team-member-form');
if (teamForm) {
    teamForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('new-member-name').value);
        formData.append('title', document.getElementById('new-member-title').value);
        formData.append('bio', document.getElementById('new-member-bio').value);

        const imageFile = document.getElementById('new-member-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                body: formData // Note: No headers! Browser sets 'multipart/form-data' automatically
            });

            if (response.ok) {
                alert('Team member added successfully!');
                teamForm.reset();
                loadTeamMembers(); // Refresh the list immediately
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    });
}

// Run loadTeamMembers as soon as the website opens
document.addEventListener('DOMContentLoaded', loadTeamMembers);
    

// Function to handle the form submission in the Admin Panel
const teamForm = document.getElementById('add-team-member-form');
if (teamForm) {
    teamForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('new-member-name').value);
        formData.append('title', document.getElementById('new-member-title').value);
        formData.append('bio', document.getElementById('new-member-bio').value);

        const imageFile = document.getElementById('new-member-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                body: formData // Note: No headers! Browser sets 'multipart/form-data' automatically
            });

            if (response.ok) {
                alert('Team member added successfully!');
                teamForm.reset();
                loadTeamMembers(); // Refresh the list immediately
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    });
}
// Run loadTeamMembers as soon as the website opens
document.addEventListener('DOMContentLoaded', loadTeamMembers);
    
    // 1. This function builds the HTML cards using the data from your server
async function fetchTeam() {
    try {
        const response = await fetch('/api/team');
        const teamMembers = await response.json();
        const container = document.getElementById('team-container');
        
        if (!container) return; // Safety check

        // This clears the 'Jane Doe' placeholders and replaces them with real data
        container.innerHTML = teamMembers.map(member => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                <img src="${member.image}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                <p class="text-[#00acc1] font-medium">${member.title}</p>
                <p class="mt-2 text-gray-600 text-sm">${member.bio || ''}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading team from database:", error);
    }
}

// 2. This tells the browser: "As soon as the page is ready, run fetchTeam"
document.addEventListener('DOMContentLoaded', () => {
    fetchTeam();
    // ... you can call your other fetch functions for Projects or Events here too
});

    // Local in-memory fallback cache when server is unavailable
    const localCache = {
        projects: [],
        blogs: [],
        team: [],
        events: []
    };

    // Simple on-screen message helper using #custom-message-box in the HTML
    const showMessage = (msg, isError = false, timeout = 3000) => {
        try {
            const box = document.getElementById('custom-message-box');
            const text = document.getElementById('custom-message-text');
            const cancelBtn = document.getElementById('custom-message-cancel-btn');
            const confirmBtn = document.getElementById('custom-message-confirm-btn');
            if (!box || !text || !confirmBtn) return;
            text.textContent = msg;
            box.classList.remove('hidden');
            // hide cancel (we don't need it here)
            if (cancelBtn) cancelBtn.classList.add('hidden');
            confirmBtn.textContent = isError ? 'Close' : 'OK';
            const hide = () => box.classList.add('hidden');
            // allow manual close
            confirmBtn.onclick = hide;
            // auto-hide after timeout
            if (timeout > 0) setTimeout(hide, timeout);
        } catch (err) {
            console.error('showMessage failed', err);
        }
    };

    const generateId = (prefix = '') => `${prefix}${Date.now()}-${Math.floor(Math.random()*10000)}`;

    // Generic function for JSON POST/PUT
    const sendJsonData = async (method, endpoint, data) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to ${method.toLowerCase()} ${endpoint}:`, error);
            throw error;
        }
    };

    // Specific function for file upload POST/PUT
    const sendFormData = async (method, endpoint, formData) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: method,
                body: formData,
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to ${method.toLowerCase()} ${endpoint}:`, error);
            throw error;
        }
    };

    const deleteData = async (endpoint, id) => {
        try {
            const response = await fetch(`/api/${endpoint}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to delete ${endpoint}:`, error);
            throw error;
        }
    };

    // --- Dynamic Content Rendering Functions ---
    const renderProjects = async () => {
        const projects = await fetchData('projects');
        const container = document.getElementById('projects-container');
        const adminList = document.getElementById('admin-project-list');
        container.innerHTML = '';
        adminList.innerHTML = '';

        const allProjects = [...projects, ...localCache.projects];

        if (allProjects.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No projects added yet.</p>';
            return;
        }

        allProjects.forEach(project => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00acc1] hover:bg-[#7a97ab] transition duration-300">
                            View Project <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', publicHtml);

            const adminHtml = `
                <div class="admin-list-item">
                    <span class="text-gray-800 truncate">${project.title}</span>
                    <div class="flex items-center">
                        <button class="edit-project text-blue-500 hover:text-blue-700 mr-2" data-id="${project.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-project text-red-500 hover:text-red-700" data-id="${project.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            adminList.insertAdjacentHTML('beforeend', adminHtml);
        });
    };

    const renderBlogPosts = async () => {
        const blogPosts = await fetchData('blogs');
        const container = document.getElementById('blog-posts-container');
        const adminList = document.getElementById('admin-blog-list');
        container.innerHTML = '';
        adminList.innerHTML = '';

        const allBlogs = [...blogPosts, ...localCache.blogs];

        if (allBlogs.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No blog posts added yet.</p>';
            return;
        }

        allBlogs.forEach(blog => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${blog.image || 'https://via.placeholder.com/400x250.png?text=No+Image'}" alt="${blog.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <span class="text-sm text-gray-500">${blog.date} | ${blog.category}</span>
                        <h3 class="text-xl font-bold text-gray-900 my-2">${blog.title}</h3>
                        <p class="text-gray-600">${blog.excerpt}</p>
                        <a href="${blog.link}" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00acc1] hover:bg-[#7a97ab] transition duration-300">
                            Read More <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', publicHtml);

            const adminHtml = `
                <div class="admin-list-item">
                    <span class="text-gray-800 truncate">${blog.title}</span>
                    <div class="flex items-center">
                        <button class="edit-blog text-blue-500 hover:text-blue-700 mr-2" data-id="${blog.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-blog text-red-500 hover:text-red-700" data-id="${blog.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            adminList.insertAdjacentHTML('beforeend', adminHtml);
        });
    };

    const renderTeamMembers = async () => {
        const teamMembers = await fetchData('team');
        const allTeam = [...teamMembers, ...localCache.team];
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');
        container.innerHTML = '';
        adminList.innerHTML = '';

        if (allTeam.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No team members added yet.</p>';
            return;
        }

        allTeam.forEach(member => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                    <img src="${member.image}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-[#00acc1] font-medium">${member.title}</p>
                    <p class="mt-2 text-gray-600 text-sm">${member.bio}</p>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', publicHtml);

            const adminHtml = `
                <div class="admin-list-item">
                    <span class="text-gray-800 truncate">${member.name}</span>
                    <div class="flex items-center">
                        <button class="edit-team text-blue-500 hover:text-blue-700 mr-2" data-id="${member.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-team text-red-500 hover:text-red-700" data-id="${member.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            adminList.insertAdjacentHTML('beforeend', adminHtml);
        });
    };

    // Events Rendering
    const renderEvents = async () => {
        const events = await fetchData('events');
        const container = document.getElementById('events-container');
        const adminList = document.getElementById('admin-event-list');
        if (!container) return;
        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        if (events.length === 0) {
            // Keep static placeholder if present in HTML; otherwise show message
            const existingStatic = container.querySelector('.card-hover');
            if (!existingStatic) container.innerHTML = '<p class="col-span-full text-center text-gray-500">No events added yet.</p>';
            if (adminList) adminList.innerHTML = '<p class="text-center text-gray-500">No events added yet.</p>';
            return;
        }

        events.forEach(evt => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${evt.image || 'https://via.placeholder.com/600x300.png?text=Event'}" alt="${evt.title}" class="w-full h-44 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${evt.title}</h3>
                        <div class="text-sm text-gray-500 mb-2">${evt.date} · ${evt.location || ''}</div>
                        <p class="text-gray-600 mb-4">${evt.description || ''}</p>
                        ${evt.link ? `<a href="${evt.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00acc1] hover:bg-[#7a97ab] transition duration-300">Event Page <i class="fas fa-arrow-right ml-2"></i></a>` : ''}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', publicHtml);

            if (adminList) {
                const adminHtml = `
                    <div class="admin-list-item">
                        <span class="text-gray-800 truncate">${evt.title}</span>
                        <div class="flex items-center">
                            <button class="edit-event text-blue-500 hover:text-blue-700 mr-2" data-id="${evt.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-event text-red-500 hover:text-red-700" data-id="${evt.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
                adminList.insertAdjacentHTML('beforeend', adminHtml);
            }
        });
    };

    // --- Admin Panel & Modal Functionality ---

    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            adminPanel.classList.toggle('open');
        });
    }

    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => {
            adminPanel.classList.remove('open');
        });
    }

    // Admin Edit Modal Handlers

    const showModal = (modalId) => {
        document.getElementById(modalId).classList.remove('hidden');
    };

    const hideModal = (modalId) => {
        document.getElementById(modalId).classList.add('hidden');
    };

    const setupModalCloseHandlers = (modalId) => {
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector(`#close-${modalId}`);
        const cancelBtn = modal.querySelector(`#cancel-${modalId}-btn`);

        if (closeBtn) closeBtn.addEventListener('click', () => hideModal(modalId));
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideModal(modalId));
    };

    // Project Modal Logic
    const editProjectModal = document.getElementById('edit-project-modal');
    setupModalCloseHandlers('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    let currentEditProjectId = null;

    document.getElementById('admin-project-list').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-project')) {
            const id = e.target.closest('.edit-project').dataset.id;
            const projects = await fetchData('projects');
            let projectToEdit = projects.find(p => p.id === id);
            if (!projectToEdit) projectToEdit = localCache.projects.find(p => p.id === id);
            if (projectToEdit) {
                currentEditProjectId = id;
                document.getElementById('modal-project-title').value = projectToEdit.title;
                document.getElementById('modal-project-description').value = projectToEdit.description;
                document.getElementById('modal-project-image').value = projectToEdit.image;
                document.getElementById('modal-project-link').value = projectToEdit.link;
                showModal('edit-project-modal');
            }
        } else if (e.target.closest('.delete-project')) {
            const id = e.target.closest('.delete-project').dataset.id;
            const listItem = e.target.closest('.admin-list-item');
            const titleText = listItem && listItem.querySelector('span') ? listItem.querySelector('span').textContent.trim() : '';
            if (confirm('Are you sure you want to delete this project?')) {
                // Optimistically remove locally for immediate feedback
                localCache.projects = localCache.projects.filter(p => p.id !== id);
                if (listItem) listItem.remove();
                renderProjects();
                try {
                    await deleteData('projects', id);
                    showMessage('Project deleted.', false, 2500);
                } catch (err) {
                    console.warn('Server delete failed for project id', id, err);
                    // Fallback: try to find server-side project by title and delete that
                    try {
                        if (titleText) {
                            const serverProjects = await fetchData('projects');
                            let match = serverProjects.find(p => (p.title || '').trim().toLowerCase() === titleText.toLowerCase());
                            if (!match) {
                                match = serverProjects.find(p => (p.title || '').toLowerCase().includes(titleText.toLowerCase()) || titleText.toLowerCase().includes((p.title || '').toLowerCase()));
                            }
                            if (match) {
                                try {
                                    await deleteData('projects', match.id);
                                    console.log('Deleted server-side project by title match:', match.id);
                                    showMessage('Project deleted (matched by title).', false, 2500);
                                } catch (delErr) {
                                    console.error('Failed to delete matched server-side project', match.id, delErr);
                                    showMessage('Failed to delete project on server.', true, 4000);
                                }
                            }
                        }
                    } catch (lookupErr) {
                        console.error('Failed to lookup server-side projects for deletion', lookupErr);
                    }
                }
            }
        }
    });

    if (editProjectForm) {
        editProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedProject = {
                title: document.getElementById('modal-project-title').value,
                description: document.getElementById('modal-project-description').value,
                image: document.getElementById('modal-project-image').value,
                link: document.getElementById('modal-project-link').value,
            };
            try {
                await sendJsonData('PUT', `projects/${currentEditProjectId}`, updatedProject);
            } catch (err) {
                // Update local cache if present
                const idx = localCache.projects.findIndex(p => p.id === currentEditProjectId);
                if (idx !== -1) {
                    localCache.projects[idx] = { id: currentEditProjectId, ...updatedProject };
                } else {
                    // if not present locally, add it so UI reflects change
                    localCache.projects.push({ id: currentEditProjectId, ...updatedProject });
                }
            }
            renderProjects();
            hideModal('edit-project-modal');
        });
    }

    // Blog Modal Logic
    const editBlogModal = document.getElementById('edit-blog-modal');
    setupModalCloseHandlers('edit-blog-modal');
    const editBlogForm = document.getElementById('edit-blog-form');
    let currentEditBlogId = null;

    document.getElementById('admin-blog-list').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-blog')) {
            const id = e.target.closest('.edit-blog').dataset.id;
            const blogPosts = await fetchData('blogs');
            let blogToEdit = blogPosts.find(b => b.id === id);
            if (!blogToEdit) blogToEdit = localCache.blogs.find(b => b.id === id);
            if (blogToEdit) {
                currentEditBlogId = id;
                document.getElementById('modal-blog-title').value = blogToEdit.title;
                document.getElementById('modal-blog-date').value = blogToEdit.date;
                document.getElementById('modal-blog-category').value = blogToEdit.category;
                document.getElementById('modal-blog-excerpt').value = blogToEdit.excerpt;
                document.getElementById('modal-blog-image').value = blogToEdit.image;
                document.getElementById('modal-blog-link').value = blogToEdit.link;
                showModal('edit-blog-modal');
            }
        } else if (e.target.closest('.delete-blog')) {
            const id = e.target.closest('.delete-blog').dataset.id;
            const listItem = e.target.closest('.admin-list-item');
            const titleText = listItem && listItem.querySelector('span') ? listItem.querySelector('span').textContent.trim() : '';
            if (confirm('Are you sure you want to delete this blog post?')) {
                // Optimistically remove locally and from UI
                localCache.blogs = localCache.blogs.filter(b => b.id !== id);
                if (listItem) listItem.remove();
                renderBlogPosts();
                try {
                    await deleteData('blogs', id);
                    showMessage('Blog post deleted.', false, 2500);
                } catch (err) {
                    console.warn('Server delete failed for blog id', id, err);
                    // Fallback: try to find server-side blog by title and delete
                    try {
                        if (titleText) {
                            const serverBlogs = await fetchData('blogs');
                            let match = serverBlogs.find(b => (b.title || '').trim().toLowerCase() === titleText.toLowerCase());
                            if (!match) {
                                match = serverBlogs.find(b => (b.title || '').toLowerCase().includes(titleText.toLowerCase()) || titleText.toLowerCase().includes((b.title || '').toLowerCase()));
                            }
                            if (match) {
                                try {
                                    await deleteData('blogs', match.id);
                                    console.log('Deleted server-side blog by title match:', match.id);
                                    showMessage('Blog post deleted (matched by title).', false, 2500);
                                } catch (delErr) {
                                    console.error('Failed to delete matched server-side blog', match.id, delErr);
                                    showMessage('Failed to delete blog on server.', true, 4000);
                                }
                            }
                        }
                    } catch (lookupErr) {
                        console.error('Failed to lookup server-side blogs for deletion', lookupErr);
                    }
                }
            }
        }
    });

    if (editBlogForm) {
        editBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedBlog = {
                title: document.getElementById('modal-blog-title').value,
                date: document.getElementById('modal-blog-date').value,
                category: document.getElementById('modal-blog-category').value,
                excerpt: document.getElementById('modal-blog-excerpt').value,
                image: document.getElementById('modal-blog-image').value,
                link: document.getElementById('modal-blog-link').value,
            };
            try {
                await sendJsonData('PUT', `blogs/${currentEditBlogId}`, updatedBlog);
            } catch (err) {
                const idx = localCache.blogs.findIndex(b => b.id === currentEditBlogId);
                if (idx !== -1) {
                    localCache.blogs[idx] = { id: currentEditBlogId, ...updatedBlog };
                } else {
                    localCache.blogs.push({ id: currentEditBlogId, ...updatedBlog });
                }
            }
            renderBlogPosts();
            hideModal('edit-blog-modal');
        });
    }

    // Team Modal Logic
    const editTeamModal = document.getElementById('edit-team-modal');
    setupModalCloseHandlers('edit-team-modal');
    const editTeamForm = document.getElementById('edit-team-form');
    let currentEditMemberId = null;

    document.getElementById('admin-team-list').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-team')) {
            const id = e.target.closest('.edit-team').dataset.id;
            const teamMembers = await fetchData('team');
            let memberToEdit = teamMembers.find(m => m.id === id);
            if (!memberToEdit) memberToEdit = localCache.team.find(m => m.id === id);
            if (memberToEdit) {
                currentEditMemberId = id;
                document.getElementById('member-name').value = memberToEdit.name;
                document.getElementById('member-title').value = memberToEdit.title;
                document.getElementById('member-bio').value = memberToEdit.bio;

                // Store current image URL and show a preview
                document.getElementById('member-image-url').value = memberToEdit.image;
                const imagePreview = document.getElementById('current-image-preview');
                imagePreview.innerHTML = memberToEdit.image ? `<img src="${memberToEdit.image}" class="w-16 h-16 object-cover rounded-full mt-2" alt="Current Profile Image">` : 'No current image.';

                // Clear file input on modal open
                document.getElementById('member-image-file').value = '';

                showModal('edit-team-modal');
            }
        } else if (e.target.closest('.delete-team')) {
            const id = e.target.closest('.delete-team').dataset.id;
            if (confirm('Are you sure you want to delete this team member?')) {
                // Optimistically remove item from UI/local cache immediately
                localCache.team = localCache.team.filter(m => m.id !== id);
                // Remove the admin list item DOM node for immediate feedback
                const listItem = e.target.closest('.admin-list-item');
                if (listItem) listItem.remove();
                renderTeamMembers();

                // Attempt server delete in background; if it fails, log but UI already updated
                try {
                    await deleteData('team', id);
                    showMessage('Team member deleted.', false, 2500);
                } catch (err) {
                    console.warn('Server delete failed for team id', id, err);
                    // If the id looks like a local-only id (starts with our prefix) or delete failed,
                    // try to find a matching server-side record by name and delete that.
                    try {
                        const listItemName = listItem ? (listItem.querySelector('span') ? listItem.querySelector('span').textContent.trim() : '') : '';
                        if (listItemName) {
                            const serverMembers = await fetchData('team');
                            const match = serverMembers.find(m => (m.name || '').trim() === listItemName);
                            if (match) {
                                try {
                                    await deleteData('team', match.id);
                                    console.log('Deleted server-side team member by name match:', match.id);
                                    showMessage('Team member deleted (matched by name).', false, 2500);
                                } catch (deleteErr) {
                                    console.error('Failed to delete matched server-side team member', match.id, deleteErr);
                                }
                            }
                        }
                    } catch (lookupErr) {
                        console.error('Failed to lookup server-side team members for deletion', lookupErr);
                    }
                }
            }
        }
    });

    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('name', document.getElementById('member-name').value);
            formData.append('title', document.getElementById('member-title').value);
            formData.append('bio', document.getElementById('member-bio').value);

            const imageFile = document.getElementById('member-image-file').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                // If no new file, send the existing URL
                formData.append('image', document.getElementById('member-image-url').value);
            }

            try {
                await sendFormData('PUT', `team/${currentEditMemberId}`, formData);
            } catch (err) {
                // update local cache
                const updatedMember = {
                    id: currentEditMemberId,
                    name: document.getElementById('member-name').value,
                    title: document.getElementById('member-title').value,
                    bio: document.getElementById('member-bio').value,
                    image: document.getElementById('member-image-url').value || ''
                };
                const idx = localCache.team.findIndex(m => m.id === currentEditMemberId);
                if (idx !== -1) localCache.team[idx] = updatedMember; else localCache.team.push(updatedMember);
            }
            renderTeamMembers();
            hideModal('edit-team-modal');
        });
    }

    // --- Admin Add Forms ---

    document.getElementById('blog-upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newBlog = {
            title: document.getElementById('blog-title').value,
            date: document.getElementById('blog-date').value,
            category: document.getElementById('blog-category').value,
            excerpt: document.getElementById('blog-excerpt').value,
            image: document.getElementById('blog-image').value,
            link: document.getElementById('blog-link').value
        };
        try {
            await sendJsonData('POST', 'blogs', newBlog);
        } catch (err) {
            // Server unavailable — store locally and render
            const id = generateId('blog-');
            localCache.blogs.push({ id, ...newBlog });
        }
        renderBlogPosts();
        e.target.reset();
    });

    document.getElementById('add-team-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('new-member-name').value);
        formData.append('title', document.getElementById('new-member-title').value);
        formData.append('bio', document.getElementById('new-member-bio').value);
        
        const imageFile = document.getElementById('new-member-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        try {
            await sendFormData('POST', 'team', formData);
        } catch (err) {
            // Create a local preview object if server not available
            const name = document.getElementById('new-member-name').value;
            const title = document.getElementById('new-member-title').value;
            const bio = document.getElementById('new-member-bio').value;
            const id = generateId('team-');
            // If an image file was provided, create an object URL for preview
            let imageUrl = '';
            if (imageFile) {
                try { imageUrl = URL.createObjectURL(imageFile); } catch (e) { imageUrl = ''; }
            }
            localCache.team.push({ id, name, title, bio, image: imageUrl });
        }
        renderTeamMembers();
        e.target.reset();
    });

    document.getElementById('project-upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newProject = {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            image: document.getElementById('project-image').value,
            link: document.getElementById('project-link').value
        };
        try {
            await sendJsonData('POST', 'projects', newProject);
        } catch (err) {
            const id = generateId('project-');
            localCache.projects.push({ id, ...newProject });
        }
        renderProjects();
        e.target.reset();
    });

    // Event Upload Form
    const eventUploadForm = document.getElementById('event-upload-form');
    if (eventUploadForm) {
        eventUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('title', document.getElementById('event-title').value);
            formData.append('date', document.getElementById('event-date').value);
            formData.append('location', document.getElementById('event-location').value);
            formData.append('description', document.getElementById('event-description').value);
            formData.append('link', document.getElementById('event-link').value);

            const imageFile = document.getElementById('event-image').files[0];
            if (imageFile) formData.append('image', imageFile);
            try {
                await sendFormData('POST', 'events', formData);
            } catch (err) {
                const id = generateId('event-');
                let imageUrl = '';
                if (imageFile) {
                    try { imageUrl = URL.createObjectURL(imageFile); } catch (e) { imageUrl = ''; }
                }
                localCache.events.push({ id, title: document.getElementById('event-title').value, date: document.getElementById('event-date').value, location: document.getElementById('event-location').value, description: document.getElementById('event-description').value, link: document.getElementById('event-link').value, image: imageUrl });
            }
            renderEvents();
            e.target.reset();
        });
    }

    // Admin event list actions (edit/delete)
    const adminEventList = document.getElementById('admin-event-list');
    if (adminEventList) {
        adminEventList.addEventListener('click', async (e) => {
            if (e.target.closest('.delete-event')) {
                const id = e.target.closest('.delete-event').dataset.id;
                const listItem = e.target.closest('.admin-list-item');
                const titleText = listItem && listItem.querySelector('span') ? listItem.querySelector('span').textContent.trim() : '';
                if (confirm('Are you sure you want to delete this event?')) {
                    // Optimistically remove locally and from UI
                    localCache.events = localCache.events.filter(ev => ev.id !== id);
                    if (listItem) listItem.remove();
                    renderEvents();
                    try {
                        await deleteData('events', id);
                        showMessage('Event deleted.', false, 2500);
                    } catch (err) {
                        console.warn('Server delete failed for event id', id, err);
                        // Fallback: try to find server-side event by title and delete
                        try {
                            if (titleText) {
                                const serverEvents = await fetchData('events');
                                let match = serverEvents.find(ev => (ev.title || '').trim().toLowerCase() === titleText.toLowerCase());
                                if (!match) {
                                    match = serverEvents.find(ev => (ev.title || '').toLowerCase().includes(titleText.toLowerCase()) || titleText.toLowerCase().includes((ev.title || '').toLowerCase()));
                                }
                                if (match) {
                                    try {
                                        await deleteData('events', match.id);
                                        console.log('Deleted server-side event by title match:', match.id);
                                        showMessage('Event deleted (matched by title).', false, 2500);
                                    } catch (delErr) {
                                        console.error('Failed to delete matched server-side event', match.id, delErr);
                                        showMessage('Failed to delete event on server.', true, 4000);
                                    }
                                }
                            }
                        } catch (lookupErr) {
                            console.error('Failed to lookup server-side events for deletion', lookupErr);
                        }
                    }
                }
            } else if (e.target.closest('.edit-event')) {
                // Simple inline edit could be implemented, but for now prompt for basic edits
                const id = e.target.closest('.edit-event').dataset.id;
                const events = await fetchData('events');
                let evt = events.find(ev => ev.id === id);
                if (!evt) evt = localCache.events.find(ev => ev.id === id);
                if (!evt) return;
                const newTitle = prompt('Edit event title:', evt.title);
                if (newTitle === null) return; // cancel
                const updated = { ...evt, title: newTitle };
                try {
                    await sendJsonData('PUT', `events/${id}`, updated);
                } catch (err) {
                    const idx = localCache.events.findIndex(ev => ev.id === id);
                    if (idx !== -1) localCache.events[idx] = { id, ...updated };
                    else localCache.events.push({ id, ...updated });
                }
                renderEvents();
            }
        });
    }

    // --- Other Functionality ---

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Scroll-based active navigation
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const setActiveLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(current)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', setActiveLink);
    setActiveLink(); // Call on load to set initial active link

    // Initial render of all content from the server
    renderProjects();
    renderBlogPosts();
    renderTeamMembers();
    renderEvents();
});
