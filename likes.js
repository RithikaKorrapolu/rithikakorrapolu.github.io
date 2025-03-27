// likes.js
export const initializeMenu = () => {
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuPopup = document.querySelector('.menu-popup');
  
    if (menuTrigger && menuPopup) {
      menuTrigger.addEventListener('click', () => {
        const isExpanded = menuTrigger.getAttribute('aria-expanded') === 'true';
        
        menuTrigger.setAttribute('aria-expanded', !isExpanded);
        menuPopup.classList.toggle('hidden');
        
        if (!isExpanded) {
          menuTrigger.classList.add('active');
        } else {
          menuTrigger.classList.remove('active');
        }
      });
  
      // Close menu when clicking outside
      document.addEventListener('click', (event) => {
        if (!menuTrigger.contains(event.target) && !menuPopup.contains(event.target)) {
          menuPopup.classList.add('hidden');
          menuTrigger.setAttribute('aria-expanded', 'false');
          menuTrigger.classList.remove('active');
        }
      });
    }
  };
  
  // Initialize the menu when the file loads
  document.addEventListener('DOMContentLoaded', initializeMenu);