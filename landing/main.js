/* ============================================
   ANCHOR — Notion + Palantir + Oceanic JS
   ============================================ */

// --- Navbar scroll ---
const navbar = document.getElementById('navbar');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
            ticking = false;
        });
        ticking = true;
    }
});

// --- Mobile menu ---
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');

mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// --- Scroll reveal (Intersection Observer) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px',
});

document.querySelectorAll('.feature-card, .wf-step, .data-row:not(.header-row)').forEach(el => {
    revealObserver.observe(el);
});

// --- CTA form ---
const ctaForm = document.getElementById('cta-form');
ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('email-input');
    const btn = ctaForm.querySelector('.btn');
    if (input.value) {
        btn.textContent = '✓ You\'re in';
        btn.style.pointerEvents = 'none';
        btn.style.background = '#059669';
        input.value = '';
        input.placeholder = 'Welcome aboard!';
        input.disabled = true;
    }
});

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
