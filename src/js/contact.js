/**
 * Contact Form Validation and Submission Handler
 * Provides real-time validation and form submission without page reload
 */
export class ContactFormValidator {
    constructor() {
        this.form = document.querySelector('.contact-form__form');
        this.submitButton = document.querySelector('.contact-form__submit');
        this.fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            topic: document.getElementById('topic'),
            message: document.getElementById('message')
        };
        
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s\u0400-\u04FF]+$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            topic: {
                required: true,
                minLength: 3,
                maxLength: 100
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 500
            }
        };
        
        this.errorMessages = {
            name: {
                required: 'Name is required',
                minLength: 'Name must be at least 2 characters long',
                maxLength: 'Name must not exceed 50 characters',
                pattern: 'Name can only contain letters and spaces'
            },
            email: {
                required: 'Email address is required',
                pattern: 'Please enter a valid email address'
            },
            topic: {
                required: 'Topic is required',
                minLength: 'Topic must be at least 3 characters long',
                maxLength: 'Topic must not exceed 100 characters'
            },
            message: {
                required: 'Message is required',
                minLength: 'Message must be at least 10 characters long',
                maxLength: 'Message must not exceed 500 characters'
            }
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearError(fieldName));
                field.addEventListener('input', () => this.validateField(fieldName));
            }
        });
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const rules = this.validationRules[fieldName];
        const value = field.value.trim();
        
        if (!rules) return true;
        
        if (rules.required && !value) {
            this.showError(fieldName, this.errorMessages[fieldName].required);
            return false;
        }
        
        if (value && rules.minLength && value.length < rules.minLength) {
            this.showError(fieldName, this.errorMessages[fieldName].minLength);
            return false;
        }
        
        if (value && rules.maxLength && value.length > rules.maxLength) {
            this.showError(fieldName, this.errorMessages[fieldName].maxLength);
            return false;
        }
        
        if (value && rules.pattern && !rules.pattern.test(value)) {
            this.showError(fieldName, this.errorMessages[fieldName].pattern);
            return false;
        }
        
        this.clearError(fieldName);
        return true;
    }
    
    showError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = document.querySelector(`.contact-form__error--${fieldName}`);
        
        if (field && errorElement) {
            field.classList.add('contact-form__input--error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    clearError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = document.querySelector(`.contact-form__error--${fieldName}`);
        
        if (field && errorElement) {
            field.classList.remove('contact-form__input--error');
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }
    
    validateAllFields() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            const fieldValid = this.validateField(fieldName);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateAllFields()) {
            this.showSubmissionMessage('Please fix the errors above before submitting.', 'error');
            return;
        }
        
        this.setSubmitButtonState(true);
        
        try {
            const formData = this.getFormData();
            await this.submitForm(formData);
            this.showSubmissionMessage('Thank you! Your message has been sent successfully.', 'success');
            this.resetForm();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showSubmissionMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            this.setSubmitButtonState(false);
        }
    }
    
    getFormData() {
        return {
            name: this.fields.name.value.trim(),
            email: this.fields.email.value.trim(),
            topic: this.fields.topic.value.trim(),
            message: this.fields.message.value.trim(),
            timestamp: new Date().toISOString()
        };
    }
    
    async submitForm(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Form submitted with data:', formData);
                resolve(formData);
            }, 1000);
        });
    }
    
    showSubmissionMessage(message, type) {
        this.removeExistingMessage();
        
        const messageElement = document.createElement('div');
        messageElement.className = `contact-form__message contact-form__message--${type}`;
        messageElement.textContent = message;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');
        
        this.form.insertBefore(messageElement, this.form.firstChild);
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
    }
    
    removeExistingMessage() {
        const existingMessage = document.querySelector('.contact-form__message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    setSubmitButtonState(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'SENDING...';
            this.submitButton.classList.add('contact-form__submit--loading');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'SEND';
            this.submitButton.classList.remove('contact-form__submit--loading');
        }
    }
    
    resetForm() {
        this.form.reset();
        Object.keys(this.fields).forEach(fieldName => {
            this.clearError(fieldName);
        });
    }
}
