
document.addEventListener('DOMContentLoaded', function () {
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.addEventListener('error', function () {
            this.style.display = 'none';
            const wrapper = this.parentElement;
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width:100%; height:100%; border-radius:50%;
                background: linear-gradient(135deg, #00ffcc 0%, #0070ff 100%);
                display:flex; align-items:center; justify-content:center;
                font-size:50px;
            `;
            placeholder.textContent = '🐧';
            wrapper.appendChild(placeholder);
        });
    }
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
    const sections = document.querySelectorAll('section[id], .section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();
    const hamburger = document.getElementById('hamburger');
    const navLinksEl = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinksEl.classList.toggle('open');
    });
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinksEl.classList.remove('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('open');
            navLinksEl.classList.remove('open');
        }
    });
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const children = entry.target.querySelectorAll('.stat-card, .link-card, .project-card, .vuln-card, .course-card');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${i * 60}ms`;
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hamburger.classList.remove('open');
            navLinksEl.classList.remove('open');
        }
    });
});
