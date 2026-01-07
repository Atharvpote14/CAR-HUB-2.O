// Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Action bar buttons functionality
    const bookBtn = document.querySelector('.btn-book');
    const callBtn = document.querySelector('.btn-call');
    const testdriveBtn = document.querySelector('.btn-testdrive');

    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            document.getElementById('testdrive').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    if (testdriveBtn) {
        testdriveBtn.addEventListener('click', function() {
            document.getElementById('testdrive').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    if (callBtn) {
        callBtn.addEventListener('click', function() {
            alert('Call us at: +91 8882990999 (Pune - Wellesley Road)\n+91 8882655000 (Goa)\n+91 8882155000 (Chhatrapati Sambhajinagar)');
        });
    }

    // Book Experience buttons
    const bookExperienceBtns = document.querySelectorAll('.btn-book-experience');
    bookExperienceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('testdrive').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form submission
    const testdriveForm = document.querySelector('.testdrive-form');
    if (testdriveForm) {
        testdriveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validation
            if (!data['first-name'] || !data['email'] || !data['mobile']) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data['email'])) {
                alert('Please enter a valid email address.');
                return;
            }

            // Phone validation
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(data['mobile'].replace(/\D/g, ''))) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            // Prepare email parameters
            const fullName = `${data['salutation'] ? data['salutation'] + ' ' : ''}${data['first-name']} ${data['last-name'] || ''}`.trim();
            const templateParamsOwner = {
                owner_email: document.body.dataset.ownerEmail || 'owner@example.com',
                customer_name: fullName,
                customer_email: data['email'],
                customer_mobile: data['mobile'],
                model: data['model'],
                branch: data['branch'],
                finance_interest: formData.get('finance-interest') ? 'Yes' : 'No',
                submitted_at: new Date().toLocaleString()
            };

            const templateParamsCustomer = {
                to_email: data['email'],
                to_name: fullName,
                model: data['model'],
                branch: data['branch'],
                support_email: document.body.dataset.ownerEmail || 'owner@example.com'
            };

            const serviceID = document.body.dataset.emailjsService;
            const ownerTemplateID = document.body.dataset.emailjsOwnerTemplate;
            const customerTemplateID = document.body.dataset.emailjsCustomerTemplate;
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : '';

            // Disable form and show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }

            if (typeof emailjs !== 'undefined' && serviceID && ownerTemplateID && customerTemplateID) {
                // Send email to owner first
                emailjs.send(serviceID, ownerTemplateID, templateParamsOwner)
                    .then(function() {
                        console.log('Owner notification email sent successfully');
                        // Then send thank-you email to customer
                        return emailjs.send(serviceID, customerTemplateID, templateParamsCustomer);
                    })
                    .then(function() {
                        console.log('Customer thank-you email sent successfully');
                        alert(`Thank you, ${data['first-name']}! Your test drive appointment request has been submitted successfully. A confirmation email has been sent to ${data['email']}.`);
                        testdriveForm.reset();
                    })
                    .catch(function(error) {
                        console.error('Email sending failed:', error);
                        // Check if owner email was sent but customer email failed
                        if (error.status === 200 || error.text === 'OK') {
                            alert('Your request was submitted and we have been notified. However, we could not send a confirmation email to your address. Please check your email address or contact us directly.');
                        } else {
                            alert('There was an error submitting your request. Please try again later or contact us directly.');
                        }
                    })
                    .finally(function() {
                        // Re-enable form button
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.textContent = originalButtonText;
                        }
                    });
            } else {
                // Fallback if EmailJS not configured
                console.warn('EmailJS not configured. Set EmailJS IDs in index.html data attributes.');
                console.warn('Required: emailjsUser, emailjsService, emailjsOwnerTemplate, emailjsCustomerTemplate');
                alert(`Thank you, ${data['first-name']}! Your test drive appointment request has been recorded locally.\n\nNote: Email notifications are not configured. Please set up EmailJS to enable email notifications. See EMAIL_SETUP_GUIDE.md for instructions.`);
                testdriveForm.reset();
                // Re-enable form button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });

        // --- Dry-run helper: simulate a submission when ?dryrun=1 is present in the URL
        function runDryRun() {
            console.info('Dry-run: Simulating a test-drive submission (no real emails will be sent).');

            const sample = {
                'salutation': 'Mr.',
                'first-name': 'Test',
                'last-name': 'User',
                'email': 'test@example.com',
                'mobile': '9999999999',
                'model': 'THE BMW X7',
                'branch': 'PUNE - WELLESLEY ROAD'
            };

            const fullName = `${sample['salutation'] ? sample['salutation'] + ' ' : ''}${sample['first-name']} ${sample['last-name'] || ''}`.trim();

            const templateParamsOwner = {
                owner_email: document.body.dataset.ownerEmail || 'owner@example.com',
                customer_name: fullName,
                customer_email: sample['email'],
                customer_mobile: sample['mobile'],
                model: sample['model'],
                branch: sample['branch'],
                finance_interest: 'Yes',
                submitted_at: new Date().toLocaleString()
            };

            const templateParamsCustomer = {
                to_email: sample['email'],
                to_name: fullName,
                model: sample['model'],
                branch: sample['branch'],
                support_email: document.body.dataset.ownerEmail || 'owner@example.com'
            };

            console.group('Dry-run: Email Targets & Payloads');
            console.log('Owner (notification) will be sent to:', templateParamsOwner.owner_email);
            console.log('Customer (thank-you) will be sent to:', templateParamsCustomer.to_email);
            console.log('Owner template payload:', templateParamsOwner);
            console.log('Customer template payload:', templateParamsCustomer);
            console.log('EmailJS service ID (configured):', document.body.dataset.emailjsService || '(not set)');
            console.log('Owner template ID (configured):', document.body.dataset.emailjsOwnerTemplate || '(not set)');
            console.log('Customer template ID (configured):', document.body.dataset.emailjsCustomerTemplate || '(not set)');
            console.groupEnd();

            // Provide a visual notification to the user (non-intrusive)
            alert('Dry-run complete: check the console for the intended email addresses and payloads. No emails were sent.');
        }

        if (window.location.search.includes('dryrun=1')) {
            // Delay slightly so developer console is ready in some browsers
            setTimeout(runDryRun, 200);
        }
    }

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) {
        const btn = document.createElement('div');
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        document.body.appendChild(btn);

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        });

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

    }
});


// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const totalSlides = slides.length;

function showSlide(n) {
    // Remove active class from all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to current slide
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    // Set initial slide
    showSlide(currentSlide);

    // Setup carousel buttons
    const nextBtn = document.getElementById('carouselNext');
    const prevBtn = document.getElementById('carouselPrev');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Auto advance carousel every 5 seconds
    setInterval(nextSlide, 5000);

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') {
            nextSlide();
        } else if (event.key === 'ArrowLeft') {
            prevSlide();
        }
    });
});
