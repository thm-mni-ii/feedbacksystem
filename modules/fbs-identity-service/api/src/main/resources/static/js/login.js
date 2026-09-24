/**
 * FBS Identity Service - Login UI Script
 * Material Design interactions: Ripple effect, password visibility toggle, client validation
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initRippleEffect();
  initFormValidation();
});

/**
 * Initializes password visibility toggle button
 */
function initPasswordToggle() {
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  if (!toggleBtn || !passwordInput) return;

  const eyeIcon = toggleBtn.querySelector('.icon-eye');
  const eyeOffIcon = toggleBtn.querySelector('.icon-eye-off');

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    toggleBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.style.display = isPassword ? 'none' : 'block';
      eyeOffIcon.style.display = isPassword ? 'block' : 'none';
    }
  });
}

/**
 * Material ink ripple effect for buttons
 */
function initRippleEffect() {
  const buttons = document.querySelectorAll('.fbs-button, .fbs-github-button');

  buttons.forEach((button) => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const existingRipple = this.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      this.appendChild(circle);

      circle.addEventListener('animationend', () => {
        circle.remove();
      });
    });
  });
}

/**
 * Basic client-side validation and submit loading state
 */
function initFormValidation() {
  const form = document.getElementById('login-form');
  const submitBtn = document.getElementById('local-login-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    let isValid = true;

    // Validate username
    if (usernameInput) {
      const usernameGroup = usernameInput.closest('.fbs-form-field');
      if (!usernameInput.value.trim()) {
        isValid = false;
        if (usernameGroup) usernameGroup.classList.add('has-error');
      } else {
        if (usernameGroup) usernameGroup.classList.remove('has-error');
      }
    }

    // Validate password
    if (passwordInput) {
      const passwordGroup = passwordInput.closest('.fbs-form-field');
      if (!passwordInput.value) {
        isValid = false;
        if (passwordGroup) passwordGroup.classList.add('has-error');
      } else {
        if (passwordGroup) passwordGroup.classList.remove('has-error');
      }
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Visual loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('is-submitting');
  });

  // Clear errors on input
  [usernameInput, passwordInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      const group = input.closest('.fbs-form-field');
      if (group) group.classList.remove('has-error');
    });
  });
}
