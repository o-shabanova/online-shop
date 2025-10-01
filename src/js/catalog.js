
class CatalogManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.popup = null;
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.initPopup();
            await this.renderProducts();
            this.updateProductCount();
        } catch (error) {
            console.error('Error initializing catalog:', error);
            this.showPopup();
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
            
            // Check if no products available
            if (!this.products || this.products.length === 0) {
                throw new Error('No products available');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    }

    async renderProducts() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const productGrid = document.getElementById('catalog-products');
                if (!productGrid) {
                    console.error('Product grid container not found');
                    resolve();
                    return;
                }
                
                productGrid.innerHTML = '';

                if (this.filteredProducts.length === 0) {
                    this.showPopup();
                    this.updatePagination(0);
                    resolve();
                    return;
                }

                const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
                const startIndex = (this.currentPage - 1) * this.productsPerPage;
                const endIndex = startIndex + this.productsPerPage;
                const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

                // Create all product cards at once instead of sequentially
                const productCards = productsToShow.map(product => this.createProductCardSync(product));
                
                // Append all cards at once
                productCards.forEach(card => productGrid.appendChild(card));

                this.updatePagination(totalPages);
                resolve();
            });
        });
    }

    createProductCardSync(product) {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);

        const formattedPrice = `$${product.price}`;
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

    async createProductCard(product) {
        return new Promise((resolve) => {
            const card = this.createProductCardSync(product);
            resolve(card);
        });
    }

    // Update list count of rendered products
    updateProductCount() {
        const productCountElement = document.getElementById('productCount');
        if (productCountElement) {
            const totalProducts = this.filteredProducts.length;
            const startIndex = (this.currentPage - 1) * this.productsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.productsPerPage, totalProducts);
            
            productCountElement.innerHTML = `
                Showing <span>${totalProducts === 0 ? 0 : startIndex}</span>-<span>${totalProducts === 0 ? 0 : endIndex}</span> of <span>${totalProducts}</span> Results
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
    async goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            await this.renderProducts();
        }
    }

    // Go to previous page
    async goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.renderProducts();
        }
    }

    // Go to next page
    async goToNextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            await this.renderProducts();
        }
        // If on last page, do nothing (button remains visible but inactive)
    }

    // Filter products based on criteria
    async filterProducts(filters) {
        this.filteredProducts = this.products.filter(product => {
            // Size filter
            if (filters.size && !this.matchesSize(filters.size, product.size)) {
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
            
            // Sales filter (true => only items on sale; false => no restriction)
            if (filters.sales && !product.salesStatus) {
                return false;
            }
            
            return true;
        });

        // Reset to first page when filtering
        this.currentPage = 1;
        await this.renderProducts();
    }

    // Determine if a product size matches selected size including ranges/lists
    matchesSize(selectedSize, productSize) {
        const normalize = (str) => str.split(',').map(s => s.trim());

        const RANGE_S_TO_L = ['S', 'M', 'L'];
        const selectedIsRange = selectedSize === 'S-L';
        const selectedIsSet = selectedSize === 'S, M, XL';
        const productIsRange = productSize === 'S-L';
        const productIsSet = productSize === 'S, M, XL';

        // If user selects a single size (S/M/L/XL)
        if (!selectedIsRange && !selectedIsSet) {
            if (productIsRange) {
                return RANGE_S_TO_L.includes(selectedSize);
            }
            if (productIsSet) {
                return normalize('S, M, XL').includes(selectedSize);
            }
            // plain value comparison
            return productSize === selectedSize;
        }

        // If user selects range S-L, match products that cover that range (range or exact same label)
        if (selectedIsRange) {
            return productIsRange || productSize === 'S-L';
        }

        // If user selects set S, M, XL, match only true set-labeled products
        if (selectedIsSet) {
            return productIsSet || productSize === 'S, M, XL';
        }

        return false;
    }

    // Sort products
    async sortProducts(sortType) {
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
        await this.renderProducts();
    }

    // Search products
    async searchProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Reset to first page when searching
        this.currentPage = 1;
        await this.renderProducts();
    }

    // Initialize popup functionality
    initPopup() {
        this.popup = document.getElementById('product-not-found-popup');
        if (!this.popup) return;

        const closeBtn = this.popup.querySelector('.popup-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePopup());
        }

        // Close popup when clicking outside
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hidePopup();
            }
        });

        // Close popup with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup.classList.contains('show')) {
                this.hidePopup();
            }
        });
    }

    // Show popup
    showPopup() {
        if (this.popup) {
            this.popup.style.display = 'flex';
            // Trigger reflow to ensure display change is applied
            this.popup.offsetHeight;
            this.popup.classList.add('show');
        }
    }

    // Hide popup
    hidePopup() {
        if (this.popup) {
            this.popup.classList.remove('show');
            // Hide after animation completes
            setTimeout(() => {
                this.popup.style.display = 'none';
            }, 300);
        }
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
        // Custom select interactions
        const customSelects = filterForm.querySelectorAll('.custom-select');
        customSelects.forEach(custom => {
            const display = custom.querySelector('.select-display');
            const optionsList = custom.querySelector('.select-options');
            const targetName = custom.getAttribute('data-target');
            const hiddenSelect = filterForm.querySelector(`select[name="${targetName}"]`);

            const closeAll = () => {
                filterForm.querySelectorAll('.custom-select.open').forEach(el => {
                    el.classList.remove('open');
                });
            };

            display.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = custom.classList.contains('open');
                closeAll();
                if (!isOpen) custom.classList.add('open');
            });

            optionsList.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', () => {
                    const value = li.getAttribute('data-value') || '';
                    const label = li.textContent || 'Choose option';
                    if (hiddenSelect) {
                        hiddenSelect.value = value;
                        display.textContent = label;
                        custom.classList.remove('open');
                        applyFiltersFromForm(filterForm, catalog);
                    }
                });
            });
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            filterForm.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
        });

        // Change-based filtering for native controls
        const sizeSelect = filterForm.querySelector('select[name="size"]');
        const colorSelect = filterForm.querySelector('select[name="color"]');
        const categorySelect = filterForm.querySelector('select[name="category"]');
        const salesCheckbox = filterForm.querySelector('input[name="sales"]');

        [sizeSelect, colorSelect, categorySelect].forEach(sel => {
            if (sel) sel.addEventListener('change', () => applyFiltersFromForm(filterForm, catalog));
        });
        if (salesCheckbox) {
            salesCheckbox.addEventListener('change', () => applyFiltersFromForm(filterForm, catalog));
        }

        // Clear filters
        const clearButton = filterForm.querySelector('.btn-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                filterForm.reset();
                // Reset custom select displays
                filterForm.querySelectorAll('.custom-select .select-display').forEach(d => {
                    d.textContent = 'Choose option';
                });
                catalog.filteredProducts = [...catalog.products];
                catalog.currentPage = 1;
                catalog.renderProducts();
                catalog.updateProductCount();
            });
        }
        // Hide/Show filters
        const hideButton = filterForm.querySelector('.btn-hide');
        if (hideButton) {
            hideButton.addEventListener('click', () => {
                const filtersSection = document.querySelector('.row');
                const isHidden = filtersSection.style.display === 'none';
                
                if (isHidden) {
                    // Show filters
                    filtersSection.style.display = 'grid';
                    hideButton.textContent = 'HIDE FILTERS';
                } else {
                    // Hide filters
                    filtersSection.style.display = 'none';
                    hideButton.textContent = 'OPEN FILTERS';
                }
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

function applyFiltersFromForm(filterForm, catalog) {
    const formData = new FormData(filterForm);
    const filters = {
        size: formData.get('size') || '',
        color: formData.get('color') || '',
        category: formData.get('category') || '',
        sales: formData.has('sales')
    };
    catalog.filterProducts(filters);
}
