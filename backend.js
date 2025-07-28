// Existing data arrays
    let blogPosts = [];
    let projects = [];
    let teamMembers = [];

    // --- Local Storage Functions ---

    // Function to save all data to local storage
    function saveAllData() {
        localStorage.setItem('medisecProjects', JSON.stringify(projects));
        localStorage.setItem('medisecTeamMembers', JSON.stringify(teamMembers));
        localStorage.setItem('medisecBlogPosts', JSON.stringify(blogPosts));
    }

    // Function to load all data from local storage
    function loadAllData() {
        const storedProjects = localStorage.getItem('medisecProjects');
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
        }

        const storedTeamMembers = localStorage.getItem('medisecTeamMembers');
        if (storedTeamMembers) {
            teamMembers = JSON.parse(storedTeamMembers);
        }

        const storedBlogPosts = localStorage.getItem('medisecBlogPosts');
        if (storedBlogPosts) {
            blogPosts = JSON.parse(storedBlogPosts);
        }
    }

    // --- Event Listeners for Page Load and Saving ---
    document.addEventListener('DOMContentLoaded', () => {
        loadAllData(); // Load data when the page loads
        renderProjects();
        renderTeamMembers();
        renderBlogPosts(); // Ensure admin panel shows loaded blogs
    });

    // --- Modify Existing Functions to Save Data ---

    function addBlog() {
        const title = document.getElementById('blog-title').value;
        const date = document.getElementById('blog-date').value;
        const category = document.getElementById('blog-category').value;
        const excerpt = document.getElementById('blog-excerpt').value;
        const image = document.getElementById('blog-image').value;
        const link = document.getElementById('blog-link').value;

        if (title && date && category && excerpt) {
            blogPosts.push({ title, date, category, excerpt, image, link });
            saveAllData(); // Save after adding
            renderBlogPosts();
            // Clear form
            document.getElementById('blog-title').value = '';
            document.getElementById('blog-date').value = '';
            document.getElementById('blog-category').value = '';
            document.getElementById('blog-excerpt').value = '';
            document.getElementById('blog-image').value = '';
            document.getElementById('blog-link').value = '';
            alert('Blog post added to admin panel list!');
        } else {
            alert('Please fill in all required blog post fields (Title, Date, Category, Excerpt).');
        }
    }

    function deleteBlog(index) {
        blogPosts.splice(index, 1);
        saveAllData(); // Save after deleting
        renderBlogPosts();
    }

    function addProject() {
        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-description').value;
        const image = document.getElementById('project-image').value;
        const link = document.getElementById('project-link').value;

        if (title && description) {
            projects.push({ title, description, image, link });
            saveAllData(); // Save after adding
            renderProjects();
            // Clear form
            document.getElementById('project-title').value = '';
            document.getElementById('project-description').value = '';
            document.getElementById('project-image').value = '';
            document.getElementById('project-link').value = '';
            alert('Project added successfully!');
        } else {
            alert('Please fill in all required project fields (Title, Description).');
        }
    }

    function deleteProject(index) {
        projects.splice(index, 1);
        saveAllData(); // Save after deleting
        renderProjects();
    }

    function addTeamMember() {
        const name = document.getElementById('team-name').value;
        const title = document.getElementById('team-title').value;
        const bio = document.getElementById('team-bio').value;
        const image = document.getElementById('team-image').value;
        const linkedin = document.getElementById('team-linkedin').value;
        const email = document.getElementById('team-email').value;

        if (name && title && bio) {
            teamMembers.push({ name, title, bio, image, linkedin, email });
            saveAllData(); // Save after adding
            renderTeamMembers();
            // Clear form
            document.getElementById('team-name').value = '';
            document.getElementById('team-title').value = '';
            document.getElementById('team-bio').value = '';
            document.getElementById('team-image').value = '';
            document.getElementById('team-linkedin').value = '';
            document.getElementById('team-email').value = '';
            alert('Team member added to admin panel list!');
        } else {
                alert('Please fill in all required team member fields (Name, Title, Bio).');
        }
    }

    function deleteTeamMember(index) {
        teamMembers.splice(index, 1);
        saveAllData(); // Save after deleting
        renderTeamMembers();
    }

    // You don't need to save data for contact info and join us links as they directly update the DOM
    // For a real scenario, these might also be stored in a backend.