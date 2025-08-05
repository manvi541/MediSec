// --- Custom Message Box Implementation (replaces alert/confirm) ---
// This function creates a custom modal for messages and confirmations,
// preventing the use of native browser alerts/confirms which can be
// disruptive in an iframe environment.
function showMessage(message, type = 'info', callback = null) {
    const messageBox = document.getElementById('custom-message-box');
    const messageText = document.getElementById('custom-message-text');
    const messageConfirmBtn = document.getElementById('custom-message-confirm-btn');
    const messageCancelBtn = document.getElementById('custom-message-cancel-btn');

    // Fallback to native alert if custom elements are missing (should not happen with updated HTML)
    if (!messageBox || !messageText || !messageConfirmBtn || !messageCancelBtn) {
        if (type === 'confirm') {
            return window.confirm(message);
        } else {
            window.alert(message);
            return;
        }
    }

    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('flex'); // Use flex to center the modal

    // Reset buttons and their actions
    messageConfirmBtn.textContent = 'OK';
    messageCancelBtn.classList.add('hidden'); // Hide cancel button by default
    messageConfirmBtn.onclick = () => {
        messageBox.classList.add('hidden');
        messageBox.classList.remove('flex');
        if (callback) callback(true); // If it's an info message, 'OK' means true
    };

    // If type is 'confirm', show cancel button and adjust text
    if (type === 'confirm') {
        messageConfirmBtn.textContent = 'Yes';
        messageCancelBtn.classList.remove('hidden');
        messageCancelBtn.onclick = () => {
            messageBox.classList.add('hidden');
            messageBox.classList.remove('flex');
            if (callback) callback(false); // 'No' means false
        };
    }
}


// --- Main DOMContentLoaded Event Listener ---
// This ensures all HTML elements are loaded before the script tries to access them.
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor jump
            const targetId = this.getAttribute('href').substring(1); // Get target section ID
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth' // Smooth scroll animation
                });
            }
            // Close mobile menu if it's open after clicking a link
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Intersection Observer for scroll animations (fade-in, slide-up, etc.)
    // Elements with these classes will animate when they come into view.
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-slide-left, .animate-zoom-in, .stat-animate, .animate-pulse-slow');

    const observerOptions = {
        root: null, // Observe relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view'); // Add class to trigger CSS animation
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Section title shadow animation on scroll
    // Adds a class to section titles when they are in view to apply a shadow effect.
    const sectionTitles = document.querySelectorAll('.section-title-shadow');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-title-in-view');
            } else {
                entry.target.classList.remove('section-title-in-view');
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the title is visible

    sectionTitles.forEach(title => {
        titleObserver.observe(title);
    });


    // Statistics counter animation
    // Animates numerical statistics from 0 to a target value.
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

            // Format text based on ID (e.g., add %, $M+)
            element.textContent = id === 'stat1' ? `${value}%` : (id === 'stat2' ? `$${value.toLocaleString()}M+` : `${value}%`);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        // Use Intersection Observer to start animation when element is visible
        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(step);
                    observer.unobserve(entry.target); // Stop observing once animation starts
                }
            });
        }, { threshold: 0.7 }); // Trigger when 70% of element is visible

        statObserver.observe(element);
    }

    // Initialize stat animations
    animateCountUp('stat1', 93);
    animateCountUp('stat2', 10);
    animateCountUp('stat3', 300);


    // --- Admin Panel Toggle Logic ---
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) {
        adminToggle.addEventListener('click', () => {
            if (adminPanel) adminPanel.classList.toggle('open');
        });
    }

    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => {
            if (adminPanel) adminPanel.classList.remove('open');
        });
    }

    // Function to open admin panel for project upload (called by HTML button)
    window.openAdminForProjectUpload = function() {
        if (adminPanel) {
            adminPanel.classList.add('open');
            // Optionally scroll to the project upload section in the admin panel
            const projectUploadSection = document.getElementById('project-upload-form');
            if (projectUploadSection) {
                projectUploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };


    // --- Dynamic Projects Section (Fetch from Backend) ---
    const projectsContainer = document.getElementById('projects-container');
    const projectUploadForm = document.getElementById('project-upload-form');
    const adminProjectList = document.getElementById('admin-project-list'); // List within admin panel
    const editProjectModal = document.getElementById('edit-project-modal');
    const closeProjectModalBtn = document.getElementById('close-edit-project-modal');
    const projectModalTitle = document.getElementById('project-modal-title');
    const projectModalForm = document.getElementById('edit-project-form');
    const modalProjectTitle = document.getElementById('modal-project-title');
    const modalProjectDescription = document.getElementById('modal-project-description');
    const modalProjectImageInput = document.getElementById('modal-project-image'); // This is now URL input
    const modalProjectLinkInput = document.getElementById('modal-project-link'); // This is now File input
    const deleteProjectModalBtn = document.getElementById('delete-project-modal-btn');
    const cancelProjectModalBtn = document.getElementById('cancel-project-modal-btn');

    let currentEditingProjectId = null; // Stores the ID of the project being edited

    // Function to fetch and render projects from the backend (Firestore)
    async function renderProjects() {
        if (!projectsContainer) return;

        projectsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading projects...</p>';
        adminProjectList.innerHTML = ''; // Clear admin list before re-rendering

        try {
            const response = await fetch('/api/projects'); // GET request to your server.js API
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();

            projectsContainer.innerHTML = ''; // Clear loading message

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects added yet. Upload one to get started!</p>';
            } else {
                projects.forEach((project) => {
                    const projectCard = document.createElement('div');
                    projectCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 project-card';
                    projectCard.dataset.id = project.id; // Store Firestore document ID

                    let imageHtml = project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover">` : '';
                    let linkHtml = '';
                    if (project.fileUrl) { // Assuming 'fileUrl' is where Base64 or direct file link is stored
                        // For Base64, create a download link
                        // For actual file hosting, this would be a direct link to the file
                        const fileName = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.zip'; // Example file name
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

                    // Add to admin list for management
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
                });
                addProjectEventListeners(); // Attach event listeners after rendering
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load projects. Please check the server logs and Firebase setup.</p>';
        }
    }

    // Attach event listeners for project cards (edit/delete buttons)
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

    // Handle project upload form submission (via backend API)
    if (projectUploadForm) {
        projectUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('project-title').value;
            const description = document.getElementById('project-description').value;
            const imageUrl = document.getElementById('project-image').value; // Now URL
            const projectFile = document.getElementById('project-link').files[0]; // Now File

            let fileUrl = '';
            if (projectFile) {
                fileUrl = await encodeFileToBase64(projectFile); // Convert file to Base64
            }

            const newProjectData = { title, description, imageUrl, fileUrl }; // Use fileUrl for the project file

            try {
                const response = await fetch('/api/projects', { // POST request to your server.js API
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProjectData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                showMessage('Project added successfully!', 'info');
                projectUploadForm.reset(); // Clear the form
                renderProjects(); // Re-render all projects from backend
            } catch (error) {
                console.error('Error adding project:', error);
                showMessage('Failed to add project. See console for details.', 'error');
            }
        });
    }

    // Function to delete a project via backend API
    async function deleteProject(projectId) {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE' // DELETE request to backend
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            showMessage('Project deleted successfully!', 'info');
            renderProjects(); // Re-render all projects after deletion
        } catch (error) {
            console.error('Error deleting project:', error);
            showMessage('Failed to delete project. See console for details.', 'error');
        }
    }

    // Project Edit Modal Logic
    function openProjectModal(projectId = null) {
        currentEditingProjectId = projectId; // Set the ID of the project being edited
        if (editProjectModal) {
            editProjectModal.classList.remove('hidden');
            editProjectModal.classList.add('flex'); // Show modal

            if (projectId === null) { // New Project (though this modal is primarily for editing)
                if (projectModalTitle) projectModalTitle.textContent = 'Add New Project';
                if (projectModalForm) projectModalForm.reset();
                if (deleteProjectModalBtn) deleteProjectModalBtn.classList.add('hidden');
            } else { // Edit existing project
                if (projectModalTitle) projectModalTitle.textContent = 'Edit Project';
                // Fetch project data to pre-fill the form fields
                fetch(`/api/projects/${projectId}`)
                    .then(res => res.json())
                    .then(project => {
                        if (modalProjectTitle) modalProjectTitle.value = project.title;
                        if (modalProjectDescription) modalProjectDescription.value = project.description;
                        if (modalProjectImageInput) modalProjectImageInput.value = project.imageUrl || ''; // Pre-fill image URL
                        // modalProjectLinkInput (file input) cannot be pre-filled for security.
                    })
                    .catch(error => {
                        console.error('Error fetching project for edit:', error);
                        showMessage('Failed to load project details for editing.', 'error');
                    });
                if (deleteProjectModalBtn) deleteProjectModalBtn.classList.remove('hidden');
            }
        }
    }

    // Close project edit modal
    if (closeProjectModalBtn) {
        closeProjectModalBtn.addEventListener('click', () => {
            if (editProjectModal) {
                editProjectModal.classList.add('hidden');
                editProjectModal.classList.remove('flex');
            }
        });
    }
    if (cancelProjectModalBtn) {
        cancelProjectModalBtn.addEventListener('click', () => {
            if (editProjectModal) {
                editProjectModal.classList.add('hidden');
                editProjectModal.classList.remove('flex');
            }
        });
    }

    // Handle project edit form submission (via backend API)
    if (projectModalForm) {
        projectModalForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = modalProjectTitle.value;
            const description = modalProjectDescription.value;
            const imageUrl = modalProjectImageInput.value; // Now URL
            const projectFile = modalProjectLinkInput.files[0]; // Now File

            let fileUrl = '';
            // If editing, try to get existing file URL if no new file is uploaded
            if (currentEditingProjectId) {
                try {
                    const existingProjectResponse = await fetch(`/api/projects/${currentEditingProjectId}`);
                    const existingProject = await existingProjectResponse.json();
                    fileUrl = existingProject.fileUrl || ''; // Keep existing file URL if not changed
                } catch (error) {
                    console.error('Error fetching existing project for file URL:', error);
                }
            }

            if (projectFile) {
                fileUrl = await encodeFileToBase64(projectFile); // New file uploaded
            }

            const updatedProjectData = {
                title,
                description,
                imageUrl,
                fileUrl // Use fileUrl for the project file
            };

            try {
                let response;
                if (currentEditingProjectId) { // Update existing project
                    response = await fetch(`/api/projects/${currentEditingProjectId}`, {
                        method: 'PUT', // PUT request to update
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedProjectData)
                    });
                } else { // Add new project (should ideally be handled by the main upload form)
                    response = await fetch('/api/projects', {
                        method: 'POST', // POST request to add
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedProjectData)
                    });
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                showMessage('Project saved successfully!', 'info');
                if (editProjectModal) {
                    editProjectModal.classList.add('hidden');
                    editProjectModal.classList.remove('flex');
                }
                renderProjects(); // Re-render all projects to show changes
            } catch (error) {
                console.error('Error saving project:', error);
                showMessage('Failed to save project. See console for details.', 'error');
            }
        });
    }

    // Handle delete button within the project edit modal
    if (deleteProjectModalBtn) {
        deleteProjectModalBtn.addEventListener('click', () => {
            if (currentEditingProjectId) {
                showMessage('Are you sure you want to delete this project?', 'confirm', async (confirmed) => {
                    if (confirmed) {
                        await deleteProject(currentEditingProjectId);
                        if (editProjectModal) {
                            editProjectModal.classList.add('hidden');
                            editProjectModal.classList.remove('flex');
                        }
                    }
                });
            }
        });
    }

    // Helper function to convert file to base64 (for file uploads)
    function encodeFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // --- Dynamic Blog Posts Section (Fetch from Backend) ---
    const blogUploadForm = document.getElementById('blog-upload-form');
    const adminBlogList = document.getElementById('admin-blog-list');
    const blogPostsContainer = document.getElementById('blog-posts-container'); // Public container for blogs

    // Function to fetch and render blog posts from the backend
    async function renderBlogPosts() {
        if (!adminBlogList) return; // Only proceed if admin blog list exists

        adminBlogList.innerHTML = ''; // Clear admin list
        if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading blog posts...</p>';

        try {
            const response = await fetch('/api/blogs'); // GET request to backend
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blogPosts = await response.json();

            if (blogPostsContainer) blogPostsContainer.innerHTML = ''; // Clear loading message

            if (blogPosts.length === 0) {
                if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts added yet.</p>';
            } else {
                blogPosts.forEach(blog => {
                    // Render to public blog section
                    if (blogPostsContainer) {
                        const blogCard = `
                            <div class="bg-white rounded-lg shadow-md overflow-hidden p-6">
                                ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="w-full h-48 object-cover mb-4 rounded-md">` : ''}
                                <h3 class="text-xl font-bold text-gray-900 mb-2">${blog.title}</h3>
                                <p class="text-gray-600 text-sm mb-2">${blog.date} | ${blog.category}</p>
                                <p class="text-gray-700 mb-4">${blog.excerpt}</p>
                                ${blog.link ? `<a href="${blog.link}" target="_blank" class="text-[#00acc1] hover:underline">Read More</a>` : ''}
                            </div>
                        `;
                        blogPostsContainer.insertAdjacentHTML('beforeend', blogCard);
                    }

                    // Add to admin list for management
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
                });
                addBlogEventListeners(); // Attach event listeners
            }
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            if (blogPostsContainer) blogPostsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load blog posts. Please check the server logs and Firebase setup.</p>';
        }
    }

    // Attach event listeners for blog buttons in admin panel
    function addBlogEventListeners() {
        document.querySelectorAll('.edit-blog-btn-admin').forEach(button => {
            button.addEventListener('click', (e) => {
                const blogId = e.target.dataset.id;
                openBlogModal(blogId);
            });
        });

        document.querySelectorAll('.delete-blog-btn-admin').forEach(button => {
            button.addEventListener('click', (e) => {
                const blogId = e.target.dataset.id;
                showMessage('Are you sure you want to delete this blog post?', 'confirm', async (confirmed) => {
                    if (confirmed) {
                        await deleteBlog(blogId);
                    }
                });
            });
        });
    }

    // Handle blog post upload form submission
    if (blogUploadForm) {
        blogUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('blog-title').value;
            const date = document.getElementById('blog-date').value;
            const category = document.getElementById('blog-category').value;
            const excerpt = document.getElementById('blog-excerpt').value;
            const imageUrl = document.getElementById('blog-image').value; // Now URL
            const link = document.getElementById('blog-link').value;

            if (!title || !date || !category || !excerpt) {
                showMessage('Please fill in all required blog post fields (Title, Date, Category, Excerpt).', 'error');
                return;
            }

            const newBlogData = { title, date, category, excerpt, imageUrl, link }; // Use imageUrl

            try {
                const response = await fetch('/api/blogs', { // POST request to backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBlogData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                showMessage('Blog post added successfully!', 'info');
                blogUploadForm.reset();
                renderBlogPosts(); // Re-render all blog posts
            } catch (error) {
                console.error('Error adding blog post:', error);
                showMessage('Failed to add blog post. See console for details.', 'error');
            }
        });
    }

    // Function to delete a blog post via backend API
    async function deleteBlog(blogId) {
        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                method: 'DELETE' // DELETE request to backend
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            showMessage('Blog post deleted successfully!', 'info');
            renderBlogPosts(); // Re-render all blog posts
        } catch (error) {
            console.error('Error deleting blog post:', error);
            showMessage('Failed to delete blog post. See console for details.', 'error');
        }
    }

    // Blog Edit Modal Logic (similar to project modal)
    const editBlogModal = document.getElementById('edit-blog-modal'); // Assuming a blog edit modal
    const closeBlogModalBtn = document.getElementById('close-edit-blog-modal');
    const blogModalTitle = document.getElementById('blog-modal-title');
    const blogModalForm = document.getElementById('edit-blog-form');
    const modalBlogTitle = document.getElementById('modal-blog-title');
    const modalBlogDate = document.getElementById('modal-blog-date');
    const modalBlogCategory = document.getElementById('modal-blog-category');
    const modalBlogExcerpt = document.getElementById('modal-blog-excerpt');
    const modalBlogImage = document.getElementById('modal-blog-image'); // Now URL
    const modalBlogLink = document.getElementById('modal-blog-link');
    const deleteBlogModalBtn = document.getElementById('delete-blog-modal-btn');
    const cancelBlogModalBtn = document.getElementById('cancel-blog-modal-btn');

    let currentEditingBlogId = null;

    function openBlogModal(blogId = null) {
        currentEditingBlogId = blogId;
        if (editBlogModal) {
            editBlogModal.classList.remove('hidden');
            editBlogModal.classList.add('flex');

            if (blogId === null) { // New Blog
                if (blogModalTitle) blogModalTitle.textContent = 'Add New Blog Post';
                if (blogModalForm) blogModalForm.reset();
                if (deleteBlogModalBtn) deleteBlogModalBtn.classList.add('hidden');
            } else { // Edit existing blog
                if (blogModalTitle) blogModalTitle.textContent = 'Edit Blog Post';
                fetch(`/api/blogs/${blogId}`)
                    .then(res => res.json())
                    .then(blog => {
                        if (modalBlogTitle) modalBlogTitle.value = blog.title;
                        if (modalBlogDate) modalBlogDate.value = blog.date;
                        if (modalBlogCategory) modalBlogCategory.value = blog.category;
                        if (modalBlogExcerpt) modalBlogExcerpt.value = blog.excerpt;
                        if (modalBlogImage) modalBlogImage.value = blog.imageUrl || ''; // Pre-fill image URL
                        if (modalBlogLink) modalBlogLink.value = blog.link;
                    })
                    .catch(error => {
                        console.error('Error fetching blog for edit:', error);
                        showMessage('Failed to load blog post details for editing.', 'error');
                    });
                if (deleteBlogModalBtn) deleteBlogModalBtn.classList.remove('hidden');
            }
        }
    }

    if (closeBlogModalBtn) {
        closeBlogModalBtn.addEventListener('click', () => {
            if (editBlogModal) {
                editBlogModal.classList.add('hidden');
                editBlogModal.classList.remove('flex');
            }
        });
    }
    if (cancelBlogModalBtn) {
        cancelBlogModalBtn.addEventListener('click', () => {
            if (editBlogModal) {
                editBlogModal.classList.add('hidden');
                editBlogModal.classList.remove('flex');
            }
        });
    }

    if (blogModalForm) {
        blogModalForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = modalBlogTitle.value;
            const date = modalBlogDate.value;
            const category = modalBlogCategory.value;
            const excerpt = modalBlogExcerpt.value;
            const imageUrl = modalBlogImage.value; // Now URL
            const link = modalBlogLink.value;

            const updatedBlogData = { title, date, category, excerpt, imageUrl, link }; // Use imageUrl

            try {
                let response;
                if (currentEditingBlogId) { // Update existing
                    response = await fetch(`/api/blogs/${currentEditingBlogId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBlogData)
                    });
                } else { // Add new (should ideally be handled by the main upload form)
                    response = await fetch('/api/blogs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBlogData)
                    });
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                showMessage('Blog post saved successfully!', 'info');
                if (editBlogModal) {
                    editBlogModal.classList.add('hidden');
                    editBlogModal.classList.remove('flex');
                }
                renderBlogPosts();
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
                        if (editBlogModal) {
                            editBlogModal.classList.add('hidden');
                            editBlogModal.classList.remove('flex');
                        }
                    }
                });
            }
        });
    }


    // --- Dynamic Team Members Section (Fetch from Backend) ---
    const teamContainer = document.getElementById('team-container');
    const addEditTeamBtn = document.getElementById('add-edit-team-btn');
    const editTeamModal = document.getElementById('edit-team-modal');
    const closeEditTeamModal = document.getElementById('close-edit-team-modal');
    const teamModalTitle = document.getElementById('team-modal-title');
    const editTeamForm = document.getElementById('edit-team-form');
    const memberNameInput = document.getElementById('member-name');
    const memberTitleInput = document.getElementById('member-title');
    const memberBioInput = document.getElementById('member-bio');
    const memberImageInput = document.getElementById('member-image'); // Now URL
    const addTeamMemberForm = document.getElementById('add-team-member-form'); // New form for adding
    const newMemberNameInput = document.getElementById('new-member-name');
    const newMemberTitleInput = document.getElementById('new-member-title');
    const newMemberBioInput = document.getElementById('new-member-bio');
    const newMemberImageInput = document.getElementById('new-member-image'); // Now URL
    const deleteMemberBtn = document.getElementById('delete-member-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const adminTeamList = document.getElementById('admin-team-list'); // List within admin panel

    let currentEditingMemberId = null;

    // Function to fetch and render team members from the backend
    async function renderTeamMembers() {
        if (!teamContainer) return;

        teamContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading team members...</p>';
        if (adminTeamList) adminTeamList.innerHTML = ''; // Clear admin list

        try {
            const response = await fetch('/api/team'); // GET request to backend
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const teamMembers = await response.json();

            teamContainer.innerHTML = ''; // Clear loading message

            if (teamMembers.length === 0) {
                teamContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members added yet. Click "Add Team Member" to get started!</p>';
            } else {
                teamMembers.forEach(member => {
                    const memberCard = document.createElement('div');
                    memberCard.className = 'bg-white rounded-lg shadow-lg overflow-hidden team-member-card transform transition duration-300 hover:scale-105';
                    memberCard.dataset.id = member.id;

                    // Use uploaded image or a placeholder
                    const imageUrl = member.imageUrl || 'https://placehold.co/150x150/cccccc/333333?text=No+Image';

                    memberCard.innerHTML = `
                        <img src="${imageUrl}" alt="${member.name}" class="w-full h-48 object-cover object-center">
                        <div class="p-6 text-center">
                            <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                            <p class="text-[#00acc1] text-md mb-3">${member.title}</p>
                            <p class="text-gray-600 text-sm mb-4">${member.bio || ''}</p>
                            <button class="edit-member-btn bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full" data-id="${member.id}">Edit</button>
                        </div>
                    `;
                    teamContainer.appendChild(memberCard);

                    // Add to admin list for management
                    if (adminTeamList) {
                        const adminListItem = document.createElement('div');
                        adminListItem.className = 'admin-list-item';
                        adminListItem.dataset.id = member.id;
                        adminListItem.innerHTML = `
                            <span>${member.name}</span>
                            <div>
                                <button data-id="${member.id}" class="edit-member-btn-admin bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-full mr-1">Edit</button>
                                <button data-id="${member.id}" class="delete-member-btn-admin bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-full">Delete</button>
                            </div>
                        `;
                        adminTeamList.appendChild(adminListItem);
                    }
                });
                addTeamMemberEventListeners(); // Attach event listeners
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            teamContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load team members. Please check the server logs and Firebase setup.</p>';
        }
    }

    // Attach event listeners for team member cards/buttons
    function addTeamMemberEventListeners() {
        document.querySelectorAll('.edit-member-btn, .edit-member-btn-admin').forEach(button => {
            button.addEventListener('click', (e) => {
                const memberId = e.target.dataset.id;
                openTeamModal(memberId);
            });
        });

        if (adminTeamList) {
            document.querySelectorAll('.delete-member-btn-admin').forEach(button => {
                button.addEventListener('click', (e) => {
                    const memberId = e.target.dataset.id;
                    showMessage('Are you sure you want to delete this team member?', 'confirm', async (confirmed) => {
                        if (confirmed) {
                            await deleteTeamMember(memberId);
                        }
                    });
                });
            });
        }
    }

    // Handle add new team member form submission
    if (addTeamMemberForm) {
        addTeamMemberForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = newMemberNameInput.value;
            const title = newMemberTitleInput.value;
            const bio = newMemberBioInput.value;
            const imageUrl = newMemberImageInput.value; // Now URL

            if (!name || !title) {
                showMessage('Please fill in Name and Title for the new team member.', 'error');
                return;
            }

            const newMemberData = { name, title, bio, imageUrl };

            try {
                const response = await fetch('/api/team', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMemberData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                showMessage('Team member added successfully!', 'info');
                addTeamMemberForm.reset();
                renderTeamMembers();
            } catch (error) {
                console.error('Error adding team member:', error);
                showMessage('Failed to add team member. See console for details.', 'error');
            }
        });
    }

    // Open/Close Team Member Modal
    if (addEditTeamBtn) {
        addEditTeamBtn.addEventListener('click', () => openTeamModal());
    }

    if (closeEditTeamModal) {
        closeEditTeamModal.addEventListener('click', () => {
            if (editTeamModal) {
                editTeamModal.classList.add('hidden');
                editTeamModal.classList.remove('flex');
            }
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (editTeamModal) {
                editTeamModal.classList.add('hidden');
                editTeamModal.classList.remove('flex');
            }
        });
    }

    function openTeamModal(memberId = null) {
        currentEditingMemberId = memberId;
        if (editTeamModal) {
            editTeamModal.classList.remove('hidden');
            editTeamModal.classList.add('flex');

            if (memberId === null) { // Add new member
                if (teamModalTitle) teamModalTitle.textContent = 'Add New Team Member';
                if (editTeamForm) editTeamForm.reset();
                if (deleteMemberBtn) deleteMemberBtn.classList.add('hidden');
            } else { // Edit existing member
                if (teamModalTitle) teamModalTitle.textContent = 'Edit Team Member';
                fetch(`/api/team/${memberId}`)
                    .then(res => res.json())
                    .then(member => {
                        if (memberNameInput) memberNameInput.value = member.name;
                        if (memberTitleInput) memberTitleInput.value = member.title;
                        if (memberBioInput) memberBioInput.value = member.bio || ''; // Handle potential undefined bio
                        if (memberImageInput) memberImageInput.value = member.imageUrl || ''; // Pre-fill image URL
                    })
                    .catch(error => {
                        console.error('Error fetching team member for edit:', error);
                        showMessage('Failed to load team member details for editing.', 'error');
                    });
                if (deleteMemberBtn) deleteMemberBtn.classList.remove('hidden');
            }
        }
    }

    // Handle team member form submission (Add/Edit)
    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = memberNameInput.value;
            const title = memberTitleInput.value;
            const bio = memberBioInput.value;
            const imageUrl = memberImageInput.value; // Now URL

            const memberData = { name, title, bio, imageUrl };

            try {
                let response;
                if (currentEditingMemberId) { // Update existing
                    response = await fetch(`/api/team/${currentEditingMemberId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(memberData)
                    });
                } else { // This path is for adding new via the modal, but main form is preferred
                    response = await fetch('/api/team', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(memberData)
                    });
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                showMessage('Team member saved successfully!', 'info');
                if (editTeamModal) {
                    editTeamModal.classList.add('hidden');
                    editTeamModal.classList.remove('flex');
                }
                renderTeamMembers(); // Re-render all team members
            } catch (error) {
                console.error('Error saving team member:', error);
                showMessage('Failed to save team member. See console for details.', 'error');
            }
        });
    }

    // Handle team member deletion from modal
    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', () => {
            if (currentEditingMemberId) {
                showMessage('Are you sure you want to delete this team member?', 'confirm', async (confirmed) => {
                    if (confirmed) {
                        await deleteTeamMember(currentEditingMemberId);
                        if (editTeamModal) {
                            editTeamModal.classList.add('hidden');
                            editTeamModal.classList.remove('flex');
                        }
                    }
                });
            }
        });
    }

    // Function to delete a team member via backend API
    async function deleteTeamMember(memberId) {
        try {
            const response = await fetch(`/api/team/${memberId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            showMessage('Team member deleted successfully!', 'info');
            renderTeamMembers(); // Re-render all team members
        } catch (error) {
            console.error('Error deleting team member:', error);
            showMessage('Failed to delete team member. See console for details.', 'error');
        }
    }


    // --- Initial renders on page load ---
    // These functions are called once the DOM is ready to load existing data
    renderProjects();
    renderBlogPosts();
    renderTeamMembers();

}); // End DOMContentLoaded
