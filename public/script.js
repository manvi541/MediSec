// --- Custom Message Box Implementation ---
function showMessage(message, type = 'info', callback = null) {
    const messageBox = document.getElementById('custom-message-box');
    const messageText = document.getElementById('custom-message-text');
    const messageConfirmBtn = document.getElementById('custom-message-confirm-btn');
    const messageCancelBtn = document.getElementById('custom-message-cancel-btn');

    if (!messageBox) {
        if (type === 'confirm') {
            const result = window.confirm(message);
            if (callback) callback(result);
        } else {
            window.alert(message);
        }
        return;
    }

    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('flex');

    messageConfirmBtn.textContent = 'OK';
    messageCancelBtn.classList.add('hidden');
    messageConfirmBtn.onclick = () => {
        messageBox.classList.add('hidden');
        messageBox.classList.remove('flex');
        if (callback) callback(true);
    };

    if (type === 'confirm') {
        messageConfirmBtn.textContent = 'Yes';
        messageCancelBtn.classList.remove('hidden');
        messageCancelBtn.onclick = () => {
            messageBox.classList.add('hidden');
            messageBox.classList.remove('flex');
            if (callback) callback(false);
        };
    }
}

// Helper function to convert file to base64
function encodeFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// --- Projects CRUD Logic (Now in global scope) ---
const projectsContainer = document.getElementById('projects-container');
const adminProjectList = document.getElementById('admin-project-list');
const editProjectModal = document.getElementById('edit-project-modal');
const projectUploadForm = document.getElementById('project-upload-form');
const projectModalForm = document.getElementById('edit-project-form');
let currentEditingProjectId = null;

async function renderProjects() {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading projects...</p>';
    if (adminProjectList) adminProjectList.innerHTML = '';

    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projects = await response.json();

        projectsContainer.innerHTML = '';
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects added yet. Upload one to get started!</p>';
        } else {
            projects.forEach((project) => {
                const projectCard = document.createElement('div');
                projectCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 project-card';
                projectCard.dataset.id = project.id;
                let imageHtml = project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover">` : '';
                let linkHtml = '';
                if (project.fileUrl) {
                    const fileName = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.zip';
                    linkHtml = `<a href="${project.fileUrl}" download="${fileName}" class="inline-block mt-4 bg-[#00acc1] hover:bg-[#7a97ab] text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300">Download Project File <i class="fas fa-download ml-1"></i></a>`;
                }

                projectCard.innerHTML = `
                    ${imageHtml}
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 text-sm mb-4">${project.description}</p>
                        ${linkHtml}
                        <div class="mt-4 flex space-x-2">
                            <button class="edit-project-btn bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full" data-id="${project.id}">Edit</button>
                            <button class="delete-project-btn bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full" data-id="${project.id}">Delete</button>
                        </div>
                    </div>
                `;
                projectsContainer.appendChild(projectCard);

                if (adminProjectList) {
                    const adminListItem = document.createElement('div');
                    adminListItem.className = 'admin-list-item';
                    adminListItem.dataset.id = project.id;
                    adminListItem.innerHTML = `
                        <span>${project.title}</span>
                        <div>
                            <button data-id="${project.id}" class="edit-project-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                            <button data-id="${project.id}" class="delete-project-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                        </div>
                    `;
                    adminProjectList.appendChild(adminListItem);
                }
            });
            addProjectEventListeners();
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load projects. Check server logs.</p>';
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        showMessage('Project deleted successfully!', 'info', () => renderProjects());
    } catch (error) {
        console.error('Error deleting project:', error);
        showMessage('Failed to delete project. See console for details.', 'error');
    }
}

function openProjectModal(projectId = null) {
    currentEditingProjectId = projectId;
    const modalProjectTitle = document.getElementById('modal-project-title');
    const modalProjectDescription = document.getElementById('modal-project-description');
    const modalProjectImageInput = document.getElementById('modal-project-image');
    const deleteProjectModalBtn = document.getElementById('delete-project-modal-btn');
    const projectModalTitle = document.getElementById('project-modal-title');

    if (editProjectModal) {
        editProjectModal.classList.remove('hidden');
        editProjectModal.classList.add('flex');

        if (projectId === null) {
            if (projectModalTitle) projectModalTitle.textContent = 'Add New Project';
            if (projectModalForm) projectModalForm.reset();
            if (deleteProjectModalBtn) deleteProjectModalBtn.classList.add('hidden');
        } else {
            if (projectModalTitle) projectModalTitle.textContent = 'Edit Project';
            fetch(`/api/projects/${projectId}`)
                .then(res => res.json())
                .then(project => {
                    if (modalProjectTitle) modalProjectTitle.value = project.title;
                    if (modalProjectDescription) modalProjectDescription.value = project.description;
                    if (modalProjectImageInput) modalProjectImageInput.value = project.imageUrl || '';
                })
                .catch(error => {
                    console.error('Error fetching project for edit:', error);
                    showMessage('Failed to load project details for editing.', 'error');
                });
            if (deleteProjectModalBtn) deleteProjectModalBtn.classList.remove('hidden');
        }
    }
}

function addProjectEventListeners() {
    document.querySelectorAll('.edit-project-btn, .edit-project-btn-admin').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.dataset.id;
            openProjectModal(projectId);
        });
    });

    document.querySelectorAll('.delete-project-btn, .delete-project-btn-admin').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.dataset.id;
            showMessage('Are you sure you want to delete this project?', 'confirm', async (confirmed) => {
                if (confirmed) {
                    await deleteProject(projectId);
                }
            });
        });
    });
}

// --- Blog CRUD Logic (Now in global scope) ---
const blogPostsContainer = document.getElementById('blog-posts-container');
const adminBlogList = document.getElementById('admin-blog-list');
const editBlogModal = document.getElementById('edit-blog-modal');
const blogUploadForm = document.getElementById('blog-upload-form');
const blogModalForm = document.getElementById('edit-blog-form');
let currentEditingBlogId = null;

async function renderBlogPosts() {
    if (!adminBlogList) return;
    if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading blog posts...</p>';

    try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blogPosts = await response.json();

        if (blogPostsContainer) blogPostsContainer.innerHTML = '';
        if (adminBlogList) adminBlogList.innerHTML = '';

        if (blogPosts.length === 0) {
            if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts added yet.</p>';
        } else {
            blogPosts.forEach(blog => {
                if (blogPostsContainer) {
                    const blogCard = `... (Your existing blog card HTML here) ...`;
                    blogPostsContainer.insertAdjacentHTML('beforeend', blogCard);
                }
                if (adminBlogList) {
                    const adminListItem = document.createElement('div');
                    adminListItem.className = 'admin-list-item';
                    adminListItem.dataset.id = blog.id;
                    adminListItem.innerHTML = `
                        <span>${blog.title}</span>
                        <div>
                            <button data-id="${blog.id}" class="edit-blog-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                            <button data-id="${blog.id}" class="delete-blog-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                        </div>
                    `;
                    adminBlogList.appendChild(adminListItem);
                }
            });
            addBlogEventListeners();
        }
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load blog posts. Check server logs.</p>';
    }
}

async function deleteBlog(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        showMessage('Blog post deleted successfully!', 'info', () => renderBlogPosts());
    } catch (error) {
        console.error('Error deleting blog post:', error);
        showMessage('Failed to delete blog post. See console for details.', 'error');
    }
}

function openBlogModal(blogId = null) {
    currentEditingBlogId = blogId;
    const blogModalTitle = document.getElementById('blog-modal-title');
    const deleteBlogModalBtn = document.getElementById('delete-blog-modal-btn');
    const modalBlogTitle = document.getElementById('modal-blog-title');
    const modalBlogDate = document.getElementById('modal-blog-date');
    const modalBlogCategory = document.getElementById('modal-blog-category');
    const modalBlogExcerpt = document.getElementById('modal-blog-excerpt');
    const modalBlogImage = document.getElementById('modal-blog-image');
    const modalBlogLink = document.getElementById('modal-blog-link');

    if (editBlogModal) {
        editBlogModal.classList.remove('hidden');
        editBlogModal.classList.add('flex');

        if (blogId === null) {
            if (blogModalTitle) blogModalTitle.textContent = 'Add New Blog Post';
            if (blogModalForm) blogModalForm.reset();
            if (deleteBlogModalBtn) deleteBlogModalBtn.classList.add('hidden');
        } else {
            if (blogModalTitle) blogModalTitle.textContent = 'Edit Blog Post';
            fetch(`/api/blogs/${blogId}`)
                .then(res => res.json())
                .then(blog => {
                    if (modalBlogTitle) modalBlogTitle.value = blog.title;
                    if (modalBlogDate) modalBlogDate.value = blog.date;
                    if (modalBlogCategory) modalBlogCategory.value = blog.category;
                    if (modalBlogExcerpt) modalBlogExcerpt.value = blog.excerpt;
                    if (modalBlogImage) modalBlogImage.value = blog.imageUrl || '';
                    if (modalBlogLink) modalBlogLink.value = blog.link || '';
                })
                .catch(error => {
                    console.error('Error fetching blog for edit:', error);
                    showMessage('Failed to load blog details for editing.', 'error');
                });
            if (deleteBlogModalBtn) deleteBlogModalBtn.classList.remove('hidden');
        }
    }
}

function addBlogEventListeners() {
    document.querySelectorAll('.edit-blog-btn-admin').forEach(button => {
        button.addEventListener('click', (e) => openBlogModal(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-blog-btn-admin').forEach(button => {
        button.addEventListener('click', (e) => {
            const blogId = e.target.dataset.id;
            showMessage('Are you sure you want to delete this blog post?', 'confirm', async (confirmed) => {
                if (confirmed) await deleteBlog(blogId);
            });
        });
    });
}

// --- Team Members CRUD Logic ---
// You will need to create similar renderTeamMembers, deleteTeamMember, etc. functions here
// to connect your frontend with the /api/team endpoints on your server.

// --- Main DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // UI Logic (keep all of this)
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
        });
    });
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-slide-left, .animate-zoom-in, .stat-animate, .animate-pulse-slow');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animateElements.forEach(element => observer.observe(element));
    const sectionTitles = document.querySelectorAll('.section-title-shadow');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('section-title-in-view');
            else entry.target.classList.remove('section-title-in-view');
        });
    }, { threshold: 0.5 });
    sectionTitles.forEach(title => titleObserver.observe(title));
    function animateCountUp(id, target, duration = 2000) { /* ... */ }
    animateCountUp('stat1', 93);
    animateCountUp('stat2', 10);
    animateCountUp('stat3', 300);
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');
    if (adminToggle) adminToggle.addEventListener('click', () => { if (adminPanel) adminPanel.classList.toggle('open'); });
    if (closeAdmin) closeAdmin.addEventListener('click', () => { if (adminPanel) adminPanel.classList.remove('open'); });
    window.openAdminForProjectUpload = function() { /* ... */ };

    // --- CRITICAL FIX: Call the render functions here to load initial data ---
    renderProjects();
    renderBlogPosts();
    // You will also need to call renderTeamMembers() here once it's implemented
});

// --- Other Event Listeners (Form Submissions, Modal Toggles) ---
const closeProjectModalBtn = document.getElementById('close-edit-project-modal');
const cancelProjectModalBtn = document.getElementById('cancel-project-modal-btn');
if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', () => editProjectModal.classList.add('hidden', 'flex'));
if (cancelProjectModalBtn) cancelProjectModalBtn.addEventListener('click', () => editProjectModal.classList.add('hidden', 'flex'));

const closeBlogModalBtn = document.getElementById('close-edit-blog-modal');
const cancelBlogModalBtn = document.getElementById('cancel-blog-modal-btn');
if (closeBlogModalBtn) closeBlogModalBtn.addEventListener('click', () => editBlogModal.classList.add('hidden', 'flex'));
if (cancelBlogModalBtn) cancelBlogModalBtn.addEventListener('click', () => editBlogModal.classList.add('hidden', 'flex'));

if (projectUploadForm) {
    projectUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-description').value;
        const imageUrl = document.getElementById('project-image').value;
        const projectFile = document.getElementById('project-link').files[0];
        let fileUrl = '';
        if (projectFile) fileUrl = await encodeFileToBase64(projectFile);
        const newProjectData = { title, description, imageUrl, fileUrl };
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProjectData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            showMessage('Project added successfully!', 'info', () => { projectUploadForm.reset(); renderProjects(); });
        } catch (error) {
            console.error('Error adding project:', error);
            showMessage('Failed to add project. See console for details.', 'error');
        }
    });
}

if (projectModalForm) {
    projectModalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('modal-project-title').value;
        const description = document.getElementById('modal-project-description').value;
        const imageUrl = document.getElementById('modal-project-image').value;
        const projectFile = document.getElementById('modal-project-link').files[0];
        let fileUrl = '';
        const existingProjectResponse = await fetch(`/api/projects/${currentEditingProjectId}`);
        const existingProject = await existingProjectResponse.json();
        fileUrl = existingProject.fileUrl || '';
        if (projectFile) fileUrl = await encodeFileToBase64(projectFile);
        const updatedProjectData = { title, description, imageUrl, fileUrl };
        try {
            const response = await fetch(`/api/projects/${currentEditingProjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProjectData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            showMessage('Project saved successfully!', 'info', () => {
                if (editProjectModal) editProjectModal.classList.add('hidden', 'flex');
                renderProjects();
            });
        } catch (error) {
            console.error('Error saving project:', error);
            showMessage('Failed to save project. See console for details.', 'error');
        }
    });
}
if (deleteProjectModalBtn) {
    deleteProjectModalBtn.addEventListener('click', () => {
        if (currentEditingProjectId) {
            showMessage('Are you sure you want to delete this project?', 'confirm', async (confirmed) => {
                if (confirmed) {
                    await deleteProject(currentEditingProjectId);
                    if (editProjectModal) editProjectModal.classList.add('hidden', 'flex');
                }
            });
        }
    });
}
// Blog Form Submission and Modal Logic
if (blogUploadForm) {
    blogUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('blog-title').value;
        const date = document.getElementById('blog-date').value;
        const category = document.getElementById('blog-category').value;
        const excerpt = document.getElementById('blog-excerpt').value;
        const imageUrl = document.getElementById('blog-image').value;
        const link = document.getElementById('blog-link').value;
        if (!title || !date || !category || !excerpt) {
            showMessage('Please fill in all required blog post fields.', 'error');
            return;
        }
        const newBlogData = { title, date, category, excerpt, imageUrl, link };
        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBlogData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            showMessage('Blog post added successfully!', 'info', () => { blogUploadForm.reset(); renderBlogPosts(); });
        } catch (error) {
            console.error('Error adding blog post:', error);
            showMessage('Failed to add blog post. See console for details.', 'error');
        }
    });
}
if (blogModalForm) {
    blogModalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('modal-blog-title').value;
        const date = document.getElementById('modal-blog-date').value;
        const category = document.getElementById('modal-blog-category').value;
        const excerpt = document.getElementById('modal-blog-excerpt').value;
        const imageUrl = document.getElementById('modal-blog-image').value;
        const link = document.getElementById('modal-blog-link').value;
        const updatedBlogData = { title, date, category, excerpt, imageUrl, link };
        try {
            const response = await fetch(`/api/blogs/${currentEditingBlogId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBlogData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            showMessage('Blog post saved successfully!', 'info', () => {
                if (editBlogModal) editBlogModal.classList.add('hidden', 'flex');
                renderBlogPosts();
            });
        } catch (error) {
            console.error('Error saving blog post:', error);
            showMessage('Failed to save blog post. See console for details.', 'error');
        }
    });
}
if (deleteBlogModalBtn) {
    deleteBlogModalBtn.addEventListener('click', () => {
        if (currentEditingBlogId) {
            showMessage('Are you sure you want to delete this blog post?', 'confirm', async (confirmed) => {
                if (confirmed) {
                    await deleteBlog(currentEditingBlogId);
                    if (editBlogModal) editBlogModal.classList.add('hidden', 'flex');
                }
            });
        }
    });
}
