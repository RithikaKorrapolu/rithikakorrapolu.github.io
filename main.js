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

function toggleDropdown(event) {
    event.preventDefault();
    const trigger = event.currentTarget;
    const content = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    trigger.setAttribute('aria-expanded', !isExpanded);
    content.classList.toggle('hidden');
    
    // Close dropdown when clicking outside
    if (!isExpanded) {
        document.addEventListener('click', function closeDropdown(e) {
            if (!trigger.contains(e.target) && !content.contains(e.target)) {
                trigger.setAttribute('aria-expanded', 'false');
                content.classList.add('hidden');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
}

// Initialize dropdown state
document.addEventListener('DOMContentLoaded', function() {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    if (dropdownTrigger) {
        dropdownTrigger.setAttribute('aria-expanded', 'false');
    }
});


// Add this function to update the selection count
function updateSelectionCount() {
    const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]:checked');
    const dropdownText = document.querySelector('.dropdown-text');
    
    if (checkboxes.length === 0) {
        dropdownText.textContent = '';
    } else {
        dropdownText.textContent = `${checkboxes.length} selected`;
    }
}

// Add event listeners for checkboxes
document.addEventListener('DOMContentLoaded', function() {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    if (dropdownTrigger) {
        dropdownTrigger.setAttribute('aria-expanded', 'false');
    }

    // Add change event listeners to all checkboxes
    const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectionCount);
    });
});

document.addEventListener('DOMContentLoaded', initializeMenu);