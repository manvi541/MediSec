// --- Custom Message Box Implementation (replaces alert/confirm) ---
function showMessage(message, type = 'info', callback = null) {
    const messageBox = document.getElementById('custom-message-box');
    const messageText = document.getElementById('custom-message-text');
    const messageConfirmBtn = document.getElementById('custom-message-confirm-btn');
    const messageCancelBtn = document.getElementById('custom-message-cancel-btn');

    if (!messageBox || !messageText) {
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
    } else {
        messageCancelBtn.classList.add('hidden');
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

// --- Main Rendering and CRUD Functions (Now in global scope) ---

// Function to handle fetching and rendering for any collection
async function renderCollection(endpoint, containerId, adminListId, renderCallback) {
    const container = document.getElementById(containerId);
    const adminList = document.getElementById(adminListId);

    if (!container) return; // public container is mandatory

    container.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading...</p>';
    if (adminList) adminList.innerHTML = '';

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const items = await response.json();

        container.innerHTML = '';
        if (items.length === 0) {
            const noItemsMessage = '<p class="col-span-full text-center text-gray-500">No items added yet.</p>';
            container.innerHTML = noItemsMessage;
            if (adminList) adminList.innerHTML = noItemsMessage;
        } else {
            items.forEach(item => {
                const publicHtml = renderCallback(item, false);
                container.insertAdjacentHTML('beforeend', publicHtml);

                if (adminList) {
                    const adminHtml = renderCallback(item, true);
                    adminList.insertAdjacentHTML('beforeend', adminHtml);
                }
            });
        }
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        const errorMessage = `<p class="col-span-full text-center text-red-500">Failed to load data. Check server logs.</p>`;
        container.innerHTML = errorMessage;
        if (adminList) adminList.innerHTML = errorMessage;
    }
}

// Function to handle deletion for any collection
async function deleteItem(endpoint, id, renderFunction) {
    showMessage('Are you sure you want to delete this item?', 'confirm', async (confirmed) => {
        if (confirmed) {
            try {
                const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                showMessage('Item deleted successfully!', 'info', renderFunction);
            } catch (error) {
                console.error('Error deleting item:', error);
                showMessage('Failed to delete item. See console for details.', 'error');
            }
        }
    });
}

// Function to update an item (generic)
async function updateItem(endpoint, id, updatedData, successCallback) {
    try {
        const response = await fetch(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        showMessage('Item updated successfully!', 'info', successCallback);
    } catch (error) {
        console.error('Error updating item:', error);
        showMessage('Failed to update item. See console for details.', 'error');
    }
}

// --- Project Specific Logic ---
function renderProject(project, isAdmin) {
    const imageHtml = project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover">` : '';
    const linkHtml = project.fileUrl ? `<a href="${project.fileUrl}" download="${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip" class="inline-block mt-4 bg-[#00acc1] hover:bg-[#7a97ab] text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300">Download Project File <i class="fas fa-download ml-1"></i></a>` : '';

    if (isAdmin) {
        return `
            <div class="admin-list-item" data-id="${project.id}">
                <span>${project.title}</span>
                <div>
                    <button data-id="${project.id}" class="edit-project-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                    <button data-id="${project.id}" class="delete-project-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 project-card">
                ${imageHtml}
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${project.description}</p>
                    ${linkHtml}
                </div>
            </div>
        `;
    }
}

// Function to open the edit project modal
async function openProjectModal(id) {
    const modal = document.getElementById('edit-project-modal');
    const form = document.getElementById('edit-project-form');
    const response = await fetch(`/api/projects/${id}`);
    const project = await response.json();

    if (project) {
        document.getElementById('edit-project-id').value = project.id;
        document.getElementById('edit-project-title').value = project.title;
        document.getElementById('edit-project-description').value = project.description;
        document.getElementById('edit-project-image').value = project.imageUrl;
        // Note: Project file is not editable via the form
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// --- Blog Specific Logic ---
function renderBlog(blog, isAdmin) {
    const imageHtml = blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="w-full h-48 object-cover mb-4 rounded-md">` : '';
    const linkHtml = blog.link ? `<a href="${blog.link}" target="_blank" class="text-[#00acc1] hover:underline">Read More</a>` : '';

    if (isAdmin) {
        return `
            <div class="admin-list-item" data-id="${blog.id}">
                <span>${blog.title}</span>
                <div>
                    <button data-id="${blog.id}" class="edit-blog-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                    <button data-id="${blog.id}" class="delete-blog-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden p-6">
                ${imageHtml}
                <h3 class="text-xl font-bold text-gray-900 mb-2">${blog.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${blog.date} | ${blog.category}</p>
                <p class="text-gray-700 mb-4">${blog.excerpt}</p>
                ${linkHtml}
            </div>
        `;
    }
}

// Function to open the edit blog modal
async function openBlogModal(id) {
    const modal = document.getElementById('edit-blog-modal');
    const form = document.getElementById('edit-blog-form');
    const response = await fetch(`/api/blogs/${id}`);
    const blog = await response.json();

    if (blog) {
        document.getElementById('edit-blog-id').value = blog.id;
        document.getElementById('edit-blog-title').value = blog.title;
        document.getElementById('edit-blog-date').value = blog.date;
        document.getElementById('edit-blog-category').value = blog.category;
        document.getElementById('edit-blog-excerpt').value = blog.excerpt;
        document.getElementById('edit-blog-image').value = blog.imageUrl;
        document.getElementById('edit-blog-link').value = blog.link;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// --- Team Member Specific Logic ---
function renderTeamMember(member, isAdmin) {
    const imageHtml = member.imageUrl ? `<img src="${member.imageUrl}" alt="${member.name}" class="w-full h-48 object-cover rounded-t-lg">` : '';

    if (isAdmin) {
        return `
            <div class="admin-list-item" data-id="${member.id}">
                <span>${member.name}</span>
                <div>
                    <button data-id="${member.id}" class="edit-team-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                    <button data-id="${member.id}" class="delete-team-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                ${imageHtml}
                <div class="p-6 text-center">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-gray-600 text-sm">${member.title}</p>
                    <div class="mt-4 flex justify-center space-x-2">
                        ${member.githubUrl ? `<a href="${member.githubUrl}" target="_blank" class="text-gray-500 hover:text-gray-900"><i class="fab fa-github"></i></a>` : ''}
                        ${member.linkedinUrl ? `<a href="${member.linkedinUrl}" target="_blank" class="text-blue-500 hover:text-blue-700"><i class="fab fa-linkedin"></i></a>` : ''}
                        ${member.twitterUrl ? `<a href="${member.twitterUrl}" target="_blank" class="text-blue-400 hover:text-blue-600"><i class="fab fa-twitter"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to open the edit team member modal
async function openTeamModal(id) {
    const modal = document.getElementById('edit-team-modal');
    const form = document.getElementById('edit-team-form');
    const response = await fetch(`/api/team/${id}`);
    const member = await response.json();

    if (member) {
        document.getElementById('edit-team-id').value = member.id;
        document.getElementById('edit-team-name').value = member.name;
        document.getElementById('edit-team-title').value = member.title;
        document.getElementById('edit-team-image').value = member.imageUrl;
        document.getElementById('edit-team-github').value = member.githubUrl;
        document.getElementById('edit-team-linkedin').value = member.linkedinUrl;
        document.getElementById('edit-team-twitter').value = member.twitterUrl;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// --- Main DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // --- UI & Scroll Logic (remains unchanged) ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.querySelectorAll('a.nav-link').forEach(anchor => anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetElement = document.getElementById(this.getAttribute('href').substring(1));
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
    }));
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
    function animateCountUp(id, target, duration = 2000) {
        const element = document.getElementById(id);
        if (!element) return;
        let start = 0;
        const range = target - start;
        let startTime = null;
        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = Math.floor(start + progress * range);
            element.textContent = id === 'stat1' ? `${value}%` : (id === 'stat2' ? `$${value.toLocaleString()}M+` : `${value}%`);
            if (progress < 1) requestAnimationFrame(step);
        }
        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(step);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.7 });
        statObserver.observe(element);
    }
    animateCountUp('stat1', 93);
    animateCountUp('stat2', 10);
    animateCountUp('stat3', 300);
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');
    if (adminToggle && adminPanel) adminToggle.addEventListener('click', () => adminPanel.classList.toggle('open'));
    if (closeAdmin && adminPanel) closeAdmin.addEventListener('click', () => adminPanel.classList.remove('open'));
    window.openAdminForProjectUpload = function() {
        if (adminPanel) adminPanel.classList.add('open');
        const projectUploadSection = document.getElementById('project-upload-form');
        if (projectUploadSection) projectUploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Initial Data Loading ---
    renderCollection('/api/projects', 'projects-container', 'admin-project-list', renderProject);
    renderCollection('/api/blogs', 'blog-posts-container', 'admin-blog-list', renderBlog);
    renderCollection('/api/team', 'team-members-container', 'admin-team-list', renderTeamMember);

    // --- Dynamic Event Listeners for Delete/Edit ---
    document.addEventListener('click', function(e) {
        const id = e.target.dataset.id;
        const editModal = e.target.closest('.fixed');
        if (e.target.matches('.delete-project-btn-admin')) {
            deleteItem('/api/projects', id, () => renderCollection('/api/projects', 'projects-container', 'admin-project-list', renderProject));
        } else if (e.target.matches('.edit-project-btn-admin')) {
            openProjectModal(id);
        } else if (e.target.matches('.delete-blog-btn-admin')) {
            deleteItem('/api/blogs', id, () => renderCollection('/api/blogs', 'blog-posts-container', 'admin-blog-list', renderBlog));
        } else if (e.target.matches('.edit-blog-btn-admin')) {
            openBlogModal(id);
        } else if (e.target.matches('.delete-team-btn-admin')) {
            deleteItem('/api/team', id, () => renderCollection('/api/team', 'team-members-container', 'admin-team-list', renderTeamMember));
        } else if (e.target.matches('.edit-team-btn-admin')) {
            openTeamModal(id);
        } else if (e.target.matches('#close-edit-project-modal')) {
            document.getElementById('edit-project-modal').classList.add('hidden');
            document.getElementById('edit-project-modal').classList.remove('flex');
        } else if (e.target.matches('#close-edit-blog-modal')) {
            document.getElementById('edit-blog-modal').classList.add('hidden');
            document.getElementById('edit-blog-modal').classList.remove('flex');
        } else if (e.target.matches('#close-edit-team-modal')) {
            document.getElementById('edit-team-modal').classList.add('hidden');
            document.getElementById('edit-team-modal').classList.remove('flex');
        }
    });

    // --- Form Submission Logic for Add Forms (remains unchanged) ---
    const projectUploadForm = document.getElementById('project-upload-form');
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
                showMessage('Project added successfully!', 'info', () => {
                    projectUploadForm.reset();
                    renderCollection('/api/projects', 'projects-container', 'admin-project-list', renderProject);
                });
            } catch (error) {
                console.error('Error adding project:', error);
                showMessage('Failed to add project. See console for details.', 'error');
            }
        });
    }
    const blogUploadForm = document.getElementById('blog-upload-form');
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
                showMessage('Blog post added successfully!', 'info', () => {
                    blogUploadForm.reset();
                    renderCollection('/api/blogs', 'blog-posts-container', 'admin-blog-list', renderBlog);
                });
            } catch (error) {
                console.error('Error adding blog post:', error);
                showMessage('Failed to add blog post. See console for details.', 'error');
            }
        });
    }

    // --- Form Submission Logic for Edit Forms (NEW) ---
    const editProjectForm = document.getElementById('edit-project-form');
    if (editProjectForm) {
        editProjectForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-project-id').value;
            const updatedData = {
                title: document.getElementById('edit-project-title').value,
                description: document.getElementById('edit-project-description').value,
                imageUrl: document.getElementById('edit-project-image').value
            };
            updateItem('/api/projects', id, updatedData, () => {
                document.getElementById('edit-project-modal').classList.add('hidden');
                document.getElementById('edit-project-modal').classList.remove('flex');
                renderCollection('/api/projects', 'projects-container', 'admin-project-list', renderProject);
            });
        });
    }
    const editBlogForm = document.getElementById('edit-blog-form');
    if (editBlogForm) {
        editBlogForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-blog-id').value;
            const updatedData = {
                title: document.getElementById('edit-blog-title').value,
                date: document.getElementById('edit-blog-date').value,
                category: document.getElementById('edit-blog-category').value,
                excerpt: document.getElementById('edit-blog-excerpt').value,
                imageUrl: document.getElementById('edit-blog-image').value,
                link: document.getElementById('edit-blog-link').value
            };
            updateItem('/api/blogs', id, updatedData, () => {
                document.getElementById('edit-blog-modal').classList.add('hidden');
                document.getElementById('edit-blog-modal').classList.remove('flex');
                renderCollection('/api/blogs', 'blog-posts-container', 'admin-blog-list', renderBlog);
            });
        });
    }
    const editTeamForm = document.getElementById('edit-team-form');
    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-team-id').value;
            const updatedData = {
                name: document.getElementById('edit-team-name').value,
                title: document.getElementById('edit-team-title').value,
                imageUrl: document.getElementById('edit-team-image').value,
                githubUrl: document.getElementById('edit-team-github').value,
                linkedinUrl: document.getElementById('edit-team-linkedin').value,
                twitterUrl: document.getElementById('edit-team-twitter').value
            };
            updateItem('/api/team', id, updatedData, () => {
                document.getElementById('edit-team-modal').classList.add('hidden');
                document.getElementById('edit-team-modal').classList.remove('flex');
                renderCollection('/api/team', 'team-members-container', 'admin-team-list', renderTeamMember);
            });
        });
    }
});
