function goTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');

    // Hide main menu
    document.getElementById('main-menu').style.display = 'none';

    // Show target section (lowercase for consistency)
    const section = document.getElementById(sectionId.toLowerCase());
    if (section) section.style.display = 'block';
}

function goBack() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');

    // Show main menu
    document.getElementById('main-menu').style.display = 'flex';
}
