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

  // Travel carousel
  (function setupTravelCarousel() {
    const travelCards = document.querySelector('.travel__grid');
    if (!travelCards) return;

    const cards = travelCards.querySelectorAll('.travel__card');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    if (!prevBtn || !nextBtn || cards.length === 0) return;

    const desktopTargetVisible = 4; // desktop-first requirement
    let currentIndex = 0;
    let autoSlide = null;

    travelCards.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';

    function getCardWidthWithGap() {
      const firstCard = cards[0];
      const computed = getComputedStyle(travelCards);
      const gap = parseFloat(computed.gap) || 0;
      return firstCard.offsetWidth + gap;
    }

    function getVisibleCount() {
      const cardWidthWithGap = getCardWidthWithGap();
      const container = travelCards.parentElement; // wrapper inside section container
      const containerWidth = container ? container.clientWidth : window.innerWidth;
      const approx = Math.max(1, Math.floor((containerWidth + (parseFloat(getComputedStyle(travelCards).gap) || 0)) / cardWidthWithGap));
      // Keep desktop intent but never exceed actual cards length
      return Math.min(Math.max(1, Math.min(desktopTargetVisible, approx)), cards.length);
    }

    function updateButtons() {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      const nothingToScroll = maxIndex === 0;
      // Always keep buttons visible; disable when nothing to scroll
      prevBtn.style.display = '';
      nextBtn.style.display = '';
      prevBtn.disabled = nothingToScroll || currentIndex === 0;
      nextBtn.disabled = nothingToScroll || currentIndex >= maxIndex;
      prevBtn.setAttribute('aria-disabled', String(prevBtn.disabled));
      nextBtn.setAttribute('aria-disabled', String(nextBtn.disabled));
    }

    function updateCarousel() {
      const cardWidth = getCardWidthWithGap();
      travelCards.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      updateButtons();
    }

    function goNext() {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      if (currentIndex < maxIndex) {
        currentIndex += 1;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }

    function goPrev() {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      if (currentIndex > 0) {
        currentIndex -= 1;
      } else {
        currentIndex = maxIndex;
      }
      updateCarousel();
    }

    function resetAutoSlide() {
      if (autoSlide) clearInterval(autoSlide);
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      if (maxIndex === 0) return; // don't auto-slide if there's nothing to scroll
      autoSlide = setInterval(goNext, 4000);
    }

    prevBtn.addEventListener('click', () => {
      goPrev();
      resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
      goNext();
      resetAutoSlide();
    });

    window.addEventListener('resize', () => {
      // Snap back if currentIndex exceeds new max after resize
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      updateCarousel();
      resetAutoSlide();
    });

    // Start auto-slide and initial state
    updateCarousel();
    resetAutoSlide();
  })();

    console.log('Application initialized with modules');
});
