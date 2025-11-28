// ===== GLAMFLOW AI - DASHBOARD (WORKING VERSION) =====

const auth = window.firebaseAuth;
const db = window.firebaseDb;
const ADMIN_EMAIL = 'dyingbreed243@gmail.com';

let currentUser = null;
let isAdmin = false;
let usingAdminToken = false;

console.log('🔍 Dashboard script loaded');
console.log('Auth available:', !!auth);
console.log('Firestore available:', !!db);

// ===== CHECK FOR ADMIN TOKEN FIRST =====
const adminToken = sessionStorage.getItem('glamflow_admin_token');
if (adminToken) {
    console.log('✅ Using admin token access');
    usingAdminToken = true;
    currentUser = { email: ADMIN_EMAIL, uid: 'admin_token', displayName: 'Admin' };
    isAdmin = true;
    showAdminDashboard();
} else if (auth) {
    // ===== NORMAL AUTH CHECK =====
    console.log('Setting up auth listener...');
    
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        try {
            if (!user) {
                console.log('❌ No user - redirecting to login');
                document.body.innerHTML = `
                    <div style="background:#0a0a0a; color:white; padding:2rem; font-family:Arial; text-align: center;">
                        <p>Redirecting to login...</p>
                    </div>
                `;
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
                return;
            }
            
            currentUser = user;
            isAdmin = user.email === ADMIN_EMAIL;
            console.log('✅ User logged in:', user.email);
            console.log('Is Admin:', isAdmin);
            
            if (isAdmin) {
                console.log('Rendering admin dashboard...');
                showAdminDashboard();
            } else {
                console.log('Rendering user dashboard...');
                showUserDashboard();
            }
        } catch (error) {
            console.error('Auth error:', error);
            document.body.innerHTML = `
                <div style="background:#0a0a0a; color:red; padding:2rem; font-family:Arial;">
                    <h2>ERROR</h2>
                    <p>${error.message}</p>
                    <p>Check browser console for details</p>
                </div>
            `;
        }
    });
} else {
    console.error('❌ Firebase auth not loaded!');
    document.body.innerHTML = '<div style="color: red; padding: 2rem;">Firebase auth not loaded. Check console.</div>';
}

// ===== ADMIN DASHBOARD =====
function showAdminDashboard() {
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #0a0a0a; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
                
                .navbar { background: linear-gradient(135deg, #00d4ff, #ff0080); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
                .navbar h1 { margin: 0; font-size: 1.4rem; }
                
                .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
                
                .tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; overflow-x: auto; }
                .tab-btn { background: rgba(0,212,255,0.15); color: #00d4ff; border: 1px solid rgba(0,212,255,0.3); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .tab-btn.active { background: #00d4ff; color: #0a0a0a; }
                
                .content { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 2rem; min-height: 500px; }
                
                .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .stat { background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(64,224,208,0.05)); border: 1px solid rgba(0,212,255,0.2); padding: 1.5rem; border-radius: 8px; }
                .stat-label { color: #b0b0b0; font-size: 0.85rem; }
                .stat-value { font-size: 1.8rem; font-weight: 900; color: #00d4ff; margin: 0.5rem 0; }
                
                .task-item { background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem; border-left: 4px solid #64ffb0; }
                .task-title { color: #64ffb0; font-weight: 600; }
                .task-desc { color: #b0b0b0; font-size: 0.9rem; margin-top: 0.3rem; }
                
                button { background: #00d4ff; color: #0a0a0a; border: none; padding: 0.7rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
                button:hover { opacity: 0.8; }
                
                input, textarea, select { background: #1a1a1a; color: white; border: 1px solid #333; padding: 0.8rem; border-radius: 6px; font-family: inherit; margin-bottom: 0.8rem; }
                
                .logout-btn { background: #ff6464; color: white; float: right; }
            </style>
        </head>
        <body>
            <div class="navbar">
                <h1>✨ GLAMFLOW ADMIN</h1>
                <button class="logout-btn" onclick="doLogout()">🚪 Logout</button>
            </div>
            
            <div class="container">
                <!-- QUICK STATS -->
                <div class="stat-grid">
                    <div class="stat">
                        <div class="stat-label">💰 Revenue</div>
                        <div class="stat-value" id="stat-revenue">$0</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">👥 Users</div>
                        <div class="stat-value" id="stat-users">0</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">⚡ Tasks</div>
                        <div class="stat-value" id="stat-tasks">0</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">🎫 Tickets</div>
                        <div class="stat-value" id="stat-tickets">0</div>
                    </div>
                </div>
                
                <!-- TABS -->
                <div class="tabs">
                    <button class="tab-btn active" onclick="switchTab('overview')">📊 Overview</button>
                    <button class="tab-btn" onclick="switchTab('automation')">⚡ Automation</button>
                    <button class="tab-btn" onclick="switchTab('users')">👥 Users</button>
                    <button class="tab-btn" onclick="switchTab('billing')">💳 Billing</button>
                    <button class="tab-btn" onclick="switchTab('support')">🎫 Support</button>
                    <button class="tab-btn" onclick="switchTab('security')">🔐 Security</button>
                </div>
                
                <!-- CONTENT -->
                <div class="content" id="tabContent">
                    Loading...
                </div>
            </div>
            
            <script>
                let currentTab = 'overview';
                
                function switchTab(tab) {
                    currentTab = tab;
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    event.target.classList.add('active');
                    
                    const content = document.getElementById('tabContent');
                    
                    switch(tab) {
                        case 'overview':
                            content.innerHTML = \`
                                <h2 style="color: #00d4ff; margin-top: 0;">📊 Dashboard Overview</h2>
                                <p style="color: #b0b0b0;">Real-time analytics and platform metrics</p>
                                <div style="margin-top: 2rem;">
                                    <h3 style="color: #40e0d0;">Recent Activity</h3>
                                    <p style="color: #999;">✅ 2 payments processed</p>
                                    <p style="color: #999;">👤 3 new users joined</p>
                                    <p style="color: #999;">📧 5 emails sent</p>
                                </div>
                            \`;
                            break;
                            
                        case 'automation':
                            content.innerHTML = \`
                                <h2 style="color: #64ffb0; margin-top: 0;">⚡ Automation Bot</h2>
                                <div style="margin-top: 1.5rem;">
                                    <h3 style="color: #64ffb0;">Create Task</h3>
                                    <input type="text" placeholder="Task title" id="taskTitle">
                                    <textarea placeholder="Description" id="taskDesc"></textarea>
                                    <button onclick="addTask()">➕ Create Task</button>
                                </div>
                                <div style="margin-top: 2rem;" id="taskList"></div>
                            \`;
                            loadTasks();
                            break;
                            
                        case 'users':
                            content.innerHTML = \`
                                <h2 style="color: #00d4ff; margin-top: 0;">👥 User Management</h2>
                                <p style="color: #b0b0b0;">Manage and track all users</p>
                                <table style="margin-top: 1.5rem; width: 100%; border-collapse: collapse;">
                                    <tr style="background: rgba(0,212,255,0.1);">
                                        <th>Email</th>
                                        <th>Plan</th>
                                        <th>Joined</th>
                                    </tr>
                                    <tr>
                                        <td>demo@example.com</td>
                                        <td>Pro</td>
                                        <td>Today</td>
                                    </tr>
                                </table>
                            \`;
                            break;
                            
                        case 'billing':
                            content.innerHTML = \`
                                <h2 style="color: #ff8c00; margin-top: 0;">💳 Billing & Payments</h2>
                                <div style="margin-top: 1.5rem;">
                                    <h3 style="color: #ff8c00;">Stripe Configuration</h3>
                                    <input type="text" placeholder="Stripe API Key" id="stripeKey">
                                    <button onclick="saveBilling()">Save</button>
                                </div>
                            \`;
                            break;
                            
                        case 'support':
                            content.innerHTML = \`
                                <h2 style="color: #40e0d0; margin-top: 0;">🎫 Support Tickets</h2>
                                <p style="color: #b0b0b0;">Open tickets: 0</p>
                                <p style="color: #b0b0b0;">Resolved today: 0</p>
                            \`;
                            break;
                            
                        case 'security':
                            content.innerHTML = \`
                                <h2 style="color: #ff6464; margin-top: 0;">🔐 Security & Logs</h2>
                                <h3 style="color: #ff6464;">Activity Log</h3>
                                <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; max-height: 300px; overflow-y: auto;">
                                    <p style="color: #b0b0b0; margin: 0.5rem 0;">✅ Admin login - now</p>
                                    <p style="color: #b0b0b0; margin: 0.5rem 0;">📧 Email sent - 2h ago</p>
                                    <p style="color: #b0b0b0; margin: 0.5rem 0;">💰 Payment received - 4h ago</p>
                                </div>
                            \`;
                            break;
                    }
                }
                
                function addTask() {
                    const title = document.getElementById('taskTitle').value;
                    if (!title) {
                        alert('Task title required');
                        return;
                    }
                    alert('✅ Task created: ' + title);
                    document.getElementById('taskTitle').value = '';
                    document.getElementById('taskDesc').value = '';
                    loadTasks();
                }
                
                function loadTasks() {
                    const list = document.getElementById('taskList');
                    if (!list) return;
                    list.innerHTML = \`
                        <h3 style="color: #64ffb0;">Active Tasks</h3>
                        <div class="task-item">
                            <div class="task-title">Sample Task</div>
                            <div class="task-desc">This is an example task</div>
                        </div>
                    \`;
                }
                
                function saveBilling() {
                    alert('✅ Billing settings saved');
                }
                
                // Load initial tab
                switchTab('overview');
            </script>
        </body>
        </html>
    `;
}

// ===== USER DASHBOARD =====
function showUserDashboard() {
    document.body.innerHTML = `
        <div style="background: #0a0a0a; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center; max-width: 500px; padding: 2rem;">
                <h1 style="color: #00d4ff; font-size: 2rem; margin-bottom: 1rem;">👤 Your Dashboard</h1>
                <p style="color: #b0b0b0; font-size: 1rem;">Welcome, ${currentUser.displayName || currentUser.email}!</p>
                <div style="background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(64,224,208,0.05)); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 2rem; margin-top: 2rem;">
                    <h2 style="color: #40e0d0;">🚀 Coming Soon</h2>
                    <p style="color: #b0b0b0;">Your personal dashboard and tools are launching next week!</p>
                </div>
                <button onclick="doLogout()" style="background: linear-gradient(135deg, #ff0080, #ff8c00); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 2rem;">🚪 Logout</button>
            </div>
        </div>
    `;
}

// ===== LOGOUT =====
function doLogout() {
    // Clear admin token if present
    sessionStorage.removeItem('glamflow_admin_token');
    
    if (auth && !usingAdminToken) {
        auth.signOut().then(() => {
            window.location.href = '/index.html';
        });
    } else {
        window.location.href = '/index.html';
    }
}

