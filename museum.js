// museum.js - Self-contained Supabase-powered art museum functionality

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the museum
    const museum = new ArtMuseum();
    museum.initialize();
});

// Main Museum class
class ArtMuseum {
    constructor() {
        // Your Supabase credentials
        this.supabaseUrl = 'https://elnpavvstpmqkszpiuuy.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnBhdnZzdHBtcWtzenBpdXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5MzEsImV4cCI6MjA2MzA4ODkzMX0.KqS7YpUTJFlgIUZ5XELGCMAnEkowbRlgE6VZaq6AVtI';
        
        // Initialize Supabase client if library is loaded
        if (window.supabase) {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase client initialized');
        } else {
            console.error('Supabase library not loaded');
        }
        
        // Initialize event listeners
        this.uploadForm = document.getElementById('art-upload-form');
        this.moodForm = document.getElementById('mood-search-form');
        this.galleryContainer = document.getElementById('art-gallery');
    }
    
    // Add these functions near the top of your ArtMuseum class

// Extract YouTube video ID from various YouTube URL formats
extractYouTubeId(url) {
    if (!url) return null;
    
    // Regular expression to match YouTube URLs and extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
}

// Extract Spotify track/album/playlist ID from Spotify URLs
extractSpotifyId(url) {
    if (!url) return null;
    
    // Regular expressions for different Spotify URL formats
    const trackRegex = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
    const albumRegex = /spotify\.com\/album\/([a-zA-Z0-9]+)/;
    const playlistRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
    
    let match = url.match(trackRegex) || url.match(albumRegex) || url.match(playlistRegex);
    
    if (match && match[1]) {
        return {
            id: match[1],
            type: url.includes('track') ? 'track' : 
                  url.includes('album') ? 'album' : 
                  url.includes('playlist') ? 'playlist' : 'track'
        };
    }
    
    return null;
}

// Validate and process content URL
processContentUrl(url, type) {
    if (!url) return { contentUrl: null, embedInfo: null };
    
    // For YouTube videos
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(url);
        if (videoId) {
            return {
                contentUrl: url,
                embedInfo: {
                    type: 'youtube',
                    videoId: videoId
                }
            };
        }
    }
    
    // For Spotify
    if (url.includes('spotify.com')) {
        const spotifyInfo = this.extractSpotifyId(url);
        if (spotifyInfo) {
            return {
                contentUrl: url,
                embedInfo: {
                    type: 'spotify',
                    id: spotifyInfo.id,
                    embedType: spotifyInfo.type
                }
            };
        }
    }
    
    // For other URLs, just return as is
    return {
        contentUrl: url,
        embedInfo: null
    };
}

    // Initialize the museum functionality
    initialize() {
        if (!this.supabase) {
            this.showMessage('Error initializing museum. Please check console for details.', 'error');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load gallery if we're on that tab
        this.loadGallery();
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Upload form
        if (this.uploadForm) {
            this.uploadForm.addEventListener('submit', (event) => this.handleUpload(event));
        }
        
        // Mood search form
        if (this.moodForm) {
            this.moodForm.addEventListener('submit', (event) => this.handleMoodSearch(event));
        }
        
        // Add this new code to handle tab switching:
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                if (tabId === 'gallery') {
                    // Reload gallery data when switching to gallery tab
                    this.loadGallery();
                }
            });
        });
    }
    
    // Handle art upload
    // Update the handleUpload method in your ArtMuseum class
async handleUpload(event) {
    event.preventDefault();
    
    const titleInput = this.uploadForm.querySelector('#art-title');
    const contentInput = this.uploadForm.querySelector('#art-content');
    const fileInput = this.uploadForm.querySelector('#art-file');
    const typeSelect = this.uploadForm.querySelector('#art-type');
    const urlInput = this.uploadForm.querySelector('#art-url') || { value: '' }; // Add this input to your form
    const submitButton = this.uploadForm.querySelector('button[type="submit"]');
    
    // Generate title if not provided
    let title = titleInput.value;
    if (!title) {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const typeStr = typeSelect.value.charAt(0).toUpperCase() + typeSelect.value.slice(1);
        title = `${typeStr} - ${dateStr}`;
    }
    
    // Check if we have content or file or URL
    if (!contentInput.value && !fileInput.files[0] && !urlInput.value) {
        this.showMessage('Please provide content, a file, or a URL', 'error');
        return;
    }
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    try {
        const content = contentInput.value;
        const type = typeSelect.value;
        const file = fileInput.files[0];
        
        // Process URL if provided
        const { contentUrl: processedUrl, embedInfo } = this.processContentUrl(urlInput.value, type);
        
        // 1. Analyze sentiment
        const sentiment = await this.analyzeSentiment(title, content || processedUrl || '');
        
        // 2. Upload file to storage if present
        let contentUrl = processedUrl; // Use the processed URL if available
        
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${type}/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('artwork')
                .upload(filePath, file);
            
            if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);
            
            const { data: urlData } = this.supabase.storage
                .from('artwork')
                .getPublicUrl(filePath);
                
            contentUrl = urlData.publicUrl;
        }
        
        // 3. Save to database
        const { data, error } = await this.supabase
            .from('artwork')
            .insert([{
                title,
                content: content || null,
                content_url: contentUrl,
                type,
                sentiment,
                tags: sentiment.tags || [],
                embed_info: embedInfo // Store embedding information
            }]);
        
        if (error) throw new Error(`Database error: ${error.message}`);
        
        // Success! Reset form and show message
        this.uploadForm.reset();
        this.showMessage('✨ Successfully saved to your museum!', 'success');
        
        // Refresh gallery if visible
        if (document.getElementById('gallery-tab').classList.contains('active')) {
            this.loadGallery();
        }
        
    } catch (error) {
        console.error('Error saving to museum:', error);
        this.showMessage(`Error: ${error.message}`, 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Save to Museum';
    }
}
    
    // Analyze sentiment using Supabase Edge Function
    async analyzeSentiment(title, content) {
        try {
            const response = await fetch('https://elnpavvstpmqkszpiuuy.supabase.co/functions/v1/analyze-sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Raw sentiment data:", data);
            
            // Handle different response formats
            if (data.content && Array.isArray(data.content) && data.content[0]) {
                // Claude API format
                return JSON.parse(data.content[0].text);
            } else if (typeof data === 'object') {
                // Direct JSON response
                return data;
            } else {
                throw new Error("Invalid response format from sentiment analysis");
            }
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            
            // Return fallback sentiment analysis
            return {
                emotions: ['unspecified'],
                themes: ['general'],
                moodTags: ['any'],
                tags: [title.toLowerCase().split(' ')].flat().filter(tag => tag.length > 2),
                overallSentiment: 0
            };
        }
    }
    
    // Handle mood-based search
    async handleMoodSearch(event) {
        event.preventDefault();
        
        const moodInput = this.moodForm.querySelector('#mood-input');
        const resultsContainer = document.getElementById('mood-results');
        const submitButton = this.moodForm.querySelector('button[type="submit"]');
        
        if (!moodInput.value) {
            this.showMessage('Please describe how you\'re feeling', 'error');
            return;
        }
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Finding...';
        resultsContainer.innerHTML = '<p>Searching your museum for the perfect match...</p>';
        
        try {
            // 1. Extract relevant tags using our Supabase Edge Function
            const response = await fetch('https://elnpavvstpmqkszpiuuy.supabase.co/functions/v1/search-by-mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: moodInput.value })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Raw mood search data:", data);
            
            // Handle different response formats
            let tags = [];
            if (data.content && Array.isArray(data.content) && data.content[0]) {
                // Claude API format
                const parsed = JSON.parse(data.content[0].text);
                tags = parsed.tags || [];
            } else if (data.tags) {
                // Direct JSON response
                tags = data.tags;
            } else {
                // Generate some default tags from the mood text
                const moodWords = moodInput.value.toLowerCase().split(/\s+/);
                tags = moodWords.filter(word => word.length > 3);
                if (tags.length === 0) {
                    tags = ['general', 'any'];
                }
            }
            
            console.log('Extracted mood tags:', tags);
            
            // 2. Query database for matching content
            // First try with array containment to find exact matches
            let { data: contentData, error } = await this.supabase
                .from('artwork')
                .select('*')
                .filter('tags', 'cs', `{${tags.join(',')}}`)
                .order('created_at', { ascending: false });
            
            // If no exact matches, try a more flexible search
            if (!contentData || contentData.length === 0) {
                const queries = [];
                
                // Create a query for each tag
                for (const tag of tags) {
                    queries.push(
                        this.supabase
                            .from('artwork')
                            .select('*')
                            .textSearch('content', tag, { type: 'plain' })
                    );
                }
                
                // Execute all queries
                const results = await Promise.all(queries);
                
                // Combine results and remove duplicates
                const combinedData = [];
                const seenIds = new Set();
                
                for (const result of results) {
                    if (result.data) {
                        for (const item of result.data) {
                            if (!seenIds.has(item.id)) {
                                combinedData.push(item);
                                seenIds.add(item.id);
                            }
                        }
                    }
                }
                
                contentData = combinedData;
            }
            
            if (error) throw new Error(`Search error: ${error.message}`);
            
            // 3. Display results
            this.displayResults(contentData, resultsContainer);
            
        } catch (error) {
            console.error('Error searching by mood:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
            resultsContainer.innerHTML = '<p>Sorry, something went wrong with your search.</p>';
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = 'Find Art';
        }
    }
    
    // Load gallery of recent items
    async loadGallery() {
        if (!this.galleryContainer) return;
        
        this.galleryContainer.innerHTML = '<p>Loading your collection...</p>';
        console.log("Loading gallery...");
        
        try {
            const { data, error } = await this.supabase
                .from('artwork')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(12);
                
            console.log("Gallery data received:", data);
            console.log("Gallery error:", error);
            
            if (error) throw new Error(`Gallery error: ${error.message}`);
            
            this.displayResults(data, this.galleryContainer);
            
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.galleryContainer.innerHTML = '<p>Error loading your gallery. Please try again later.</p>';
        }
    }
    
    // Display art results in a container
    // Update the displayResults method in your ArtMuseum class
displayResults(items, container) {
    console.log("Displaying results. Items:", items);
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p>No items found. Try adding some art to your museum first!</p>';
        return;
    }
    
    let html = '<div class="results-grid">';
    
    for (const item of items) {
        console.log("Processing item:", item);
        
        // Process sentiment data safely
        let sentiment = null;
        try {
            sentiment = typeof item.sentiment === 'string' 
                ? JSON.parse(item.sentiment) 
                : item.sentiment;
            console.log("Processed sentiment:", sentiment);
        } catch (e) {
            console.error("Error parsing sentiment:", e);
            sentiment = { emotions: ["unknown"], themes: ["unknown"] };
        }
                
        const emotions = sentiment?.emotions?.join(', ') || 'Not specified';
        const themes = sentiment?.themes?.join(', ') || 'Not specified';
        
        // Create content preview based on type and embed info
        let contentPreview = '';
        
        // Handle embed_info if present
        if (item.embed_info) {
            if (item.embed_info.type === 'youtube') {
                // YouTube embed
                contentPreview = `
                    <div class="video-container">
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="https://www.youtube.com/embed/${item.embed_info.videoId}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
            } else if (item.embed_info.type === 'spotify') {
                // Spotify embed
                const embedType = item.embed_info.embedType || 'track';
                contentPreview = `
                    <div class="spotify-container">
                        <iframe 
                            src="https://open.spotify.com/embed/${embedType}/${item.embed_info.id}" 
                            width="100%" 
                            height="80" 
                            frameborder="0" 
                            allowtransparency="true" 
                            allow="encrypted-media">
                        </iframe>
                    </div>
                `;
            }
        } 
        // If no embed info but content_url exists, handle by file type
        else if (item.content_url) {
            if (item.type === 'music' && !contentPreview) {
                // Try to detect if it's a Spotify URL even without embed_info
                if (item.content_url.includes('spotify.com')) {
                    const spotifyInfo = this.extractSpotifyId(item.content_url);
                    if (spotifyInfo) {
                        contentPreview = `
                            <div class="spotify-container">
                                <iframe 
                                    src="https://open.spotify.com/embed/${spotifyInfo.type}/${spotifyInfo.id}" 
                                    width="100%" 
                                    height="80" 
                                    frameborder="0" 
                                    allowtransparency="true" 
                                    allow="encrypted-media">
                                </iframe>
                            </div>
                        `;
                    }
                } else {
                    // Generic audio player
                    contentPreview = `<audio controls src="${item.content_url}" class="art-preview"></audio>`;
                }
            } else if (item.type === 'video' && !contentPreview) {
                // Try to detect if it's a YouTube URL even without embed_info
                if (item.content_url.includes('youtube.com') || item.content_url.includes('youtu.be')) {
                    const videoId = this.extractYouTubeId(item.content_url);
                    if (videoId) {
                        contentPreview = `
                            <div class="video-container">
                                <iframe 
                                    width="100%" 
                                    height="200" 
                                    src="https://www.youtube.com/embed/${videoId}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        `;
                    }
                } else {
                    // Generic video player
                    contentPreview = `<video controls src="${item.content_url}" class="art-preview"></video>`;
                }
            } else if (item.type === 'art' || item.type === 'image') {
                contentPreview = `<img src="${item.content_url}" alt="${item.title}" class="art-preview">`;
            } else if (item.type === 'film') {
                // Add a movie poster or placeholder
                contentPreview = `<div class="film-poster"><img src="${item.content_url}" alt="${item.title}" class="art-preview"></div>`;
            }
        }
        
        // Format for different types
        let typeSpecificDisplay = '';
        if (item.type === 'quote') {
            typeSpecificDisplay = `<blockquote>${item.content}</blockquote>`;
        } else if (item.type === 'book') {
            typeSpecificDisplay = `<div class="book-info">${item.content}</div>`;
        } else {
            typeSpecificDisplay = item.content ? `<p>${item.content}</p>` : '';
        }
        
        html += `
            <div class="art-item art-type-${item.type}">
                <h3>${item.title}</h3>
                ${contentPreview}
                ${typeSpecificDisplay}
                <p><strong>Emotions:</strong> ${emotions}</p>
                <p><strong>Themes:</strong> ${themes}</p>
                <div class="art-tags">
                    ${Array.isArray(item.tags) ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}
    
    // Show a message to the user
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageElement.remove();
            }
        }, 5000);
    }
}