export class FormValidator {
    constructor(config) {
        this.form = config.form;
        this.submitButton = config.submitButton;
        this.fields = config.fields;
        this.formClassPrefix = config.formClassPrefix || 'form';
        this.validationRules = this.mergeValidationRules(config.validationRules);
        this.errorMessages = this.mergeErrorMessages(config.errorMessages);
        
        this.init();
    }
    
    getDefaultValidationRules() {
        return {
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
            },
            review: {
                required: true,
                minLength: 10,
                maxLength: 1000
            }
        };
    }
    

    getDefaultErrorMessages() {
        return {
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
            },
            review: {
                required: 'Review is required',
                minLength: 'Review must be at least 10 characters long',
                maxLength: 'Review must not exceed 1000 characters'
            }
        };
    }
    

    mergeValidationRules(customRules = {}) {
        const defaults = this.getDefaultValidationRules();
        const merged = { ...defaults };
        
        Object.keys(customRules).forEach(fieldName => {
            merged[fieldName] = { ...merged[fieldName], ...customRules[fieldName] };
        });
        
        return merged;
    }

    mergeErrorMessages(customMessages = {}) {
        const defaults = this.getDefaultErrorMessages();
        const merged = { ...defaults };
        
        Object.keys(customMessages).forEach(fieldName => {
            merged[fieldName] = { ...merged[fieldName], ...customMessages[fieldName] };
        });
        
        return merged;
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
                field.addEventListener('input', () => {
                    this.clearError(fieldName);
                    this.validateField(fieldName);
                });
            }
        });
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    getErrorElement(field, fieldName) {
        const specific = this.form.querySelector(`.${this.formClassPrefix}__error--${fieldName}`);
        if (specific) return specific;
        
        if (field?.nextElementSibling?.classList.contains(`${this.formClassPrefix}__error`)) {
            return field.nextElementSibling;
        }
        
        return this.form.querySelector(`.${this.formClassPrefix}__error`);
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const rules = this.validationRules[fieldName];
        if (!field || !rules) return true;

        const value = (field.value || '').trim();
        const errorElement = this.getErrorElement(field, fieldName);

        const show = (msg) => {
            if (errorElement) {
                errorElement.textContent = msg;
                errorElement.style.display = 'block';
            }
            field.classList.add(`${this.formClassPrefix}__input--error`);
        };

        if (rules.required && !value) {
            show(this.errorMessages[fieldName].required);
            return false;
        }
        if (value && rules.minLength && value.length < rules.minLength) {
            show(this.errorMessages[fieldName].minLength);
            return false;
        }
        if (value && rules.maxLength && value.length > rules.maxLength) {
            show(this.errorMessages[fieldName].maxLength);
            return false;
        }
        if (value && rules.pattern && !rules.pattern.test(value)) {
            show(this.errorMessages[fieldName].pattern);
            return false;
        }

        this.clearError(fieldName);
        return true;
    }
    
    showError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = this.getErrorElement(field, fieldName);
        
        if (field && errorElement) {
            field.classList.add(`${this.formClassPrefix}__input--error`);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    clearError(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return;
        const errorElement = this.getErrorElement(field, fieldName);
        field.classList.remove(`${this.formClassPrefix}__input--error`);
        if (errorElement) {
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
        const data = {};
        Object.keys(this.fields).forEach(fieldName => {
            data[fieldName] = (this.fields[fieldName]?.value || '').trim();
        });
        data.timestamp = new Date().toISOString();
        return data;
    }
    
    async submitForm(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted with data:', formData);
                resolve(formData);
            }, 1000);
        });
    }
    
    showSubmissionMessage(message, type) {
        this.removeExistingMessage();
        
        const messageElement = document.createElement('div');
        messageElement.className = `${this.formClassPrefix}__message ${this.formClassPrefix}__message--${type}`;
        messageElement.textContent = message;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');
        
        this.form.insertBefore(messageElement, this.form.firstChild);
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }, 5000);
    }
    
    removeExistingMessage() {
        const existingMessage = this.form.querySelector(`.${this.formClassPrefix}__message`);
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    setSubmitButtonState(isLoading) {
        if (!this.submitButton) return;
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'SUBMITTING...';
            this.submitButton.classList.add(`${this.formClassPrefix}__submit--loading`);
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'SUBMIT';
            this.submitButton.classList.remove(`${this.formClassPrefix}__submit--loading`);
        }
    }
    
    resetForm() {
        this.form.reset();
        Object.keys(this.fields).forEach(fieldName => {
            this.clearError(fieldName);
        });
    }
}
