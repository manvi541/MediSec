document.addEventListener('DOMContentLoaded', () => {
    // UI Selectors
    const adminPanel = document.getElementById('admin-panel');
    const adminToggle = document.getElementById('admin-toggle');
    const closeAdmin = document.getElementById('close-admin');

    // Toggle Panel
    if (adminToggle) {
        adminToggle.onclick = () => {
            adminPanel.style.display = 'block';
            setTimeout(() => adminPanel.classList.remove('translate-x-full'), 10);
            renderAll();
        };
    }
    if (closeAdmin) {
        closeAdmin.onclick = () => {
            adminPanel.classList.add('translate-x-full');
            setTimeout(() => adminPanel.style.display = 'none', 300);
        };
    }

    const renderAll = () => {
        renderTeam();
        renderProjects();
    };

    // --- TEAM LOGIC ---
    async function renderTeam() {
        const res = await fetch('/api/team');
        const team = await res.json();
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');

        if (container) container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        team.forEach(m => {
            if (container) {
                container.insertAdjacentHTML('beforeend', `
                    <div class="bg-white rounded-lg shadow-lg p-6 text-center border-t-4 border-[#00acc1]">
                        <img src="${m.image}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" onerror="this.src='https://via.placeholder.com/150'">
                        <h3 class="text-xl font-bold">${m.name}</h3>
                        <p class="text-[#00acc1] font-medium">${m.title}</p>
                    </div>
                `);
            }
            if (adminList) {
                adminList.insertAdjacentHTML('beforeend', `
                    <div class="flex justify-between items-center p-2 bg-gray-50 border rounded">
                        <span class="text-xs font-bold truncate w-32">${m.name}</span>
                        <button onclick="deleteItem('team', '${m.id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                    </div>
                `);
            }
        });
    }

    // --- PROJECT LOGIC ---
    async function renderProjects() {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        const container = document.getElementById('projects-container');
        const adminList = document.getElementById('admin-project-list');

        if (container) container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        projects.forEach(p => {
            if (container) {
                container.insertAdjacentHTML('beforeend', `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                        <img src="${p.image}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200'">
                        <div class="p-4">
                            <h3 class="font-bold text-lg text-gray-900">${p.title}</h3>
                            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${p.description}</p>
                            <a href="${p.link}" target="_blank" class="text-[#00acc1] font-bold text-sm hover:underline">View Details →</a>
                        </div>
                    </div>
                `);
            }
            if (adminList) {
                adminList.insertAdjacentHTML('beforeend', `
                    <div class="flex justify-between items-center p-2 bg-gray-50 border rounded">
                        <span class="text-xs font-bold truncate w-32">${p.title}</span>
                        <button onclick="deleteItem('projects', '${p.id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                    </div>
                `);
            }
        });
    }

    // --- FORM HANDLING (NO REFRESH) ---
    const teamForm = document.getElementById('team-upload-form');
    if (teamForm) {
        teamForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('member-name-input').value,
                title: document.getElementById('member-title-input').value,
                bio: document.getElementById('member-bio-input').value,
                image: document.getElementById('member-image-url-input').value
            };
            await fetch('/api/team', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            alert("Member Saved!");
            teamForm.reset();
            renderTeam();
        };
    }

    const projectForm = document.getElementById('project-upload-form');
    if (projectForm) {
        projectForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                title: document.getElementById('project-title-input').value,
                description: document.getElementById('project-desc-input').value,
                image: document.getElementById('project-image-url-input').value,
                link: document.getElementById('project-link-input').value
            };
            await fetch('/api/projects', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            alert("Project Saved!");
            projectForm.reset();
            renderProjects();
        };
    }

    renderAll();
});

// Global Delete
window.deleteItem = async (type, id) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
        location.reload();
    }
};
