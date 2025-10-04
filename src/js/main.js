// Main application module
import { CatalogManager, initializeCatalog } from './catalog.js';
import { CartManager } from './cart.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    let catalogManager = null;
    let cartManager = null;
    
    // Initialize catalog manager (only on catalog page)
    if (document.querySelector('#catalog-products')) {
        catalogManager = initializeCatalog();
    }
    
    // Initialize cart manager
    cartManager = new CartManager();
    
    // Pass catalog manager to cart manager for product data access
    if (catalogManager) {
        cartManager.setCatalogManager(catalogManager);
    }
    
    // If we're on the cart page, render the cart
    if (document.querySelector('.cart-items')) {
        cartManager.renderCart();
    }

    
    console.log('Application initialized with modules');
});
