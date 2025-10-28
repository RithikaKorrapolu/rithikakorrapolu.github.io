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

// Export home page functionality without Instagram compatibility
export function initializeHomePage() {
    const welcomeVideo = document.getElementById('welcomeVideo');
    const muteLine = document.querySelector('.mute-line');
    const nameOverlay = document.querySelector('.name-overlay');
    const infoTrigger = document.querySelector('.info-trigger');
    const infoPopup = document.querySelector('.info-popup');
    const closeButton = document.querySelector('.close-button');
    const nameElement = document.querySelector('.name');
    const videoContainer = document.querySelector('.video-container');

    if (welcomeVideo) {
        // Array of available videos
        const videos = [
            {
                mp4: '/thattaya.mp4',
                name: 'Dr. Sambasiva Korrapolu'
            },
            {
                mp4: '/taruna.mp4',
                name: 'Taruna Emani'
            },
            {
                mp4: '/glory.mp4',
                name: 'Glory Kanes'
            },
            {
                mp4: '/mich.mp4',
                name: 'Michelle Christian'
            },
            {
                mp4: '/jordan.mp4',
                webm: '/jordan.webm',
                name: 'Jordan Mitchell'
            },
            {
                mp4: '/kasra.mp4',
                name: 'Kasra Koushan',
            },
            {
                mp4: '/anant.mp4',
                name: 'Anant Vasudevan',
            },
            {
                mp4: '/mahi.mp4',
                name: 'Mahi Patel',
            },
            {
                mp4: '/crystal.mp4',
                name: 'Crystal Desai',
            }
        ];

        // Track which videos have been played in this cycle
        let remainingVideos = [];
        let preloadedVideo = null;
        let isVideoEnding = false;

        // Function to reset the playlist when all videos have been played
        function resetPlaylist() {
            // Create a fresh shuffled copy of all videos
            remainingVideos = [...videos].sort(() => Math.random() - 0.5);
            console.log('Playlist reset with new random order.');
        }

        // Initialize the playlist
        resetPlaylist();

        // Function to preload next video
        function preloadNextVideo() {
            if (remainingVideos.length === 0) {
                resetPlaylist();
            }

            const nextVideo = remainingVideos[0];
            if (!nextVideo) return;

            // Create invisible video element for preloading
            preloadedVideo = document.createElement('video');
            preloadedVideo.preload = 'auto';
            preloadedVideo.muted = true;

            const source = document.createElement('source');
            source.src = nextVideo.mp4;
            source.type = 'video/mp4';
            preloadedVideo.appendChild(source);

            if (nextVideo.webm) {
                const webmSource = document.createElement('source');
                webmSource.src = nextVideo.webm;
                webmSource.type = 'video/webm';
                preloadedVideo.appendChild(webmSource);
            }

            preloadedVideo.load();
            console.log(`Preloading next video: ${nextVideo.name}`);
        }

        // Function to load and play the next video
        function loadNextVideo() {
            if (isVideoEnding) return;
            isVideoEnding = true;

            // Show loading indicator
            if (videoContainer) {
                videoContainer.classList.add('loading');
            }

            // If we've played all videos, reset the playlist
            if (remainingVideos.length === 0) {
                resetPlaylist();
            }

            // Take the first video from the remaining ones
            const selectedVideo = remainingVideos.shift();

            console.log(`Playing video: ${selectedVideo.name}`);

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

            // Load the new video sources
            welcomeVideo.load();

            // Play the video
            welcomeVideo.play().catch(function(error) {
                console.log("Video play failed:", error);
                welcomeVideo.muted = true;
                welcomeVideo.play();
            }).finally(() => {
                isVideoEnding = false;
            });

            // Preload the next video in background
            preloadNextVideo();
        }

        // Event listener for when the current video ends
        welcomeVideo.addEventListener('ended', function() {
            console.log('Video ended, loading next video');
            loadNextVideo();
        });
        
        // Ensure necessary attributes for best cross-browser compatibility
        welcomeVideo.muted = true;
        welcomeVideo.setAttribute('playsinline', '');
        welcomeVideo.setAttribute('webkit-playsinline', '');
        welcomeVideo.preload = 'metadata'; // Changed from 'auto' to 'metadata' for faster initial load
        welcomeVideo.autoplay = true;

        // Important: Turn OFF loop since we want to handle ending ourselves
        welcomeVideo.loop = false;

        if (muteLine) muteLine.classList.remove('hidden');

        // Remove loading indicator when video is ready to play
        welcomeVideo.addEventListener('canplay', function() {
            if (videoContainer) {
                videoContainer.classList.remove('loading');
            }
        });

        // Also remove loading when video starts playing
        welcomeVideo.addEventListener('playing', function() {
            if (videoContainer) {
                videoContainer.classList.remove('loading');
            }
        });

        // Start with the first video
        loadNextVideo();

        // Name overlay / mute toggle
        if (nameOverlay) {
            nameOverlay.addEventListener('click', function() {
                welcomeVideo.muted = !welcomeVideo.muted;
                muteLine.classList.toggle('hidden', !welcomeVideo.muted);
            });
        }

        // Video size handling with better error prevention
        function updateVideoSize() {
            try {
                const container = welcomeVideo.parentElement;
                if (!container) return;
                
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                
                if (!containerWidth || !containerHeight) return;
                
                const containerAspect = containerWidth / containerHeight;
                
                // Only continue if video metadata is loaded
                if (!welcomeVideo.videoWidth || !welcomeVideo.videoHeight) {
                    return;
                }
                
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
            } catch (err) {
                console.error('Error updating video size:', err);
            }
        }

        // Multiple event listeners for more reliable size calculation
        welcomeVideo.addEventListener('loadedmetadata', updateVideoSize);
        welcomeVideo.addEventListener('loadeddata', updateVideoSize);
        welcomeVideo.addEventListener('playing', updateVideoSize);
        
        // Also update on window resize
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
                            <p>I'm allergic to tree nuts. I don't fully understand how the stock market works. When I get really frustrated, I'll just start crying. I need to learn how to communicate better when that happens. I also need to get better at handling feedback more objectively. I can be overly sensitive. I'll strive to be stronger in these areas.</p>
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

export function initializeMuseumPage() {
    console.log('Museum page loaded');
    // The museum functionality is handled by museum.js
    // No additional initialization needed here
}

// Initialize everything when DOM is loaded
// Update your DOMContentLoaded handler in main.js
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
    } else if (currentPage === 'museum') {
        initializeMuseumPage();
    }
});