// Get the form element
const addMemberForm = document.getElementById('add-member-form'); 

// Add an event listener for the form submission
addMemberForm.addEventListener('submit', async (e) => {
    // Prevent the default form submission behavior
    e.preventDefault(); 

    // Get the values from the form inputs
    const name = document.getElementById('team-name').value;
    const role = document.getElementById('team-role').value;
    const profileImage = document.getElementById('team-image').value;

    // Create a new team member object from the form values
    const newMember = { name, role, profileImage };

    try {
        // Send the data to the server using the fetch API
        const response = await fetch('/api/team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMember), // Convert the JavaScript object to a JSON string
        });

        if (response.ok) {
            const addedMember = await response.json();
            console.log('Team member added successfully:', addedMember);
            
            // You can add code here to display a success message or clear the form
            alert('Team member added successfully!');
            addMemberForm.reset(); // Clear the form fields
        } else {
            console.error('Failed to add team member:', response.statusText);
            alert('Error adding team member. Please try again.');
        }
    } catch (error) {
        console.error('An error occurred during form submission:', error);
        alert('An unexpected error occurred. Check the console for details.');
    }
});
