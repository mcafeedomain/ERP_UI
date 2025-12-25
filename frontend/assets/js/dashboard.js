/**
 * University ERP - Dashboard Module
 * assets/js/dashboard.js
 * 
 * Fixed:
 * - Sidebar expand/collapse alignment
 * - Quick actions grid
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        STORAGE_KEY: 'erp_user',
        THEME_KEY: 'theme',
        SIDEBAR_KEY: 'sidebarCollapsed',
        LOGIN_URL: 'index.html',
        ROLES: {
            ADMIN: 'admin',
            FACULTY: 'faculty',
            STUDENT: 'student'
        }
    };

    // ============================================================
    // STATE
    // ============================================================
    let currentUser = null;
    let sidebarCollapsed = false;
    let sidebarMobileOpen = false;

    // ============================================================
    // DOM HELPER
    // ============================================================
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // ============================================================
    // ELEMENTS CACHE
    // ============================================================
    const elements = {};

    // ============================================================
    // INITIALIZATION
    // ============================================================
    function init() {
        if (!checkAuthentication()) return;

        cacheElements();
        setupUserDisplay();
        setupRoleBasedMenus();
        setupRoleBasedStats();
        setupQuickActions();
        setupTheme();
        setupSidebar();
        setupLogout();
        setupCurrentYear();

        console.log('%c🎓 University ERP Dashboard', 'color: #6366f1; font-weight: bold; font-size: 16px;');
        console.log('%c👤 User: ' + currentUser.name + ' (' + currentUser.role + ')', 'color: #10b981;');
    }

    // ============================================================
    // AUTHENTICATION CHECK
    // ============================================================
    function checkAuthentication() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEY);

        if (!userData) {
            redirectToLogin();
            return false;
        }

        try {
            currentUser = JSON.parse(userData);
            if (!currentUser || !currentUser.name || !currentUser.role) {
                throw new Error('Invalid user data');
            }
            return true;
        } catch (error) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            redirectToLogin();
            return false;
        }
    }

    function redirectToLogin() {
        window.location.href = CONFIG.LOGIN_URL;
    }

    // ============================================================
    // CACHE ELEMENTS
    // ============================================================
    function cacheElements() {
        elements.sidebar = $('#sidebar');
        elements.sidebarToggle = $('#sidebarToggle');
        elements.toggleIcon = $('#toggleIcon');
        elements.sidebarOverlay = $('#sidebarOverlay');
        elements.mobileMenuBtn = $('#mobileMenuBtn');
        elements.mainWrapper = $('#mainWrapper');
        elements.themeToggle = $('#themeToggle');
        elements.themeIcon = $('#themeIcon');
        elements.userName = $('#userName');
        elements.userRole = $('#userRole');
        elements.userAvatar = $('#userAvatar');
        elements.welcomeName = $('#welcomeName');
        elements.dropdownName = $('#dropdownName');
        elements.menuAdmin = $('#menu-admin');
        elements.menuFaculty = $('#menu-faculty');
        elements.menuStudent = $('#menu-student');
        elements.quickActions = $('#quickActions');
        elements.stat1 = $('#stat1');
        elements.stat2 = $('#stat2');
        elements.stat3 = $('#stat3');
        elements.stat4 = $('#stat4');
        elements.statLabel1 = $('#statLabel1');
        elements.statLabel2 = $('#statLabel2');
        elements.statLabel3 = $('#statLabel3');
        elements.statLabel4 = $('#statLabel4');
        elements.logoutBtn = $('#logoutBtn');
        elements.currentYear = $('#currentYear');
    }

    // ============================================================
    // USER DISPLAY
    // ============================================================
    function setupUserDisplay() {
        const name = currentUser.name || 'User';
        const role = currentUser.role || 'Guest';
        const initials = generateInitials(name);

        updateElement(elements.userName, name);
        updateElement(elements.userRole, capitalize(role));
        updateElement(elements.userAvatar, initials);
        updateElement(elements.welcomeName, name);
        updateElement(elements.dropdownName, name);
    }

    function generateInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ').filter(part => part.length > 0);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function updateElement(element, value) {
        if (element) element.textContent = value;
    }

    // ============================================================
    // ROLE-BASED MENUS
    // ============================================================
    function setupRoleBasedMenus() {
        const role = (currentUser.role || '').toLowerCase();

        hideElement(elements.menuAdmin);
        hideElement(elements.menuFaculty);
        hideElement(elements.menuStudent);

        switch (role) {
            case CONFIG.ROLES.ADMIN:
                showElement(elements.menuAdmin);
                showElement(elements.menuFaculty);
                break;
            case CONFIG.ROLES.FACULTY:
                showElement(elements.menuFaculty);
                break;
            case CONFIG.ROLES.STUDENT:
                showElement(elements.menuStudent);
                break;
        }
    }

    function showElement(element) {
        if (element) element.classList.remove('hidden');
    }

    function hideElement(element) {
        if (element) element.classList.add('hidden');
    }

    // ============================================================
    // ROLE-BASED STATS
    // ============================================================
    function setupRoleBasedStats() {
        const role = (currentUser.role || '').toLowerCase();

        switch (role) {
            case CONFIG.ROLES.ADMIN:
                updateStat(elements.stat1, elements.statLabel1, '2,456', 'Total Users');
                updateStat(elements.stat2, elements.statLabel2, '45', 'Departments');
                updateStat(elements.stat3, elements.statLabel3, '128', 'Total Courses');
                updateStat(elements.stat4, elements.statLabel4, '8', 'System Alerts');
                break;
            case CONFIG.ROLES.FACULTY:
                updateStat(elements.stat1, elements.statLabel1, '248', 'Total Students');
                updateStat(elements.stat2, elements.statLabel2, '94.2%', 'Attendance Rate');
                updateStat(elements.stat3, elements.statLabel3, '6', 'Active Courses');
                updateStat(elements.stat4, elements.statLabel4, '12', 'Pending Tasks');
                break;
            case CONFIG.ROLES.STUDENT:
            default:
                updateStat(elements.stat1, elements.statLabel1, '92%', 'My Attendance');
                updateStat(elements.stat2, elements.statLabel2, '8.5', 'Current CGPA');
                updateStat(elements.stat3, elements.statLabel3, '5', 'Enrolled Courses');
                updateStat(elements.stat4, elements.statLabel4, '3', 'Pending Tasks');
                break;
        }
    }

    function updateStat(valueEl, labelEl, value, label) {
        if (valueEl) valueEl.textContent = value;
        if (labelEl) labelEl.textContent = label;
    }

    // ============================================================
    // QUICK ACTIONS - FIXED ALIGNMENT
    // ============================================================
    function setupQuickActions() {
        if (!elements.quickActions) return;

        const role = (currentUser.role || '').toLowerCase();
        let html = '';

        switch (role) {
            case CONFIG.ROLES.ADMIN:
                html = getAdminActions();
                break;
            case CONFIG.ROLES.FACULTY:
                html = getFacultyActions();
                break;
            case CONFIG.ROLES.STUDENT:
            default:
                html = getStudentActions();
                break;
        }

        elements.quickActions.innerHTML = html;
    }

    function getAdminActions() {
        return `
            <a href="#" class="action-card">
                <div class="action-icon bg-indigo">
                    <i class="bi bi-person-plus-fill"></i>
                </div>
                <span class="action-label">Add User</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-emerald">
                    <i class="bi bi-building"></i>
                </div>
                <span class="action-label">Departments</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-amber">
                    <i class="bi bi-file-earmark-bar-graph"></i>
                </div>
                <span class="action-label">Reports</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-rose">
                    <i class="bi bi-gear-fill"></i>
                </div>
                <span class="action-label">Settings</span>
            </a>
        `;
    }

    function getFacultyActions() {
        return `
            <a href="#" class="action-card">
                <div class="action-icon bg-indigo">
                    <i class="bi bi-calendar-check-fill"></i>
                </div>
                <span class="action-label">Mark Attendance</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-emerald">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <span class="action-label">Enter Grades</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-amber">
                    <i class="bi bi-file-earmark-plus"></i>
                </div>
                <span class="action-label">Create Assignment</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-rose">
                    <i class="bi bi-megaphone-fill"></i>
                </div>
                <span class="action-label">Announcements</span>
            </a>
        `;
    }

    function getStudentActions() {
        return `
            <a href="#" class="action-card">
                <div class="action-icon bg-indigo">
                    <i class="bi bi-calendar-check-fill"></i>
                </div>
                <span class="action-label">View Attendance</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-emerald">
                    <i class="bi bi-award-fill"></i>
                </div>
                <span class="action-label">View Grades</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-amber">
                    <i class="bi bi-credit-card-fill"></i>
                </div>
                <span class="action-label">Pay Fees</span>
            </a>
            <a href="#" class="action-card">
                <div class="action-icon bg-rose">
                    <i class="bi bi-download"></i>
                </div>
                <span class="action-label">Download ID</span>
            </a>
        `;
    }

    // ============================================================
    // THEME
    // ============================================================
    function setupTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        applyTheme(isDark);

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem(CONFIG.THEME_KEY)) {
                applyTheme(e.matches);
            }
        });
    }

    function toggleTheme() {
        const isDark = !document.documentElement.classList.contains('dark');
        applyTheme(isDark);
        localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
    }

    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
        updateThemeIcon(isDark);
    }

    function updateThemeIcon(isDark) {
        if (elements.themeIcon) {
            elements.themeIcon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
    }

    // ============================================================
    // SIDEBAR - FIXED EXPAND/COLLAPSE
    // ============================================================
    function setupSidebar() {
        // Desktop toggle
        if (elements.sidebarToggle) {
            elements.sidebarToggle.addEventListener('click', toggleSidebarDesktop);
        }

        // Mobile toggle
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleSidebarMobile);
        }

        // Overlay click
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.addEventListener('click', closeSidebarMobile);
        }

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebarMobileOpen) {
                closeSidebarMobile();
            }
        });

        // Restore state
        restoreSidebarState();
    }

    function toggleSidebarDesktop() {
        if (!elements.sidebar) return;

        sidebarCollapsed = !sidebarCollapsed;

        if (sidebarCollapsed) {
            elements.sidebar.classList.add('collapsed');
        } else {
            elements.sidebar.classList.remove('collapsed');
        }

        // Update icon
        if (elements.toggleIcon) {
            elements.toggleIcon.className = sidebarCollapsed 
                ? 'bi bi-chevron-right' 
                : 'bi bi-chevron-left';
        }

        // Save state
        localStorage.setItem(CONFIG.SIDEBAR_KEY, sidebarCollapsed.toString());

        // Force scroll to top when expanding
        if (!sidebarCollapsed) {
            const sidebarMenu = elements.sidebar.querySelector('.sidebar-menu');
            if (sidebarMenu) {
                sidebarMenu.scrollTop = 0;
            }
        }
    }

    function toggleSidebarMobile() {
        if (!elements.sidebar || !elements.sidebarOverlay) return;

        sidebarMobileOpen = !sidebarMobileOpen;

        if (sidebarMobileOpen) {
            elements.sidebar.classList.add('mobile-open');
            elements.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            elements.sidebar.classList.remove('mobile-open');
            elements.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function closeSidebarMobile() {
        if (!elements.sidebar || !elements.sidebarOverlay) return;

        sidebarMobileOpen = false;
        elements.sidebar.classList.remove('mobile-open');
        elements.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function restoreSidebarState() {
        if (window.innerWidth < 1024) return;

        const wasCollapsed = localStorage.getItem(CONFIG.SIDEBAR_KEY) === 'true';

        if (wasCollapsed && elements.sidebar) {
            sidebarCollapsed = true;
            elements.sidebar.classList.add('collapsed');

            if (elements.toggleIcon) {
                elements.toggleIcon.className = 'bi bi-chevron-right';
            }
        }
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    function setupLogout() {
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', handleLogout);
        }

        $$('[data-logout]').forEach(function (btn) {
            btn.addEventListener('click', handleLogout);
        });
    }

    function handleLogout() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        console.log('%c👋 Logged out', 'color: #10b981;');
        redirectToLogin();
    }

    // ============================================================
    // UTILITIES
    // ============================================================
    function setupCurrentYear() {
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
