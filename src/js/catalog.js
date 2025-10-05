
class CatalogManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.topBestSets = [];
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
            await this.renderTopBestSets();
            this.updateProductCount();
        } catch (error) {
            console.error('Error initializing catalog:', error);
            this.showPopup();
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/assets/data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch products data');
            }
            const data = await response.json();
            this.products = data.data;
            this.topBestSets = data.topBestSets || [];
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
        const saleBadge = product.salesStatus ? '<span class="product-card__badge">SALE</span>' : '';

        card.innerHTML = `
            <div class="product-card__image-wrapper">
                <img class="product-card__image" alt="${product.name}" height="400" src="${product.imageUrl}">
                ${saleBadge}
            </div>
            <div class="product-card__info">
                <p class="product-card__name">${product.name}</p>
                <p class="product-card__price">${formattedPrice}</p>
                <button class="main-button product-card__button" data-add-to-cart data-product-id="${product.id}" data-quantity="1">Add To Cart</button>
            </div>
        `;

        // Add click event listener to navigate to product details page
        card.addEventListener('click', (event) => {
            // Don't navigate if clicking on the Add to Cart button
            if (event.target.matches('[data-add-to-cart]')) {
                return;
            }
            
            // Navigate to product details page with product ID
            window.location.href = `/pages/product-details-template.html?id=${product.id}`;
        });

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
        const prevButton = document.querySelector('.catalog-pagination__button--prev');
        const nextButton = document.querySelector('.catalog-pagination__button--next');
        
        if (!paginationNumbers || !prevButton || !nextButton) {
            return;
        }

        // Clear existing page numbers
        paginationNumbers.innerHTML = '';

        // Generate page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'catalog-pagination__number';
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

        const closeBtn = this.popup.querySelector('.catalog-popup__button');
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

    // Render top best sets section
    async renderTopBestSets() {
        if (!this.topBestSets || this.topBestSets.length === 0) {
            console.warn('No top best sets data available');
            return;
        }

        const topSetsContainer = document.querySelector('.catalog-top-sets');
        if (!topSetsContainer) {
            console.warn('Top sets container not found');
            return;
        }

        // Get three random items from topBestSets
        const randomSets = this.getRandomItems(this.topBestSets, 3);

        // Create cards for each random set
        randomSets.forEach(set => {
            const card = this.createTopSetCard(set);
            topSetsContainer.appendChild(card);
        });
    }

    // Get random items from an array
    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Create a top set card element
    createTopSetCard(set) {
        const card = document.createElement('article');
        card.className = 'catalog-top-sets__card';

        const stars = this.generateStars(set.rating);
        const formattedPrice = `$${set.price}`;

        card.innerHTML = `
            <div class="catalog-top-sets__image">
                <img src="${set.imageUrl}" alt="${set.name}" width="87" height="87" class="catalog-top-sets__photo">
            </div>
            <div class="catalog-top-sets__info">
                <p class="catalog-top-sets__desc">${set.name}</p>
                <div class="catalog-top-sets__rating">
                    ${stars}
                </div>
                <p class="catalog-top-sets__price">${formattedPrice}</p>
            </div>
        `;

        return card;
    }

    // Generate star rating HTML
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += this.createStarSVG('#F5B423');
        }

        // Half star (if needed)
        if (hasHalfStar) {
            starsHTML += this.createStarSVG('#F5B423', true);
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += this.createStarSVG('#E9E9ED');
        }

        return starsHTML;
    }

    // Create star SVG element
    createStarSVG(fillColor, isHalf = false) {
        const opacity = isHalf ? '0.5' : '1';
        return `
            <svg class="star-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.09993 0.873192C5.18181 0.704121 5.30966 0.561534 5.46884 0.461766C5.62801 0.361997 5.81207 0.309082 5.99993 0.309082C6.18778 0.309082 6.37184 0.361997 6.53101 0.461766C6.69019 0.561534 6.81804 0.704121 6.89993 0.873192L7.86193 2.87319C7.93455 3.02416 8.04395 3.15447 8.18006 3.25214C8.31617 3.34982 8.47465 3.41173 8.64093 3.43219L10.8409 3.70219C11.0307 3.72541 11.2098 3.80252 11.357 3.92438C11.5043 4.04625 11.6135 4.20777 11.6718 4.38981C11.7301 4.57186 11.735 4.76679 11.686 4.95153C11.6369 5.13627 11.5359 5.30308 11.3949 5.43219L9.81193 6.88519C9.68547 7.00097 9.59092 7.14732 9.53733 7.31018C9.48374 7.47304 9.47293 7.64695 9.50593 7.81519L9.91993 9.92619C9.95658 10.1121 9.93964 10.3047 9.87108 10.4814C9.80252 10.658 9.68517 10.8116 9.53269 10.9242C9.38021 11.0367 9.19888 11.1036 9.00984 11.1171C8.82079 11.1305 8.63182 11.09 8.46493 11.0002L6.47393 9.93019C6.32837 9.85194 6.16568 9.81099 6.00043 9.81099C5.83517 9.81099 5.67248 9.85194 5.52693 9.93019L3.53493 11.0002C3.36803 11.09 3.17906 11.1305 2.99002 11.1171C2.80097 11.1036 2.61965 11.0367 2.46717 10.9242C2.31468 10.8116 2.19733 10.658 2.12877 10.4814C2.06021 10.3047 2.04327 10.1121 2.07993 9.92619L2.49393 7.81519C2.52692 7.64695 2.51611 7.47304 2.46252 7.31018C2.40894 7.14732 2.31438 7.00097 2.18793 6.88519L0.599926 5.43119C0.45866 5.30213 0.357387 5.13526 0.308124 4.95036C0.258862 4.76547 0.263679 4.57033 0.322003 4.38809C0.380327 4.20585 0.48971 4.04418 0.63717 3.92224C0.78463 3.80031 0.963977 3.72325 1.15393 3.70019L3.35393 3.43019C3.5202 3.40973 3.67868 3.34782 3.81479 3.25014C3.9509 3.15247 4.0603 3.02216 4.13293 2.87119L5.09993 0.873192Z" fill="${fillColor}" opacity="${opacity}"/>
            </svg>
        `;
    }
}

// Export the CatalogManager class
export { CatalogManager };

// Initialize catalog setup function
export function initializeCatalog() {
    const catalogManager = new CatalogManager();
    
    // Set up event listeners for filters, sorting, and search
    setupEventListeners(catalogManager);
    
    return catalogManager;
}

function setupEventListeners(catalog) {
    // Filter form
    const filterForm = document.getElementById('catalog-filters-form');
    if (filterForm) {
        // Custom select interactions
        const customSelects = filterForm.querySelectorAll('.catalog-filters__select');
        customSelects.forEach(custom => {
            const display = custom.querySelector('.catalog-filters__select-display');
            const optionsList = custom.querySelector('.catalog-filters__select-options');
            const targetName = custom.getAttribute('data-target');
            const hiddenSelect = filterForm.querySelector(`select[name="${targetName}"]`);

            const closeAll = () => {
                filterForm.querySelectorAll('.catalog-filters__select.open').forEach(el => {
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
            filterForm.querySelectorAll('.catalog-filters__select.open').forEach(el => el.classList.remove('open'));
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
        const clearButton = filterForm.querySelector('.catalog-filters__button--clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                filterForm.reset();
                // Reset custom select displays
                filterForm.querySelectorAll('.catalog-filters__select .catalog-filters__select-display').forEach(d => {
                    d.textContent = 'Choose option';
                });
                catalog.filteredProducts = [...catalog.products];
                catalog.currentPage = 1;
                catalog.renderProducts();
                catalog.updateProductCount();
            });
        }
        // Hide/Show filters
        const hideButton = filterForm.querySelector('.catalog-filters__button--hide');
        if (hideButton) {
            hideButton.addEventListener('click', () => {
                const filtersSection = document.querySelector('.catalog-filters__row');
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
    const searchForm = document.querySelector('.catalog-controls__search');
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
    const prevButton = document.querySelector('.catalog-pagination__button--prev');
    const nextButton = document.querySelector('.catalog-pagination__button--next');
    
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
