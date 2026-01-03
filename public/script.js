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

    const sendJsonData = async (method, endpoint, data) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to ${method} ${endpoint}:`, error);
            throw error;
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
            const response = await fetch(`/api/${endpoint}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to delete ${endpoint}:`, error);
            throw error;
        }
    };

    // --- Simple Message Helper ---
    const showMessage = (msg, isError = false, timeout = 3000) => {
        const box = document.getElementById('custom-message-box');
        const text = document.getElementById('custom-message-text');
        const confirmBtn = document.getElementById('custom-message-confirm-btn');
        if (!box || !text) return;

        text.textContent = msg;
        box.classList.remove('hidden');
        if (confirmBtn) {
            confirmBtn.textContent = isError ? 'Close' : 'OK';
            confirmBtn.onclick = () => box.classList.add('hidden');
        }
        if (timeout > 0) setTimeout(() => box.classList.add('hidden'), timeout);
    };

    // --- Dynamic Content Rendering ---

    const renderProjects = async () => {
        const projects = await fetchData('projects');
        const container = document.getElementById('projects-container');
        const adminList = document.getElementById('admin-project-list');
        if (!container) return;

        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        projects.forEach(project => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <a href="${project.link}" target="_blank" class="inline-flex items-center px-4 py-2 text-white bg-[#00acc1] rounded-md">View Project</a>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', publicHtml);

            if (adminList) {
                const adminHtml = `
                    <div class="admin-list-item">
                        <span>${project.title}</span>
                        <div>
                            <button class="edit-project text-blue-500 mr-2" data-id="${project.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-project text-red-500" data-id="${project.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>`;
                adminList.insertAdjacentHTML('beforeend', adminHtml);
            }
        });
    };

    const renderBlogPosts = async () => {
        const blogs = await fetchData('blogs');
        const container = document.getElementById('blog-posts-container');
        const adminList = document.getElementById('admin-blog-list');
        if (!container) return;

        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        blogs.forEach(blog => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                    <img src="${blog.image || 'https://via.placeholder.com/400x250'}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <span class="text-sm text-gray-500">${blog.date} | ${blog.category}</span>
                        <h3 class="text-xl font-bold text-gray-900 my-2">${blog.title}</h3>
                        <p class="text-gray-600">${blog.excerpt}</p>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', publicHtml);

            if (adminList) {
                const adminHtml = `
                    <div class="admin-list-item">
                        <span>${blog.title}</span>
                        <div>
                            <button class="edit-blog text-blue-500 mr-2" data-id="${blog.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-blog text-red-500" data-id="${blog.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>`;
                adminList.insertAdjacentHTML('beforeend', adminHtml);
            }
        });
    };

    const renderTeamMembers = async () => {
        const team = await fetchData('team');
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');
        if (!container) return;

        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        team.forEach(member => {
            const publicHtml = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                    <img src="${member.image || 'https://via.placeholder.com/150'}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-[#00acc1] font-medium">${member.title}</p>
                    <p class="mt-2 text-gray-600 text-sm">${member.bio}</p>
                </div>`;
            container.insertAdjacentHTML('beforeend', publicHtml);

            if (adminList) {
                const adminHtml = `
                    <div class="admin-list-item">
                        <span>${member.name}</span>
                        <div>
                            <button class="edit-team text-blue-500 mr-2" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-team text-red-500" data-id="${member.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>`;
                adminList.insertAdjacentHTML('beforeend', adminHtml);
            }
        });
    };

    // --- Admin Panel Toggle ---
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) {
        adminToggle.addEventListener('click', () => adminPanel.classList.toggle('open'));
    }
    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => adminPanel.classList.remove('open'));
    }

    const showModal = (id) => document.getElementById(id).classList.remove('hidden');
    const hideModal = (id) => document.getElementById(id).classList.add('hidden');

    // --- Team Form Handlers ---
    let currentEditMemberId = null;
    const adminTeamList = document.getElementById('admin-team-list');
    if (adminTeamList) {
        adminTeamList.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('edit-team')) {
                const team = await fetchData('team');
                const member = team.find(m => m.id === id);
                if (member) {
                    currentEditMemberId = id;
                    document.getElementById('member-name').value = member.name;
                    document.getElementById('member-title').value = member.title;
                    document.getElementById('member-bio').value = member.bio;
                    document.getElementById('member-image-url').value = member.image || '';
                    showModal('edit-team-modal');
                }
            } else if (btn.classList.contains('delete-team')) {
                if (confirm('Delete this officer permanently?')) {
                    await deleteData('team', id);
                    renderTeamMembers();
                }
            }
        });
    }

    const editTeamForm = document.getElementById('edit-team-form');
    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editTeamForm);
            try {
                await sendFormData('PUT', `team/${currentEditMemberId}`, formData);
                hideModal('edit-team-modal');
                renderTeamMembers();
                showMessage('Saved successfully!');
            } catch (err) {
                showMessage('Error saving to Firebase', true);
            }
        });
    }

    const addTeamForm = document.getElementById('add-team-member-form');
    if (addTeamForm) {
        addTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addTeamForm);
            try {
                await sendFormData('POST', 'team', formData);
                addTeamForm.reset();
                renderTeamMembers();
                showMessage('Officer added!');
            } catch (err) {
                showMessage('Failed to add officer', true);
            }
        });
    }

    // --- Initial Load ---
    renderProjects();
    renderBlogPosts();
    renderTeamMembers();
});
