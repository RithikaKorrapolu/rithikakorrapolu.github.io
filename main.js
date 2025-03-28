// Export menu functionality for use in other files
// Remove EmailJS initialization from main.js to avoid double initialization
// The emailjs.init() call is now handled directly in the contact.html file

export function initializeMenu() {
    console.log('Initializing menu');
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuPopup = document.querySelector('.menu-popup');

    if (menuTrigger && menuPopup) {
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
}

// Export home page functionality
export function initializeHomePage() {
    const welcomeVideo = document.getElementById('welcomeVideo');
    const muteLine = document.querySelector('.mute-line');
    const nameOverlay = document.querySelector('.name-overlay');
    const infoTrigger = document.querySelector('.info-trigger');
    const infoPopup = document.querySelector('.info-popup');
    const closeButton = document.querySelector('.close-button');
    const nameElement = document.querySelector('.name');

    if (welcomeVideo) {
        // Array of available videos
        const videos = [
            {
                mp4: '/thattaya.mp4',
                webm: '/thattaya.webm',
                name: 'Dr. Sambasiva Korrapolu'
            },
            {
                mp4: '/taruna.mp4',
                webm: '/taruna.webm', // If you have a WebM version available
                name: 'Taruna Emani'
            },
            {
                mp4: '/glory.mp4',
                webm: '/glory.webm', // If you have a WebM version available
                name: 'Glory Kanes'
            }
            // Add more videos as needed
        ];

        // Randomly select a video
        const randomIndex = Math.floor(Math.random() * videos.length);
        const selectedVideo = videos[randomIndex];
        
        // Update source URLs
        const sourceElements = welcomeVideo.getElementsByTagName('source');
        sourceElements[0].src = selectedVideo.mp4;
        if (sourceElements.length > 1 && selectedVideo.webm) {
            sourceElements[1].src = selectedVideo.webm;
        }
        
        // Update name in the overlay
        if (nameElement && selectedVideo.name) {
            nameElement.textContent = selectedVideo.name;
        }
        
        // Video setup
        welcomeVideo.muted = true;
        if (muteLine) muteLine.classList.remove('hidden');
        welcomeVideo.autoplay = true;
        welcomeVideo.loop = true;
        
        // Load the new video sources before trying to play
        welcomeVideo.load();
        
        welcomeVideo.play().catch(function(error) {
            console.log("Video autoplay failed:", error);
            welcomeVideo.muted = true;
            welcomeVideo.play();
        });

        // Name overlay / mute toggle
        if (nameOverlay) {
            nameOverlay.addEventListener('click', function() {
                welcomeVideo.muted = !welcomeVideo.muted;
                muteLine.classList.toggle('hidden', !welcomeVideo.muted);
            });
        }

        // Video size handling
        function updateVideoSize() {
            const container = welcomeVideo.parentElement;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const containerAspect = containerWidth / containerHeight;
            const videoAspect = welcomeVideo.videoWidth / welcomeVideo.videoHeight;

            if (containerAspect > videoAspect) {
                const scale = containerWidth / welcomeVideo.videoWidth;
                welcomeVideo.style.width = containerWidth + 'px';
                welcomeVideo.style.height = (welcomeVideo.videoHeight * scale) + 'px';
            } else {
                const scale = containerHeight / welcomeVideo.videoHeight;
                welcomeVideo.style.height = containerHeight + 'px';
                welcomeVideo.style.width = (welcomeVideo.videoWidth * scale) + 'px';
            }
        }

        welcomeVideo.addEventListener('loadedmetadata', updateVideoSize);
        window.addEventListener('resize', updateVideoSize);
    }

    // Info popup functionality
    if (infoTrigger && infoPopup && closeButton) {
        function updateInfoButtonState() {
            const isPopupVisible = !infoPopup.classList.contains('hidden');
            infoTrigger.classList.toggle('active', isPopupVisible);
        }

        infoTrigger.addEventListener('click', () => {
            infoPopup.classList.toggle('hidden');
            updateInfoButtonState();
        });

        closeButton.addEventListener('click', () => {
            infoPopup.classList.add('hidden');
            updateInfoButtonState();
        });

        document.addEventListener('click', (e) => {
            if (!infoPopup.contains(e.target) && !infoTrigger.contains(e.target)) {
                infoPopup.classList.add('hidden');
                updateInfoButtonState();
            }
        });
    }
}

// Contact page functionality - now handled directly in the HTML
export function initializeContactPage() {
    console.log('Contact page initialized from main.js, but using inline handler for reliability');
    // The contact form is now initialized directly in the HTML
    // This avoids any potential timing issues with module loading
    // No additional action needed here
}

// Export dropdown toggle function
export function toggleDropdown(event) {
    console.log('Toggle dropdown called');
    event.preventDefault();
    const trigger = event.currentTarget;
    const content = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    trigger.setAttribute('aria-expanded', !isExpanded);
    content.classList.toggle('hidden');
    
    if (!isExpanded) {
        const closeDropdown = function(e) {
            if (!trigger.contains(e.target) && !content.contains(e.target)) {
                trigger.setAttribute('aria-expanded', 'false');
                content.classList.add('hidden');
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }
}

// Export selection count update function
export function updateSelectionCount() {
    console.log('Update selection count called');
    const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]:checked');
    const dropdownText = document.querySelector('.dropdown-text');
    const selectedReasonsInput = document.getElementById('selected-reasons');
    
    if (checkboxes.length === 0) {
        dropdownText.textContent = '';
        selectedReasonsInput.value = '';
    } else {
        dropdownText.textContent = `${checkboxes.length} selected`;
        selectedReasonsInput.value = Array.from(checkboxes)
            .map(cb => cb.nextElementSibling.textContent)
            .join(', ');
    }
}

// Export about page functionality
export function initializeAboutPage() {
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;

    let currentSlide = 0;

    const slides = [
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Who and where I'm from</h2>
                            <img src="family.jpg" alt="Family photo" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>Born in 1997, I was raised in <a href="https://en.wikipedia.org/wiki/New_Jersey" class="link" target="_blank" rel="noopener noreferrer">Paradise</a> by my earnest, loving family. The best parts of me came from them. I live in NYC now but still visit them often.</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Weaknesses</h2>
                            <img src="weaknesses.jpg" alt="Childhood photo" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                                <p><em>"I'm so embarrassed. I'm not a real person yet" - Frances Ha</em></p>
                                <br>
                            <p>I'm allergic to tree nuts. I don't fully understand how the stock market works. Sometimes, I start randomly crying when I get really frustrated. I need to learn how to communicate better when that happens. I also need to get better at handling feedback more objectively. I can be overly sensitive. I'll strive to be stronger in these areas.</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Strengths</h2>
                            <img src="strengths.jpg" alt="Photo in office" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I know two magic tricks. I am generally optimistic about people and humanity. A friend told me once I have a disarming personality. I hope that's true - I want people to feel safe and sincere and playful when they talk to me. I think I'm capable of that. Also, I'm pretty sure I can do the macarena to any song.</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Work</h2>
                            <img src="work.jpg" alt="Big Suit Show photo" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I'm on the <a href="https://www.linkedin.com/in/rithikakorrapolu/" class="link" target="_blank" rel="noopener noreferrer">Responsible AI team</a> at Microsoft. I help set product policy around emerging AI technologies and domains. My job is cool.</p>
                            <p><br>I'm also working on a variety show with my friend Crystal. It's called <a href="https://www.youtube.com/@TheBigSuitShow" class="link" target="_blank" rel="noopener noreferrer">The Big Suit Show</a>. I love making it so much. You should check it out.</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Hobbies</h2>
                            <img src="hobbies.jpg" alt="Photo with hat" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I like doing bad improv. I really like getting my friends to do bad improv. I work part-time at bars and restaurants. I host dinners and workout and practice different dance moves in front of my mirror. They're pretty heinous. I collect gadgets. I love pranks. More stuff I like <a href="likes.html" class="link" target="_blank" rel="noopener noreferrer">here</a>.</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">slideshow -</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                        <h2>The End</h2>
                                 <p><em>"You don't meet the people you love. You recognize them." - Anna Gavalda</em></p>
                                <br>
                            <p>If you want to chat, come <a href="contact.html" class="link" target="_blank" rel="noopener noreferrer">here</a></p>
                        </div>
                        <div class="slide-column-right">
                        </div>
                    </div>
                </div>
            `
        }
    ];

    function createNavButton(direction) {
        const button = document.createElement('button');
        button.className = `nav-button nav-${direction}`;
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="${direction === 'prev' 
                    ? 'M20 12H4M4 12L10 6M4 12L10 18' 
                    : 'M4 12H20M20 12L14 6M20 12L14 18'}" 
                    stroke="currentColor" 
                    stroke-width="3" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
        `;
        return button;
    }

    function updateSlide() {
        let slideContent = slides[currentSlide].content;
        
        // Add slide counter
        const headerRegex = /<div class="slide-header">([\s\S]*?)<\/div>/;
        const headerMatch = slideContent.match(headerRegex);
        
        if (headerMatch) {
            const newHeader = `
                <div class="slide-header">
                    <h1>What I'm about</h1>
                    <div class="subtitle-container">
                        <p class="subtitle">slideshow -</p>
                        <span class="slide-counter">${currentSlide + 1}/${slides.length}</span>
                    </div>
                </div>
            `;
            slideContent = slideContent.replace(headerRegex, newHeader);
        }
        
        // Update content and add navigation
        contentContainer.innerHTML = `
            ${slideContent}
            <div class="navigation ${currentSlide === 0 ? 'first-slide' : ''}">
                ${currentSlide > 0 ? createNavButton('prev').outerHTML : ''}
                ${currentSlide < slides.length - 1 ? createNavButton('next').outerHTML : ''}
            </div>
        `;
        
        // Add button event listeners
        const prevButton = contentContainer.querySelector('.nav-prev');
        const nextButton = contentContainer.querySelector('.nav-next');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSlide();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentSlide < slides.length - 1) {
                    currentSlide++;
                    updateSlide();
                }
            });
        }
    }

    // Initialize first slide
    updateSlide();
}

// Portfolio page functionality
export function initializePortfolioPage() {
    const projectCards = document.querySelectorAll('.project-card');
    
    // Add fade-in animation for project cards
    if (projectCards.length > 0) {
        projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Add hover effect enhancement
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    initializeMenu();
    
    const currentPage = document.querySelector('.current-page')?.textContent.toLowerCase();
    console.log('Current page:', currentPage);
    
    // Contact page now initialized directly in HTML
    if (currentPage === 'home') {
        initializeHomePage();
    } else if (currentPage === 'about') {
        initializeAboutPage();
    } else if (currentPage === 'portfolio') {
        initializePortfolioPage();
    }
});