// /js/components/productCard.js
export async function loadProductCardTemplate(url = '/components/product-card.html') {
    const res = await fetch(url);
    const html = await res.text();
  
    // Parse file and extract the <template> node
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const template = doc.querySelector('template');
    if (!template) throw new Error('product-card.html must contain a <template> root');
  
    return template; 
  }
  
  export function renderProductCard(templateEl, product) {
    // Clone the <template> content (a DocumentFragment)
    const node = templateEl.content.cloneNode(true);
  
    // Grab the article root
    const article = node.querySelector('.product-card');
    if (!article) return node; 
    article.dataset.id = product.id;
  
    // Image
    const img = article.querySelector('.product-card__image');
    if (img) {
      img.src = product.imageUrl;
      img.alt = product.name;
    }
  
    // Badge (SALE)
    const badge = article.querySelector('.product-card__badge');
    if (badge) {
      badge.textContent = product.salesStatus ? 'SALE' : '';
      badge.style.display = product.salesStatus ? '' : 'none';
    }
  
    // Name
    const name = article.querySelector('.product-card__name');
    if (name) name.textContent = product.name;
  
    // Price
    const price = article.querySelector('.product-card__price');
    if (price) price.textContent = `$${product.price}`;
  
    // Button
    const btn = article.querySelector('[data-add-to-cart]');
    if (btn) {
      btn.dataset.productId = product.id;
      btn.dataset.quantity = '1';
    }
  
    return node;
  }
  