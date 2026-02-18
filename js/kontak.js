document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion
    const toggles = document.querySelectorAll('.faq-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;

            // Close others (Optional, but cleaner)
            toggles.forEach(otherToggle => {
                if (otherToggle !== toggle && otherToggle.classList.contains('active')) {
                    otherToggle.classList.remove('active');
                    otherToggle.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current
            toggle.classList.toggle('active');

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Contact Form Logic
    const form = document.getElementById('contact-form');
    const success = document.getElementById('contact-success');
    const btn = document.querySelector('.submit-btn');
    const spinner = document.querySelector('.spinner');
    const btnText = document.querySelector('.btn-text');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Loading
            btn.disabled = true;
            spinner.classList.remove('hidden');
            btnText.classList.add('hidden');

            setTimeout(() => {
                form.classList.add('hidden');
                form.style.display = 'none';
                success.classList.remove('hidden');
            }, 1500);
        });
    }
});
