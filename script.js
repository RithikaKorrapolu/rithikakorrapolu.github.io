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
        
        if (existingMessages === 0) {
            // Only show initial messages if there are no messages displayed
            initialMessages.forEach(message => {
                chatMessages.appendChild(createMessage(message.text));
            });
            scrollToBottom();
    
            // Only show return messages if we haven't shown them before in this session
            if (hasSeenMessages() && !sessionStorage.getItem('hasShownReturnMessages')) {
                console.log('Showing return messages for returning visitor');
                
                // Add a small pause before showing the typing indicator
                await new Promise(resolve => setTimeout(resolve, 500));
                
                try {
                    // Show typing indicator for return messages
                    const typingIndicator = await showTypingIndicator();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    typingIndicator.remove();
    
                    // Add only the return messages
                    for (const message of returnMessages) {
                        chatMessages.appendChild(createMessage(message.text));
                        scrollToBottom();
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
    
                    // Mark that we've shown the return messages
                    sessionStorage.setItem('hasShownReturnMessages', 'true');
                } catch (error) {
                    console.error('Error showing return messages:', error);
                }
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
        // Log the current state when initializing
        console.log('Initializing chat with state:', {
            hasSeenMessages: hasSeenMessages(),
            hasShownReturnMessages: sessionStorage.getItem('hasShownReturnMessages')
        });
    
        if (hasSeenMessages()) {
            // For returning visitors in the same session
            console.log('Showing messages instantly for returning visitor');
            showAllMessagesInstantly();
        } else {
            // For first-time visitors
            console.log('Showing animated messages for first-time visitor');
            animateMessages();
        }
    }

    initializeChat();
});