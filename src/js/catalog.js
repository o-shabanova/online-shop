
class CatalogManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.renderProducts();
            this.updateProductCount();
        } catch (error) {
            console.error('Error initializing catalog:', error);
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('../assets/data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch products data');
            }
            const data = await response.json();
            this.products = data.data;
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    renderProducts() {
        const productGrid = document.getElementById('catalog-products');
        if (!productGrid) {
            console.error('Product grid container not found');
            return;
        }

        // Get first 12 products
        const productsToShow = this.filteredProducts.slice(0, this.productsPerPage);
        
        // Clear existing content
        productGrid.innerHTML = '';

        // Render each product
        productsToShow.forEach(product => {
            const productCard = this.createProductCard(product);
            productGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);

        // Format price
        const formattedPrice = `$${product.price}`;
        
        // Determine if product is on sale
        const saleBadge = product.salesStatus ? '<span class="badge main-button">SALE</span>' : '';

        card.innerHTML = `
            <div class="image-wrapper">
                <img class="product-image" alt="${product.name}" height="400" src="${product.imageUrl}">
                ${saleBadge}
            </div>
            <div class="product-card-info">
                <p class="product-name">${product.name}</p>
                <p class="product-price">${formattedPrice}</p>
                <button class="main-button product-button">Add To Cart</button>
            </div>
        `;

        return card;
    }

    // Update list count of rendered products
    updateProductCount() {
        const productCountElement = document.getElementById('productCount');
        if (productCountElement) {
            const totalProducts = this.filteredProducts.length;
            const displayedProducts = Math.min(this.productsPerPage, totalProducts);
            
            productCountElement.innerHTML = `
                Showing <span>1</span>-<span>${displayedProducts}</span> of <span>${totalProducts}</span> Results
            `;
        }
    }

    // Filter products based on criteria
    filterProducts(filters) {
        this.filteredProducts = this.products.filter(product => {
            // Size filter
            if (filters.size && product.size !== filters.size) {
                return false;
            }
            
            // Color filter
            if (filters.color && product.color !== filters.color) {
                return false;
            }
            
            // Category filter
            if (filters.category && product.category !== filters.category) {
                return false;
            }
            
            // Sales filter
            if (filters.sales && !product.salesStatus) {
                return false;
            }
            
            return true;
        });

        this.renderProducts();
        this.updateProductCount();
    }

    // Sort products
    sortProducts(sortType) {
        switch (sortType) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'popularity':
                this.filteredProducts.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Keep original order
                break;
        }

        this.renderProducts();
    }

    // Search products
    searchProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        this.renderProducts();
        this.updateProductCount();
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const catalog = new CatalogManager();
    
    // Set up event listeners for filters, sorting, and search
    setupEventListeners(catalog);
});

function setupEventListeners(catalog) {
    // Filter form
    const filterForm = document.getElementById('filters-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(filterForm);
            const filters = {
                size: formData.get('size'),
                color: formData.get('color'),
                category: formData.get('category'),
                sales: formData.has('sales')
            };
            
            catalog.filterProducts(filters);
        });

        // Clear filters
        const clearButton = filterForm.querySelector('.btn-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                filterForm.reset();
                catalog.filteredProducts = [...catalog.products];
                catalog.renderProducts();
                catalog.updateProductCount();
            });
        }
    }

    // Sorting
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            catalog.sortProducts(e.target.value);
        });
    }

    // Search
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = searchForm.querySelector('input[type="search"]');
            if (searchInput) {
                catalog.searchProducts(searchInput.value);
            }
        });
    }
}
