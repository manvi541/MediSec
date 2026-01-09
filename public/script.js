document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // BASIC FETCH HELPERS
    // ===============================

    const fetchData = async (endpoint) => {
        try {
            const res = await fetch(`/api/${endpoint}`);
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (err) {
            console.error(`Fetch failed: ${endpoint}`, err);
            return [];
        }
    };

    const sendJsonData = async (method, endpoint, data) => {
        const res = await fetch(`/api/${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Request failed');
        return res.json();
    };

    const sendFormData = async (method, endpoint, formData) => {
        const res = await fetch(`/api/${endpoint}`, {
            method,
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    };

    const deleteData = async (endpoint, id) => {
        const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        return res.json();
    };

    // ===============================
    // TEAM RENDERING
    // ===============================

    async function renderTeamMembers() {
        const container = document.getElementById('team-container');
        const adminList = document.getElementById('admin-team-list');
        if (!container) return;

        const team = await fetchData('team');
        container.innerHTML = '';
        if (adminList) adminList.innerHTML = '';

        if (!team.length) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500">No team members yet.</p>`;
            return;
        }

        team.forEach(member => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                    <img src="${member.image || 'images/default-avatar.png'}"
                         class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold">${member.name}</h3>
                    <p class="text-[#00acc1]">${member.title}</p>
                    <p class="text-sm text-gray-600 mt-2">${member.bio || ''}</p>
                </div>
            `);

            if (adminList) {
                adminList.insertAdjacentHTML('beforeend', `
                    <div class="admin-list-item">
                        <span>${member.name}</span>
                        <button class="delete-team text-red-500" data-id="${member.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `);
            }
        });
    }

    // ===============================
    // ADD TEAM MEMBER
    // ===============================

    const teamForm = document.getElementById('add-team-member-form');
    if (teamForm) {
        teamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(teamForm);

            try {
                await sendFormData('POST', 'team', formData);
                teamForm.reset();
                renderTeamMembers();
                alert('Team member added!');
            } catch (err) {
                console.error(err);
                alert('Failed to add team member');
            }
        });
    }

    // ===============================
    // DELETE TEAM MEMBER (ADMIN)
    // ===============================

    const adminTeamList = document.getElementById('admin-team-list');
    if (adminTeamList) {
        adminTeamList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.delete-team');
            if (!btn) return;

            const id = btn.dataset.id;
            if (!confirm('Delete this team member?')) return;

            try {
                await deleteData('team', id);
                renderTeamMembers();
            } catch (err) {
                console.error(err);
                alert('Delete failed');
            }
        });
    }

    // ===============================
    // PROJECTS
    // ===============================

    async function renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const projects = await fetchData('projects');
        container.innerHTML = '';

        projects.forEach(p => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <img src="${p.image}" class="w-full h-48 object-cover mb-4">
                    <h3 class="text-xl font-bold">${p.title}</h3>
                    <p class="text-gray-600">${p.description}</p>
                </div>
            `);
        });
    }

    // ===============================
    // BLOGS
    // ===============================

    async function renderBlogs() {
        const container = document.getElementById('blog-posts-container');
        if (!container) return;

        const blogs = await fetchData('blogs');
        container.innerHTML = '';

        blogs.forEach(b => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold">${b.title}</h3>
                    <p class="text-gray-600">${b.excerpt}</p>
                </div>
            `);
        });
    }

    // ===============================
    // EVENTS
    // ===============================

    async function renderEvents() {
        const container = document.getElementById('events-container');
        if (!container) return;

        const events = await fetchData('events');
        container.innerHTML = '';

        events.forEach(evt => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold">${evt.title}</h3>
                    <p class="text-gray-600">${evt.description}</p>
                </div>
            `);
        });
    }

    // ===============================
    // INIT
    // ===============================

    renderTeamMembers();
    renderProjects();
    renderBlogs();
    renderEvents();
});
