document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CORE API UTILITIES ---
    // Uses JSON instead of FormData to bypass Storage billing issues
    const fetchData = async (endpoint) => {
        try {
            const response = await fetch(`/api/${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return [];
        }
    };

    const sendData = async (method, endpoint, data) => {
        const response = await fetch(`/api/${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Action failed');
        return await response.json();
    };

    // --- 2. ADMIN PANEL TOGGLE ---
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) {
        adminToggle.addEventListener('click', () => adminPanel.classList.add('open'));
    }
    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => adminPanel.classList.remove('open'));
    }

    // --- 3. TEAM MEMBER LOGIC (URL BASED) ---
    const renderTeam = async () => {
        const team = await fetchData('team');
        const container = document.getElementById('team-container');
        if (!container) return;
        container.innerHTML = '';

        team.forEach(member => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center card-hover">
                    <img src="${member.image}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]" 
                         onerror="this.src='https://via.placeholder.com/150'">
                    <h3 class="text-xl font-bold text-gray-900">${member.name}</h3>
                    <p class="text-[#00acc1] font-medium">${member.title}</p>
                    <p class="text-gray-600 text-sm mt-2">${member.bio}</p>
                </div>
            `);
        });
    };

    const teamForm = document.getElementById('edit-team-form');
    if (teamForm) {
        teamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const memberData = {
                name: document.getElementById('member-name').value,
                title: document.getElementById('member-title').value,
                bio: document.getElementById('member-bio').value,
                image: document.getElementById('member-image-url-input').value // From the new text input
            };

            try {
                await sendData('POST', 'team', memberData);
                alert("Team member added successfully!");
                teamForm.reset();
                renderTeam();
            } catch (err) {
                alert("Error saving team member. Check Firestore rules.");
            }
        });
    }

    // --- 4. PROJECTS & BLOGS LOGIC ---
    const renderProjects = async () => {
        const projects = await fetchData('projects');
        const container = document.getElementById('projects-container');
        if (!container) return;
        container.innerHTML = '';

        projects.forEach(project => {
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="${project.image}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200'">
                    <div class="p-4">
                        <h3 class="font-bold text-lg">${project.title}</h3>
                        <p class="text-gray-600 text-sm">${project.description}</p>
                    </div>
                </div>
            `);
        });
    };

    // --- 5. EVENTS LOGIC ---
    const renderEvents = async () => {
        const events = await fetchData('events');
        const container = document.getElementById('events-container');
        if (!container) return;
        container.innerHTML = '';

        events.forEach(event => {
            container.insertAdjacentHTML('beforeend', `
                <div class="border-l-4 border-[#00acc1] bg-white p-4 shadow-sm">
                    <h4 class="font-bold">${event.name}</h4>
                    <p class="text-sm text-gray-500">${event.date}</p>
                    <p class="text-gray-700">${event.description}</p>
                </div>
            `);
        });
    };

    // --- 6. INITIALIZE EVERYTHING ---
    const init = () => {
        renderTeam();
        renderProjects();
        renderEvents();
    };

    init();
});
