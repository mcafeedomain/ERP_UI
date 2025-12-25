/**
 * MICversity ERP - Landing Page
 * assets/js/landing.js
 */

(function () {
    'use strict';

    // ============================================================
    // INITIALIZATION
    // ============================================================
    document.addEventListener('DOMContentLoaded', function () {
        initParticles();
        initTheme();
        initNavbarScroll();
        initSmoothScroll();
        setCurrentYear();

        console.log('%c🎓 MICversity ERP Landing', 'color: #6366f1; font-weight: bold; font-size: 14px;');
    });

    // ============================================================
    // PARTICLES
    // ============================================================
    function initParticles() {
        if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;

        particlesJS('particles-js', {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 1000 } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                opacity: { value: 0.12, random: true, anim: { enable: true, speed: 0.3, opacity_min: 0.05, sync: false } },
                size: { value: 3, random: true, anim: { enable: true, speed: 1, size_min: 0.5, sync: false } },
                line_linked: { enable: true, distance: 150, color: '#6366f1', opacity: 0.08, width: 1 },
                move: { enable: true, speed: 0.6, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.2 } }, push: { particles_nb: 3 } }
            },
            retina_detect: true
        });
    }

    // ============================================================
    // THEME
    // ============================================================
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const html = document.documentElement;

        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            html.classList.add('dark');
            updateIcon(true);
        } else {
            html.classList.remove('dark');
            updateIcon(false);
        }

        // Toggle handler
        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                const isDark = html.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateIcon(isDark);
            });
        }

        // System change listener
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem('theme')) {
                html.classList.toggle('dark', e.matches);
                updateIcon(e.matches);
            }
        });

        function updateIcon(isDark) {
            if (themeIcon) {
                themeIcon.className = isDark ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
            }
        }
    }

    // ============================================================
    // NAVBAR SCROLL
    // ============================================================
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        }, { passive: true });
    }

    // ============================================================
    // SMOOTH SCROLL
    // ============================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = target.offsetTop - 80;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            });
        });
    }

    // ============================================================
    // UTILITY
    // ============================================================
    function setCurrentYear() {
        const el = document.getElementById('currentYear');
        if (el) el.textContent = new Date().getFullYear();
    }

})();
