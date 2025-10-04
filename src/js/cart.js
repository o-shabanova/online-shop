// Import CatalogManager
import { CatalogManager } from './catalog.js';

// Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.catalogManager = null;
        console.log('CartManager initialized with cart:', this.cart);
        this.updateCartCounter();
        this.bindEvents();
    }

    setCatalogManager(catalogManager) {
        this.catalogManager = catalogManager;
    }

    loadCart() {
        // Load cart from localStorage or initialize empty cart
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addItem(productId, quantity = 1) {
        console.log('Adding item to cart:', productId, quantity);
        
        // Try to get product data from the catalog manager if available
        let productData = null;
        
        if (this.catalogManager && this.catalogManager.products) {
            productData = this.catalogManager.products.find(p => p.id === productId);
            console.log('Found product in catalog:', productData);
        }
        
        // If not found in catalog, try to extract from DOM
        if (!productData) {
            const productElement = document.querySelector(`[data-product-id="${productId}"]`)?.closest('.product-card, .product-details');
            if (productElement) {
                const nameElement = productElement.querySelector('.product-card__name, .product-details__name, h1, h2, h3');
                const priceElement = productElement.querySelector('.product-card__price, .product-details__price');
                const imageElement = productElement.querySelector('.product-card__image, .product-details__image, img');
                
                productData = {
                    id: productId,
                    name: nameElement?.textContent?.trim() || 'Product',
                    price: this.extractPrice(priceElement?.textContent || '0'),
                    imageUrl: imageElement?.src || '/assets/product1.png'
                };
                console.log('Extracted product data from DOM:', productData);
            }
        }
        
        // Fallback if still no data found
        if (!productData) {
            productData = {
                id: productId,
                name: 'Product',
                price: 0,
                imageUrl: '/assets/product1.png',
                color: 'unknown',
                size: 'unknown'
            };
        }
        
        // Ensure productData has color and size properties
        if (!productData.color) productData.color = 'unknown';
        if (!productData.size) productData.size = 'unknown';
        
        // Find existing item with matching name, size, and color
        const existingItem = this.cart.find(item => 
            item.name === productData.name && 
            item.size === productData.size && 
            item.color === productData.color
        );
        
        if (existingItem) {
            // Merge entries and update quantity if name, size, and color match
            existingItem.quantity += quantity;
            console.log('Merged with existing item:', existingItem);
        } else {
            // Keep separate entries if only the name matches (or no match at all)
            this.cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                imageUrl: productData.imageUrl,
                color: productData.color,
                size: productData.size,
                quantity: quantity
            });
            console.log('Added new item to cart:', productData);
        }
        
        this.saveCart();
        this.updateCartCounter();
        this.dispatchCartUpdate();
    }

    removeItem(productId) {
        console.log('Removing item with ID:', productId);
        console.log('Cart before removal:', this.cart);
        this.cart = this.cart.filter(item => item.id !== productId);
        console.log('Cart after removal:', this.cart);
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

    updateItemQuantityByIndex(index, quantity) {
        if (index >= 0 && index < this.cart.length) {
            if (quantity <= 0) {
                this.cart.splice(index, 1);
            } else {
                this.cart[index].quantity = quantity;
            }
            this.saveCart();
            this.updateCartCounter();
            this.dispatchCartUpdate();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCounter();
        this.dispatchCartUpdate();
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        const subtotal = this.cart.reduce((total, item) => {
            console.log('Calculating subtotal for item:', item, 'price:', item.price, 'quantity:', item.quantity);
            return total + (item.price * item.quantity);
        }, 0);
        console.log('Total subtotal:', subtotal);
        return subtotal;
    }

    getDiscount() {
        // 10% discount for orders over $3000
        const subtotal = this.getSubtotal();
        return subtotal > 3000 ? Math.round(subtotal * 0.1) : 0;
    }

    getShipping() {
        // No shipping if cart is empty
        if (this.cart.length === 0) {
            return 0;
        }
        return 30;
    }

    getTotal() {
        return this.getSubtotal() - this.getDiscount() + this.getShipping();
    }

    extractPrice(priceText) {
        if (!priceText) return 0;
        // Remove $ and any non-numeric characters except decimal point
        const cleanPrice = priceText.replace(/[^0-9.]/g, '');
        const price = parseFloat(cleanPrice);
        return isNaN(price) ? 0 : price;
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

    renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        console.log('Rendering cart items:', this.cart);

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <h3>Your cart is empty.</h3>
                    <p>Use the catalog to add new items.</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item__image">
                    <img src="${item.imageUrl}" alt="${item.name}">
                </div>
                <div class="cart-item__name">${item.name}</div>
                <div class="cart-item__price">$${item.price}</div>
                <div class="cart-item__quantity">
                    <button class="cart-item__qty-btn cart-item__qty-btn--minus" data-product-id="${item.id}">-</button>
                    <span class="cart-item__qty-value">${item.quantity}</span>
                    <button class="cart-item__qty-btn cart-item__qty-btn--plus" data-product-id="${item.id}">+</button>
                </div>
                <div class="cart-item__total">$${item.price * item.quantity}</div>
                <div class="cart-item__delete">
                    <button class="cart-item__delete-btn" data-remove-from-cart data-product-id="${item.id}">
                        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5H19" stroke="#B92770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M17 5V19C17 19.5304 16.7893 20.0391 16.4142 20.4142C16.0391 20.7893 15.5304 21 15 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5M6 5V3C6 2.46957 6.21071 1.96086 6.58579 1.58579C6.96086 1.21071 7.46957 1 8 1H12C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V5" stroke="#B92770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M8 10V16" stroke="#B92770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M12 10V16" stroke="#B92770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCartSummary() {
        // Use IDs for reliable element selection
        const subtotalElement = document.getElementById('cart-subtotal');
        const discountElement = document.getElementById('cart-discount');
        const shippingElement = document.getElementById('cart-shipping');
        const totalElement = document.getElementById('cart-total');

        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const shipping = this.getShipping();
        const total = this.getTotal();

        if (subtotalElement) subtotalElement.textContent = `$${subtotal}`;
        if (discountElement) discountElement.textContent = `$${discount}`;
        if (shippingElement) shippingElement.textContent = `$${shipping}`;
        if (totalElement) totalElement.textContent = `$${total}`;
    }

    renderCart() {
        // Handle table header visibility based on cart content
        const cartTableHeader = document.querySelector('.cart-table__header');
        if (cartTableHeader) {
            cartTableHeader.style.display = this.cart.length === 0 ? 'none' : 'grid';
        }
        
        // Handle checkout section visibility based on cart content
        const cartCheckout = document.querySelector('.cart-checkout');
        if (cartCheckout) {
            cartCheckout.style.display = this.cart.length === 0 ? 'none' : 'block';
        }
        
        this.renderCartItems();
        this.renderCartSummary();
    }

    bindEvents() {
        // Remove existing event listeners to prevent duplicates
        if (this.eventListenersAdded) return;
        this.eventListenersAdded = true;
        
        // Listen for add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-add-to-cart]')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                const quantity = parseInt(e.target.getAttribute('data-quantity')) || 1;
                
                if (productId) {
                    this.addItem(productId, quantity);
                    // Show feedback to user
                    this.showAddToCartFeedback(e.target);
                } else {
                    console.warn('No product ID found for add to cart button');
                }
            }
        });

        // Listen for remove from cart buttons
        document.addEventListener('click', (e) => {
            // Check if the clicked element or its parent has the data-remove-from-cart attribute
            const deleteBtn = e.target.closest('[data-remove-from-cart]');
            if (deleteBtn) {
                e.preventDefault();
                const productId = deleteBtn.getAttribute('data-product-id');
                console.log('Delete button clicked for product:', productId);
                this.removeItem(productId);
            }
        });

        // Listen for quantity change buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-item__qty-btn--plus')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateItemQuantity(productId, item.quantity + 1);
                }
            }
            
            if (e.target.matches('.cart-item__qty-btn--minus')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateItemQuantity(productId, item.quantity - 1);
                }
            }
        });

        // Listen for clear cart button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-actions__btn:last-child')) {
                e.preventDefault();
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            }
        });

        // Listen for continue shopping button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-actions__btn:first-child')) {
                e.preventDefault();
                window.location.href = '/pages/catalog.html';
            }
        });

        // Listen for checkout button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-checkout__btn')) {
                e.preventDefault();
                if (this.cart.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                this.processCheckout();
            }
        });

        // Listen for cart updates to re-render cart page
        document.addEventListener('cartUpdated', () => {
            if (document.querySelector('.cart-items')) {
                this.renderCart();
            }
        });
    }

    processCheckout() {
        // Clear the cart
        this.clearCart();
        
        // Show thank you message
        this.showThankYouMessage();
    }

    showThankYouMessage() {
        // Create and display thank you message overlay
        const overlay = document.createElement('div');
        overlay.className = 'checkout-overlay';
        overlay.innerHTML = `
            <div class="checkout-message">
                <h2>Thank you for your purchase!</h2>
                <p>Your order has been processed successfully.</p>
                <button class="checkout-message__btn" onclick="this.closest('.checkout-overlay').remove()">
                    Continue Shopping
                </button>
            </div>
        `;
        
        // Add styles for the overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Style the message box
        const messageBox = overlay.querySelector('.checkout-message');
        messageBox.style.cssText = `
            background: white;
            padding: 3rem;
            border-radius: 0.5rem;
            text-align: center;
            max-width: 30rem;
            box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
        `;
        
        // Style the button
        const button = overlay.querySelector('.checkout-message__btn');
        button.style.cssText = `
            background-color: #B92770;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.25rem;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: background-color 0.3s ease;
        `;
        
        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#9a1f5a';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#B92770';
        });
        
        // Add to page and auto-remove after 5 seconds
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 5000);
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

// Export the CartManager class
export { CartManager };

