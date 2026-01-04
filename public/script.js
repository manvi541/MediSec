// Data Management
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [
    {
        id: '1',
        name: 'Jane Doe',
        title: 'Chief Medical Officer',
        bio: 'Jane has over 15 years of experience in healthcare administration and is passionate about leveraging technology to improve patient care.',
        image: 'images/image_e87710.jpg'
    },
    {
        id: '2',
        name: 'John Smith',
        title: 'Lead Developer',
        bio: 'John is a full-stack developer with a focus on creating secure and scalable applications for the medical industry.',
        image: 'images/image_e87749.jpg'
    }
];
let events = JSON.parse(localStorage.getItem('events')) || [];

// DOM Elements
const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const closeAdmin = document.getElementById('close-admin');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    setupEventListeners();
});

function renderAll() {
    renderBlogPosts();
    renderProjects();
    renderTeam();
    renderEvents();
    renderAdminLists();
}

// --- Navigation & UI ---
function setupEventListeners() {
    adminToggle.addEventListener('click', () => adminPanel.classList.toggle('open'));
    closeAdmin.addEventListener('click', () => adminPanel.classList.remove('open'));
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Forms
    document.getElementById('blog-upload-form').addEventListener('submit', handleAddBlog);
    document.getElementById('project-upload-form').addEventListener('submit', handleAddProject);
    document.getElementById('team-member-form').addEventListener('submit', handleTeamSubmit);
    document.getElementById('event-upload-form').addEventListener('submit', handleAddEvent);
}

// --- Team Management ---
function renderTeam() {
    const container = document.getElementById('team-container');
    container.innerHTML = teamMembers.map(member => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 card-hover animate-zoom-in">
            <img src="${member.image}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#00acc1]">
            <h3 class="text-xl font-bold text-gray-900 mb-1">${member.name}</h3>
            <p class="text-[#00acc1] font-medium">${member.title}</p>
            <p class="mt-2 text-gray-600 text-sm">${member.bio}</p>
        </div>
    `).join('');
}

function handleTeamSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-member-id').value;
    const newMember = {
        id: id || Date.now().toString(),
        name: document.getElementById('member-name').value,
        title: document.getElementById('member-title').value,
        bio: document.getElementById('member-bio').value,
        image: document.getElementById('member-image-url').value
    };

    if (id) {
        teamMembers = teamMembers.map(m => m.id === id ? newMember : m);
    } else {
        teamMembers.push(newMember);
    }

    saveAndRefresh();
    e.target.reset();
}

// --- Project Management ---
function renderProjects() {
    const container = document.getElementById('projects-container');
    if (projects.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No projects yet.</p>';
        return;
    }
    container.innerHTML = projects.map(project => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden card-hover transition duration-300">
            <img src="${project.image || 'https://via.placeholder.com/400x200'}" alt="${project.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                <p class="text-gray-600 mb-4 text-sm">${project.description}</p>
                <a href="${project.link}" target="_blank" class="text-[#00acc1] font-semibold hover:underline">View Project →</a>
            </div>
        </div>
    `).join('');
}

function handleAddProject(e) {
    e.preventDefault();
    const project = {
        id: Date.now().toString(),
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        image: document.getElementById('project-image').value,
        link: document.getElementById('project-link').value
    };
    projects.push(project);
    saveAndRefresh();
    e.target.reset();
}

// --- Blog Management ---
function renderBlogPosts() {
    const container = document.getElementById('blog-posts-container');
    if (blogPosts.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No blog posts yet.</p>';
        return;
    }
    container.innerHTML = blogPosts.map(post => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden card-hover transition duration-300">
            <div class="p-6">
                <span class="text-xs font-bold text-[#00acc1] uppercase tracking-wider">${post.category}</span>
                <h3 class="text-xl font-bold text-gray-900 mt-2 mb-2">${post.title}</h3>
                <p class="text-gray-500 text-sm mb-4">${new Date(post.date).toLocaleDateString()}</p>
                <p class="text-gray-600 mb-4 text-sm">${post.excerpt}</p>
                ${post.link ? `<a href="${post.link}" class="text-[#00acc1] font-semibold hover:underline">Read More</a>` : ''}
            </div>
        </div>
    `).join('');
}

function handleAddBlog(e) {
    e.preventDefault();
    const blog = {
        id: Date.now().toString(),
        title: document.getElementById('blog-title').value,
        date: document.getElementById('blog-date').value,
        category: document.getElementById('blog-category').value,
        excerpt: document.getElementById('blog-excerpt').value,
        image: document.getElementById('blog-image').value,
        link: document.getElementById('blog-link').value
    };
    blogPosts.push(blog);
    saveAndRefresh();
    e.target.reset();
}

// --- Event Management ---
function renderEvents() {
    const container = document.getElementById('events-container');
    if (events.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No upcoming events.</p>';
        return;
    }
    container.innerHTML = events.map(event => `
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#00acc1]">
            <h3 class="text-lg font-bold text-gray-900">${event.title}</h3>
            <p class="text-gray-500 mb-2"><i class="far fa-calendar-alt mr-2"></i>${new Date(event.date).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function handleAddEvent(e) {
    e.preventDefault();
    const event = {
        id: Date.now().toString(),
        title: document.getElementById('event-title').value,
        date: document.getElementById('event-date').value
    };
    events.push(event);
    saveAndRefresh();
    e.target.reset();
}

// --- Admin List Utilities ---
function renderAdminLists() {
    // Team Admin List
    const teamList = document.getElementById('admin-team-list');
    teamList.innerHTML = teamMembers.map(m => `
        <div class="admin-list-item">
            <span>${m.name}</span>
            <button onclick="deleteItem('team', '${m.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    // Project Admin List
    const projectList = document.getElementById('admin-project-list');
    projectList.innerHTML = projects.map(p => `
        <div class="admin-list-item">
            <span>${p.title}</span>
            <button onclick="deleteItem('project', '${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    // Blog Admin List
    const blogList = document.getElementById('admin-blog-list');
    blogList.innerHTML = blogPosts.map(b => `
        <div class="admin-list-item">
            <span>${b.title}</span>
            <button onclick="deleteItem('blog', '${b.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function deleteItem(type, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        if (type === 'team') teamMembers = teamMembers.filter(i => i.id !== id);
        if (type === 'project') projects = projects.filter(i => i.id !== id);
        if (type === 'blog') blogPosts = blogPosts.filter(i => i.id !== id);
        saveAndRefresh();
    }
}

// --- Helper Functions ---
function saveAndRefresh() {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    localStorage.setItem('events', JSON.stringify(events));
    renderAll();
}
