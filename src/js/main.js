// Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCounter();
        this.bindEvents();
    }

    loadCart() {
        // Load cart from localStorage or initialize empty cart
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addItem(productData, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === productData.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                imageUrl: productData.imageUrl,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartCounter();
        this.dispatchCartUpdate();
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCounter();
        this.dispatchCartUpdate();
    }

    updateItemQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCounter();
                this.dispatchCartUpdate();
            }
        }
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartCounter() {
        const counter = document.querySelector('.counter-text');
        const totalItems = this.getTotalItems();
        
        if (counter) {
            counter.textContent = totalItems;
            
            // Show/hide counter based on items
            const counterCircle = document.querySelector('.header__icon__cart__counter');
            if (counterCircle) {
                if (totalItems > 0) {
                    counterCircle.style.display = 'block';
                } else {
                    counterCircle.style.display = 'none';
                }
            }
        }
    }

    dispatchCartUpdate() {
        // Dispatch custom event for other components to listen
        const event = new CustomEvent('cartUpdated', {
            detail: { cart: this.cart, totalItems: this.getTotalItems() }
        });
        document.dispatchEvent(event);
    }

    bindEvents() {
        // Listen for add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-add-to-cart]')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                const quantity = parseInt(e.target.getAttribute('data-quantity')) || 1;
                this.addItem(productId, quantity);
                
                // Show feedback to user
                this.showAddToCartFeedback(e.target);
            }
        });

        // Listen for remove from cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-remove-from-cart]')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                this.removeItem(productId);
            }
        });
    }

    showAddToCartFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 1500);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for use in other files
window.CartManager = CartManager;
