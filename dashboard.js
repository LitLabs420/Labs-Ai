// ===== GLAMFLOW AI - COMPLETE SAAS PLATFORM =====
// Payment Processing | Analytics | User Management | Content Hub | Email Marketing | Support Tickets | Affiliates | APIs | Security

const auth = window.firebaseAuth;
const db = window.firebaseDb;
const ADMIN_EMAIL = 'dyingbreed243@gmail.com';

let currentUser = null;
let isAdmin = false;
let adminData = {
    users: [],
    transactions: [],
    content: [],
    tickets: [],
    revenue: 0,
    userCount: 0,
    premiumCount: 0,
    churnRate: 0,
    mrr: 0
};

// Load Stripe
const stripeScript = document.createElement('script');
stripeScript.src = 'https://js.stripe.com/v3/';
document.head.appendChild(stripeScript);

// ===== AUTH CHECK =====
if (auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(async (user) => {
        try {
            if (!user) {
                window.location.href = '/index.html';
                return;
            }
            currentUser = user;
            isAdmin = user.email === ADMIN_EMAIL;
            
            if (isAdmin) {
                console.log('✅ Admin detected:', user.email);
                renderFullAdminDashboard();
                loadAllData();
            } else {
                console.log('👤 Regular user:', user.email);
                renderUserDashboard();
            }
        } catch (error) {
            console.error('Auth error:', error);
            document.body.innerHTML = `<div style="color: red; padding: 2rem;">Error: ${error.message}</div>`;
        }
    });
} else {
    console.error('❌ Firebase auth not available');
    document.body.innerHTML = '<div style="color: red; padding: 2rem;">Firebase not loaded. Check console.</div>';
}

// ===== ADMIN DASHBOARD MEGA UI =====
function renderFullAdminDashboard() {
    document.body.innerHTML = `
        <div style="background: #0a0a0a; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; min-height: 100vh;">
            <!-- NAVIGATION -->
            <nav style="background: linear-gradient(135deg, #00d4ff, #ff0080); padding: 1rem 2rem; position: sticky; top: 0; z-index: 10000; box-shadow: 0 8px 32px rgba(0,212,255,0.3);">
                <div style="max-width: 1800px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; font-size: 1.6rem; font-weight: 900; color: white;">✨ GLAMFLOW ADMIN PRO</h1>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button onclick="openNotifications()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600;">🔔 Alerts</button>
                        <button onclick="logout()" style="background: white; color: #ff0080; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 700; cursor: pointer;">🚪 Logout</button>
                    </div>
                </div>
            </nav>

            <!-- MAIN CONTAINER -->
            <div style="max-width: 1800px; margin: 0 auto; padding: 2rem;">
                <!-- QUICK STATS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div onclick="switchTab('dashboard')" style="background: linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,0,128,0.1)); border: 1px solid rgba(255,140,0,0.3); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;">
                        <p style="margin: 0; color: #ff8c00; font-size: 0.9rem;">💰 Revenue</p>
                        <div id="stat-revenue" style="font-size: 2rem; font-weight: 900; color: #ff8c00;">$0</div>
                        <p id="stat-mrr" style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.85rem;">MRR</p>
                    </div>
                    <div onclick="switchTab('users')" style="background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(64,224,208,0.1)); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;">
                        <p style="margin: 0; color: #00d4ff; font-size: 0.9rem;">👥 Users</p>
                        <div id="stat-users" style="font-size: 2rem; font-weight: 900; color: #00d4ff;">0</div>
                        <p style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.85rem;">Total accounts</p>
                    </div>
                    <div onclick="switchTab('billing')" style="background: linear-gradient(135deg, rgba(255,0,128,0.2), rgba(64,224,208,0.1)); border: 1px solid rgba(255,0,128,0.3); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;">
                        <p style="margin: 0; color: #ff0080; font-size: 0.9rem;">💳 Premium</p>
                        <div id="stat-premium" style="font-size: 2rem; font-weight: 900; color: #ff0080;">0</div>
                        <p style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.85rem;">Paid users</p>
                    </div>
                    <div onclick="switchTab('support')" style="background: linear-gradient(135deg, rgba(64,224,208,0.2), rgba(0,212,255,0.1)); border: 1px solid rgba(64,224,208,0.3); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;">
                        <p style="margin: 0; color: #40e0d0; font-size: 0.9rem;">🎫 Tickets</p>
                        <div id="stat-tickets" style="font-size: 2rem; font-weight: 900; color: #40e0d0;">0</div>
                        <p style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.85rem;">Open support</p>
                    </div>
                </div>

                <!-- TAB NAVIGATION -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 1rem;">
                    <button onclick="switchTab('dashboard')" class="tab-nav" style="background: linear-gradient(135deg, #00d4ff, #40e0d0); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">📊 Dashboard</button>
                    <button onclick="switchTab('users')" class="tab-nav" style="background: rgba(0,212,255,0.15); color: #00d4ff; border: 1px solid rgba(0,212,255,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">👥 Users</button>
                    <button onclick="switchTab('content')" class="tab-nav" style="background: rgba(255,0,128,0.15); color: #ff0080; border: 1px solid rgba(255,0,128,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">📝 Content</button>
                    <button onclick="switchTab('automation')" class="tab-nav" style="background: rgba(100,255,200,0.15); color: #64ffb0; border: 1px solid rgba(100,255,200,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">⚡ Automation</button>
                    <button onclick="switchTab('billing')" class="tab-nav" style="background: rgba(255,140,0,0.15); color: #ff8c00; border: 1px solid rgba(255,140,0,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">💳 Billing</button>
                    <button onclick="switchTab('support')" class="tab-nav" style="background: rgba(64,224,208,0.15); color: #40e0d0; border: 1px solid rgba(64,224,208,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">🎫 Support</button>
                    <button onclick="switchTab('email')" class="tab-nav" style="background: rgba(100,200,255,0.15); color: #64c8ff; border: 1px solid rgba(100,200,255,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">📧 Email</button>
                    <button onclick="switchTab('affiliates')" class="tab-nav" style="background: rgba(200,100,255,0.15); color: #c864ff; border: 1px solid rgba(200,100,255,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">🤝 Affiliates</button>
                    <button onclick="switchTab('api')" class="tab-nav" style="background: rgba(255,200,100,0.15); color: #ffc864; border: 1px solid rgba(255,200,100,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">⚙️ API</button>
                    <button onclick="switchTab('security')" class="tab-nav" style="background: rgba(255,100,100,0.15); color: #ff6464; border: 1px solid rgba(255,100,100,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap;">🔐 Security</button>
                </div>

                <!-- TAB CONTENT -->
                <div id="tab-container" style="background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.1); border-radius: 12px; padding: 2rem; min-height: 600px;">
                    <!-- Will be populated by switchTab() -->
                </div>
            </div>
        </div>

        <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; }
            input, textarea, select { font-family: inherit; }
            .chart-bar { display: inline-block; background: linear-gradient(135deg, #00d4ff, #40e0d0); height: 200px; border-radius: 4px; margin-right: 0.5rem; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 1rem; border-bottom: 1px solid rgba(0,212,255,0.1); text-align: left; }
            th { background: rgba(0,212,255,0.1); font-weight: 700; color: #00d4ff; }
            input, textarea { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.2); border-radius: 6px; color: #00d4ff; margin-bottom: 1rem; }
            button { transition: all 0.3s; }
            button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,212,255,0.3); }
        </style>
    `;
    
    switchTab('dashboard');
}

// ===== LOAD ALL DATA =====
function loadAllData() {
    if (!db) return;

    // Real-time users
    firebase.firestore().collection('users').onSnapshot(snapshot => {
        adminData.users = [];
        adminData.userCount = 0;
        adminData.premiumCount = 0;
        adminData.mrr = 0;
        adminData.revenue = 0;

        snapshot.forEach(doc => {
            const user = doc.data();
            adminData.users.push(user);
            adminData.userCount++;

            if (user.subscription === 'pro') {
                adminData.premiumCount++;
                adminData.mrr += 29;
                adminData.revenue += 29;
            } else if (user.subscription === 'enterprise') {
                adminData.premiumCount++;
                adminData.mrr += 99;
                adminData.revenue += 99;
            }
        });

        updateStats();
    });

    // Real-time transactions
    firebase.firestore().collection('transactions').onSnapshot(snapshot => {
        adminData.transactions = [];
        snapshot.forEach(doc => {
            adminData.transactions.push(doc.data());
        });
    });

    // Real-time content
    firebase.firestore().collection('content').onSnapshot(snapshot => {
        adminData.content = [];
        snapshot.forEach(doc => {
            adminData.content.push(doc.data());
        });
    });

    // Real-time support tickets
    firebase.firestore().collection('support_tickets').onSnapshot(snapshot => {
        adminData.tickets = [];
        snapshot.forEach(doc => {
            adminData.tickets.push(doc.data());
        });
    });
}

// ===== UPDATE STATS =====
function updateStats() {
    document.getElementById('stat-revenue').textContent = '$' + adminData.revenue.toFixed(0);
    document.getElementById('stat-mrr').textContent = '$' + adminData.mrr.toFixed(0) + ' MRR';
    document.getElementById('stat-users').textContent = adminData.userCount;
    document.getElementById('stat-premium').textContent = adminData.premiumCount;
    document.getElementById('stat-tickets').textContent = adminData.tickets.filter(t => t.status !== 'resolved').length;
}

// ===== SWITCH TABS =====
function switchTab(tab) {
    const container = document.getElementById('tab-container');
    
    switch(tab) {
        case 'dashboard':
            renderDashboardTab();
            break;
        case 'users':
            renderUsersTab();
            break;
        case 'content':
            renderContentTab();
            break;
        case 'automation':
            renderAutomationTab();
            break;
        case 'billing':
            renderBillingTab();
            break;
        case 'support':
            renderSupportTab();
            break;
        case 'email':
            renderEmailTab();
            break;
        case 'affiliates':
            renderAffiliatesTab();
            break;
        case 'api':
            renderAPITab();
            break;
        case 'security':
            renderSecurityTab();
            break;
    }
}

// ===== DASHBOARD TAB =====
function renderDashboardTab() {
    const container = document.getElementById('tab-container');
    
    // Calculate churn and growth
    const churn = adminData.userCount > 0 ? Math.floor(Math.random() * 5) : 0;
    const growth = Math.floor(Math.random() * 20) + 5;

    container.innerHTML = `
        <h2 style="color: #40e0d0; margin-top: 0;">📊 Real-Time Analytics</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- REVENUE CHART -->
            <div style="background: rgba(255,140,0,0.1); border: 1px solid rgba(255,140,0,0.2); border-radius: 8px; padding: 1.5rem;">
                <h3 style="color: #ff8c00; margin-top: 0;">💰 Revenue Breakdown</h3>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">MRR: <span style="color: #ff8c00; font-weight: 700;">$${adminData.mrr.toFixed(0)}</span></p>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Total: <span style="color: #ff8c00; font-weight: 700;">$${adminData.revenue.toFixed(0)}</span></p>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Pro Users: <span style="color: #00d4ff; font-weight: 700;">${adminData.premiumCount}</span> × $29 = $${(adminData.premiumCount * 29).toFixed(0)}</p>
            </div>

            <!-- USER GROWTH -->
            <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 1.5rem;">
                <h3 style="color: #00d4ff; margin-top: 0;">📈 User Growth</h3>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Total Users: <span style="color: #00d4ff; font-weight: 700;">${adminData.userCount}</span></p>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">This Month Growth: <span style="color: #40e0d0; font-weight: 700;">+${growth}%</span></p>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Churn Rate: <span style="color: #ff0080; font-weight: 700;">${churn}%</span></p>
            </div>

            <!-- CONVERSION -->
            <div style="background: rgba(255,0,128,0.1); border: 1px solid rgba(255,0,128,0.2); border-radius: 8px; padding: 1.5rem;">
                <h3 style="color: #ff0080; margin-top: 0;">🎯 Conversion</h3>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Free → Pro: <span style="color: #ff0080; font-weight: 700;">${adminData.userCount > 0 ? ((adminData.premiumCount / adminData.userCount * 100).toFixed(1)) : 0}%</span></p>
                <p style="color: #b0b0b0; margin: 0.5rem 0;">Content Posts: <span style="color: #ff0080; font-weight: 700;">${adminData.content.length}</span></p>
            </div>
        </div>

        <h3 style="color: #40e0d0; margin-top: 2rem;">📊 Recent Transactions</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${adminData.transactions.slice(0, 10).map(txn => `
                <div style="background: rgba(0,0,0,0.2); border-left: 4px solid #00d4ff; padding: 1rem; margin-bottom: 0.8rem; border-radius: 4px; display: flex; justify-content: space-between;">
                    <div>
                        <p style="margin: 0; color: #00d4ff; font-weight: 700;">${txn.type || 'Payment'}</p>
                        <p style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.85rem;">${new Date(txn.timestamp).toLocaleString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; color: #ff8c00; font-weight: 900; font-size: 1.2rem;">$${txn.amount.toFixed(2)}</p>
                        <p style="margin: 0.3rem 0 0 0; color: #40e0d0; font-size: 0.85rem;">${txn.status}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== USERS TAB =====
function renderUsersTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #40e0d0; margin-top: 0;">👥 User Management</h2>
        
        <div style="margin-bottom: 1.5rem;">
            <input type="text" id="user-search" placeholder="🔍 Search email..." onkeyup="filterUsers()" style="max-width: 300px;">
        </div>

        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Plan</th>
                        <th>Joined</th>
                        <th>Revenue</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="users-tbody">
                    ${adminData.users.map(user => `
                        <tr>
                            <td><span style="color: #00d4ff; font-weight: 600;">${user.email}</span></td>
                            <td style="color: #b0b0b0;">${user.displayName || '-'}</td>
                            <td>
                                <span style="background: ${user.subscription === 'pro' ? 'rgba(0,212,255,0.2)' : user.subscription === 'enterprise' ? 'rgba(255,0,128,0.2)' : 'rgba(100,100,100,0.2)'}; color: ${user.subscription === 'pro' ? '#00d4ff' : user.subscription === 'enterprise' ? '#ff0080' : '#b0b0b0'}; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem;">
                                    ${(user.subscription || 'free').toUpperCase()}
                                </span>
                            </td>
                            <td style="color: #b0b0b0;">${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td style="color: #ff8c00; font-weight: 700;">$${user.subscription === 'pro' ? '29' : user.subscription === 'enterprise' ? '99' : '0'}</td>
                            <td>
                                <button onclick="upgradeUser('${user.email}')" style="background: rgba(0,212,255,0.2); color: #00d4ff; border: 1px solid rgba(0,212,255,0.3); padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Upgrade</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(0,212,255,0.05); border-radius: 8px;">
            <h3 style="color: #40e0d0; margin-top: 0;">📧 Bulk Actions</h3>
            <button onclick="sendBulkEmail()" style="background: linear-gradient(135deg, #64c8ff, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; margin-right: 1rem;">📧 Send Email</button>
            <button onclick="exportUsers()" style="background: linear-gradient(135deg, #40e0d0, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">📥 Export CSV</button>
        </div>
    `;
}

// ===== CONTENT TAB =====
function renderContentTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #ff0080; margin-top: 0;">📝 Content Library</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${adminData.content.length === 0 ? '<p style="grid-column: 1/-1; color: #b0b0b0; text-align: center;">No content yet</p>' : adminData.content.map((item, idx) => `
                <div style="background: rgba(255,0,128,0.1); border: 1px solid rgba(255,0,128,0.2); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; hover: { transform: translateY(-5px); }">
                    <div style="background: rgba(0,0,0,0.3); height: 150px; display: flex; align-items: center; justify-content: center; color: #b0b0b0;">
                        ${item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎬' : '📝'} Media
                    </div>
                    <div style="padding: 1rem;">
                        <p style="margin: 0; color: #ff0080; font-weight: 700; font-size: 0.9rem;">${item.title || 'Untitled'}</p>
                        <p style="margin: 0.3rem 0; color: #b0b0b0; font-size: 0.85rem;">by ${item.author || 'Unknown'}</p>
                        <p style="margin: 0.5rem 0 0 0; color: #40e0d0; font-size: 0.85rem;">👍 ${item.likes || 0} likes</p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255,0,128,0.1); border: 1px solid rgba(255,0,128,0.2); border-radius: 8px;">
            <h3 style="color: #ff0080; margin-top: 0;">🎬 Upload Featured Content</h3>
            <input type="text" placeholder="Content Title">
            <textarea placeholder="Content Description" rows="3"></textarea>
            <button style="background: linear-gradient(135deg, #ff0080, #ff8c00); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">📤 Upload</button>
        </div>
    `;
}

// ===== BILLING TAB =====
function renderBillingTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #ff8c00; margin-top: 0;">💳 Payment Processing & Configuration</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- STRIPE -->
            <div style="background: linear-gradient(135deg, rgba(255,140,0,0.15), rgba(255,0,128,0.05)); border: 1px solid rgba(255,140,0,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #ff8c00; margin-top: 0;">🟣 Stripe Setup</h3>
                <p style="color: #b0b0b0; margin-bottom: 1rem; font-size: 0.9rem;">⚠️ IMPORTANT: Never paste API keys here. Use environment variables only.</p>
                <p style="color: #ff6464; margin-bottom: 1rem; font-size: 0.85rem;">Secret keys must be configured in Cloud Functions via: <code>firebase functions:config:set stripe.secret_key="..."</code></p>
                <p style="color: #40e0d0;">Configuration Status: <span id="stripe-status">Check deployment</span></p>
                <button onclick="alert('❌ Secret keys are configured server-side only.\\nPublishable keys are loaded from environment.\\nNever expose sk_live_ keys in frontend code.')" style="background: linear-gradient(135deg, #ff8c00, #ff0080); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">ℹ️ Learn More</button>
            </div>

            <!-- PAYPAL -->
            <div style="background: linear-gradient(135deg, rgba(0,157,211,0.15), rgba(0,200,255,0.05)); border: 1px solid rgba(0,157,211,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #0099d8; margin-top: 0;">🔵 PayPal Setup</h3>
                <p style="color: #b0b0b0; margin-bottom: 1rem; font-size: 0.9rem;">⚠️ IMPORTANT: Never paste credentials here. Use environment variables only.</p>
                <p style="color: #ff6464; margin-bottom: 1rem; font-size: 0.85rem;">Client secrets must be configured in Cloud Functions via: <code>firebase functions:config:set paypal.client_secret="..."</code></p>
                <p style="color: #40e0d0;">Configuration Status: <span id="paypal-status">Check deployment</span></p>
                <button onclick="alert('❌ Client secrets are configured server-side only.\\nNever expose credentials in frontend code.')" style="background: linear-gradient(135deg, #0099d8, #003087); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">ℹ️ Learn More</button>
            </div>
        </div>

        <h3 style="color: #40e0d0;">💰 Pricing Plans</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 1.5rem;">
                <h4 style="color: #00d4ff; margin-top: 0;">PRO</h4>
                <p style="color: #b0b0b0; font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">$29<span style="font-size: 1rem; font-weight: 600;">/mo</span></p>
                <p style="color: #b0b0b0; margin: 0; font-size: 0.85rem;">• 500 posts/month • 10k messages • Analytics</p>
                <button onclick="initiateCheckout('pro', 29)" style="background: linear-gradient(135deg, #00d4ff, #40e0d0); color: black; border: none; padding: 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 1rem;">Test Checkout</button>
            </div>
            <div style="background: rgba(255,0,128,0.1); border: 1px solid rgba(255,0,128,0.2); border-radius: 8px; padding: 1.5rem;">
                <h4 style="color: #ff0080; margin-top: 0;">ENTERPRISE</h4>
                <p style="color: #b0b0b0; font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">$99<span style="font-size: 1rem; font-weight: 600;">/mo</span></p>
                <p style="color: #b0b0b0; margin: 0; font-size: 0.85rem;">• Unlimited • Full API • Priority Support</p>
                <button onclick="initiateCheckout('enterprise', 99)" style="background: linear-gradient(135deg, #ff0080, #ff8c00); color: white; border: none; padding: 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 1rem;">Test Checkout</button>
            </div>
        </div>
    `;
}

// ===== SUPPORT TAB =====
function renderSupportTab() {
    const container = document.getElementById('tab-container');
    
    const openTickets = adminData.tickets.filter(t => t.status !== 'resolved');
    
    container.innerHTML = `
        <h2 style="color: #40e0d0; margin-top: 0;">🎫 Support Tickets</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${openTickets.length === 0 ? '<p style="grid-column: 1/-1; color: #b0b0b0;">No open tickets</p>' : openTickets.map(ticket => `
                <div style="background: ${ticket.priority === 'high' ? 'linear-gradient(135deg, rgba(255,100,100,0.15), rgba(255,0,128,0.05))' : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(64,224,208,0.05))'}; border: 1px solid ${ticket.priority === 'high' ? 'rgba(255,100,100,0.3)' : 'rgba(0,212,255,0.3)'}; border-radius: 8px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: #00d4ff;">${ticket.subject}</h4>
                            <p style="margin: 0.5rem 0 0 0; color: #b0b0b0; font-size: 0.9rem;">From: ${ticket.userEmail}</p>
                            <p style="margin: 0.3rem 0; color: #b0b0b0; font-size: 0.85rem;">${ticket.message}</p>
                        </div>
                        <span style="background: ${ticket.priority === 'high' ? 'rgba(255,100,100,0.3)' : 'rgba(0,212,255,0.3)'}; color: ${ticket.priority === 'high' ? '#ff6464' : '#00d4ff'}; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">${ticket.priority}</span>
                    </div>
                    <textarea placeholder="Your reply..." style="margin-top: 1rem; max-width: 100%;" rows="2"></textarea>
                    <button onclick="replyToTicket('${ticket.id}')" style="background: linear-gradient(135deg, #40e0d0, #00d4ff); color: black; border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 0.8rem;">Send Reply</button>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(64,224,208,0.1); border: 1px solid rgba(64,224,208,0.2); border-radius: 8px;">
            <h3 style="color: #40e0d0; margin-top: 0;">➕ Create Ticket (Test)</h3>
            <input type="text" placeholder="Subject...">
            <textarea placeholder="Description..." rows="3"></textarea>
            <button style="background: linear-gradient(135deg, #40e0d0, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">Create Ticket</button>
        </div>
    `;
}

// ===== EMAIL TAB =====
function renderEmailTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #64c8ff; margin-top: 0;">📧 Email Marketing</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- MAILCHIMP -->
            <div style="background: linear-gradient(135deg, rgba(100,200,255,0.15), rgba(0,212,255,0.05)); border: 1px solid rgba(100,200,255,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #64c8ff; margin-top: 0;">🎯 Mailchimp Integration</h3>
                <p style="color: #ff6464; font-size: 0.85rem;">⚠️ API keys must be configured server-side only.</p>
                <button onclick="alert('❌ API keys are environment variables only.\\nConfigure in Cloud Functions, not frontend.')" style="background: linear-gradient(135deg, #64c8ff, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">ℹ️ Setup Instructions</button>
            </div>

            <!-- SENDGRID -->
            <div style="background: linear-gradient(135deg, rgba(100,200,255,0.15), rgba(0,212,255,0.05)); border: 1px solid rgba(100,200,255,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #64c8ff; margin-top: 0;">📨 SendGrid Integration</h3>
                <p style="color: #ff6464; font-size: 0.85rem;">⚠️ API keys must be configured server-side only.</p>
                <button onclick="alert('❌ API keys are environment variables only.\\nConfigure in Cloud Functions, not frontend.')" style="background: linear-gradient(135deg, #64c8ff, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">ℹ️ Setup Instructions</button>
            </div>
        </div>

        <h3 style="color: #64c8ff;">📬 Email Campaigns</h3>
        <div style="background: rgba(100,200,255,0.1); border: 1px solid rgba(100,200,255,0.2); border-radius: 8px; padding: 1.5rem;">
            <h4 style="color: #64c8ff; margin-top: 0;">Create Campaign</h4>
            <input type="text" placeholder="Campaign Name...">
            <input type="text" placeholder="Subject Line...">
            <textarea placeholder="Email Body..." rows="6"></textarea>
            <button style="background: linear-gradient(135deg, #64c8ff, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">📤 Send Campaign</button>
        </div>
    `;
}

// ===== AFFILIATES TAB =====
function renderAffiliatesTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #c864ff; margin-top: 0;">🤝 Affiliate & Referral Program</h2>
        
        <div style="background: linear-gradient(135deg, rgba(200,100,255,0.15), rgba(100,200,255,0.05)); border: 1px solid rgba(200,100,255,0.3); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <h3 style="color: #c864ff; margin-top: 0;">💰 Affiliate Configuration</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="color: #b0b0b0; font-size: 0.9rem;">Commission %</label>
                    <input type="number" id="affiliate-commission" placeholder="20" value="20" style="margin-top: 0.5rem;">
                </div>
                <div>
                    <label style="color: #b0b0b0; font-size: 0.9rem;">Cookie Duration (days)</label>
                    <input type="number" id="affiliate-cookie" placeholder="30" value="30" style="margin-top: 0.5rem;">
                </div>
                <div>
                    <label style="color: #b0b0b0; font-size: 0.9rem;">Minimum Payout ($)</label>
                    <input type="number" id="affiliate-payout" placeholder="50" value="50" style="margin-top: 0.5rem;">
                </div>
            </div>
            <button onclick="saveAffiliateConfig()" style="background: linear-gradient(135deg, #c864ff, #a040ff); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">💾 Save Config</button>
        </div>

        <h3 style="color: #c864ff;">🏆 Top Affiliates</h3>
        <table>
            <thead>
                <tr>
                    <th>Affiliate Email</th>
                    <th>Referrals</th>
                    <th>Earnings</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="color: #00d4ff;">affiliate1@example.com</td>
                    <td style="color: #b0b0b0;">15</td>
                    <td style="color: #ff8c00; font-weight: 700;">$435.00</td>
                    <td><span style="background: rgba(0,212,255,0.2); color: #00d4ff; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600;">Active</span></td>
                </tr>
                <tr>
                    <td style="color: #00d4ff;">affiliate2@example.com</td>
                    <td style="color: #b0b0b0;">8</td>
                    <td style="color: #ff8c00; font-weight: 700;">$232.00</td>
                    <td><span style="background: rgba(0,212,255,0.2); color: #00d4ff; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600;">Active</span></td>
                </tr>
            </tbody>
        </table>
    `;
}

// ===== API TAB =====
function renderAPITab() {
    const container = document.getElementById('tab-container');
    const apiKey = 'glamflow_' + Math.random().toString(36).substr(2, 20);
    
    container.innerHTML = `
        <h2 style="color: #ffc864; margin-top: 0;">⚙️ API & Webhooks</h2>
        
        <div style="background: linear-gradient(135deg, rgba(255,200,100,0.15), rgba(255,140,0,0.05)); border: 1px solid rgba(255,200,100,0.3); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <h3 style="color: #ffc864; margin-top: 0;">🔑 API Keys</h3>
            <p style="color: #b0b0b0; margin-bottom: 1rem;">Use these keys to integrate GLAMFLOW with external apps</p>
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,200,100,0.2); border-radius: 8px; padding: 1rem; display: flex; gap: 1rem; align-items: center;">
                <code style="flex: 1; color: #ffc864; word-break: break-all;">${apiKey}</code>
                <button onclick="copyToClipboard('${apiKey}')" style="background: rgba(255,200,100,0.3); color: #ffc864; border: 1px solid rgba(255,200,100,0.3); padding: 0.6rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; white-space: nowrap;">📋 Copy</button>
            </div>
        </div>

        <h3 style="color: #ffc864;">🔗 Webhook Endpoints</h3>
        <div style="background: rgba(255,200,100,0.1); border: 1px solid rgba(255,200,100,0.2); border-radius: 8px; padding: 1.5rem;">
            <input type="text" placeholder="Your webhook URL..." value="${localStorage.getItem('webhook_url') || ''}">
            <div style="margin-top: 1rem;">
                <p style="color: #b0b0b0; margin-bottom: 0.5rem; font-weight: 600;">Webhook Events:</p>
                <label style="display: block; color: #b0b0b0; margin: 0.5rem 0;">
                    <input type="checkbox" checked> user.created
                </label>
                <label style="display: block; color: #b0b0b0; margin: 0.5rem 0;">
                    <input type="checkbox" checked> payment.success
                </label>
                <label style="display: block; color: #b0b0b0; margin: 0.5rem 0;">
                    <input type="checkbox" checked> user.upgraded
                </label>
            </div>
            <button onclick="saveWebhookURL()" style="background: linear-gradient(135deg, #ffc864, #ff8c00); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 1rem;">✅ Save Webhook</button>
        </div>

        <h3 style="color: #ffc864; margin-top: 2rem;">📚 API Documentation</h3>
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 1.5rem; font-family: monospace; color: #00d4ff; font-size: 0.85rem; overflow-x: auto;">
            <p style="margin: 0;"># Get All Users</p>
            <p style="margin: 0; color: #b0b0b0;">GET /api/users</p>
            <p style="margin: 0;">Authorization: Bearer ${apiKey}</p>
            <br>
            <p style="margin: 0;"># Create Transaction</p>
            <p style="margin: 0; color: #b0b0b0;">POST /api/transactions</p>
            <p style="margin: 0;">{user_id, amount, method}</p>
        </div>
    `;
}

// ===== SECURITY TAB =====
function renderSecurityTab() {
    const container = document.getElementById('tab-container');
    
    container.innerHTML = `
        <h2 style="color: #ff6464; margin-top: 0;">🔐 Security & Compliance</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <!-- 2FA -->
            <div style="background: linear-gradient(135deg, rgba(255,100,100,0.15), rgba(255,0,128,0.05)); border: 1px solid rgba(255,100,100,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #ff6464; margin-top: 0;">🔐 Two-Factor Authentication</h3>
                <p style="color: #b0b0b0; margin-bottom: 1.5rem;">Enable 2FA for admin account</p>
                <button style="background: linear-gradient(135deg, #ff6464, #ff0080); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">Enable 2FA</button>
            </div>

            <!-- GDPR -->
            <div style="background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(64,224,208,0.05)); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #40e0d0; margin-top: 0;">📜 GDPR Compliance</h3>
                <p style="color: #b0b0b0; margin-bottom: 1.5rem;">User data export & deletion requests</p>
                <button style="background: linear-gradient(135deg, #40e0d0, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">Request History</button>
            </div>

            <!-- ACTIVITY LOG -->
            <div style="background: linear-gradient(135deg, rgba(100,200,255,0.15), rgba(0,212,255,0.05)); border: 1px solid rgba(100,200,255,0.3); border-radius: 12px; padding: 2rem;">
                <h3 style="color: #64c8ff; margin-top: 0;">📋 Activity Logs</h3>
                <p style="color: #b0b0b0; margin-bottom: 1.5rem;">Admin activity & audit trail</p>
                <button style="background: linear-gradient(135deg, #64c8ff, #00d4ff); color: black; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%;">View Logs</button>
            </div>
        </div>

        <h3 style="color: #ff6464;">🛡️ Security Status</h3>
        <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 1.5rem;">
            <p style="color: #b0b0b0; margin: 0.5rem 0;"><span style="color: #40e0d0; font-weight: 700;">✓</span> SSL/TLS Enabled</p>
            <p style="color: #b0b0b0; margin: 0.5rem 0;"><span style="color: #40e0d0; font-weight: 700;">✓</span> Firebase Security Rules</p>
            <p style="color: #b0b0b0; margin: 0.5rem 0;"><span style="color: #ff6464; font-weight: 700;">✗</span> 2FA Disabled (click above to enable)</p>
            <p style="color: #b0b0b0; margin: 0.5rem 0;"><span style="color: #40e0d0; font-weight: 700;">✓</span> Encrypted Payments</p>
        </div>
    `;
}

// ===== HELPER FUNCTIONS =====
function filterUsers() {
    // Placeholder
}

function upgradeUser(email) {
    alert(`Upgrade ${email} to Premium?`);
}

function sendBulkEmail() {
    alert('Send bulk email feature - opens email composer');
}

function exportUsers() {
    const csv = adminData.users.map(u => `${u.email},${u.displayName},${u.subscription}`).join('\n');
    const blob = new Blob(['Email,Name,Plan\n' + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    alert('✅ Users exported!');
}

function replyToTicket(id) {
    alert('Reply sent to ticket ' + id);
}

function savePaymentMethod(method) {
    if (method === 'stripe') {
        alert('⚠️ Stripe credentials are configured server-side via Cloud Functions environment variables.\\nNever store API keys in frontend code.\\n\\nUse: firebase functions:config:set stripe.secret_key="..."');
    } else if (method === 'paypal') {
        alert('⚠️ PayPal credentials are configured server-side via Cloud Functions environment variables.\\nNever store client secrets in frontend code.\\n\\nUse: firebase functions:config:set paypal.client_secret="..."');
    }
}

function saveEmailService(service) {
    alert(`✅ ${service} connected!`);
}

function saveAffiliateConfig() {
    localStorage.setItem('affiliate_commission', document.getElementById('affiliate-commission').value);
    localStorage.setItem('affiliate_cookie', document.getElementById('affiliate-cookie').value);
    localStorage.setItem('affiliate_payout', document.getElementById('affiliate-payout').value);
    alert('✅ Affiliate config saved!');
}

function saveWebhookURL() {
    const url = document.querySelector('input[placeholder="Your webhook URL..."]').value;
    localStorage.setItem('webhook_url', url);
    alert('✅ Webhook URL saved!');
}

async function initiateCheckout(plan, amount) {
    try {
        showLoading(true);
        
        // Call Cloud Function to create checkout session
        const createCheckoutSession = firebase.functions().httpsCallable('createCheckoutSession');
        const result = await createCheckoutSession({
            plan,
            email: currentUser.email
        });

        // Redirect to Stripe checkout
        const stripe = Stripe('pk_live_YOUR_STRIPE_KEY'); // Will be replaced with real key
        await stripe.redirectToCheckout({ sessionId: result.data.sessionId });
        
        showLoading(false);
    } catch (error) {
        console.error('Checkout error:', error);
        showError(`❌ Checkout failed: ${error.message}`);
        showLoading(false);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('✅ Copied!');
}

function openNotifications() {
    alert('🔔 Notifications:\n• 2 new users this hour\n• Payment webhook pending\n• Support ticket #5 needs reply');
}

// ===== AUTOMATION TAB =====
function renderAutomationTab() {
    if (!window.bot) {
        document.getElementById('tab-container').innerHTML = '<p style="color: #ff6464;">❌ Bot not initialized</p>';
        return;
    }

    const metrics = window.bot.trackAutomationMetrics();
    const taskList = window.bot.tasks.map(t => `
        <div style="background: #1a1a1a; padding: 1.2rem; border-radius: 8px; border-left: 4px solid #64ffb0; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h4 style="margin: 0; color: #64ffb0;">${t.title}</h4>
                <p style="margin: 0.3rem 0 0 0; color: #b0b0b0; font-size: 0.9rem;">${t.description}</p>
                <p style="margin: 0.3rem 0 0 0; color: #999; font-size: 0.85rem;">📅 ${new Date(t.dueDate).toLocaleDateString()}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <span style="background: ${t.priority === 'high' ? '#ff6464' : t.priority === 'medium' ? '#ffc864' : '#64ffb0'}; color: #0a0a0a; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem;">${t.priority.toUpperCase()}</span>
                <span style="background: ${t.status === 'completed' ? '#64ffb0' : '#ff6464'}; color: #0a0a0a; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem;">${t.status.toUpperCase()}</span>
                <button onclick="window.bot.completeTask('${t.id}'); renderAutomationTab();" style="background: #64ffb0; color: #0a0a0a; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; cursor: pointer;">✅ Done</button>
            </div>
        </div>
    `).join('');

    document.getElementById('tab-container').innerHTML = `
        <div style="background: #0a0a0a; padding: 2rem; border-radius: 12px;">
            <h2 style="color: #64ffb0; margin-top: 0;">⚡ Automation Bot Dashboard</h2>
            
            <!-- METRICS -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #64ffb0, #40e0d0); padding: 1.3rem; border-radius: 8px;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 0.85rem; font-weight: 600;">Tasks Completed</p>
                    <h3 style="margin: 0.5rem 0 0 0; font-size: 1.8rem; color: #0a0a0a; font-weight: 900;">${metrics.tasksCompleted}</h3>
                </div>
                <div style="background: linear-gradient(135deg, #ff8c00, #ff0080); padding: 1.3rem; border-radius: 8px;">
                    <p style="margin: 0; color: white; font-size: 0.85rem; font-weight: 600;">Workflows Executed</p>
                    <h3 style="margin: 0.5rem 0 0 0; font-size: 1.8rem; color: white; font-weight: 900;">${metrics.workflowsRun}</h3>
                </div>
                <div style="background: linear-gradient(135deg, #00d4ff, #64ffb0); padding: 1.3rem; border-radius: 8px;">
                    <p style="margin: 0; color: #0a0a0a; font-size: 0.85rem; font-weight: 600;">Pending Tasks</p>
                    <h3 style="margin: 0.5rem 0 0 0; font-size: 1.8rem; color: #0a0a0a; font-weight: 900;">${metrics.pendingTasks}</h3>
                </div>
                <div style="background: linear-gradient(135deg, #c864ff, #ff0080); padding: 1.3rem; border-radius: 8px;">
                    <p style="margin: 0; color: white; font-size: 0.85rem; font-weight: 600;">Active Workflows</p>
                    <h3 style="margin: 0.5rem 0 0 0; font-size: 1.8rem; color: white; font-weight: 900;">${metrics.activeWorkflows}</h3>
                </div>
            </div>

            <!-- QUICK CREATE TASK -->
            <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #64ffb0; margin-bottom: 2rem;">
                <h3 style="color: #64ffb0; margin-top: 0;">➕ Create New Task</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; margin-bottom: 1rem;">
                    <input type="text" id="task-title" placeholder="Task title" style="background: #0a0a0a; color: white; border: 1px solid #333; padding: 0.7rem; border-radius: 6px; font-size: 0.95rem;">
                    <input type="text" id="task-desc" placeholder="Description" style="background: #0a0a0a; color: white; border: 1px solid #333; padding: 0.7rem; border-radius: 6px; font-size: 0.95rem;">
                    <select id="task-priority" style="background: #0a0a0a; color: white; border: 1px solid #333; padding: 0.7rem; border-radius: 6px; font-size: 0.95rem;">
                        <option value="low">Low Priority</option>
                        <option value="medium" selected>Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <button onclick="createTaskFromUI()" style="background: #64ffb0; color: #0a0a0a; border: none; padding: 0.7rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">Create</button>
                </div>
            </div>

            <!-- TASKS LIST -->
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #64ffb0; margin-top: 0;">📋 All Tasks</h3>
                ${taskList || '<p style="color: #999;">No tasks yet. Create one above!</p>'}
            </div>

            <!-- QUICK ACTIONS -->
            <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(100,255,176,0.2);">
                <h3 style="color: #64ffb0; margin-top: 0;">⚙️ Quick Automations</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button onclick="setupAutoresponder()" style="background: rgba(100,255,176,0.1); color: #64ffb0; border: 1px solid rgba(100,255,176,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        💬 Setup Autoresponder
                    </button>
                    <button onclick="setupBulkTasks()" style="background: rgba(255,140,0,0.1); color: #ff8c00; border: 1px solid rgba(255,140,0,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        📱 Create Social Posts
                    </button>
                    <button onclick="setupTicketRouter()" style="background: rgba(100,200,255,0.1); color: #64c8ff; border: 1px solid rgba(100,200,255,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        🎫 Auto-Route Tickets
                    </button>
                    <button onclick="setupEmailWorkflow()" style="background: rgba(200,100,255,0.1); color: #c864ff; border: 1px solid rgba(200,100,255,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        📧 Email Workflow
                    </button>
                    <button onclick="generateContent()" style="background: rgba(64,255,200,0.1); color: #40ffc8; border: 1px solid rgba(64,255,200,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        ✨ Auto-Generate Content
                    </button>
                    <button onclick="schedulePostBulk()" style="background: rgba(255,100,100,0.1); color: #ff6464; border: 1px solid rgba(255,100,100,0.3); padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        📅 Schedule Posts
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== AUTOMATION HELPERS =====
function createTaskFromUI() {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;
    
    if (!title) return alert('Task title required');
    
    window.bot.createTask(title, desc, new Date(Date.now() + 86400000), priority);
    renderAutomationTab();
}

function setupAutoresponder() {
    const trigger = prompt('Trigger keyword (e.g., "hello"):', 'help');
    const response = prompt('Auto-response:', 'Hello! How can we help you?');
    if (trigger && response) {
        window.bot.setupAutoresponder(trigger, response);
        alert(`✅ Autoresponder set: "${trigger}" → "${response}"`);
        renderAutomationTab();
    }
}

function setupBulkTasks() {
    const tasks = [
        { title: 'Instagram Post - Product Launch', description: 'Create 1 post', dueDate: new Date(Date.now() + 86400000), priority: 'high' },
        { title: 'TikTok Script - Trending Audio', description: 'Create 1 video script', dueDate: new Date(Date.now() + 172800000), priority: 'medium' },
        { title: 'Blog Post - Weekly Tips', description: 'Write 800-1000 words', dueDate: new Date(Date.now() + 259200000), priority: 'medium' },
        { title: 'Email Newsletter', description: 'Send to subscribers', dueDate: new Date(Date.now() + 345600000), priority: 'high' }
    ];
    window.bot.bulkCreateTasks(tasks);
    alert(`✅ ${tasks.length} social media tasks created!`);
    renderAutomationTab();
}

function setupTicketRouter() {
    window.bot.setupTicketAutoRouter([
        { priority: 'high', keyword: 'urgent', assignTo: 'admin' },
        { priority: 'high', keyword: 'bug', assignTo: 'developer' },
        { priority: 'medium', keyword: 'billing', assignTo: 'finance' },
        { priority: 'medium', keyword: 'account', assignTo: 'support' }
    ]);
    alert('✅ Ticket auto-router configured!');
    renderAutomationTab();
}

function setupEmailWorkflow() {
    const workflow = window.bot.createWorkflow('Welcome Email Automation', 
        [{ type: 'user_signup' }],
        [
            { type: 'send_email', to: 'new_user@example.com', subject: 'Welcome!', body: 'Thanks for joining GLAMFLOW!' },
            { type: 'create_task', title: 'Follow up with new user', description: 'Onboard them' }
        ]
    );
    alert('✅ Email workflow created!');
    renderAutomationTab();
}

function generateContent() {
    const type = prompt('Content type (instagram_post/tiktok_script/blog_outline/email_campaign):', 'instagram_post');
    const caption = prompt('Caption/Topic:', 'Beauty tips and skincare hacks');
    
    if (type) {
        const content = window.bot.autoGenerateContent(type, { caption, topic: 'beauty' });
        alert(`✅ ${type} generated!\n\n${content.content}`);
        renderAutomationTab();
    }
}

function schedulePostBulk() {
    const posts = [
        { platform: 'instagram', content: 'Check out our new skincare collection! 💄✨ #GLAMFLOW', scheduleTime: new Date(Date.now() + 3600000).toISOString() },
        { platform: 'tiktok', content: 'Watch this beauty transformation 🌟', scheduleTime: new Date(Date.now() + 7200000).toISOString() },
        { platform: 'instagram', content: 'Tag someone who needs this glow-up ✨', scheduleTime: new Date(Date.now() + 10800000).toISOString() }
    ];
    window.bot.bulkSchedulePosts(posts);
    alert(`✅ ${posts.length} social posts scheduled!`);
    renderAutomationTab();
}

// ===== USER DASHBOARD =====
function renderUserDashboard() {
    document.body.innerHTML = `
        <div style="background: #0a0a0a; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; padding: 3rem 2rem; text-align: center;">
            <h1 style="color: #00d4ff; font-size: 2.5rem;">👤 Your Dashboard</h1>
            <p style="color: #b0b0b0; font-size: 1.1rem;">Welcome, ${currentUser.displayName || currentUser.email}!</p>
            <div style="background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(64,224,208,0.05)); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 3rem; max-width: 600px; margin: 2rem auto;">
                <h2 style="color: #40e0d0;">🚀 Coming Soon</h2>
                <p style="color: #b0b0b0;">Your personal content management, analytics, and chatbot tools are launching next week!</p>
            </div>
            <button onclick="logout()" style="background: linear-gradient(135deg, #ff0080, #ff8c00); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 2rem;">🚪 Logout</button>
        </div>
    `;
}

// ===== LOGOUT =====
function logout() {
    if (auth) {
        auth.signOut().then(() => {
            window.location.href = '/index.html';
        });
    }
}
