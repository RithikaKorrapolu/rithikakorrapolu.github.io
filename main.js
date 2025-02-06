// main.js - Menu functionality only
function initializeMenu() {
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuPopup = document.querySelector('.menu-popup');

    menuTrigger.addEventListener('click', function(event) {
        event.stopPropagation();
        menuPopup.classList.toggle('hidden');
        this.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!menuTrigger.contains(event.target) && !menuPopup.contains(event.target)) {
            menuPopup.classList.add('hidden');
            menuTrigger.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeMenu);