document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INITIALIZATION & UI ---
    const adminPanel = document.getElementById('admin-panel');
    const adminToggle = document.getElementById('admin-toggle');
    const closeAdmin = document.getElementById('close-admin');

    if (adminToggle) adminToggle.onclick = () => adminPanel.classList.add('open');
    if (closeAdmin) closeAdmin.onclick = () => adminPanel.classList.remove('open');

    // --- 2. TEAM MANAGEMENT ---
    const teamForm = document.getElementById('team-member-form');
    const adminTeamList = document.getElementById('admin-team-list');
    const teamContainer = document.getElementById('team-container');

    const renderTeam = async () => {
        const res = await fetch('/api/team');
        const team = await res.json();
        
        if (teamContainer) teamContainer.innerHTML = '';
        if (adminTeamList) adminTeamList.innerHTML = '';

        team.forEach(member => {
            // Main Website UI
            if (teamContainer) {
                teamContainer.insertAdjacentHTML('beforeend', `
                    <div class="bg-white rounded-lg shadow-lg p-6 text-center card-hover">
                        <img src="${member.image}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]" onerror="this.src='https://via.placeholder.com/150'">
                        <h3 class="text-xl font-bold">${member.name}</h3>
                        <p class="text-[#00acc1]">${member.title}</p>
                        <p class="text-sm text-gray-600 mt-2">${member.bio}</p>
                    </div>
                `);
            }

            // Admin List UI
            if (adminTeamList) {
                adminTeamList.insertAdjacentHTML('beforeend', `
                    <div class="flex justify-between items-center p-2 bg-gray-50 border rounded">
                        <span class="font-medium">${member.name}</span>
                        <div class="flex space-x-2">
                            <button onclick="editTeamMember('${member.id}', '${encodeURIComponent(JSON.stringify(member))}')" class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteItem('team', '${member.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `);
            }
        });
    };

    teamForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-member-id').value;
        const data = {
            name: document.getElementById('member-name').value,
            title: document.getElementById('member-title').value,
            bio: document.getElementById('member-bio').value,
            image: document.getElementById('member-image-url').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/team/${id}` : '/api/team';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        teamForm.reset();
        document.getElementById('edit-member-id').value = '';
        renderTeam();
    };

    // --- 3. PROJECT MANAGEMENT ---
    const projectForm = document.getElementById('edit-project-form');
    
    window.editProject = (id, title, desc, img, link) => {
        document.getElementById('modal-project-id').value = id;
        document.getElementById('modal-project-title').value = title;
        document.getElementById('modal-project-description').value = desc;
        document.getElementById('modal-project-image').value = img;
        document.getElementById('modal-project-link').value = link;
        document.getElementById('edit-project-modal').classList.remove('hidden');
        document.getElementById('delete-project-modal-btn').classList.remove('hidden');
    };

    // --- 4. GLOBAL ACTIONS ---
    window.editTeamMember = (id, encodedData) => {
        const member = JSON.parse(decodeURIComponent(encodedData));
        document.getElementById('edit-member-id').value = id;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-title').value = member.title;
        document.getElementById('member-bio').value = member.bio;
        document.getElementById('member-image-url').value = member.image;
        document.getElementById('team-submit-btn').innerText = "Update Member";
        document.getElementById('cancel-team-edit').classList.remove('hidden');
    };

    window.deleteItem = async (type, id) => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
            location.reload();
        }
    };

    // Initial Load
    renderTeam();
}); 
