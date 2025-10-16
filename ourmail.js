// Our Mail - Shared Inbox JavaScript

// Supabase configuration
const SUPABASE_URL = 'https://pgyyyowlvvyszxyolpgy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneXl5b3dsdnZ5c3p4eW9scGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzc5NTIsImV4cCI6MjA3NTg1Mzk1Mn0.fbWfkzZK1mqc9Cv0vA6dhYgonS--7gIhOI4j_Arr2tY';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize EmailJS
emailjs.init('IQQqJBlmNLVOkWWax');

// DOM elements
const composeBtn = document.getElementById('composeBtn');
const composeModal = document.getElementById('composeModal');
const closeComposeBtn = document.getElementById('closeComposeBtn');
const composeForm = document.getElementById('composeForm');
const emailList = document.getElementById('emailList');
const emailDetail = document.getElementById('emailDetail');
const backBtn = document.getElementById('backBtn');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const inboxTab = document.getElementById('inboxTab');
const pinnedTab = document.getElementById('pinnedTab');
const feedbackTab = document.getElementById('feedbackTab');
const logoBtn = document.getElementById('logoBtn');
const replyToggleBtn = document.getElementById('replyToggleBtn');
const heartBtn = document.getElementById('heartBtn');

// State
let allEmails = [];
let currentEmail = null;
let currentEmailId = null; // Store current email ID for replies (null for pinned emails)
let currentView = 'inbox'; // 'inbox', 'pinned', or 'feedback'
let selectedEmails = new Set(); // Track selected email IDs (both visitor and pinned)

// Pinned emails data (shared across functions)
const pinnedEmailsData = [
    {
        id: 'pinned-0',
        sender: 'Rithika',
        subject: 'can emails be beautiful? lol',
        preview: 'Dear Stranger, You made it! It\'s cool you\'re here. My name is Rithika and I love writing and receiving hand written letters. A good one feels like opening treasure...',
        time: '10/14',
        fullMessage: `Dear Stranger,

You made it! It's cool you're here. My name is Rithika and I love writing and receiving hand written letters. A good one feels like <strong>opening treasure</strong>. It made me think that there should be a place online where people can do something similar and get that feeling. But then I realized it exists already - its fcking EMAIL lol. I don't know about you but email to me feels joyless. Checking my inbox doesn't feel like discovering treasure - it feels tedious and sterile and cold. I think it's because

1.  Most people (including me) only really use email for networking and more transactional stuff, and two,
2. Most people's email writing (including mine) is pretty lazy - it's all the same corporate, sanitized language - <em>"Great to e-meet you"</em>  <em>"Hope you're doing well"</em> <em>"Sounds good." "Looking forward to it"</em>….

So then I had the idea for this project. This website acts as basically a shared inbox where strangers can write and read emails from each other. It has a similar design to standard email services but I've tried to add small elements to encourage people to put in more effort and creativity and heart into any email they send here. More similar to how you'd write a thoughtful letter. Basically, the question with this is - <strong>can we make opening an email feel like discovering treasure? Can we make emails beautiful? lol</strong>

<em>"The world is full of paper.
Write to me."
- Agha Shahid Ali</em>

Cordially,
Rithika`
    },
    {
        id: 'pinned-1',
        sender: 'Rithika',
        subject: 'Picture of Me looking Dope as Hell',
        preview: 'A picture of me looking dope as hell',
        time: '10/12',
        fullMessage: `<img src="/images/suitme.jpg" alt="Picture of me looking dope as hell" style="max-width: 100%; height: auto; border-radius: 8px;">`
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadEmails();
    setupEventListeners();
    setupFormattingButtons();
    setupLinkModal();
    setupDropdownMenu();
    setupFeedbackModal();
    setupPenPalModal();
});

// Setup event listeners
function setupEventListeners() {
    composeBtn.addEventListener('click', () => {
        composeModal.classList.remove('hidden');
    });

    closeComposeBtn.addEventListener('click', () => {
        composeModal.classList.add('hidden');
        composeForm.reset();
        document.getElementById('message').innerHTML = ''; // Clear contenteditable div
    });

    composeForm.addEventListener('submit', handleSendEmail);

    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (selectedEmails.size > 0) {
                downloadSelectedEmails();
            }
        });
    }

    // Reply form
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', handleSendReply);
    }

    backBtn.addEventListener('click', () => {
        emailDetail.classList.add('hidden');
        emailList.classList.remove('hidden');
        currentEmailId = null;
        // Hide reply form
        document.querySelector('.reply-form-container').classList.remove('visible');
    });

    // Reply toggle button
    replyToggleBtn.addEventListener('click', () => {
        const replyContainer = document.querySelector('.reply-form-container');
        replyContainer.classList.toggle('visible');
        if (replyContainer.classList.contains('visible')) {
            // Focus on textarea when opening
            document.getElementById('replyMessage').focus();
        }
    });

    // Heart button
    heartBtn.addEventListener('click', handleHeartClick);

    // Download button in detail view
    const downloadDetailBtn = document.getElementById('downloadDetailBtn');
    if (downloadDetailBtn) {
        downloadDetailBtn.addEventListener('click', () => {
            if (currentEmailId) {
                // Download only current email
                downloadEmailById(currentEmailId);
            }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadEmails);
    }

    searchInput.addEventListener('input', handleSearch);

    // Logo click - go back to inbox
    logoBtn.addEventListener('click', () => {
        currentView = 'inbox';
        inboxTab.classList.add('active');
        pinnedTab.classList.remove('active');
        feedbackTab.classList.remove('active');
        emailDetail.classList.add('hidden');
        emailList.classList.remove('hidden');
        clearSelections();
        renderEmailList(allEmails, '');
    });

    // Header logo click - same as sidebar logo
    const headerLogoBtn = document.getElementById('headerLogoBtn');
    if (headerLogoBtn) {
        headerLogoBtn.addEventListener('click', () => {
            currentView = 'inbox';
            inboxTab.classList.add('active');
            pinnedTab.classList.remove('active');
            feedbackTab.classList.remove('active');
            emailDetail.classList.add('hidden');
            emailList.classList.remove('hidden');
            clearSelections();
            renderEmailList(allEmails, '');
        });
    }

    // Tab switching
    inboxTab.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'inbox';
        inboxTab.classList.add('active');
        pinnedTab.classList.remove('active');
        feedbackTab.classList.remove('active');
        emailDetail.classList.add('hidden');
        emailList.classList.remove('hidden');
        clearSelections();
        renderEmailList(allEmails, '');
    });

    pinnedTab.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'pinned';
        pinnedTab.classList.add('active');
        inboxTab.classList.remove('active');
        feedbackTab.classList.remove('active');
        emailDetail.classList.add('hidden');
        emailList.classList.remove('hidden');
        clearSelections();
        renderPinnedOnly();
    });

    feedbackTab.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'penpals';
        feedbackTab.classList.add('active');
        inboxTab.classList.remove('active');
        pinnedTab.classList.remove('active');
        emailDetail.classList.add('hidden');
        emailList.classList.remove('hidden');
        clearSelections();
        renderEPenPalsView();
    });
}

// Load emails from Supabase
async function loadEmails() {
    try {
        const { data, error } = await supabaseClient
            .from('shared_inbox')
            .select('*')
            .is('parent_id', null) // Only get parent emails, not replies
            .order('created_at', { ascending: false });

        if (error) throw error;

        allEmails = data || [];
        renderEmailList(allEmails);
    } catch (error) {
        console.error('Error loading emails:', error);
        emailList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #5f6368;">Error loading emails. Please try again.</div>';
    }
}

// Render feedback view as a full compose draft
function renderFeedbackView() {
    const defaultFeedbackText = `What up Visitor,

Have you noticed any bugs or have feature requests? Let me know and I'll try to work on them! Thanks for being here in general!

Cordially,
Rithika

Leave your name and email if you'd like me to respond, thank you!`;

    const feedbackHTML = `
        <div class="feedback-compose-view">
            <div class="feedback-compose-header">
                <h2>Submit Feedback</h2>
            </div>
            <form id="feedbackForm" class="feedback-form">
                <div class="feedback-field">
                    <input type="text" id="feedbackFromName" value="Rithika (rkrox24@gmail.com)" readonly class="feedback-input">
                </div>
                <div class="feedback-field">
                    <input type="text" id="feedbackSubject" value="Feedback for Our Mail" readonly class="feedback-input">
                </div>
                <div class="feedback-field">
                    <textarea id="feedbackMessage" class="feedback-textarea feedback-placeholder">${defaultFeedbackText}</textarea>
                </div>
                <div class="feedback-footer">
                    <button type="submit" class="send-btn" id="feedbackSendBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Send
                    </button>
                    <input type="text" id="feedbackUserName" placeholder="Your name (optional)" maxlength="50" class="feedback-inline-input">
                    <input type="email" id="feedbackUserEmail" placeholder="Your email (optional)" maxlength="100" class="feedback-inline-input">
                    <div class="send-status hidden" id="feedbackSendStatus"></div>
                </div>
            </form>
        </div>
    `;

    emailList.innerHTML = feedbackHTML;

    // Add event listener to feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleSendFeedback);
    }

    // Handle placeholder-like behavior for feedback textarea
    const feedbackTextarea = document.getElementById('feedbackMessage');
    if (feedbackTextarea) {
        feedbackTextarea.addEventListener('focus', function() {
            if (this.value === defaultFeedbackText) {
                this.value = '';
                this.classList.remove('feedback-placeholder');
            }
        });

        feedbackTextarea.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.value = defaultFeedbackText;
                this.classList.add('feedback-placeholder');
            }
        });
    }
}

// Handle send feedback
async function handleSendFeedback(e) {
    e.preventDefault();

    const defaultFeedbackText = `What up Visitor,

Have you noticed any bugs or have feature requests? Let me know and I'll try to work on them! Thanks for being here in general!

Cordially,
Rithika

Leave your name and email if you'd like me to respond, thank you!`;

    const message = document.getElementById('feedbackMessage').value.trim();
    const userName = document.getElementById('feedbackUserName').value.trim();
    const userEmail = document.getElementById('feedbackUserEmail').value.trim();
    const sendBtn = document.getElementById('feedbackSendBtn');
    const sendStatus = document.getElementById('feedbackSendStatus');

    // Check if message is empty or still the default text
    if (!message || message === defaultFeedbackText) {
        sendStatus.textContent = 'Please write your feedback message.';
        sendStatus.className = 'send-status error';
        setTimeout(() => sendStatus.classList.add('hidden'), 3000);
        return;
    }

    // Disable button and show sending status
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
        // Build the message with contact info if provided
        let fullMessage = message;
        if (userName || userEmail) {
            fullMessage += '\n\n---\nContact Info:\n';
            if (userName) fullMessage += `Name: ${userName}\n`;
            if (userEmail) fullMessage += `Email: ${userEmail}`;
        }

        // Send email via EmailJS
        const templateParams = {
            from_name: userName || 'Anonymous Visitor',
            reasons: 'Feedback for Our Mail',
            message: fullMessage,
            from_email: userEmail || 'Not provided'
        };

        await emailjs.send('service_b566mfj', 'template_ea9zmeh', templateParams);

        // Show success message
        sendStatus.textContent = 'Feedback sent successfully! Thank you!';
        sendStatus.className = 'send-status success';

        // Clear the form after a moment
        setTimeout(() => {
            document.getElementById('feedbackMessage').value = defaultFeedbackText;
            document.getElementById('feedbackMessage').classList.add('feedback-placeholder');
            document.getElementById('feedbackUserName').value = '';
            document.getElementById('feedbackUserEmail').value = '';
            sendStatus.classList.add('hidden');
        }, 2000);

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Send
        `;
    } catch (error) {
        console.error('Error sending feedback:', error);
        sendStatus.textContent = 'Failed to send feedback. Please try again.';
        sendStatus.className = 'send-status error';

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Send
        `;
    }
}

// Render pinned emails only
function renderPinnedOnly() {
    let html = '';
    pinnedEmailsData.forEach((email, index) => {
        html += `
            <div class="email-item unread pinned" data-pinned-id="${email.id}">
                <input type="checkbox" class="email-checkbox">
                <svg class="email-important" width="20" height="20" viewBox="0 0 24 24" fill="#F9AB00">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <div class="email-sender">${email.sender}</div>
                <div class="email-content">
                    <span class="email-subject">${email.subject}</span>
                    <span class="email-preview"> - ${email.preview}</span>
                </div>
                <div class="email-time">${email.time}</div>
            </div>
        `;
    });

    emailList.innerHTML = html;

    // Add click listeners for pinned emails
    document.querySelectorAll('.email-item[data-pinned-id]').forEach((item) => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('email-checkbox')) {
                const pinnedId = item.dataset.pinnedId;
                const index = parseInt(pinnedId.replace('pinned-', ''));
                openPinnedEmail(index);
            }
        });
    });

    // Add checkbox listeners for pinned emails
    document.querySelectorAll('.email-item[data-pinned-id] .email-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const emailItem = checkbox.closest('.email-item');
            const pinnedId = emailItem.dataset.pinnedId;

            if (checkbox.checked) {
                selectedEmails.add(pinnedId);
            } else {
                selectedEmails.delete(pinnedId);
            }

            updateSelectionToolbar();
        });
    });
}

// Render email list
function renderEmailList(emails, searchQuery = '') {
    // Filter pinned emails based on search query
    let filteredPinnedEmails = pinnedEmailsData;
    if (searchQuery) {
        filteredPinnedEmails = pinnedEmailsData.filter(email => {
            return email.subject.toLowerCase().includes(searchQuery) ||
                   email.preview.toLowerCase().includes(searchQuery) ||
                   email.sender.toLowerCase().includes(searchQuery);
        });
    }

    // Generate pinned emails HTML
    let pinnedEmailsHTML = '';
    if (filteredPinnedEmails.length > 0) {
        pinnedEmailsHTML = `
            <div class="section-header">
                <div class="section-header-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>Pinned</span>
                </div>
            </div>
        `;

        filteredPinnedEmails.forEach((email, index) => {
            pinnedEmailsHTML += `
                <div class="email-item unread pinned" data-pinned-id="${email.id}">
                    <input type="checkbox" class="email-checkbox">
                    <svg class="email-important" width="20" height="20" viewBox="0 0 24 24" fill="#F9AB00">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <div class="email-sender">${email.sender}</div>
                    <div class="email-content">
                        <span class="email-subject">${email.subject}</span>
                        <span class="email-preview"> - ${email.preview}</span>
                    </div>
                    <div class="email-time">${email.time}</div>
                </div>
            `;
        });
    }

    // Visitor emails section (header with count)
    const visitorCount = emails.length;
    const displayCount = visitorCount === 0 ? '0 of 0' : `1-${Math.min(5, visitorCount)} of ${visitorCount}`;
    const visitorEmailsHeader = `
        <div class="section-header">
            <div class="section-header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Emails from visitors</span>
            </div>
            <span class="page-info">${displayCount}</span>
        </div>
    `;

    if (emails.length === 0) {
        emailList.innerHTML = pinnedEmailsHTML + visitorEmailsHeader + `
            <div style="padding: 2rem; text-align: center; color: #5f6368;">
                <p>No visitor messages yet. Be the first to send one!</p>
            </div>
        `;
        return;
    }

    const visitorEmails = emails.map(email => {
        const date = new Date(email.created_at);
        const timeString = formatDate(date);

        return `
            <div class="email-item" data-id="${email.id}">
                <input type="checkbox" class="email-checkbox">
                <svg class="email-star ${email.is_starred ? 'starred' : ''}" width="20" height="20" viewBox="0 0 24 24" fill="${email.is_starred ? '#f9ab00' : 'none'}" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <div class="email-sender">${email.sender_name || 'Anonymous'}</div>
                <div class="email-content">
                    <span class="email-subject">${email.subject}</span>
                    <span class="email-preview"> - ${truncate(email.message, 100)}</span>
                </div>
                <div class="email-time">${timeString}</div>
            </div>
        `;
    }).join('');

    emailList.innerHTML = pinnedEmailsHTML + visitorEmailsHeader + visitorEmails;

    // Add click listeners to email items (skip pinned emails)
    document.querySelectorAll('.email-item:not(.pinned)').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('email-checkbox') && !e.target.classList.contains('email-star')) {
                const emailId = item.dataset.id;
                openEmail(emailId);
            }
        });
    });

    // Add click listeners for pinned emails (they open but show static content)
    document.querySelectorAll('.email-item.pinned').forEach((item) => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('email-checkbox') && !e.target.classList.contains('email-star')) {
                const pinnedId = item.dataset.pinnedId;
                const index = parseInt(pinnedId.replace('pinned-', ''));
                openPinnedEmail(index);
            }
        });
    });

    // Add click listeners to star icons
    document.querySelectorAll('.email-star').forEach(star => {
        star.addEventListener('click', async (e) => {
            e.stopPropagation();
            const emailItem = star.closest('.email-item');
            const emailId = emailItem.dataset.id;
            await toggleStar(emailId);
        });
    });

    // Add checkbox listeners for visitor emails
    document.querySelectorAll('.email-item:not(.pinned) .email-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const emailItem = checkbox.closest('.email-item');
            const emailId = emailItem.dataset.id;

            if (checkbox.checked) {
                selectedEmails.add(emailId);
            } else {
                selectedEmails.delete(emailId);
            }

            updateSelectionToolbar();
        });
    });

    // Add checkbox listeners for pinned emails
    document.querySelectorAll('.email-item.pinned .email-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const emailItem = checkbox.closest('.email-item');
            const pinnedId = emailItem.dataset.pinnedId;

            if (checkbox.checked) {
                selectedEmails.add(pinnedId);
            } else {
                selectedEmails.delete(pinnedId);
            }

            updateSelectionToolbar();
        });
    });
}

// Open pinned email detail view
function openPinnedEmail(index) {
    const email = pinnedEmailsData[index];

    // Update detail view
    document.querySelector('.detail-subject').textContent = email.subject;
    document.querySelector('.detail-sender').textContent = email.sender;
    document.querySelector('.detail-timestamp').textContent = email.time;
    document.querySelector('.detail-body').innerHTML = email.fullMessage;

    // Show but disable reply button for pinned emails, enable heart and download
    currentEmailId = 'pinned-' + index; // Use a special ID for pinned emails
    document.querySelector('.reply-form-container').classList.remove('visible');
    document.getElementById('replyToggleBtn').style.display = 'flex';
    document.getElementById('replyToggleBtn').disabled = true;
    document.getElementById('replyToggleBtn').classList.add('disabled');
    document.getElementById('heartBtn').style.display = 'flex';
    document.getElementById('heartBtn').disabled = false;
    document.getElementById('heartBtn').classList.remove('disabled');
    document.getElementById('downloadDetailBtn').style.display = 'flex';
    document.getElementById('downloadDetailBtn').disabled = false;
    document.getElementById('downloadDetailBtn').classList.remove('disabled');

    // Get heart count from localStorage for pinned emails
    const pinnedHeartCount = localStorage.getItem('pinned-hearts-' + index) || 0;
    updateHeartDisplay(parseInt(pinnedHeartCount));

    // Check if user has hearted this pinned email
    const heartedKey = 'hearted-' + currentEmailId;
    if (localStorage.getItem(heartedKey)) {
        document.getElementById('heartBtn').classList.add('hearted');
    } else {
        document.getElementById('heartBtn').classList.remove('hearted');
    }

    document.getElementById('repliesSection').innerHTML = '';

    // Show detail view
    emailList.classList.add('hidden');
    emailDetail.classList.remove('hidden');
}

// Open email detail view
async function openEmail(emailId) {
    const email = allEmails.find(e => e.id === emailId);
    if (!email) return;

    currentEmail = email;
    currentEmailId = emailId;

    // Mark as read
    if (!email.is_read) {
        await markAsRead(emailId);
    }

    // Update detail view
    document.querySelector('.detail-subject').textContent = email.subject;
    document.querySelector('.detail-sender').textContent = email.sender_name || 'Anonymous';
    document.querySelector('.detail-timestamp').textContent = new Date(email.created_at).toLocaleString();
    document.querySelector('.detail-body').innerHTML = sanitizeHTML(email.message);

    // Show and enable reply button, keep form hidden initially
    document.getElementById('replyToggleBtn').style.display = 'flex';
    document.getElementById('replyToggleBtn').disabled = false;
    document.getElementById('replyToggleBtn').classList.remove('disabled');
    document.querySelector('.reply-form-container').classList.remove('visible');

    // Show and enable heart button
    document.getElementById('heartBtn').style.display = 'flex';
    document.getElementById('heartBtn').disabled = false;
    document.getElementById('heartBtn').classList.remove('disabled');
    updateHeartDisplay(email.hearts_count || 0);

    // Show and enable download button
    document.getElementById('downloadDetailBtn').style.display = 'flex';
    document.getElementById('downloadDetailBtn').disabled = false;
    document.getElementById('downloadDetailBtn').classList.remove('disabled');

    // Check if user has hearted this email
    const heartedKey = 'hearted-' + currentEmailId;
    if (localStorage.getItem(heartedKey)) {
        document.getElementById('heartBtn').classList.add('hearted');
    } else {
        document.getElementById('heartBtn').classList.remove('hearted');
    }

    // Load and display replies
    await loadReplies(emailId);

    // Show detail view
    emailList.classList.add('hidden');
    emailDetail.classList.remove('hidden');
}

// Handle send email
async function handleSendEmail(e) {
    e.preventDefault();

    const fromName = document.getElementById('fromName').value.trim() || 'Anonymous';
    const subject = document.getElementById('subject').value.trim();
    const messageEditor = document.getElementById('message');
    const message = messageEditor.innerHTML.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendStatus = document.getElementById('sendStatus');

    if (!subject || !message || message === '<br>' || message === '') {
        sendStatus.textContent = 'Please fill in both subject and message.';
        sendStatus.className = 'send-status error';
        sendStatus.classList.remove('hidden');
        setTimeout(() => sendStatus.classList.add('hidden'), 3000);
        return;
    }

    // Disable button and show sending status
    sendBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient
            .from('shared_inbox')
            .insert([
                {
                    sender_name: fromName,
                    subject: subject,
                    message: message,
                    is_starred: false,
                    is_read: false
                }
            ])
            .select();

        if (error) throw error;

        // Show success message
        sendStatus.textContent = 'Message sent successfully!';
        sendStatus.className = 'send-status success';

        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Close modal and reset form
        composeModal.classList.add('hidden');
        composeForm.reset();
        messageEditor.innerHTML = ''; // Clear contenteditable div
        sendStatus.classList.add('hidden');

        // Reload emails
        await loadEmails();

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    } catch (error) {
        console.error('Error sending email:', error);
        sendStatus.textContent = 'Failed to send message. Please try again.';
        sendStatus.className = 'send-status error';
        sendStatus.classList.remove('hidden');

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    }
}

// Mark email as read
async function markAsRead(emailId) {
    try {
        const { error } = await supabaseClient
            .from('shared_inbox')
            .update({ is_read: true })
            .eq('id', emailId);

        if (error) throw error;

        // Update local state
        const email = allEmails.find(e => e.id === emailId);
        if (email) email.is_read = true;
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

// Toggle star status
async function toggleStar(emailId) {
    const email = allEmails.find(e => e.id === emailId);
    if (!email) return;

    const newStarredStatus = !email.is_starred;

    try {
        const { error } = await supabaseClient
            .from('shared_inbox')
            .update({ is_starred: newStarredStatus })
            .eq('id', emailId);

        if (error) throw error;

        // Update local state
        email.is_starred = newStarredStatus;

        // Re-render
        renderEmailList(allEmails);
    } catch (error) {
        console.error('Error toggling star:', error);
    }
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    // If on pen pals view, disable search
    if (currentView === 'penpals') {
        return;
    }

    // If on pinned view, search only pinned emails
    if (currentView === 'pinned') {
        const pinnedEmailsData = [
            {
                sender: 'Rithika',
                subject: 'Welcome to Our Mail!',
                preview: 'Hi there! This is a shared inbox where anyone can write messages and read what others have written. Feel free to share your thoughts, stories, or just say hello. Looking forward to reading what you have to say!',
                time: '10/12'
            },
            {
                sender: 'Rithika',
                subject: 'How to use Our Mail',
                preview: 'Click "Compose" to write a message. You can add your name or stay anonymous. All messages appear here for everyone to read. This is a space for connection and shared stories!',
                time: '10/12'
            }
        ];

        if (!query) {
            renderPinnedOnly();
            return;
        }

        const filteredPinned = pinnedEmailsData.filter(email => {
            return email.subject.toLowerCase().includes(query) ||
                   email.preview.toLowerCase().includes(query) ||
                   email.sender.toLowerCase().includes(query);
        });

        // Render filtered pinned emails
        let html = '';
        filteredPinned.forEach((email, index) => {
            html += `
                <div class="email-item unread pinned" data-pinned-index="${index}">
                    <input type="checkbox" class="email-checkbox">
                    <svg class="email-important" width="20" height="20" viewBox="0 0 24 24" fill="#F9AB00">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <div class="email-sender">${email.sender}</div>
                    <div class="email-content">
                        <span class="email-subject">${email.subject}</span>
                        <span class="email-preview"> - ${email.preview}</span>
                    </div>
                    <div class="email-time">${email.time}</div>
                </div>
            `;
        });

        if (filteredPinned.length === 0) {
            html = '<div style="padding: 2rem; text-align: center; color: #5f6368;">No matching pinned messages</div>';
        }

        emailList.innerHTML = html;

        // Add click listeners
        document.querySelectorAll('.email-item[data-pinned-index]').forEach((item) => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('email-checkbox')) {
                    const index = parseInt(item.dataset.pinnedIndex);
                    openPinnedEmail(index);
                }
            });
        });

        return;
    }

    // If on inbox view, search all emails
    if (!query) {
        renderEmailList(allEmails, '');
        return;
    }

    const filtered = allEmails.filter(email => {
        return email.subject.toLowerCase().includes(query) ||
               email.message.toLowerCase().includes(query) ||
               (email.sender_name && email.sender_name.toLowerCase().includes(query));
    });

    renderEmailList(filtered, query);
}

// Update email count in sidebar
function updateEmailCount(count) {
    const emailCountElement = document.getElementById('emailCount');
    if (emailCountElement) {
        // Always show 2 to represent the 2 pinned unread messages
        emailCountElement.textContent = '2';
    }
}

// Utility: Format date
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days < 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Utility: Truncate text
function truncate(text, maxLength) {
    // Strip HTML tags and replace line breaks with spaces
    const stripped = text.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
}

// Update heart display
function updateHeartDisplay(count) {
    const heartCount = document.getElementById('heartCount');
    if (heartCount) {
        heartCount.textContent = count;
    }
}

// Handle heart click
async function handleHeartClick() {
    if (!currentEmailId) return;

    const heartBtn = document.getElementById('heartBtn');
    const isHearted = heartBtn.classList.contains('hearted');
    const heartedKey = 'hearted-' + currentEmailId;

    heartBtn.disabled = true;

    try {
        // Check if this is a pinned email
        if (currentEmailId.startsWith('pinned-')) {
            const index = currentEmailId.replace('pinned-', '');
            const storageKey = 'pinned-hearts-' + index;
            const currentCount = parseInt(localStorage.getItem(storageKey) || 0);

            if (isHearted) {
                // Unheart - decrement count
                const newCount = Math.max(0, currentCount - 1);
                localStorage.setItem(storageKey, newCount);
                updateHeartDisplay(newCount);
                heartBtn.classList.remove('hearted');
                localStorage.removeItem(heartedKey);
            } else {
                // Heart - increment count
                const newCount = currentCount + 1;
                localStorage.setItem(storageKey, newCount);
                updateHeartDisplay(newCount);
                heartBtn.classList.add('hearted');
                localStorage.setItem(heartedKey, 'true');
            }
        } else {
            // Regular email - update in database
            const email = allEmails.find(e => e.id === currentEmailId);
            if (!email) return;

            if (isHearted) {
                // Unheart - decrement count
                const newCount = Math.max(0, (email.hearts_count || 0) - 1);

                const { error } = await supabaseClient
                    .from('shared_inbox')
                    .update({ hearts_count: newCount })
                    .eq('id', currentEmailId);

                if (error) throw error;

                email.hearts_count = newCount;
                updateHeartDisplay(newCount);
                heartBtn.classList.remove('hearted');
                localStorage.removeItem(heartedKey);
            } else {
                // Heart - increment count
                const newCount = (email.hearts_count || 0) + 1;

                const { error } = await supabaseClient
                    .from('shared_inbox')
                    .update({ hearts_count: newCount })
                    .eq('id', currentEmailId);

                if (error) throw error;

                email.hearts_count = newCount;
                updateHeartDisplay(newCount);
                heartBtn.classList.add('hearted');
                localStorage.setItem(heartedKey, 'true');
            }
        }

    } catch (error) {
        console.error('Error updating heart:', error);
    } finally {
        heartBtn.disabled = false;
    }
}

// Load replies for an email
async function loadReplies(parentId) {
    try {
        const { data, error } = await supabaseClient
            .from('shared_inbox')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        renderReplies(data || []);
    } catch (error) {
        console.error('Error loading replies:', error);
        document.getElementById('repliesSection').innerHTML = '<div style="padding: 1rem; color: #5f6368;">Error loading replies.</div>';
    }
}

// Render replies in the detail view
function renderReplies(replies) {
    const repliesSection = document.getElementById('repliesSection');

    if (replies.length === 0) {
        repliesSection.innerHTML = '';
        return;
    }

    const repliesHTML = replies.map(reply => {
        const date = new Date(reply.created_at);
        const timeString = date.toLocaleString();

        return `
            <div class="reply-item">
                <div class="reply-header">
                    <span class="reply-sender">${reply.sender_name || 'Anonymous'}</span>
                    <span class="reply-timestamp">${timeString}</span>
                </div>
                <div class="reply-body">${sanitizeHTML(reply.message)}</div>
            </div>
        `;
    }).join('');

    repliesSection.innerHTML = repliesHTML;
}

// Handle send reply
async function handleSendReply(e) {
    e.preventDefault();

    if (!currentEmailId) {
        return; // Can't reply to pinned emails
    }

    const fromName = document.getElementById('replyFromName').value.trim() || 'Anonymous';
    const replyEditor = document.getElementById('replyMessage');
    const message = replyEditor.innerHTML.trim();
    const replyBtn = document.getElementById('replyBtn');
    const replyStatus = document.getElementById('replyStatus');
    const replyForm = document.getElementById('replyForm');

    if (!message || message === '<br>' || message === '') {
        replyStatus.textContent = 'Please write a message.';
        replyStatus.className = 'send-status error';
        setTimeout(() => replyStatus.classList.add('hidden'), 3000);
        return;
    }

    // Disable button and show sending status
    replyBtn.disabled = true;
    replyBtn.textContent = 'Sending...';

    try {
        const { data, error } = await supabaseClient
            .from('shared_inbox')
            .insert([
                {
                    sender_name: fromName,
                    subject: 'Re: ' + currentEmail.subject,
                    message: message,
                    parent_id: currentEmailId,
                    is_starred: false,
                    is_read: false
                }
            ])
            .select();

        if (error) throw error;

        // Show success message
        replyStatus.textContent = 'Reply sent successfully!';
        replyStatus.className = 'send-status success';
        replyStatus.classList.remove('hidden');

        // Clear form
        replyForm.reset();
        replyEditor.innerHTML = ''; // Clear contenteditable div

        // Reload replies
        await loadReplies(currentEmailId);

        // Hide reply form after successful send
        document.querySelector('.reply-form-container').classList.remove('visible');

        // Hide success message after a moment
        setTimeout(() => {
            replyStatus.classList.add('hidden');
        }, 2000);

        // Reset button
        replyBtn.disabled = false;
        replyBtn.textContent = 'Send';
    } catch (error) {
        console.error('Error sending reply:', error);
        replyStatus.textContent = 'Failed to send reply. Please try again.';
        replyStatus.className = 'send-status error';
        replyStatus.classList.remove('hidden');

        // Reset button
        replyBtn.disabled = false;
        replyBtn.textContent = 'Send';
    }
}

// Update selection toolbar visibility and count
function updateSelectionToolbar() {
    const selectionToolbar = document.getElementById('selectionToolbar');
    const selectionCount = document.getElementById('selectionCount');

    if (selectedEmails.size > 0) {
        selectionToolbar.classList.remove('hidden');
        selectionCount.textContent = `${selectedEmails.size} selected`;
    } else {
        selectionToolbar.classList.add('hidden');
    }
}

// Clear all selections
function clearSelections() {
    selectedEmails.clear();
    updateSelectionToolbar();
}

// Download selected emails
function downloadSelectedEmails() {
    // Get selected email objects (both visitor and pinned)
    const selectedEmailObjects = [];

    selectedEmails.forEach(emailId => {
        if (emailId.startsWith('pinned-')) {
            // Find pinned email
            const pinnedEmail = pinnedEmailsData.find(email => email.id === emailId);
            if (pinnedEmail) {
                selectedEmailObjects.push({
                    subject: pinnedEmail.subject,
                    sender_name: pinnedEmail.sender,
                    message: pinnedEmail.fullMessage,
                    created_at: pinnedEmail.time
                });
            }
        } else {
            // Find visitor email
            const visitorEmail = allEmails.find(email => email.id === emailId);
            if (visitorEmail) {
                selectedEmailObjects.push(visitorEmail);
            }
        }
    });

    // Format emails into a text file
    let fileContent = '';
    selectedEmailObjects.forEach((email, index) => {
        fileContent += `${index > 0 ? '\n\n' : ''}========================================\n`;
        fileContent += `Email ${index + 1}\n`;
        fileContent += `========================================\n\n`;
        fileContent += `From: ${email.sender_name || 'Anonymous'}\n`;
        fileContent += `Subject: ${email.subject}\n`;
        fileContent += `Date: ${typeof email.created_at === 'string' && !email.created_at.includes('-') ? email.created_at : new Date(email.created_at).toLocaleString()}\n\n`;
        // Strip HTML tags from message for plain text
        const messageText = email.message.replace(/<[^>]*>/g, '');
        fileContent += messageText + '\n';
    });

    // Create and download file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `our-mail-emails-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Clear selections
    selectedEmails.clear();
    document.querySelectorAll('.email-checkbox').forEach(cb => cb.checked = false);
    updateSelectionToolbar();
}

// Download a single email by ID
function downloadEmailById(emailId) {
    let email;

    if (emailId.startsWith('pinned-')) {
        // Find pinned email
        const pinnedEmail = pinnedEmailsData.find(e => e.id === emailId);
        if (pinnedEmail) {
            email = {
                subject: pinnedEmail.subject,
                sender_name: pinnedEmail.sender,
                message: pinnedEmail.fullMessage,
                created_at: pinnedEmail.time
            };
        }
    } else {
        // Find visitor email
        email = allEmails.find(e => e.id === emailId);
    }

    if (!email) return;

    // Format email into a text file
    let fileContent = '';
    fileContent += `========================================\n`;
    fileContent += `From: ${email.sender_name || 'Anonymous'}\n`;
    fileContent += `Subject: ${email.subject}\n`;
    fileContent += `Date: ${typeof email.created_at === 'string' && !email.created_at.includes('-') ? email.created_at : new Date(email.created_at).toLocaleString()}\n`;
    fileContent += `========================================\n\n`;
    // Strip HTML tags from message for plain text
    const messageText = email.message.replace(/<[^>]*>/g, '');
    fileContent += messageText + '\n';

    // Create and download file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${email.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Setup formatting buttons
function setupFormattingButtons() {
    // Compose modal formatting buttons
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const linkBtn = document.getElementById('linkBtn');
    const messageEditor = document.getElementById('message');

    if (boldBtn) {
        boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyFormatting('bold');
        });
    }

    if (italicBtn) {
        italicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyFormatting('italic');
        });
    }

    if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            insertLink(messageEditor);
        });
    }

    // Reply formatting buttons
    const boldBtnReply = document.getElementById('boldBtnReply');
    const italicBtnReply = document.getElementById('italicBtnReply');
    const linkBtnReply = document.getElementById('linkBtnReply');
    const replyEditor = document.getElementById('replyMessage');

    if (boldBtnReply) {
        boldBtnReply.addEventListener('click', (e) => {
            e.preventDefault();
            applyFormatting('bold');
        });
    }

    if (italicBtnReply) {
        italicBtnReply.addEventListener('click', (e) => {
            e.preventDefault();
            applyFormatting('italic');
        });
    }

    if (linkBtnReply) {
        linkBtnReply.addEventListener('click', (e) => {
            e.preventDefault();
            insertLink(replyEditor);
        });
    }
}

// Apply formatting to contenteditable element
function applyFormatting(command) {
    document.execCommand(command, false, null);
}

// State for link modal
let currentLinkEditor = null;
let savedSelection = null;

// Insert link
function insertLink(editor) {
    currentLinkEditor = editor;
    const linkModal = document.getElementById('linkModal');
    const linkUrlInput = document.getElementById('linkUrlInput');

    // Save the current selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedSelection = selection.getRangeAt(0);
    }

    linkUrlInput.value = '';
    linkModal.classList.remove('hidden');
    linkUrlInput.focus();
}

// Apply link from modal
function applyLink() {
    const linkUrlInput = document.getElementById('linkUrlInput');
    const url = linkUrlInput.value.trim();

    if (!url || !currentLinkEditor || !savedSelection) {
        closeLinkModal();
        return;
    }

    // Add https:// if no protocol specified
    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;

    // Restore the selection
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);

    // Create link element
    const link = document.createElement('a');
    link.href = finalUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Get selected text or use URL as text
    const selectedText = savedSelection.toString();
    link.textContent = selectedText || finalUrl;

    // Insert the link
    if (selectedText) {
        // Replace selection with link
        savedSelection.deleteContents();
        savedSelection.insertNode(link);
    } else {
        // Insert link at cursor
        savedSelection.insertNode(link);
    }

    // Move cursor after the link
    const range = document.createRange();
    range.setStartAfter(link);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    closeLinkModal();
    currentLinkEditor.focus();
}

// Close link modal
function closeLinkModal() {
    const linkModal = document.getElementById('linkModal');
    linkModal.classList.add('hidden');
    currentLinkEditor = null;
    savedSelection = null;
}

// Setup link modal event listeners
function setupLinkModal() {
    const linkApplyBtn = document.getElementById('linkApplyBtn');
    const linkUrlInput = document.getElementById('linkUrlInput');
    const linkModal = document.getElementById('linkModal');

    if (linkApplyBtn) {
        linkApplyBtn.addEventListener('click', applyLink);
    }

    if (linkUrlInput) {
        linkUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
            }
        });
    }

    // Close modal when clicking outside the content
    if (linkModal) {
        linkModal.addEventListener('click', (e) => {
            if (e.target === linkModal) {
                closeLinkModal();
            }
        });
    }

    // Prevent clicks on modal content from closing the modal
    const linkModalContent = document.querySelector('.link-modal-content');
    if (linkModalContent) {
        linkModalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !linkModal.classList.contains('hidden')) {
            closeLinkModal();
        }
    });
}

// Sanitize HTML to only allow safe tags
function sanitizeHTML(html) {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Allowed tags
    const allowedTags = ['STRONG', 'EM', 'A', 'BR'];

    // Recursively clean nodes
    function cleanNode(node) {
        // If it's a text node, return it as is
        if (node.nodeType === 3) {
            return node.textContent;
        }

        // If it's an element node
        if (node.nodeType === 1) {
            const tagName = node.tagName;

            // If tag is allowed
            if (allowedTags.includes(tagName)) {
                let result = '';

                if (tagName === 'STRONG') {
                    result = '<strong>';
                } else if (tagName === 'EM') {
                    result = '<em>';
                } else if (tagName === 'A') {
                    const href = node.getAttribute('href') || '';
                    // Basic URL validation
                    if (href.startsWith('http://') || href.startsWith('https://')) {
                        result = `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
                    } else {
                        // If not a valid URL, just return the content without the link
                        result = '';
                    }
                } else if (tagName === 'BR') {
                    return '<br>';
                }

                // Process children
                for (let child of node.childNodes) {
                    result += cleanNode(child);
                }

                // Close tag
                if (tagName === 'STRONG') {
                    result += '</strong>';
                } else if (tagName === 'EM') {
                    result += '</em>';
                } else if (tagName === 'A' && result.startsWith('<a')) {
                    result += '</a>';
                }

                return result;
            } else {
                // Tag not allowed, just return content of children
                let result = '';
                for (let child of node.childNodes) {
                    result += cleanNode(child);
                }
                return result;
            }
        }

        return '';
    }

    let cleaned = '';
    for (let child of temp.childNodes) {
        cleaned += cleanNode(child);
    }

    // Preserve line breaks
    return cleaned.replace(/\n/g, '<br>');
}

// Setup dropdown menu
function setupDropdownMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const contactUsBtn = document.getElementById('contactUsBtn');

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
        });

        // Prevent dropdown from closing when clicking inside
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (contactUsBtn) {
        contactUsBtn.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
            document.getElementById('feedbackModal').classList.remove('hidden');
        });
    }
}

// Setup feedback modal
function setupFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
    const feedbackModalForm = document.getElementById('feedbackModalForm');

    if (closeFeedbackBtn) {
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('hidden');
            feedbackModalForm.reset();
            document.getElementById('feedbackModalMessage').innerHTML = '';
            document.getElementById('feedbackModalSubject').value = '';
        });
    }

    if (feedbackModalForm) {
        feedbackModalForm.addEventListener('submit', handleFeedbackModalSubmit);
    }
}

// Handle feedback modal submit
async function handleFeedbackModalSubmit(e) {
    e.preventDefault();

    const messageEditor = document.getElementById('feedbackModalMessage');
    const message = messageEditor.innerHTML.trim();
    const subject = document.getElementById('feedbackModalSubject').value.trim();
    const userName = document.getElementById('feedbackModalUserName').value.trim();
    const userEmail = document.getElementById('feedbackModalUserEmail').value.trim();
    const sendBtn = document.getElementById('feedbackModalSendBtn');
    const sendStatus = document.getElementById('feedbackModalStatus');

    if (!message || message === '<br>' || message === '') {
        sendStatus.textContent = 'Please write your feedback message.';
        sendStatus.className = 'send-status error';
        sendStatus.classList.remove('hidden');
        setTimeout(() => sendStatus.classList.add('hidden'), 3000);
        return;
    }

    // Disable button and show sending status
    sendBtn.disabled = true;

    try {
        // Strip HTML tags for email sending
        const strippedMessage = message.replace(/<[^>]*>/g, '').replace(/<br>/g, '\n');

        // Build the message with contact info if provided
        let fullMessage = strippedMessage;
        if (userName || userEmail) {
            fullMessage += '\n\n---\nContact Info:\n';
            if (userName) fullMessage += `Name: ${userName}\n`;
            if (userEmail) fullMessage += `Email: ${userEmail}`;
        }

        // Send email via EmailJS
        const templateParams = {
            from_name: userName || 'Anonymous Visitor',
            reasons: subject || 'Contacting you from OurMail',
            message: fullMessage,
            from_email: userEmail || 'Not provided'
        };

        await emailjs.send('service_b566mfj', 'template_ea9zmeh', templateParams);

        // Show success message
        sendStatus.textContent = 'Feedback sent successfully! Thank you!';
        sendStatus.className = 'send-status success';
        sendStatus.classList.remove('hidden');

        // Clear the form after a moment
        setTimeout(() => {
            document.getElementById('feedbackModal').classList.add('hidden');
            document.getElementById('feedbackModalForm').reset();
            messageEditor.innerHTML = '';
            document.getElementById('feedbackModalSubject').value = '';
            document.getElementById('feedbackModalUserName').value = '';
            document.getElementById('feedbackModalUserEmail').value = '';
            sendStatus.classList.add('hidden');
        }, 2000);

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    } catch (error) {
        console.error('Error sending feedback:', error);
        sendStatus.textContent = 'Failed to send feedback. Please try again.';
        sendStatus.className = 'send-status error';
        sendStatus.classList.remove('hidden');

        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    }
}

// Setup pen pal modal
function setupPenPalModal() {
    const penPalModal = document.getElementById('penPalModal');
    const closePenPalBtn = document.getElementById('closePenPalBtn');
    const penPalForm = document.getElementById('penPalForm');

    if (closePenPalBtn) {
        closePenPalBtn.addEventListener('click', () => {
            penPalModal.classList.add('hidden');
            penPalForm.reset();
            document.getElementById('penPalBio').innerHTML = '';
        });
    }

    if (penPalForm) {
        penPalForm.addEventListener('submit', handlePenPalSubmit);
    }
}

// Handle pen pal form submission
async function handlePenPalSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('penPalName').value.trim();
    const email = document.getElementById('penPalEmail').value.trim();
    const bioEditor = document.getElementById('penPalBio');
    const bio = bioEditor.innerHTML.trim();
    const submitBtn = document.getElementById('penPalSubmitBtn');
    const status = document.getElementById('penPalStatus');

    if (!name || !email || !bio || bio === '<br>' || bio === '') {
        status.textContent = 'Please fill in all fields.';
        status.className = 'send-status error';
        status.classList.remove('hidden');
        setTimeout(() => status.classList.add('hidden'), 3000);
        return;
    }

    // Disable button and show sending status
    submitBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient
            .from('pen_pals')
            .insert([
                {
                    name: name,
                    email: email,
                    bio: bio
                }
            ])
            .select();

        if (error) throw error;

        // Show success message
        status.textContent = 'Successfully signed up!';
        status.className = 'send-status success';
        status.classList.remove('hidden');

        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Close modal and reset form
        document.getElementById('penPalModal').classList.add('hidden');
        document.getElementById('penPalForm').reset();
        bioEditor.innerHTML = '';
        status.classList.add('hidden');

        // Reload pen pals view
        renderEPenPalsView();

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    } catch (error) {
        console.error('Error signing up for pen pal:', error);
        status.textContent = 'Failed to sign up. Please try again.';
        status.className = 'send-status error';
        status.classList.remove('hidden');

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
    }
}

// Load pen pals from database
async function loadPenPals() {
    try {
        const { data, error } = await supabaseClient
            .from('pen_pals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error loading pen pals:', error);
        return [];
    }
}

// Render E-Pen Pals view
async function renderEPenPalsView() {
    const penPals = await loadPenPals();

    let html = `
        <div class="pen-pals-view">
            <div class="pen-pals-header">
                <div class="pen-pals-header-text">
                    <h2>E-Pen Pals</h2>
                    <p class="pen-pals-subtitle">Sign up if you are open to being sent an email from a stranger. Or if anyone on this list intrigues, feel free to shoot them an email!</p>
                </div>
                <button class="compose-btn pen-pals-signup-btn" id="openPenPalModalBtn">
                    Sign Up
                </button>
            </div>
    `;

    if (penPals.length === 0) {
        html += `
            <div class="pen-pals-empty">
                <p>No pen pals yet. Be the first to sign up!</p>
            </div>
        `;
    } else {
        html += `
            <table class="pen-pals-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Bio</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
        `;

        penPals.forEach(penPal => {
            const date = new Date(penPal.created_at);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Strip HTML from bio for table display
            const bioText = penPal.bio.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');

            html += `
                <tr>
                    <td class="pen-pal-name">${penPal.name}</td>
                    <td class="pen-pal-email">${penPal.email}</td>
                    <td class="pen-pal-bio">${bioText}</td>
                    <td class="pen-pal-date">${dateString}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
    }

    html += `
        </div>
    `;

    emailList.innerHTML = html;

    // Add event listener to open modal button
    const openPenPalModalBtn = document.getElementById('openPenPalModalBtn');
    if (openPenPalModalBtn) {
        openPenPalModalBtn.addEventListener('click', () => {
            document.getElementById('penPalModal').classList.remove('hidden');
        });
    }
}
