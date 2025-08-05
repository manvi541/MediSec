document.addEventListener('DOMContentLoaded', () => {

    // --- API Call Functions (Communicating with server.js) ---
    const fetchData = async (endpoint) => {
        try {
            const response = await fetch(`/api/${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return []; // Return empty array on error
        }
    };

    const postData = async (endpoint, data) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to add ${endpoint}:`, error);
            throw error;
        }
    };

    const updateData = async (endpoint, id, data) => {
        try {
            const response = await fetch(`/api/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Failed to update ${endpoint}:`, error);
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

        if (projects.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No projects added yet.</p>';
            return;
        }

        projects.forEach(project => {
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

        if (blogPosts.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No blog posts added yet.</p>';
            return;
        }

        blogPosts.forEach(blog => {
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
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');
        container.innerHTML = '';
        adminList.innerHTML = '';

        if (teamMembers.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members added yet.</p>';
            adminList.innerHTML = '<p class="text-center text-gray-500">No team members added yet.</p>';
            return;
        }

        teamMembers.forEach(member => {
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
            const projectToEdit = projects.find(p => p.id === id);
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
            if (confirm('Are you sure you want to delete this project?')) {
                await deleteData('projects', id);
                renderProjects();
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
            await updateData('projects', currentEditProjectId, updatedProject);
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
            const blogToEdit = blogPosts.find(b => b.id === id);
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
            if (confirm('Are you sure you want to delete this blog post?')) {
                await deleteData('blogs', id);
                renderBlogPosts();
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
            await updateData('blogs', currentEditBlogId, updatedBlog);
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
            const memberToEdit = teamMembers.find(m => m.id === id);
            if (memberToEdit) {
                currentEditMemberId = id;
                document.getElementById('member-name').value = memberToEdit.name;
                document.getElementById('member-title').value = memberToEdit.title;
                document.getElementById('member-bio').value = memberToEdit.bio;
                document.getElementById('member-image').value = memberToEdit.image;
                showModal('edit-team-modal');
            }
        } else if (e.target.closest('.delete-team')) {
            const id = e.target.closest('.delete-team').dataset.id;
            if (confirm('Are you sure you want to delete this team member?')) {
                await deleteData('team', id);
                renderTeamMembers();
            }
        }
    });

    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedMember = {
                name: document.getElementById('member-name').value,
                title: document.getElementById('member-title').value,
                bio: document.getElementById('member-bio').value,
                image: document.getElementById('member-image').value,
            };
            await updateData('team', currentEditMemberId, updatedMember);
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
        await postData('blogs', newBlog);
        renderBlogPosts();
        e.target.reset();
    });

    document.getElementById('add-team-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newMember = {
            name: document.getElementById('new-member-name').value,
            title: document.getElementById('new-member-title').value,
            bio: document.getElementById('new-member-bio').value,
            image: document.getElementById('new-member-image').value,
        };
        await postData('team', newMember);
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
        await postData('projects', newProject);
        renderProjects();
        e.target.reset();
    });

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
});
