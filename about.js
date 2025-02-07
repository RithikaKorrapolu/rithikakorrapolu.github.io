// about.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("About page loaded");

    const contentContainer = document.querySelector('.content-container');
    console.log("Content container found:", contentContainer);

    let currentSlide = 0;

    const slides = [
        {
            content: `
                <div class="slide-content">
                    <div class="slide-header">
                        <h1>What I'm about</h1>
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Who and where I'm from</h2>
                            <img src="family.jpg" alt="Family photo" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>Born in 1997, I was raised in <a href="#" class="link">Paradise</a> by my earnest and hard working family. My mom's dream was to come to America so my parents immigrated with 70$ in their pocket. My dad worked at a school cafeteria at first. They saved enough so that they could both go to school. My dad became an engineer, my mom a nurse. They sent money home to their families every month. They made it. I live in NYC now and get to see them often.</p>
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
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Weaknesses</h2>
                            <img src="weaknesses.jpg" alt="Childhood photo" class="slide-image">
                            <div class="quote-container">
                                <p class="quote">"I'm so embarrassed. I'm not a real person yet."</p>
                                <p class="quote-author">- From Frances Ha</p>
                            </div>
                        </div>
                        <div class="slide-column-right">
                            <p>I'm allergic to tree nuts. I'll start crying if you try to teach me about the <a href="#" class="link">stock market</a>. Sometimes, I pretend like I understand what someone is saying even though I don't because I don't want them to think I'm dumb. It happens the most with new people in my life. I also need to get better at handling feedback more objectively. I can be overly sensitive. I'll strive to be stronger in these areas.</p>
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
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Strengths</h2>
                            <img src="strengths.jpg" alt="Photo in office" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I know two magic tricks. I am generally optimistic about people and humanity. A friend told me once I have a disarming personality. I really hope that's true - I want people to feel safe and sincere and playful when they talk to me. Also, I'm pretty sure I can do the <a href="#" class="link">macarena</a> to any song.</p>
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
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Work</h2>
                            <img src="work.jpg" alt="Big Suit Show photo" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I'm on the <a href="#" class="link">Responsible AI team</a> at Microsoft. I help set product policy around emerging AI technologies and domains. My job is cool.</p>
                            <p><br>I'm also working on a comedy talk show with my friend Crystal. It's called <a href="#" class="link">The Big Suit Show</a>. I love making it so much. You should check it out.</p>
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
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                            <h2>Hobbies</h2>
                            <img src="hobbies.jpg" alt="Photo with hat" class="slide-image">
                        </div>
                        <div class="slide-column-right">
                            <p>I like doing bad improv. I really like getting my friends to do bad improv. I work part-time at bars and restaurants. And think everyone should. I host dinners and workout and practice how I'm going to dance at the next party I get invited to. I collect gadgets. I love pranks. More stuff I like <a href="#" class="link">here</a>.</p>
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
                        <p class="subtitle">A slideshow</p>
                    </div>
                    <div class="slide-main">
                        <div class="slide-column-left">
                        <h2>Testimonials</h2>
                            <div class="testimonial-box">
                                <p class="quote">"Even though you have hair, I can see you being one of those people that has a bunch of weird wigs."</p>
                                <p class="quote-author">- one of my best friends</p>
                            </div>
                        </div>
                        <div class="slide-column-right">
                            <p>In general, I hope this presentation inspires you to fly free and reach for the stars and say "I love you" more.</p>
                            <p>And if you want to talk, come <a href="#" class="link">here</a></p>
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
        console.log("Updating to slide:", currentSlide);
        const slideContent = slides[currentSlide].content;
        contentContainer.innerHTML = `
            ${slideContent}
            <div class="navigation ${currentSlide === 0 ? 'first-slide' : ''}">
                ${currentSlide > 0 ? createNavButton('prev').outerHTML : ''}
                ${currentSlide < slides.length - 1 ? createNavButton('next').outerHTML : ''}
            </div>
            <div class="slide-counter">${currentSlide + 1}/${slides.length}</div>
        `;
    
        // Add event listeners to new buttons
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
});