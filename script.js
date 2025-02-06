// script.js - Video functionality only
document.addEventListener('DOMContentLoaded', function() {
    const welcomeVideo = document.getElementById('welcomeVideo');
    const muteLine = document.querySelector('.mute-line');

    welcomeVideo.muted = true;
    muteLine.classList.remove('hidden');
    welcomeVideo.autoplay = true;
    welcomeVideo.loop = true;
    welcomeVideo.play().catch(function(error) {
        console.log("Video autoplay failed:", error);
        welcomeVideo.muted = true;
        welcomeVideo.play();
    });

    const nameOverlay = document.querySelector('.name-overlay');
    nameOverlay.addEventListener('click', function() {
        welcomeVideo.muted = !welcomeVideo.muted;
        muteLine.classList.toggle('hidden', !welcomeVideo.muted);
    });

    welcomeVideo.addEventListener('error', function(e) {
        console.error('Error loading video:', e);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'f' || e.key === 'F') {
            if (!document.fullscreenElement) {
                welcomeVideo.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });

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

// Add to your script.js
document.addEventListener('DOMContentLoaded', function() {
    const infoTrigger = document.querySelector('.info-trigger');
    const infoPopup = document.querySelector('.info-popup');
    const closeButton = document.querySelector('.close-button');

    infoTrigger.addEventListener('click', () => {
        infoPopup.classList.toggle('hidden');
        infoTrigger.classList.toggle('active');
    });

    closeButton.addEventListener('click', () => {
        infoPopup.classList.add('hidden');
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!infoPopup.contains(e.target) && !infoTrigger.contains(e.target)) {
            infoPopup.classList.add('hidden');
        }
    });
});