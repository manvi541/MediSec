document.addEventListener('DOMContentLoaded', () => {
    // --- 1. API COMMUNICATION HELPERS ---
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

    const sendFormData = async (method, endpoint, formData) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: method,
                body: formData
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to ${method} ${endpoint}:`, error);
            throw error;
        }
    };

    const deleteData = async (endpoint, id) => {
        try {
            const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to delete ${endpoint}:`, error);
            throw error;
        }
    };

    // --- 2. RENDERING FUNCTIONS ---
    
    const renderProjects = async () => {
        const projects = await fetchData('projects');
        const container = document.getElementById('projects-container');
        const adminList = document.getElementById('admin-project-list');
        if (!container) return;

        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        projects.forEach(project => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <a href="${project.link}" target="_blank" class="inline-flex items-center px-4 py-2 text-white bg-[#00acc1] rounded-md">View Project</a>
                    </div>
                </div>`);
            if (adminList) {
                adminList.insertAdjacentHTML('beforeend', `
                    <div class="admin-list-item flex justify-between p-2 border-b">
                        <span>${project.title}</span>
                        <button class="delete-project text-red-500" data-id="${project.id}"><i class="fas fa-trash"></i></button>
                    </div>`);
            }
        });
    };

    const renderTeamMembers = async () => {
        const teamMembers = await fetchData('team');
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');
        if (!container) return;

        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        teamMembers.forEach(member => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                    <img src="${member.image || 'https://via.placeholder.com/150'}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-[#00acc1] font-medium">${member.title}</p>
                    <p class="mt-2 text-gray-600 text-sm">${member.bio}</p>
                </div>`);
            if (adminList) {
                adminList.insertAdjacentHTML('beforeend', `
                    <div class="admin-list-item flex justify-between p-2 border-b">
                        <span>${member.name}</span>
                        <button class="delete-team text-red-500" data-id="${member.id}"><i class="fas fa-trash"></i></button>
                    </div>`);
            }
        });
    };

    // --- 3. ADMIN PANEL & MODAL LOGIC ---
    
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            adminPanel.classList.toggle('open');
            console.log("Admin Panel Toggled");
        });
    }

    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => adminPanel.classList.remove('open'));
    }

    // Modal helpers
    const showModal = (id) => document.getElementById(id).classList.remove('hidden');
    const hideModal = (id) => document.getElementById(id).classList.add('hidden');

    // --- 4. FORM SUBMISSIONS (CREATE DATA) ---

    // Add Project
    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addProjectForm);
            try {
                await sendFormData('POST', 'projects', formData);
                addProjectForm.reset();
                renderProjects();
                alert("Project added successfully!");
            } catch (err) { alert("Failed to add project"); }
        });
    }

    // Add Team Member
    const addTeamForm = document.getElementById('add-team-member-form');
    if (addTeamForm) {
        addTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addTeamForm);
            // Manually append if your IDs don't match the database fields exactly
            // formData.append('name', document.getElementById('new-member-name').value);
            try {
                await sendFormData('POST', 'team', formData);
                addTeamForm.reset();
                renderTeamMembers();
                alert("Officer added!");
            } catch (err) { alert("Failed to add officer"); }
        });
    }

    // --- 5. DELETE LISTENERS ---
    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('button');
        if (!deleteBtn) return;

        const id = deleteBtn.dataset.id;
        if (deleteBtn.classList.contains('delete-project')) {
            if (confirm("Delete Project?")) {
                await deleteData('projects', id);
                renderProjects();
            }
        }
        if (deleteBtn.classList.contains('delete-team')) {
            if (confirm("Delete Officer?")) {
                await deleteData('team', id);
                renderTeamMembers();
            }
        }
    });

    // --- 6. INITIALIZATION ---
    renderProjects();
    renderTeamMembers();
    renderBlogPosts(); 
});
