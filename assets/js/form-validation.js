'use strict';

const FormValidation = (function() {
  // Private variables
  const errorMessages = {
    required: 'Este campo é obrigatório',
    email: 'Por favor, insira um email válido',
    default: 'Este campo contém um erro'
  };

  // Create live region for screen readers
  const createLiveRegion = () => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.classList.add('sr-only');
    document.body.appendChild(region);
    return region;
  };

  const liveRegion = createLiveRegion();

  // Private validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRequired = (value) => {
    return value.trim().length > 0;
  };

  const showError = (input, message) => {
    const errorDiv = input.nextElementSibling?.classList.contains('error-message')
      ? input.nextElementSibling
      : document.createElement('div');

    if (!input.nextElementSibling?.classList.contains('error-message')) {
      errorDiv.className = 'error-message';
      errorDiv.setAttribute('role', 'alert');
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }

    errorDiv.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    liveRegion.textContent = message;
  };

  const clearError = (input) => {
    const errorDiv = input.nextElementSibling;
    if (errorDiv?.classList.contains('error-message')) {
      errorDiv.remove();
    }
    input.setAttribute('aria-invalid', 'false');
  };

  // Form validation handler
  const validateInput = (input) => {
    clearError(input);

    // Required field validation
    if (input.hasAttribute('required') && !validateRequired(input.value)) {
      showError(input, errorMessages.required);
      return false;
    }

    // Email validation
    if (input.type === 'email' && input.value && !validateEmail(input.value)) {
      showError(input, errorMessages.email);
      return false;
    }

    return true;
  };

  // Form submission handler
  const handleSubmit = async (form) => {
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!validateInput(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      firstError?.focus();
      return false;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário');
      }

      // Success handling
      form.reset();
      liveRegion.textContent = 'Mensagem enviada com sucesso!';
      return true;
    } catch (error) {
      liveRegion.textContent = 'Erro ao enviar mensagem. Por favor, tente novamente.';
      return false;
    }
  };

  // Initialize form validation
  const init = (formSelector) => {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => validateInput(input));
      input.addEventListener('blur', () => validateInput(input));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSubmit(form);
    });
  };

  return { init };
})();
