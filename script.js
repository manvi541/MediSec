document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
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
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Intersection Observer for scroll animations (fade-in, slide-up, etc.)
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-slide-left, .animate-zoom-in, .stat-animate, .animate-pulse-slow');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Section title shadow animation on scroll
    const sectionTitles = document.querySelectorAll('.section-title-shadow');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-title-in-view');
            } else {
                entry.target.classList.remove('section-title-in-view');
            }
        });
    }, { threshold: 0.5 }); // Adjust threshold as needed

    sectionTitles.forEach(title => {
        titleObserver.observe(title);
    });


    // Statistics counter animation
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
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(step);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.7 }); // Trigger when 70% of element is visible

        statObserver.observe(element);
    }

    animateCountUp('stat1', 93);
    animateCountUp('stat2', 10);
    animateCountUp('stat3', 300);

    // Dynamic Projects/Blogs Section
    const projectsContainer = document.getElementById('projects-container');
    const projectUploadForm = document.getElementById('project-upload-form');

    // Load projects from localStorage (or an empty array if none)
    // Using 'mediSecProjects' for consistency.
    let projects = JSON.parse(localStorage.getItem('mediSecProjects')) || [];

    function saveProjects() {
        localStorage.setItem('mediSecProjects', JSON.stringify(projects));
    }

    function renderProjects() {
        if (!projectsContainer) return;

        projectsContainer.innerHTML = ''; // Clear existing content

        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects or blogs added yet. Upload one to get started!</p>';
            return;
        }

        projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 project-card';
            projectCard.dataset.index = index; // Store index for editing/deleting

            let imageHtml = project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover">` : '';
            let linkHtml = project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 bg-[#00acc1] hover:bg-[#7a97ab] text-white text-sm font-semibold py-2 px-4 rounded-full transition duration-300">View Project <i class="fas fa-external-link-alt ml-1"></i></a>` : '';

            projectCard.innerHTML = `
                ${imageHtml}
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${project.description}</p>
                    ${linkHtml}
                    <div class="mt-4 flex space-x-2">
                        <button class="edit-project-btn bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full" data-index="${index}">Edit</button>
                        <button class="delete-project-btn bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-full" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });

        addProjectEventListeners();
    }

    function addProjectEventListeners() {
        document.querySelectorAll('.edit-project-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                openProjectModal(index);
            });
        });

        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (confirm('Are you sure you want to delete this project?')) {
                    projects.splice(index, 1);
                    saveProjects();
                    renderProjects();
                }
            });
        });
    }

    // Project Upload/Edit Modal Logic
    const editProjectModal = document.getElementById('edit-project-modal');
    const closeProjectModalBtn = document.getElementById('close-edit-project-modal');
    const projectModalTitle = document.getElementById('project-modal-title');
    const projectModalForm = document.getElementById('edit-project-form'); // This is the form within the modal for editing
    const modalProjectTitle = document.getElementById('modal-project-title');
    const modalProjectDescription = document.getElementById('modal-project-description');
    const modalProjectImageInput = document.getElementById('modal-project-image');
    const modalProjectLink = document.getElementById('modal-project-link');
    const deleteProjectModalBtn = document.getElementById('delete-project-modal-btn');
    const cancelProjectModalBtn = document.getElementById('cancel-project-modal-btn');

    let currentProjectIndex = -1; // -1 for new project, otherwise index of project being edited

    if (projectUploadForm) { // This is the initial upload form outside the modal
        projectUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('project-title').value;
            const description = document.getElementById('project-description').value;
            const imageFile = document.getElementById('project-image').files[0];
            const link = document.getElementById('project-link').value;

            let imageUrl = '';
            if (imageFile) {
                imageUrl = await encodeFileToBase64(imageFile);
            }

            const newProject = {
                title,
                description,
                imageUrl,
                link
            };

            projects.push(newProject);
            saveProjects();
            renderProjects();
            projectUploadForm.reset();
        });
    }

    function openProjectModal(index = -1) {
        currentProjectIndex = index;
        if (editProjectModal) {
            editProjectModal.classList.remove('hidden');
        }


        if (index === -1) { // New Project
            if (projectModalTitle) projectModalTitle.textContent = 'Add New Project';
            if (projectModalForm) projectModalForm.reset();
            if (deleteProjectModalBtn) deleteProjectModalBtn.classList.add('hidden');
        } else { // Edit existing project
            if (projectModalTitle) projectModalTitle.textContent = 'Edit Project';
            const project = projects[index];
            if (modalProjectTitle) modalProjectTitle.value = project.title;
            if (modalProjectDescription) modalProjectDescription.value = project.description;
            if (modalProjectLink) modalProjectLink.value = project.link;
            // Image input is not pre-filled for security reasons, user has to re-upload if they want to change it
            if (deleteProjectModalBtn) deleteProjectModalBtn.classList.remove('hidden');
        }
    }

    if (closeProjectModalBtn) {
        closeProjectModalBtn.addEventListener('click', () => {
            if (editProjectModal) {
                editProjectModal.classList.add('hidden');
            }
        });
    }
    if (cancelProjectModalBtn) {
        cancelProjectModalBtn.addEventListener('click', () => {
            if (editProjectModal) {
                editProjectModal.classList.add('hidden');
            }
        });
    }

    if (projectModalForm) {
        projectModalForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = modalProjectTitle.value;
            const description = modalProjectDescription.value;
            const imageFile = modalProjectImageInput.files[0];
            const link = modalProjectLink.value;

            let imageUrl = projects[currentProjectIndex] ? projects[currentProjectIndex].imageUrl : ''; // Keep existing image if not changed
            if (imageFile) {
                imageUrl = await encodeFileToBase64(imageFile);
            }

            const updatedProject = {
                title,
                description,
                imageUrl,
                link
            };

            if (currentProjectIndex === -1) { // Add new
                projects.push(updatedProject);
            } else { // Update existing
                projects[currentProjectIndex] = updatedProject;
            }

            saveProjects();
            renderProjects();
            if (editProjectModal) {
                editProjectModal.classList.add('hidden');
            }
        });
    }

    if (deleteProjectModalBtn) {
        deleteProjectModalBtn.addEventListener('click', () => {
            if (currentProjectIndex !== -1 && confirm('Are you sure you want to delete this project?')) {
                projects.splice(currentProjectIndex, 1);
                saveProjects();
                renderProjects();
                if (editProjectModal) {
                    editProjectModal.classList.add('hidden');
                }
            }
        });
    }

    // Helper to convert file to base64
    function encodeFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Initial render of projects on page load
    renderProjects();


    // Dynamic Team Section
    const teamContainer = document.getElementById('team-container');
    const addEditTeamBtn = document.getElementById('add-edit-team-btn'); // This button likely triggers the add/edit modal
    const editTeamModal = document.getElementById('edit-team-modal');
    const closeEditTeamModal = document.getElementById('close-edit-team-modal');
    const teamModalTitle = document.getElementById('team-modal-title');
    const editTeamForm = document.getElementById('edit-team-form');
    const memberNameInput = document.getElementById('member-name');
    const memberTitleInput = document.getElementById('member-title');
    const memberBioInput = document.getElementById('member-bio');
    const memberImageInput = document.getElementById('member-image');
    const deleteMemberBtn = document.getElementById('delete-member-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    let teamMembers = JSON.parse(localStorage.getItem('mediSecTeam')) || [];
    let currentMemberIndex = -1; // -1 for new member, otherwise index of member being edited

    function saveTeamMembers() {
        localStorage.setItem('mediSecTeam', JSON.stringify(teamMembers));
    }

    function renderTeamMembers() {
        if (!teamContainer) return;

        teamContainer.innerHTML = ''; // Clear existing content

        if (teamMembers.length === 0) {
            teamContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No team members added yet. Click "Add Team Member" to get started!</p>';
            return;
        }

        teamMembers.forEach((member, index) => {
            const memberCard = document.createElement('div');
            memberCard.className = 'bg-white rounded-lg shadow-lg overflow-hidden team-member-card transform transition duration-300 hover:scale-105';
            memberCard.dataset.index = index; // Store index for editing/deleting

            const imageUrl = member.imageUrl || 'https://via.placeholder.com/150'; // Default image if none uploaded

            memberCard.innerHTML = `
                <img src="${imageUrl}" alt="${member.name}" class="w-full h-48 object-cover object-center">
                <div class="p-6 text-center">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
                    <p class="text-[#00acc1] text-md mb-3">${member.title}</p>
                    <p class="text-gray-600 text-sm mb-4">${member.bio}</p>
                    <button class="edit-member-btn bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full" data-index="${index}">Edit</button>
                </div>
            `;
            teamContainer.appendChild(memberCard);
        });

        addTeamMemberEventListeners();
    }

    function addTeamMemberEventListeners() {
        document.querySelectorAll('.edit-member-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                openTeamModal(index);
            });
        });
    }

    if (addEditTeamBtn) {
        addEditTeamBtn.addEventListener('click', () => openTeamModal());
    }

    if (closeEditTeamModal) {
        closeEditTeamModal.addEventListener('click', () => {
            if (editTeamModal) {
                editTeamModal.classList.add('hidden');
            }
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (editTeamModal) {
                editTeamModal.classList.add('hidden');
            }
        });
    }

    function openTeamModal(index = -1) {
        currentMemberIndex = index;
        if (editTeamModal) {
            editTeamModal.classList.remove('hidden');
        }

        if (index === -1) { // Add new member
            if (teamModalTitle) teamModalTitle.textContent = 'Add New Team Member';
            if (editTeamForm) editTeamForm.reset();
            if (deleteMemberBtn) deleteMemberBtn.classList.add('hidden');
        } else { // Edit existing member
            if (teamModalTitle) teamModalTitle.textContent = 'Edit Team Member';
            const member = teamMembers[index];
            if (memberNameInput) memberNameInput.value = member.name;
            if (memberTitleInput) memberTitleInput.value = member.title;
            if (memberBioInput) memberBioInput.value = member.bio;
            // Image input is not pre-filled for security reasons, user has to re-upload if they want to change it
            if (deleteMemberBtn) deleteMemberBtn.classList.remove('hidden');
        }
    }

    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = memberNameInput.value;
            const title = memberTitleInput.value;
            const bio = memberBioInput.value;
            const imageFile = memberImageInput.files[0];

            let imageUrl = teamMembers[currentMemberIndex] ? teamMembers[currentMemberIndex].imageUrl : ''; // Keep existing image if not changed
            if (imageFile) {
                imageUrl = await encodeFileToBase64(imageFile);
            }

            const updatedMember = {
                name,
                title,
                bio,
                imageUrl
            };

            if (currentMemberIndex === -1) { // Add new
                teamMembers.push(updatedMember);
            } else { // Update existing
                teamMembers[currentMemberIndex] = updatedMember;
            }

            saveTeamMembers();
            renderTeamMembers();
            if (editTeamModal) {
                editTeamModal.classList.add('hidden');
            }
        });
    }

    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', () => {
            if (currentMemberIndex !== -1 && confirm('Are you sure you want to delete this team member?')) {
                teamMembers.splice(currentMemberIndex, 1);
                saveTeamMembers();
                renderTeamMembers();
                if (editTeamModal) {
                    editTeamModal.classList.add('hidden');
                }
            }
        });
    }

    // Initial render of team members on page load
    renderTeamMembers();

});