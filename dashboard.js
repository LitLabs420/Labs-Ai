// Initialize Firebase Auth
const auth = getAuth();
const db = getFirestore();

// Current user state
let currentUser = null;
let userData = null;

// Check authentication on page load
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '/auth.html';
        return;
    }

    currentUser = user;
    await loadUserData();
    initializeDashboard();
    
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    document.head.appendChild(script);
});

// Load user data from Firestore
async function loadUserData() {
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
            userData = userDoc.data();
        } else {
            // Create default user profile
            userData = {
                email: currentUser.email,
                displayName: currentUser.displayName || 'User',
                subscription: 'free',
                createdAt: new Date(),
                postsCreated: 0,
                messagesUsed: 0,
                totalRevenue: 0,
                billingCycle: 'monthly'
            };
            await setDoc(doc(db, 'users', currentUser.uid), userData);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Initialize dashboard UI
function initializeDashboard() {
    updateHeader();
    loadDashboardPage();
    setupNavigation();
    setupLogout();
}

// Update header with user info
function updateHeader() {
    document.querySelector('.user-info p:first-child').textContent = 
        userData.displayName || currentUser.email;
    document.querySelector('.user-info p:last-child').textContent = 
        `Subscription: ${userData.subscription.charAt(0).toUpperCase() + userData.subscription.slice(1)}`;
}

// Load dashboard (overview) page
function loadDashboardPage() {
    const content = document.querySelector('.content-pages');
    
    const subscriptionPlan = {
        'free': { limit: 10, used: userData.postsCreated },
        'pro': { limit: 500, used: userData.postsCreated },
        'enterprise': { limit: -1, used: userData.postsCreated }
    };

    const plan = subscriptionPlan[userData.subscription] || subscriptionPlan.free;
    const messagesLimit = {
        'free': 100,
        'pro': 10000,
        'enterprise': -1
    }[userData.subscription] || 100;

    const progressPercent = plan.limit === -1 ? 100 : (plan.used / plan.limit) * 100;
    const messagesPercent = messagesLimit === -1 ? 100 : (userData.messagesUsed / messagesLimit) * 100;

    content.innerHTML = `
        <div class="page">
            <h1>Dashboard</h1>
            <p>Welcome back, ${userData.displayName || 'User'}!</p>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Current Plan</h3>
                        <span class="stat-icon">📊</span>
                    </div>
                    <div class="stat-value">${userData.subscription.charAt(0).toUpperCase() + userData.subscription.slice(1)}</div>
                    <div class="stat-desc">Active subscription</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Posts Created</h3>
                        <span class="stat-icon">✍️</span>
                    </div>
                    <div class="stat-value">${userData.postsCreated}</div>
                    <div class="stat-desc">of ${plan.limit === -1 ? '∞' : plan.limit} monthly</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Messages Used</h3>
                        <span class="stat-icon">💬</span>
                    </div>
                    <div class="stat-value">${userData.messagesUsed}</div>
                    <div class="stat-desc">of ${messagesLimit === -1 ? '∞' : messagesLimit} monthly</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(messagesPercent, 100)}%"></div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Total Revenue</h3>
                        <span class="stat-icon">💰</span>
                    </div>
                    <div class="stat-value">$${userData.totalRevenue.toFixed(2)}</div>
                    <div class="stat-desc">Earned this month</div>
                </div>
            </div>

            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="actions-grid">
                    <button class="action-btn" onclick="navigateTo('chatbot')">
                        <span class="icon">🤖</span>
                        <span>Manage Chatbot</span>
                    </button>
                    <button class="action-btn" onclick="navigateTo('billing')">
                        <span class="icon">💳</span>
                        <span>Billing</span>
                    </button>
                    <button class="action-btn" onclick="navigateTo('settings')">
                        <span class="icon">⚙️</span>
                        <span>Settings</span>
                    </button>
                    ${userData.subscription !== 'enterprise' ? `
                        <button class="action-btn upgrade-btn" onclick="navigateTo('billing')">
                            <span class="icon">⭐</span>
                            <span>Upgrade Plan</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Load billing page
function loadBillingPage() {
    const content = document.querySelector('.content-pages');
    
    content.innerHTML = `
        <div class="page">
            <h1>Billing & Subscription</h1>
            <p>Manage your subscription and view billing history</p>

            <div class="pricing-grid">
                <div class="pricing-card ${userData.subscription === 'free' ? 'featured' : ''}">
                    ${userData.subscription === 'free' ? '<div class="badge">CURRENT PLAN</div>' : ''}
                    <h3>Free</h3>
                    <div class="price">$0<span>/month</span></div>
                    <ul>
                        <li>✓ 10 posts per month</li>
                        <li>✓ 100 messages</li>
                        <li>✓ Basic support</li>
                        <li>✗ Advanced analytics</li>
                        <li>✗ Priority support</li>
                    </ul>
                    <button class="pricing-btn" ${userData.subscription === 'free' ? 'id="current-plan" disabled' : 'onclick="handleDowngrade()"'}>
                        ${userData.subscription === 'free' ? 'Current Plan' : 'Downgrade'}
                    </button>
                </div>

                <div class="pricing-card ${userData.subscription === 'pro' ? 'featured' : ''}">
                    ${userData.subscription === 'pro' ? '<div class="badge">CURRENT PLAN</div>' : ''}
                    <h3>Pro</h3>
                    <div class="price">$29<span>/month</span></div>
                    <ul>
                        <li>✓ 500 posts per month</li>
                        <li>✓ 10,000 messages</li>
                        <li>✓ Advanced analytics</li>
                        <li>✓ Priority support</li>
                        <li>✗ Custom integrations</li>
                    </ul>
                    <button class="pricing-btn ${userData.subscription !== 'pro' ? 'upgrade-btn' : ''}" 
                            ${userData.subscription === 'pro' ? 'id="current-plan" disabled' : 'onclick="handleUpgrade(\'pro\', 2900)"'}>
                        ${userData.subscription === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                    </button>
                </div>

                <div class="pricing-card ${userData.subscription === 'enterprise' ? 'featured' : ''}">
                    ${userData.subscription === 'enterprise' ? '<div class="badge">CURRENT PLAN</div>' : ''}
                    <h3>Enterprise</h3>
                    <div class="price">Custom<span>/month</span></div>
                    <ul>
                        <li>✓ Unlimited posts</li>
                        <li>✓ Unlimited messages</li>
                        <li>✓ Full analytics suite</li>
                        <li>✓ 24/7 phone support</li>
                        <li>✓ Custom integrations</li>
                    </ul>
                    <button class="pricing-btn ${userData.subscription !== 'enterprise' ? 'upgrade-btn' : ''}" 
                            ${userData.subscription === 'enterprise' ? 'id="current-plan" disabled' : 'onclick="contactSales()"'}>
                        ${userData.subscription === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                    </button>
                </div>
            </div>

            <div class="billing-history">
                <h3>Billing History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${new Date().toLocaleDateString()}</td>
                            <td>${userData.subscription.charAt(0).toUpperCase() + userData.subscription.slice(1)} Plan - Monthly</td>
                            <td>$${userData.subscription === 'free' ? '0.00' : userData.subscription === 'pro' ? '29.00' : 'Custom'}</td>
                            <td><span style="color: #4ade80;">Paid</span></td>
                            <td><a href="#" style="color: #667eea;">Download</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load chatbot management page
function loadChatbotPage() {
    const content = document.querySelector('.content-pages');
    
    content.innerHTML = `
        <div class="page">
            <h1>Chatbot Management</h1>
            <p>Configure and monitor your GLAMFLOW AI chatbot</p>

            <div class="settings-section">
                <h3>📊 Chatbot Status</h3>
                <div class="settings-desc">Your chatbot is live and ready to chat</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div class="stat-card">
                        <div class="stat-value">1,234</div>
                        <div class="stat-desc">Total Conversations</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">156</div>
                        <div class="stat-desc">Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">94%</div>
                        <div class="stat-desc">Satisfaction Rate</div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3>⚙️ Chatbot Settings</h3>
                <div class="form-group">
                    <label for="bot-name">Bot Name</label>
                    <input type="text" id="bot-name" value="GLAMFLOW AI" />
                </div>
                <div class="form-group">
                    <label for="bot-greeting">Welcome Message</label>
                    <textarea style="width: 100%; padding: 10px; background: #2a2a4e; border: 1px solid #3a3a5e; border-radius: 6px; color: white; font-family: Arial; min-height: 100px;" id="bot-greeting">Hi! I'm GLAMFLOW AI. How can I help you with your beauty business today?</textarea>
                </div>
                <button class="save-btn" onclick="saveBotSettings()">Save Settings</button>
            </div>

            <div class="settings-section">
                <h3>🔧 Integration Code</h3>
                <div class="settings-desc">Copy this code to add the chatbot to your website</div>
                <div class="api-key-box">
                    <div class="key-display">
                        <code style="flex: 1; overflow: auto; max-height: 200px;">&lt;script src="https://studio-4627045237-a2fe9.web.app/chatbot.js"&gt;&lt;/script&gt;</code>
                        <button class="copy-btn" onclick="copyToClipboard('&lt;script src=\"https://studio-4627045237-a2fe9.web.app/chatbot.js\"&gt;&lt;/script&gt;')">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load settings page
function loadSettingsPage() {
    const content = document.querySelector('.content-pages');
    
    content.innerHTML = `
        <div class="page">
            <h1>Account Settings</h1>
            <p>Manage your account and preferences</p>

            <div class="settings-section">
                <h3>👤 Profile Information</h3>
                <div class="form-group">
                    <label for="display-name">Display Name</label>
                    <input type="text" id="display-name" value="${userData.displayName || ''}" />
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${userData.email || ''}" disabled />
                </div>
                <div class="form-group">
                    <label for="business-name">Business Name</label>
                    <input type="text" id="business-name" value="${userData.businessName || ''}" placeholder="Your beauty business name" />
                </div>
                <button class="save-btn" onclick="saveProfileSettings()">Save Profile</button>
            </div>

            <div class="settings-section">
                <h3>🔐 API Keys</h3>
                <div class="settings-desc">Use these keys to integrate with our API</div>
                <div class="api-key-box">
                    <p>Public API Key</p>
                    <div class="key-display">
                        <code>${currentUser.uid.substring(0, 20)}...</code>
                        <button class="copy-btn" onclick="copyToClipboard('${currentUser.uid}')">Copy</button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3>🔔 Preferences</h3>
                <div style="display: flex; gap: 20px; margin-top: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" checked />
                        Email notifications
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" checked />
                        Marketing emails
                    </label>
                </div>
            </div>

            <div class="settings-section" style="border: 1px solid #ef4444;">
                <h3 style="color: #ef4444;">⚠️ Danger Zone</h3>
                <button class="action-btn" style="background: #ef4444; color: white; border: none; margin-top: 15px;" onclick="confirmDelete()">
                    Delete Account
                </button>
            </div>
        </div>
    `;
}

// Navigation functions
function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const navItem = document.querySelector(`[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    switch(page) {
        case 'overview':
            loadDashboardPage();
            break;
        case 'chatbot':
            loadChatbotPage();
            break;
        case 'billing':
            loadBillingPage();
            break;
        case 'settings':
            loadSettingsPage();
            break;
    }
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

// Upgrade plan
function handleUpgrade(plan, priceInCents) {
    console.log(`Upgrading to ${plan} plan for $${priceInCents / 100}`);
    
    // Call Stripe Cloud Function to create checkout session
    const functions = firebase.functions();
    const createCheckoutSession = functions.httpsCallable('createCheckoutSession');
    
    createCheckoutSession({
        priceId: `price_${plan}_monthly`, // Update with actual Stripe Price IDs
        plan: plan
    }).then((result) => {
        window.location.href = result.data.url;
    }).catch((error) => {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    });
}

// Downgrade plan
function handleDowngrade() {
    if (confirm('Are you sure you want to downgrade to the Free plan?')) {
        updateUserSubscription('free');
    }
}

// Update subscription in Firestore
async function updateUserSubscription(newPlan) {
    try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
            subscription: newPlan,
            postsCreated: 0,
            messagesUsed: 0
        });
        
        userData.subscription = newPlan;
        updateHeader();
        loadBillingPage();
        alert(`Successfully upgraded to ${newPlan} plan!`);
    } catch (error) {
        console.error('Error updating subscription:', error);
        alert('Error updating subscription');
    }
}

// Save profile settings
async function saveProfileSettings() {
    try {
        const displayName = document.getElementById('display-name').value;
        const businessName = document.getElementById('business-name').value;

        // Update Firebase Auth display name
        if (currentUser.displayName !== displayName) {
            await updateProfile(currentUser, { displayName });
        }

        // Update Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), {
            displayName,
            businessName
        });

        userData.displayName = displayName;
        userData.businessName = businessName;
        updateHeader();
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile');
    }
}

// Save chatbot settings
function saveBotSettings() {
    const botName = document.getElementById('bot-name').value;
    const greeting = document.getElementById('bot-greeting').value;
    
    console.log('Saving bot settings:', { botName, greeting });
    alert('Chatbot settings saved successfully!');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

// Contact sales
function contactSales() {
    window.location.href = 'mailto:sales@glamflow.ai?subject=Enterprise Plan Inquiry';
}

// Confirm account deletion
function confirmDelete() {
    if (confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) {
        if (confirm('Type YES to confirm account deletion')) {
            deleteUserAccount();
        }
    }
}

// Delete user account
async function deleteUserAccount() {
    try {
        // Delete Firestore user document
        await deleteDoc(doc(db, 'users', currentUser.uid));
        
        // Delete Firebase Auth account
        await deleteUser(currentUser);
        
        window.location.href = '/auth.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account');
    }
}

// Logout
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await auth.signOut();
            window.location.href = '/auth.html';
        });
    }
}
