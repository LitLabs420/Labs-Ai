// Scroll to section smoothly
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.elements[0].value;
    const email = form.elements[1].value;
    const message = form.elements[2].value;
    
    // Simple validation
    if (name && email && message) {
        // Show success message (in a real app, you'd send this to a server)
        alert(`Thank you, ${name}! Your message has been received.\nWe'll get back to you at ${email} soon.`);
        
        // Reset form
        form.reset();
    } else {
        alert('Please fill out all fields.');
    }
}

// Add scroll animation to elements
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all feature cards and service items
    document.querySelectorAll('.feature-card, .service-item').forEach(el => {
        el.style.animation = 'none';
        observer.observe(el);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Log deployment info
    console.log('LiTLaBs website loaded successfully!');
    console.log('Deployed with Firebase Hosting');
});
