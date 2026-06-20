// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navigation Smooth Scrolling
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSec = document.querySelector(targetId);
            
            if (targetSec) {
                window.scrollTo({
                    top: targetSec.offsetTop - 80, // Offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Intersection Observer for scroll animations (fade-up elements)
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const fadeObserverOptions = {
        root: null,
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated if we don't want it to trigger again on scroll up
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // 3. Navbar background style on scroll (make it more opaque)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(7, 9, 15, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.8)';
        } else {
            navbar.style.background = 'rgba(7, 9, 15, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 4. Handle Join Form Submission to Flask Backend
    const joinForm = document.getElementById('joinForm');
    const formMessage = document.getElementById('form-message');

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            formMessage.textContent = 'Submitting...';
            formMessage.className = 'form-message';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                plan: document.getElementById('plan').value
            };
            
            try {
                const response = await fetch('/api/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    formMessage.textContent = result.message || 'Successfully joined! We will contact you soon.';
                    formMessage.className = 'form-message success';
                    joinForm.reset();
                } else {
                    formMessage.textContent = result.error || 'An error occurred. Please try again.';
                    formMessage.className = 'form-message error';
                }
            } catch (error) {
                console.error('Submission error:', error);
                formMessage.textContent = 'Failed to connect to the server. Is it running?';
                formMessage.className = 'form-message error';
            }
        });
    }

    // Connect Join Buttons to form
    const joinBtns = document.querySelectorAll('.btn-primary, .btn-outline');
    joinBtns.forEach(btn => {
        if(btn.textContent === 'Select Plan' || btn.textContent === 'Join Now') {
            btn.addEventListener('click', (e) => {
                if(!btn.getAttribute('href') && !btn.getAttribute('type')) {
                    e.preventDefault();
                    // Optional: pre-select plan if clicking a specific card
                    const planTitle = btn.closest('.pricing-card')?.querySelector('.card-header h3');
                    if(planTitle) {
                        const select = document.getElementById('plan');
                        for(let i=0; i<select.options.length; i++) {
                            if(select.options[i].text.includes(planTitle.textContent)) {
                                select.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    
                    const joinSection = document.getElementById('join');
                    if (joinSection) {
                        window.scrollTo({
                            top: joinSection.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });
});
