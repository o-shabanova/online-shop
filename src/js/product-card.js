export async function loadProductCardTemplate(url = '/components/product-card.html') {
    const res = await fetch(url);
    const html = await res.text();
  
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const template = doc.querySelector('template');
    if (!template) throw new Error('product-card.html must contain a <template> root');
  
    return template; 
  }
  
  export function renderProductCard(templateEl, product) {
    const node = templateEl.content.cloneNode(true);
  
    const article = node.querySelector('.product-card');

    const applyIf = (selector, fn) => {
      if (!article) return;
      const el = article.querySelector(selector);
      if (el) fn(el);
    };

    if (article) {
      article.dataset.id = product.id;
    }

    applyIf('.product-card__image', (el) => {
      el.src = product.imageUrl;
      el.alt = product.name;
    });

    applyIf('.product-card__badge', (el) => {
      el.textContent = product.salesStatus ? 'SALE' : '';
      el.style.display = product.salesStatus ? '' : 'none';
    });

    applyIf('.product-card__name', (el) => {
      el.textContent = product.name;
    });

    applyIf('.product-card__price', (el) => {
      el.textContent = `$${product.price}`;
    });

    applyIf('[data-add-to-cart]', (el) => {
      el.dataset.productId = product.id;
      el.dataset.quantity = '1';
    });
  
    return node;
  }
  