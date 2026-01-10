// --- LOAD FUNCTIONS ---
async function loadAllData() {
    // 1. Load Team
    const teamRes = await fetch('/api/team');
    const teamMembers = await teamRes.json();
    const teamContainer = document.getElementById('team-container');
    if (teamContainer) {
        teamContainer.innerHTML = ''; // Wipe static Jane Doe
        teamMembers.forEach(m => {
            teamContainer.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center animate-zoom-in">
                    <img src="${m.image}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
                    <h3 class="text-xl font-bold">${m.name}</h3>
                    <p class="text-[#00acc1] font-medium">${m.title || m.role}</p>
                    <p class="mt-2 text-gray-600 text-sm">${m.bio || ''}</p>
                </div>`);
        });
    }

    // 2. Load Projects
    const projRes = await fetch('/api/projects');
    const projects = await projRes.json();
    const projGrid = document.getElementById('projects-grid');
    if (projGrid) {
        projGrid.innerHTML = ''; // Wipe static projects
        projects.forEach(p => {
            projGrid.insertAdjacentHTML('beforeend', `
                <div class="bg-white rounded-xl shadow-lg overflow-hidden animate-zoom-in">
                    <img src="${p.image}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2">${p.title}</h3>
                        <p class="text-gray-600 mb-4">${p.description}</p>
                        <a href="${p.link}" target="_blank" class="text-[#00acc1] font-bold">View Project →</a>
                    </div>
                </div>`);
        });
    }
}

// --- SUBMISSION FUNCTIONS ---
async function handleForm(e, endpoint) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(`/api/${endpoint}`, { method: 'POST', body: formData });
    if (res.ok) {
        e.target.reset();
        loadAllData(); // Refresh display immediately
        alert("Success! Data saved to Firebase.");
    }
}

// --- STARTUP ---
document.addEventListener('DOMContentLoaded', () => {
    loadAllData(); // THIS MAKES IT PERSIST ON REFRESH

    const teamForm = document.getElementById('add-team-member-form');
    if (teamForm) teamForm.onsubmit = (e) => handleForm(e, 'team');

    const projectForm = document.getElementById('add-project-form');
    if (projectForm) projectForm.onsubmit = (e) => handleForm(e, 'projects');
});
