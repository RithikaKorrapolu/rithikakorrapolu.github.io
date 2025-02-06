// script.js
document.addEventListener('DOMContentLoaded', function() {
    const welcomeVideo = document.getElementById('welcomeVideo');
    const micToggle = document.querySelector('.mic-toggle');
    const muteLine = document.querySelector('.mute-line');
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuPopup = document.querySelector('.menu-popup');

    // Video initial state
    welcomeVideo.muted = true;
    muteLine.classList.remove('hidden');
    welcomeVideo.autoplay = true;
    welcomeVideo.loop = true;
    welcomeVideo.play().catch(function(error) {
        console.log("Video autoplay failed:", error);
        welcomeVideo.muted = true;
        welcomeVideo.play();
    });

    // Mic toggle functionality
    micToggle.addEventListener('click', function() {
        welcomeVideo.muted = !welcomeVideo.muted;
        muteLine.classList.toggle('hidden', !welcomeVideo.muted);
    });

    // Menu toggle functionality
    menuTrigger.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click from immediately triggering document click
        menuPopup.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuTrigger.contains(event.target) && !menuPopup.contains(event.target)) {
            menuPopup.classList.add('hidden');
        }
    });

    // Video error handling
    welcomeVideo.addEventListener('error', function(e) {
        console.error('Error loading video:', e);
    });

    // Fullscreen functionality
    document.addEventListener('keydown', function(e) {
        if (e.key === 'f' || e.key === 'F') {
            if (!document.fullscreenElement) {
                welcomeVideo.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });

    // Video size management
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
});