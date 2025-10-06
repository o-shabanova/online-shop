// Main application module
import { CatalogManager, initializeCatalog } from './catalog.js';
import { CartManager } from './cart.js';
import { ContactFormValidator } from './contact.js';
import { ProductDetailsManager } from './product-details-template.js';
import { loadProductCardTemplate, renderProductCard } from './product-card.js';


//helpers functions

async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }
  //selected-product-grid
  async function renderSelectedProductsIndex() {
    const grid = document.getElementById('selected-products-grid');
    if (!grid) return; // only runs on index.html
  
    // Adjust paths as needed for your project structure
    const data = await loadJSON('/assets/data.json');
  
    const products = (data.data || []).filter(p =>
      Array.isArray(p.blocks) && p.blocks.includes('Selected Products')
    );
  
    const tpl = await loadProductCardTemplate('/components/product-card.html');
  
    const frag = document.createDocumentFragment();
    products.forEach(p => frag.appendChild(renderProductCard(tpl, p)));
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  //new-products-arrival
  async function renderNewProductsArrivalIndex() {
    const grid = document.getElementById('new-products-arrival-grid');
    if (!grid) return; // only runs on index.html
  
  const data = await loadJSON('/assets/data.json');

  const products = (data.data || []).filter(p =>
    Array.isArray(p.blocks) && p.blocks.includes('New Products Arrival')
  );
  
  const tpl = await loadProductCardTemplate('/components/product-card.html');

  const frag = document.createDocumentFragment();
  products.forEach(p => frag.appendChild(renderProductCard(tpl, p)));
  grid.innerHTML = '';
  grid.appendChild(frag);
}


// Global card navigation for all product cards (including dynamically added ones)
function setupGlobalCardNavigation() {
  document.addEventListener('click', (event) => {
    // If click happened inside the Add-to-Cart button → do nothing here.
    if (event.target.closest('[data-add-to-cart]')) {
      return;
    }

    // Navigate when clicking anywhere else on the card
    const card = event.target.closest('.product-card');
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    window.location.href = `/pages/product-details-template?id=${id}`;
  });
}
  


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

    // Initialize contact form validation (only on contact page)
    if (document.querySelector('.contact-form__form')) {
        new ContactFormValidator();
    }

    // Initialize product details manager (only on product details page)
    if (document.querySelector('.product-details')) {
        new ProductDetailsManager();
    }

    //  Home page cards (only runs if the grid exists on index.html)
    renderSelectedProductsIndex().catch(console.error);
    renderNewProductsArrivalIndex().catch(console.error);
    
    // Setup global card navigation for all product cards (including dynamically added ones)
    setupGlobalCardNavigation();

    console.log('Application initialized with modules');
});
