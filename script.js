document.addEventListener('DOMContentLoaded', function() {
    // Video elements
    const welcomeVideo = document.getElementById('welcomeVideo');
    const muteLine = document.querySelector('.mute-line');
    const nameOverlay = document.querySelector('.name-overlay');
    const infoTrigger = document.querySelector('.info-trigger');
    const infoPopup = document.querySelector('.info-popup');
    const closeButton = document.querySelector('.close-button');
 
    // Video setup
    welcomeVideo.muted = true;
    muteLine.classList.remove('hidden');
    welcomeVideo.autoplay = true;
    welcomeVideo.loop = true;
    welcomeVideo.play().catch(function(error) {
        console.log("Video autoplay failed:", error);
        welcomeVideo.muted = true;
        welcomeVideo.play();
    });
 
    // Info popup functionality
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
 
    // Video controls
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