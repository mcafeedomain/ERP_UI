/**
 * University ERP - Authentication Module
 * assets/js/auth.js
 * 
 * Features:
 * - Auto dark mode detection
 * - Localhost Turnstile bypass
 * - Password visibility toggle
 * - OTP verification with auto-focus & paste support
 * - Role-based login (Student, Faculty, Admin)
 * - 5-minute countdown timer
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        OTP_LENGTH: 6,
        OTP_EXPIRY_SECONDS: 300, // 5 minutes
        RESEND_COOLDOWN_SECONDS: 30,
        DEV_OTP: '123456',
        STORAGE_KEY: 'erp_user',
        LOCALHOST_HOSTS: ['localhost', '127.0.0.1', ''],
        
        // Role-based redirect URLs
        REDIRECT_URLS: {
            admin: 'pages/admin/dashboard.html',
            faculty: 'pages/faculty/dashboard.html',
            student: 'pages/student/dashboard.html'
        }
    };

    // ============================================================
    // STATE
    // ============================================================
    let turnstileVerified = false;
    let countdownInterval = null;
    let resendInterval = null;
    let timeRemaining = CONFIG.OTP_EXPIRY_SECONDS;
    const isLocalhost = CONFIG.LOCALHOST_HOSTS.includes(window.location.hostname);

    // ============================================================
    // DOM ELEMENTS CACHE
    // ============================================================
    const el = {};

    // ============================================================
    // INITIALIZATION
    // ============================================================
    document.addEventListener('DOMContentLoaded', function () {
        cacheElements();
        initParticles();
        initTheme();
        initLocalhostBypass();
        initPasswordToggle();
        initFormValidation();
        initFormSubmission();
        initOTPModal();
        setCurrentYear();

        // Console branding
        console.log('%c🎓 University ERP Authentication', 'color: #6366f1; font-weight: bold; font-size: 16px;');
        
        if (isLocalhost) {
            console.log('%c🔧 Development Mode Active', 'color: #f59e0b; font-weight: bold;');
            console.log('%c📌 Turnstile bypassed for localhost', 'color: #10b981;');
            console.log('%c🔐 Test OTP: ' + CONFIG.DEV_OTP, 'color: #10b981; font-weight: bold;');
            console.log('%c', 'color: #6366f1;');
            console.log('%c📧 Login as different roles:', 'color: #8b5cf6; font-weight: bold;');
            console.log('%c   • student@test.com → Student Dashboard', 'color: #10b981;');
            console.log('%c   • faculty@test.com → Faculty Dashboard', 'color: #f59e0b;');
            console.log('%c   • admin@test.com → Admin Dashboard', 'color: #ef4444;');
        }
    });

    // ============================================================
    // CACHE DOM ELEMENTS
    // ============================================================
    function cacheElements() {
        // Theme
        el.themeToggle = document.getElementById('themeToggle');
        el.themeIcon = document.getElementById('themeIcon');

        // Form
        el.loginForm = document.getElementById('loginForm');
        el.email = document.getElementById('email');
        el.password = document.getElementById('password');
        el.roleSelect = document.getElementById('roleSelect');
        el.togglePassword = document.getElementById('togglePassword');
        el.eyeIcon = document.getElementById('eyeIcon');
        el.submitBtn = document.getElementById('submitBtn');
        el.turnstileWrapper = document.getElementById('turnstileWrapper');

        // OTP Modal
        el.otpModal = document.getElementById('otpModal');
        el.otpContainer = document.getElementById('otpContainer');
        el.otpInputs = document.querySelectorAll('.otp-input');
        el.verifyOtpBtn = document.getElementById('verifyOtpBtn');
        el.resendOtpBtn = document.getElementById('resendOtpBtn');
        el.maskedEmail = document.getElementById('maskedEmail');
        el.countdownTimer = document.getElementById('countdownTimer');
        el.countdownText = document.getElementById('countdownText');
        el.countdownProgress = document.getElementById('countdownProgress');
        el.resendCountdown = document.getElementById('resendCountdown');

        // Toasts
        el.successToast = document.getElementById('successToast');
        el.errorToast = document.getElementById('errorToast');
        el.toastMessage = document.getElementById('toastMessage');
        el.errorMessage = document.getElementById('errorMessage');
    }

    // ============================================================
    // PARTICLES.JS INITIALIZATION
    // ============================================================
    function initParticles() {
        if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) {
            return;
        }

        const isDark = document.documentElement.classList.contains('dark');

        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: { enable: true, value_area: 1000 }
                },
                color: { value: isDark ? '#ffffff' : '#6366f1' },
                shape: { type: 'circle' },
                opacity: {
                    value: isDark ? 0.12 : 0.25,
                    random: true,
                    anim: { enable: true, speed: 0.3, opacity_min: 0.05, sync: false }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: { enable: true, speed: 1, size_min: 0.5, sync: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#6366f1',
                    opacity: isDark ? 0.08 : 0.15,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.2 } },
                    push: { particles_nb: 3 }
                }
            },
            retina_detect: true
        });
    }

    // ============================================================
    // THEME MANAGEMENT (Auto Dark Mode Detection)
    // ============================================================
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Determine initial theme
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        updateThemeIcon(shouldBeDark);

        // Theme toggle click handler
        if (el.themeToggle) {
            el.themeToggle.addEventListener('click', function () {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeIcon(isDark);
                reinitializeParticles();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem('theme')) {
                const shouldBeDark = e.matches;
                document.documentElement.classList.toggle('dark', shouldBeDark);
                updateThemeIcon(shouldBeDark);
                reinitializeParticles();
            }
        });
    }

    function updateThemeIcon(isDark) {
        if (el.themeIcon) {
            el.themeIcon.className = isDark ? 'bi bi-sun-fill text-lg' : 'bi bi-moon-fill text-lg';
        }
    }

    function reinitializeParticles() {
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }
        setTimeout(initParticles, 100);
    }

    // ============================================================
    // LOCALHOST TURNSTILE BYPASS
    // ============================================================
    function initLocalhostBypass() {
        if (isLocalhost) {
            // Hide Turnstile widget
            if (el.turnstileWrapper) {
                el.turnstileWrapper.style.display = 'none';
            }

            // Auto-verify for localhost
            turnstileVerified = true;
            updateSubmitButton();
        }
    }

    // Global Turnstile callbacks
    window.onTurnstileSuccess = function (token) {
        turnstileVerified = true;
        updateSubmitButton();
        console.log('%c✅ Turnstile verification successful', 'color: #10b981;');
    };

    window.onTurnstileExpired = function () {
        turnstileVerified = false;
        updateSubmitButton();
        console.log('%c⚠️ Turnstile expired', 'color: #f59e0b;');
    };

    window.onTurnstileError = function () {
        turnstileVerified = false;
        updateSubmitButton();
        showToast('error', 'Security verification failed. Please refresh the page.');
    };

    // ============================================================
    // PASSWORD VISIBILITY TOGGLE
    // ============================================================
    function initPasswordToggle() {
        if (!el.togglePassword || !el.password || !el.eyeIcon) return;

        el.togglePassword.addEventListener('click', function () {
            const isPassword = el.password.type === 'password';
            el.password.type = isPassword ? 'text' : 'password';
            el.eyeIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
        });
    }

    // ============================================================
    // FORM VALIDATION
    // ============================================================
    function initFormValidation() {
        if (el.email) {
            el.email.addEventListener('input', updateSubmitButton);
        }

        if (el.password) {
            el.password.addEventListener('input', updateSubmitButton);
        }
    }

    function updateSubmitButton() {
        if (!el.submitBtn) return;

        const email = el.email ? el.email.value.trim() : '';
        const password = el.password ? el.password.value : '';
        const isValid = email.length > 0 && password.length > 0 && turnstileVerified;

        el.submitBtn.disabled = !isValid;
    }

    // ============================================================
    // FORM SUBMISSION
    // ============================================================
    function initFormSubmission() {
        if (!el.loginForm) return;

        el.loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = el.email ? el.email.value.trim() : '';
            const password = el.password ? el.password.value : '';

            if (!email || !password) {
                showToast('error', 'Please fill in all fields');
                return;
            }

            if (!turnstileVerified) {
                showToast('error', 'Please complete the security verification');
                return;
            }

            // Show loading state
            setButtonLoading(el.submitBtn, true, 'Sending OTP...');

            // Simulate API call
            setTimeout(function () {
                // Reset button
                setButtonLoading(el.submitBtn, false, '<i class="bi bi-envelope-arrow-up"></i><span>Send OTP to Email</span>');

                // Print OTP to console
                console.log('%c' + '═'.repeat(50), 'color: #6366f1;');
                console.log('%c📧 OTP SENT SUCCESSFULLY!', 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log('%c🔐 Your OTP Code: ' + CONFIG.DEV_OTP, 'color: #6366f1; font-weight: bold; font-size: 20px; background: #eef2ff; padding: 10px 20px; border-radius: 8px;');
                console.log('%c' + '═'.repeat(50), 'color: #6366f1;');

                // Update masked email
                if (el.maskedEmail) {
                    el.maskedEmail.textContent = maskEmail(email);
                }

                // Show OTP modal
                showOTPModal();

                // Show success toast
                showToast('success', 'OTP sent successfully! Check console for demo code.');
            }, 1500);
        });
    }

    function setButtonLoading(button, isLoading, content) {
        if (!button) return;

        button.disabled = isLoading;

        if (isLoading) {
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span><span>' + content + '</span>';
        } else {
            button.innerHTML = content;
        }
    }

    function maskEmail(email) {
        if (email.includes('@')) {
            const [local, domain] = email.split('@');
            const masked = local.charAt(0) + '***';
            return masked + '@' + domain;
        }
        return email.charAt(0) + '***';
    }

    // ============================================================
    // OTP MODAL
    // ============================================================
    function showOTPModal() {
        if (!el.otpModal) return;

        // Reset OTP inputs
        resetOTPInputs();

        // Show modal using Bootstrap
        const modal = new bootstrap.Modal(el.otpModal);
        modal.show();

        // Start timers
        startCountdown();
        startResendCooldown();

        // Focus first input after animation
        setTimeout(function () {
            if (el.otpInputs && el.otpInputs[0]) {
                el.otpInputs[0].focus();
            }
        }, 500);
    }

    function initOTPModal() {
        if (!el.otpInputs || el.otpInputs.length === 0) return;

        // Setup OTP input handlers
        el.otpInputs.forEach(function (input, index) {
            // Input event
            input.addEventListener('input', function (e) {
                handleOTPInput(e, index);
            });

            // Keydown event
            input.addEventListener('keydown', function (e) {
                handleOTPKeydown(e, index);
            });

            // Paste event
            input.addEventListener('paste', function (e) {
                handleOTPPaste(e);
            });

            // Focus event
            input.addEventListener('focus', function () {
                this.select();
            });
        });

        // Verify button click
        if (el.verifyOtpBtn) {
            el.verifyOtpBtn.addEventListener('click', verifyOTP);
        }

        // Resend button click
        if (el.resendOtpBtn) {
            el.resendOtpBtn.addEventListener('click', handleResendOTP);
        }

        // Modal close cleanup
        if (el.otpModal) {
            el.otpModal.addEventListener('hidden.bs.modal', function () {
                clearInterval(countdownInterval);
                clearInterval(resendInterval);
                resetOTPInputs();
                timeRemaining = CONFIG.OTP_EXPIRY_SECONDS;
            });
        }
    }

    function handleOTPInput(e, index) {
        const input = e.target;
        let value = input.value;

        // Only allow digits
        value = value.replace(/\D/g, '');
        input.value = value.charAt(0) || '';

        // Update visual state
        if (input.value) {
            input.classList.add('filled');
            // Auto-focus next input
            if (index < CONFIG.OTP_LENGTH - 1) {
                el.otpInputs[index + 1].focus();
            }
        } else {
            input.classList.remove('filled');
        }

        checkOTPComplete();
    }

    function handleOTPKeydown(e, index) {
        const input = el.otpInputs[index];

        switch (e.key) {
            case 'Backspace':
                if (!input.value && index > 0) {
                    el.otpInputs[index - 1].focus();
                    el.otpInputs[index - 1].select();
                }
                break;

            case 'ArrowLeft':
                if (index > 0) {
                    e.preventDefault();
                    el.otpInputs[index - 1].focus();
                }
                break;

            case 'ArrowRight':
                if (index < CONFIG.OTP_LENGTH - 1) {
                    e.preventDefault();
                    el.otpInputs[index + 1].focus();
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (!el.verifyOtpBtn.disabled) {
                    verifyOTP();
                }
                break;
        }
    }

    function handleOTPPaste(e) {
        e.preventDefault();

        const pasteData = (e.clipboardData || window.clipboardData)
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, CONFIG.OTP_LENGTH);

        if (pasteData.length === 0) return;

        // Fill inputs with pasted data
        el.otpInputs.forEach(function (input, i) {
            input.value = pasteData[i] || '';
            input.classList.toggle('filled', !!pasteData[i]);
        });

        // Focus appropriate input
        const focusIndex = Math.min(pasteData.length, CONFIG.OTP_LENGTH - 1);
        el.otpInputs[focusIndex].focus();

        checkOTPComplete();

        console.log('%c📋 Pasted OTP: ' + pasteData, 'color: #6366f1;');
    }

    function checkOTPComplete() {
        const otp = getOTPValue();
        const isComplete = otp.length === CONFIG.OTP_LENGTH;
        const hasTime = timeRemaining > 0;

        if (el.verifyOtpBtn) {
            el.verifyOtpBtn.disabled = !isComplete || !hasTime;
        }
    }

    function getOTPValue() {
        return Array.from(el.otpInputs).map(function (input) {
            return input.value;
        }).join('');
    }

    function resetOTPInputs() {
        if (!el.otpInputs) return;

        el.otpInputs.forEach(function (input) {
            input.value = '';
            input.classList.remove('filled', 'success', 'error');
        });

        if (el.verifyOtpBtn) {
            el.verifyOtpBtn.disabled = true;
            el.verifyOtpBtn.innerHTML = '<i class="bi bi-check-circle"></i><span>Verify & Login</span>';
        }
    }

    // ============================================================
    // OTP VERIFICATION
    // ============================================================
    function verifyOTP() {
        const otp = getOTPValue();

        if (otp.length !== CONFIG.OTP_LENGTH) {
            showToast('error', 'Please enter a valid 6-digit OTP');
            shakeOTPInputs();
            return;
        }

        // Show loading state
        setButtonLoading(el.verifyOtpBtn, true, 'Verifying...');

        // Simulate verification
        setTimeout(function () {
            if (otp === CONFIG.DEV_OTP) {
                handleVerificationSuccess();
            } else {
                handleVerificationFailure();
            }
        }, 1500);
    }

    // ============================================================
    // VERIFICATION SUCCESS - ROLE-BASED LOGIN
    // ============================================================
    function handleVerificationSuccess() {
        // Update inputs to success state
        el.otpInputs.forEach(function (input) {
            input.classList.remove('filled', 'error');
            input.classList.add('success');
        });

        // Get email and determine role
        const emailValue = el.email ? el.email.value.trim().toLowerCase() : '';
        
        // Check if role selector exists
        const roleSelect = document.getElementById('roleSelect');
        let userRole = 'student'; // Default role
        let userName = 'Student User';

        if (roleSelect) {
            // Use dropdown selection if available
            userRole = roleSelect.value;
        } else {
            // Detect role from email pattern
            if (emailValue.includes('admin')) {
                userRole = 'admin';
            } else if (emailValue.includes('faculty') || emailValue.includes('prof') || emailValue.includes('dr.') || emailValue.includes('teacher')) {
                userRole = 'faculty';
            } else {
                userRole = 'student';
            }
        }

        // Set name based on role
        switch (userRole) {
            case 'admin':
                userName = 'Admin User';
                break;
            case 'faculty':
                userName = 'Dr. Sharma';
                break;
            case 'student':
            default:
                userName = 'John Student';
                break;
        }

        // Store user data
        const userData = {
            role: userRole,
            name: userName,
            email: emailValue,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(userData));

        // Console output
        console.log('%c' + '═'.repeat(50), 'color: #10b981;');
        console.log('%c✅ LOGIN SUCCESSFUL!', 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log('%c👤 User: ' + userData.name, 'color: #6366f1;');
        console.log('%c🎭 Role: ' + userData.role.toUpperCase(), 'color: #6366f1;');
        console.log('%c📧 Email: ' + userData.email, 'color: #6366f1;');
        console.log('%c' + '═'.repeat(50), 'color: #10b981;');

        // Show success message
        showToast('success', 'Login successful! Redirecting to ' + userRole + ' dashboard...');

        // Alert success
        alert('✅ Login Successful!\n\nWelcome, ' + userData.name + '!\nRole: ' + userData.role.charAt(0).toUpperCase() + userData.role.slice(1));

        // Redirect based on role
        setTimeout(function () {
            const redirectUrl = CONFIG.REDIRECT_URLS[userRole] || CONFIG.REDIRECT_URLS.student;
            console.log('%c🔄 Redirecting to: ' + redirectUrl, 'color: #8b5cf6;');
            window.location.href = redirectUrl;
        }, 1500);
    }

    function handleVerificationFailure() {
        // Reset button
        setButtonLoading(el.verifyOtpBtn, false, '<i class="bi bi-check-circle"></i><span>Verify & Login</span>');

        // Show error
        showToast('error', 'Invalid OTP. Please try again.');

        // Shake inputs
        shakeOTPInputs();

        // Clear inputs after shake
        setTimeout(resetOTPInputs, 600);

        console.log('%c❌ Invalid OTP entered', 'color: #ef4444; font-weight: bold;');
    }

    function shakeOTPInputs() {
        if (!el.otpContainer || !el.otpInputs) return;

        // Add error state to inputs
        el.otpInputs.forEach(function (input) {
            input.classList.add('error');
        });

        // Add shake animation
        el.otpContainer.classList.add('animate-shake');

        // Remove after animation completes
        setTimeout(function () {
            el.otpContainer.classList.remove('animate-shake');
            el.otpInputs.forEach(function (input) {
                input.classList.remove('error');
            });
        }, 600);
    }

    // ============================================================
    // COUNTDOWN TIMER
    // ============================================================
    function startCountdown() {
        clearInterval(countdownInterval);
        timeRemaining = CONFIG.OTP_EXPIRY_SECONDS;

        // Circumference for SVG circle (radius = 45)
        const circumference = 2 * Math.PI * 45; // 282.74

        // Reset progress ring
        if (el.countdownProgress) {
            el.countdownProgress.style.strokeDashoffset = '0';
            el.countdownProgress.style.stroke = '#6366f1';
        }

        // Update display immediately
        updateCountdownDisplay();

        // Start interval
        countdownInterval = setInterval(function () {
            timeRemaining--;
            updateCountdownDisplay();

            // Update progress ring
            if (el.countdownProgress) {
                const progress = (CONFIG.OTP_EXPIRY_SECONDS - timeRemaining) / CONFIG.OTP_EXPIRY_SECONDS;
                el.countdownProgress.style.strokeDashoffset = circumference * progress;

                // Change color based on time remaining
                if (timeRemaining <= 60) {
                    el.countdownProgress.style.stroke = '#ef4444'; // Red
                } else if (timeRemaining <= 120) {
                    el.countdownProgress.style.stroke = '#f59e0b'; // Orange
                }
            }

            // Check if expired
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);

                if (el.verifyOtpBtn) {
                    el.verifyOtpBtn.disabled = true;
                }

                showToast('error', 'OTP expired. Please request a new one.');
                console.log('%c⏰ OTP Expired', 'color: #ef4444; font-weight: bold;');
            }
        }, 1000);
    }

    function updateCountdownDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        // Update timer display
        if (el.countdownTimer) {
            el.countdownTimer.textContent = minutes + ':' + seconds.toString().padStart(2, '0');
        }

        // Update text display
        if (el.countdownText) {
            if (timeRemaining > 60) {
                el.countdownText.textContent = minutes + ' minute' + (minutes !== 1 ? 's' : '');
            } else if (timeRemaining > 0) {
                el.countdownText.textContent = timeRemaining + ' second' + (timeRemaining !== 1 ? 's' : '');
            } else {
                el.countdownText.textContent = 'Expired';
            }
        }
    }

    // ============================================================
    // RESEND OTP
    // ============================================================
    function startResendCooldown() {
        clearInterval(resendInterval);
        let cooldown = CONFIG.RESEND_COOLDOWN_SECONDS;

        if (el.resendOtpBtn) {
            el.resendOtpBtn.disabled = true;
        }

        if (el.resendCountdown) {
            el.resendCountdown.classList.remove('hidden');
            el.resendCountdown.textContent = '(' + cooldown + 's)';
        }

        resendInterval = setInterval(function () {
            cooldown--;

            if (el.resendCountdown) {
                el.resendCountdown.textContent = '(' + cooldown + 's)';
            }

            if (cooldown <= 0) {
                clearInterval(resendInterval);

                if (el.resendOtpBtn) {
                    el.resendOtpBtn.disabled = false;
                }

                if (el.resendCountdown) {
                    el.resendCountdown.classList.add('hidden');
                }
            }
        }, 1000);
    }

    function handleResendOTP() {
        // Reset inputs
        resetOTPInputs();

        // Restart timers
        startCountdown();
        startResendCooldown();

        // Focus first input
        if (el.otpInputs && el.otpInputs[0]) {
            el.otpInputs[0].focus();
        }

        // Log new OTP
        console.log('%c' + '═'.repeat(50), 'color: #6366f1;');
        console.log('%c📧 NEW OTP SENT!', 'color: #10b981; font-weight: bold; font-size: 14px;');
        console.log('%c🔐 Your OTP Code: ' + CONFIG.DEV_OTP, 'color: #6366f1; font-weight: bold; font-size: 20px; background: #eef2ff; padding: 10px 20px; border-radius: 8px;');
        console.log('%c' + '═'.repeat(50), 'color: #6366f1;');

        // Show success toast
        showToast('success', 'New OTP sent successfully!');
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(type, message) {
        const toast = type === 'success' ? el.successToast : el.errorToast;
        const messageEl = type === 'success' ? el.toastMessage : el.errorMessage;

        if (!toast || !messageEl) return;

        messageEl.textContent = message;

        const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
        bsToast.show();
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    function setCurrentYear() {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

})();
