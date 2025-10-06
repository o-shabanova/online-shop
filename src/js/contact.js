import { FormValidator } from './form-validator.js';
export class ContactFormValidator extends FormValidator {
    constructor() {
        const config = {
            form: document.querySelector('.contact-form__form'),
            submitButton: document.querySelector('.contact-form__submit'),
            fields: {
                name: document.getElementById('name'),
                email: document.getElementById('email'),
                topic: document.getElementById('topic'),
                message: document.getElementById('message')
            },
            formClassPrefix: 'contact-form'
        };
        
        super(config);
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
}
