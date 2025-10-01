
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

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        
        // Get products for current page
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        // Clear existing content
        productGrid.innerHTML = '';

        // Render each product
        productsToShow.forEach(product => {
            const productCard = this.createProductCard(product);
            productGrid.appendChild(productCard);
        });

        // Update pagination
        this.updatePagination(totalPages);
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
            const startIndex = (this.currentPage - 1) * this.productsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.productsPerPage, totalProducts);
            
            productCountElement.innerHTML = `
                Showing <span>${startIndex}</span>-<span>${endIndex}</span> of <span>${totalProducts}</span> Results
            `;
        }
    }

    // Update pagination controls
    updatePagination(totalPages) {
        const paginationNumbers = document.getElementById('pagination-numbers');
        const prevButton = document.querySelector('.btn-prev');
        const nextButton = document.querySelector('.btn-next');
        
        if (!paginationNumbers || !prevButton || !nextButton) {
            return;
        }

        // Clear existing page numbers
        paginationNumbers.innerHTML = '';

        // Generate page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-number';
            pageButton.textContent = i;
            pageButton.setAttribute('data-page', i);
            
            if (i === this.currentPage) {
                pageButton.classList.add('active');
            }
            
            pageButton.addEventListener('click', () => this.goToPage(i));
            paginationNumbers.appendChild(pageButton);
        }

        // Update prev/next button visibility
        prevButton.style.display = this.currentPage > 1 ? 'block' : 'none';
        // NEXT button is always visible

        // Update product count
        this.updateProductCount();
    }

    // Navigate to specific page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProducts();
        }
    }

    // Go to previous page
    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderProducts();
        }
    }

    // Go to next page
    goToNextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderProducts();
        }
        // If on last page, do nothing (button remains visible but inactive)
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

        // Reset to first page when filtering
        this.currentPage = 1;
        this.renderProducts();
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

        // Reset to first page when sorting
        this.currentPage = 1;
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

        // Reset to first page when searching
        this.currentPage = 1;
        this.renderProducts();
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
                catalog.currentPage = 1;
                catalog.renderProducts();
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

    // Pagination navigation
    const prevButton = document.querySelector('.btn-prev');
    const nextButton = document.querySelector('.btn-next');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            catalog.goToPreviousPage();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            catalog.goToNextPage();
        });
    }
}
