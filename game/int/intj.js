// Function to navigate between sections
function goTo(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');

    // Show the selected section
    document.getElementById(section).style.display = 'block';

    // Hide the main menu
    document.getElementById('main-menu').style.display = 'none';
}

// Function to go back to the main menu
function goBack() {
    // Show the main menu
    document.getElementById('main-menu').style.display = 'block';

    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
}
