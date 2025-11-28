// ===== GLAMFLOW AI - ADVANCED NAVIGATION SYSTEM =====

/**
 * Modern Navigation Hub for All Pages
 * Features:
 * - Persistent sidebar across all pages
 * - Breadcrumb navigation
 * - Search functionality
 * - Quick-access menu
 * - Mobile-responsive drawer
 * - Smooth transitions between screens
 */

const NAVIGATION_CONFIG = {
    pages: {
        'dashboard': {
            title: '📊 Dashboard',
            path: '/dashboard.html',
            icon: '📊',
            description: 'Main analytics hub',
            color: '#00d4ff',
            category: 'main'
        },
        'content': {
            title: '✍️ Content Creator',
            path: '/content.html',
            icon: '✍️',
            description: 'AI-powered content generation',
            color: '#ff0080',
            category: 'tools'
        },
        'chatbot': {
            title: '🤖 Chatbot Manager',
            path: '/chatbot-manager.html',
            icon: '🤖',
            description: 'Deploy & manage chatbots',
            color: '#00d4ff',
            category: 'tools'
        },
        'automation': {
            title: '⚡ Automation',
            path: '/automation.html',
            icon: '⚡',
            description: 'Task automation engine',
            color: '#64ffb0',
            category: 'tools'
        },
        'analytics': {
            title: '📈 Analytics',
            path: '/analytics.html',
            icon: '📈',
            description: 'Real-time business metrics',
            color: '#ff8c00',
            category: 'insights'
        },
        'billing': {
            title: '💳 Billing',
            path: '/billing.html',
            icon: '💳',
            description: 'Subscriptions & payments',
            color: '#ff8c00',
            category: 'account'
        },
        'settings': {
            title: '⚙️ Settings',
            path: '/settings.html',
            icon: '⚙️',
            description: 'Account preferences',
            color: '#40e0d0',
            category: 'account'
        },
        'templates': {
            title: '📋 Templates',
            path: '/templates.html',
            icon: '📋',
            description: 'Pre-built automation flows',
            color: '#c864ff',
            category: 'tools'
        },
        'workflows': {
            title: '🔄 Workflows',
            path: '/workflows.html',
            icon: '🔄',
            description: 'Create custom workflows',
            color: '#40e0d0',
            category: 'tools'
        },
        'team': {
            title: '👥 Team',
            path: '/team.html',
            icon: '👥',
            description: 'Manage team members',
            color: '#64ffb0',
            category: 'account'
        },
        'integrations': {
            title: '🔌 Integrations',
            path: '/integrations.html',
            icon: '🔌',
            description: 'Connect third-party apps',
            color: '#ffc864',
            category: 'tools'
        },
        'support': {
            title: '🎫 Support',
            path: '/support.html',
            icon: '🎫',
            description: 'Help & documentation',
            color: '#40e0d0',
            category: 'help'
        }
    },
    categories: {
        'main': '🏠 Main',
        'tools': '🛠️ Tools',
        'insights': '💡 Insights',
        'account': '👤 Account',
        'help': '❓ Help'
    }
};

class GlamflowNavigationSystem {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.searchResults = [];
        this.favorites = JSON.parse(localStorage.getItem('glamflow_favorites')) || [];
        this.init();
    }

    init() {
        console.log('🌐 Initializing Glamflow Navigation System');
        this.injectNavigation();
        this.setupEventListeners();
        this.setupSearch();
        this.setupMobileMenu();
        this.updateBreadcrumbs();
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'dashboard.html';
    }

    injectNavigation() {
        const navHTML = this.renderNavigation();
        const navContainer = document.getElementById('glamflow-nav-container') || this.createNavContainer();
        navContainer.innerHTML = navHTML;
        document.body.insertBefore(navContainer, document.body.firstChild);
    }

    createNavContainer() {
        const container = document.createElement('div');
        container.id = 'glamflow-nav-container';
        container.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 280px;
            height: 100vh;
            background: linear-gradient(180deg, #0a0a0a, #1a1a1a);
            border-right: 2px solid #ff0080;
            z-index: 9999;
            overflow-y: auto;
            transition: all 0.3s ease;
        `;
        return container;
    }

    renderNavigation() {
        return `
            <style>
                .glamflow-nav {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .glamflow-nav-header {
                    background: linear-gradient(135deg, #ff0080, #00d4ff);
                    padding: 1.5rem;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .glamflow-nav-header:hover {
                    transform: scale(1.05);
                }

                .search-box {
                    padding: 1rem;
                    margin: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                }

                .search-box::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .search-results {
                    max-height: 200px;
                    overflow-y: auto;
                    margin: 0 1rem;
                    margin-bottom: 1rem;
                }

                .search-result-item {
                    padding: 0.7rem;
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .search-result-item:hover {
                    background: rgba(0, 212, 255, 0.2);
                    transform: translateX(5px);
                }

                .glamflow-nav-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem 0;
                }

                .nav-category {
                    margin-bottom: 1.5rem;
                }

                .nav-category-title {
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: #00d4ff;
                    padding: 0 1rem;
                    margin-bottom: 0.7rem;
                    letter-spacing: 1px;
                }

                .nav-item {
                    padding: 0.8rem 1rem;
                    margin: 0.3rem;
                    cursor: pointer;
                    border-left: 3px solid transparent;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    font-size: 0.95rem;
                }

                .nav-item:hover {
                    background: rgba(0, 212, 255, 0.15);
                    border-left-color: #00d4ff;
                    transform: translateX(5px);
                }

                .nav-item.active {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(255, 0, 128, 0.1));
                    border-left-color: #ff0080;
                    color: #ff0080;
                    font-weight: 700;
                }

                .nav-item-icon {
                    font-size: 1.2rem;
                    width: 24px;
                    text-align: center;
                }

                .nav-item-label {
                    flex: 1;
                }

                .favorite-btn {
                    background: none;
                    border: none;
                    color: #40e0d0;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0;
                    transition: all 0.3s;
                }

                .favorite-btn:hover {
                    color: #ff0080;
                    transform: scale(1.2);
                }

                .favorite-btn.active {
                    color: #ff0080;
                }

                .glamflow-nav-footer {
                    border-top: 1px solid rgba(0, 212, 255, 0.2);
                    padding: 1rem;
                    margin-top: auto;
                }

                .mobile-menu-toggle {
                    display: none;
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #ff0080, #00d4ff);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(255, 0, 128, 0.4);
                }

                @media (max-width: 768px) {
                    #glamflow-nav-container {
                        width: 250px;
                        position: fixed;
                        left: -250px;
                        transition: left 0.3s ease;
                        z-index: 9998;
                    }

                    #glamflow-nav-container.mobile-open {
                        left: 0;
                        box-shadow: 0 0 20px rgba(255, 0, 128, 0.3);
                    }

                    .mobile-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }
            </style>

            <div class="glamflow-nav">
                <!-- HEADER -->
                <div class="glamflow-nav-header" onclick="navigateTo('dashboard')">
                    ✨ GLAMFLOW
                </div>

                <!-- SEARCH -->
                <input type="text" class="search-box" id="nav-search" placeholder="🔍 Search pages...">
                <div class="search-results" id="search-results" style="display: none;"></div>

                <!-- FAVORITES -->
                <div id="favorites-section"></div>

                <!-- NAVIGATION CONTENT -->
                <div class="glamflow-nav-content">
                    ${this.renderCategories()}
                </div>

                <!-- FOOTER -->
                <div class="glamflow-nav-footer">
                    <div class="nav-item" onclick="handleLogout()">
                        <span class="nav-item-icon">🚪</span>
                        <span class="nav-item-label">Logout</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategories() {
        let html = '';
        for (const [categoryKey, categoryName] of Object.entries(NAVIGATION_CONFIG.categories)) {
            const pages = Object.entries(NAVIGATION_CONFIG.pages)
                .filter(([, page]) => page.category === categoryKey);
            
            if (pages.length === 0) continue;

            html += `<div class="nav-category">
                <div class="nav-category-title">${categoryName}</div>
            `;

            for (const [pageKey, page] of pages) {
                const isActive = this.currentPage.includes(pageKey) ? 'active' : '';
                const isFavorite = this.favorites.includes(pageKey);

                html += `
                    <div class="nav-item ${isActive}" onclick="navigateTo('${pageKey}')">
                        <span class="nav-item-icon">${page.icon}</span>
                        <span class="nav-item-label">${page.title}</span>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); toggleFavorite('${pageKey}')">
                            ${isFavorite ? '⭐' : '☆'}
                        </button>
                    </div>
                `;
            }

            html += '</div>';
        }

        return html;
    }

    setupEventListeners() {
        const searchBox = document.getElementById('nav-search');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => this.handleSearch(e));
            searchBox.addEventListener('focus', () => {
                document.getElementById('search-results').style.display = 'block';
            });
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-box')) {
                    document.getElementById('search-results').style.display = 'none';
                }
            });
        }
    }

    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        const resultsContainer = document.getElementById('search-results');

        if (!query) {
            resultsContainer.style.display = 'none';
            return;
        }

        const results = Object.entries(NAVIGATION_CONFIG.pages).filter(([key, page]) =>
            page.title.toLowerCase().includes(query) ||
            page.description.toLowerCase().includes(query) ||
            key.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="color: #999; padding: 1rem;">No results found</div>';
        } else {
            resultsContainer.innerHTML = results.map(([key, page]) => `
                <div class="search-result-item" onclick="navigateTo('${key}')">
                    <strong>${page.icon} ${page.title}</strong>
                    <div style="font-size: 0.8rem; color: #aaa; margin-top: 0.3rem;">${page.description}</div>
                </div>
            `).join('');
        }

        resultsContainer.style.display = 'block';
    }

    setupSearch() {
        // Search functionality built into event listeners
    }

    setupMobileMenu() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '☰';
        toggle.onclick = () => {
            const nav = document.getElementById('glamflow-nav-container');
            nav.classList.toggle('mobile-open');
        };

        document.body.appendChild(toggle);

        // Close menu on page navigation
        window.addEventListener('navigated', () => {
            const nav = document.getElementById('glamflow-nav-container');
            if (window.innerWidth <= 768) {
                nav.classList.remove('mobile-open');
            }
        });
    }

    updateBreadcrumbs() {
        const page = NAVIGATION_CONFIG.pages[this.currentPage.replace('.html', '')];
        if (page) {
            document.title = `${page.title} | GLAMFLOW AI`;
        }
    }

    toggleFavorite(pageKey) {
        const index = this.favorites.indexOf(pageKey);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(pageKey);
        }
        localStorage.setItem('glamflow_favorites', JSON.stringify(this.favorites));
        this.renderFavoritesSection();
        this.injectNavigation(); // Refresh navigation
    }

    renderFavoritesSection() {
        if (this.favorites.length === 0) return;

        let html = `<div class="nav-category">
            <div class="nav-category-title">⭐ Favorites</div>
        `;

        for (const pageKey of this.favorites) {
            const page = NAVIGATION_CONFIG.pages[pageKey];
            if (page) {
                html += `
                    <div class="nav-item" onclick="navigateTo('${pageKey}')">
                        <span class="nav-item-icon">${page.icon}</span>
                        <span class="nav-item-label">${page.title}</span>
                    </div>
                `;
            }
        }

        html += '</div>';

        const section = document.getElementById('favorites-section');
        if (section) {
            section.innerHTML = html;
        }
    }
}

// ===== GLOBAL FUNCTIONS =====

function navigateTo(pageKey) {
    const page = NAVIGATION_CONFIG.pages[pageKey];
    if (page) {
        window.dispatchEvent(new CustomEvent('navigated'));
        window.location.href = page.path;
    }
}

function toggleFavorite(pageKey) {
    const nav = window.glamflowNav;
    if (nav) {
        nav.toggleFavorite(pageKey);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut().then(() => {
            window.location.href = '/index.html';
        });
    }
}

// ===== INITIALIZE ON PAGE LOAD =====
window.addEventListener('DOMContentLoaded', () => {
    window.glamflowNav = new GlamflowNavigationSystem();
});

// Adjust main content for sidebar
window.addEventListener('load', () => {
    const mainContent = document.querySelector('.main-content') || 
                       document.querySelector('main') ||
                       document.querySelector('.dashboard-container');
    
    if (mainContent) {
        mainContent.style.marginLeft = 'max(280px, 22vw)';
        mainContent.style.transition = 'margin-left 0.3s ease';
    }
});
