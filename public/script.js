document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Functions ---
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

    const showMessage = (msg, isError = false, timeout = 3000) => {
        try {
            const box = document.getElementById('custom-message-box');
            const text = document.getElementById('custom-message-text');
            const cancelBtn = document.getElementById('custom-message-cancel-btn');
            const confirmBtn = document.getElementById('custom-message-confirm-btn');
            if (!box || !text || !confirmBtn) return;
            text.textContent = msg;
            box.classList.remove('hidden');
            if (cancelBtn) cancelBtn.classList.add('hidden');
            confirmBtn.textContent = isError ? 'Close' : 'OK';
            const hide = () => box.classList.add('hidden');
            confirmBtn.onclick = hide;
            if (timeout > 0) setTimeout(hide, timeout);
        } catch (err) {
            console.error('showMessage failed', err);
        }
    };

    const generateId = (prefix = '') => `${prefix}${Date.now()}-${Math.floor(Math.random()*10000)}`;

    const sendJsonData = async (method, endpoint, data) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (err) {
            console.error(`Failed to ${method} ${endpoint}`, err);
            throw err;
        }
    };

    const sendFormData = async (method, endpoint, formData) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method,
                body: formData
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (err) {
            console.error(`Failed to ${method} ${endpoint}`, err);
            throw err;
        }
    };

    const deleteData = async (endpoint, id) => {
        try {
            const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (err) {
            console.error(`Failed to delete ${endpoint}:`, err);
            throw err;
        }
    };

    const localCache = { projects: [], blogs: [], team: [], events: [] };

    // --- Safe Element Helper ---
    const getSafe = (id) => document.getElementById(id);

    // --- Render Functions ---
    const renderProjects = async () => {
        try {
            const container = getSafe('projects-container');
            const adminList = getSafe('admin-project-list');
            if (!container && !adminList) return;

            const projects = await fetchData('projects');
            const allProjects = [...projects, ...localCache.projects];

            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            if (allProjects.length === 0) {
                if (container) container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects added yet.</p>';
                if (adminList) adminList.innerHTML = '<p class="text-center text-gray-500">No projects added yet.</p>';
                return;
            }

            allProjects.forEach(project => {
                if (container) {
                    container.insertAdjacentHTML('beforeend', `
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
                    `);
                }
                if (adminList) {
                    adminList.insertAdjacentHTML('beforeend', `
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
                    `);
                }
            });
        } catch (err) {
            console.error('renderProjects failed', err);
        }
    };

    const renderBlogPosts = async () => {
        try {
            const container = getSafe('blog-posts-container');
            const adminList = getSafe('admin-blog-list');
            if (!container && !adminList) return;

            const blogPosts = await fetchData('blogs');
            const allBlogs = [...blogPosts, ...localCache.blogs];
            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            if (allBlogs.length === 0) {
                if (container) container.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts added yet.</p>';
                if (adminList) adminList.innerHTML = '<p class="text-center text-gray-500">No blog posts added yet.</p>';
                return;
            }

            allBlogs.forEach(blog => {
                if (container) {
                    container.insertAdjacentHTML('beforeend', `
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
                    `);
                }
                if (adminList) {
                    adminList.insertAdjacentHTML('beforeend', `
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
                    `);
                }
            });
        } catch (err) {
            console.error('renderBlogPosts failed', err);
        }
    };

    const renderTeamMembers = async () => {
        try {
            const container = getSafe('team-container');
            const adminList = getSafe('admin-team-list');
            if (!container && !adminList) return;

            const teamMembers = await fetchData('team');
            const allTeam = [...teamMembers, ...localCache.team];
            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            if (allTeam.length === 0) {
                if (container) container.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members added yet.</p>';
                if (adminList) adminList.innerHTML = '<p class="text-center text-gray-500">No team members added yet.</p>';
                return;
            }

            allTeam.forEach(member => {
                if (container) {
                    container.insertAdjacentHTML('beforeend', `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
                            <img src="${member.image}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                            <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                            <p class="text-[#00acc1] font-medium">${member.title}</p>
                            <p class="mt-2 text-gray-600 text-sm">${member.bio}</p>
                        </div>
                    `);
                }
                if (adminList) {
                    adminList.insertAdjacentHTML('beforeend', `
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
                    `);
                }
            });
        } catch (err) {
            console.error('renderTeamMembers failed', err);
        }
    };

    const renderEvents = async () => {
        try {
            const container = getSafe('events-container');
            const adminList = getSafe('admin-event-list');
            if (!container && !adminList) return;

            const events = await fetchData('events');
            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            if (events.length === 0) {
                if (container) container.innerHTML = '<p class="col-span-full text-center text-gray-500">No events added yet.</p>';
                if (adminList) adminList.innerHTML = '<p class="text-center text-gray-500">No events added yet.</p>';
                return;
            }

            events.forEach(evt => {
                if (container) {
                    container.insertAdjacentHTML('beforeend', `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover animate-zoom-in">
                            <img src="${evt.image || 'https://via.placeholder.com/600x300.png?text=Event'}" alt="${evt.title}" class="w-full h-44 object-cover">
                            <div class="p-6">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">${evt.title}</h3>
                                <div class="text-sm text-gray-500 mb-2">${evt.date} · ${evt.location || ''}</div>
                                <p class="text-gray-600 mb-4">${evt.description || ''}</p>
                                ${evt.link ? `<a href="${evt.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00acc1] hover:bg-[#7a97ab] transition duration-300">Event Page <i class="fas fa-arrow-right ml-2"></i></a>` : ''}
                            </div>
                        </div>
                    `);
                }
                if (adminList) {
                    adminList.insertAdjacentHTML('beforeend', `
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
                    `);
                }
            });
        } catch (err) {
            console.error('renderEvents failed', err);
        }
    };

    // --- Initial Render ---
    renderProjects();
    renderBlogPosts();
    renderTeamMembers();
    renderEvents();

});

