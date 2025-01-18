document.addEventListener('DOMContentLoaded', function() {
    // Initial messages that everyone sees
    const initialMessages = [
        { text: "hey", delay: 100 },
        { text: "what up player", delay: 1000 },
        { text: "check out my about page", delay: 1000 },
        { 
            text: "You can learn more <a href='about.html' class='chat-link'>about me</a> or check out some of my <a href='learnings.html' class='chat-link'>learnings</a>",
            delay: 2000 
        },
        { text: "...", delay: 2000 },
        { text: "adding some tests", delay: 2000 },
        { text: "woohoo", delay: 2000 },
        { text: "this one is a long message. I'm curuous to see what happens when it goes past the width of the container yeehaw. I want to love my dad and my family the best I can. I want to fly so free and be happy okay that's probably enough.", delay: 2000 },
        { text: "bad boss", delay: 2000 }
    ];

    // Messages that appear when users return during the same session
    const returnMessages = [
        { text: "Welcome back!", delay: 1000 },
        { text: "Glad you're exploring the site", delay: 1500 },
        { text: "Let me know if you need anything else", delay: 1500 }
    ];

    const chatMessages = document.getElementById('chat-messages');

    function hasSeenMessages() {
        return sessionStorage.getItem('hasSeenChatMessages') === 'true';
    }
    
    function markMessagesAsSeen() {
        sessionStorage.setItem('hasSeenChatMessages', 'true');
    }

    async function showAllMessagesInstantly() {
        // Check if messages are already displayed
        const existingMessages = chatMessages.children.length;
        
        // First time loading messages in this session
        if (existingMessages === 0) {
            // Show initial messages instantly
            initialMessages.forEach(message => {
                chatMessages.appendChild(createMessage(message.text));
            });
            scrollToBottom();
    
            // Only show welcome back messages on the first return visit
            if (hasSeenMessages() && !sessionStorage.getItem('hasShownReturnMessages')) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                try {
                    const typingIndicator = await showTypingIndicator();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    typingIndicator.remove();
    
                    // Add return messages
                    for (const message of returnMessages) {
                        chatMessages.appendChild(createMessage(message.text));
                        scrollToBottom();
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                    
                    // Mark that return messages have been shown
                    sessionStorage.setItem('hasShownReturnMessages', 'true');
                } catch (error) {
                    console.error('Error showing return messages:', error);
                }
            }
    
            // If we've already shown return messages in a previous load, add them instantly
            if (sessionStorage.getItem('hasShownReturnMessages')) {
                returnMessages.forEach(message => {
                    chatMessages.appendChild(createMessage(message.text));
                });
                scrollToBottom();
            }
        }
    }

    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    async function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = `
            <div class="chat-avatar"></div>
            <div class="typing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatMessages.appendChild(typing);
        scrollToBottom();
        return typing;
    }

    function createMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <div class="chat-avatar"></div>
            <div class="chat-bubble">${text}</div>
        `;
        return messageDiv;
    }

    async function animateMessages() {
        for (const message of initialMessages) {
            const typingIndicator = await showTypingIndicator();
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            typingIndicator.remove();
            chatMessages.appendChild(createMessage(message.text));
            scrollToBottom();
            
            await new Promise(resolve => setTimeout(resolve, message.delay));
        }
        markMessagesAsSeen();
    }

    function initializeChat() {
        console.log('Initializing chat with state:', {
            hasSeenMessages: hasSeenMessages(),
            hasShownReturnMessages: sessionStorage.getItem('hasShownReturnMessages')
        });

        if (hasSeenMessages()) {
            console.log('Showing messages instantly for returning visitor');
            showAllMessagesInstantly();
        } else {
            console.log('Showing animated messages for first-time visitor');
            animateMessages();
            // Set initial message seen flag
            markMessagesAsSeen();
        }
    }

    // Initialize menu functionality after everything else
    function initializeMenu() {
        const menuButton = document.querySelector('.menu-button');
        const headerMenu = document.querySelector('.header-menu');
        
        if (!menuButton || !headerMenu) {
            console.error('Menu elements not found!');
            return;
        }

        // Toggle menu when clicking the menu button
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            headerMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!headerMenu.contains(e.target) && !menuButton.contains(e.target)) {
                headerMenu.classList.remove('active');
            }
        });
        
        // Close menu when clicking a menu item
        headerMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                headerMenu.classList.remove('active');
            }
        });
    }

    // Start the chat and menu
    initializeChat();
    initializeMenu();
});