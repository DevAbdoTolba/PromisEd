/**
 * NAVBAR.JS - Dynamic Navigation
 * Renders context-aware navigation based on user role.
 * Uses relative paths for file:// protocol compatibility.
 */

function getBasePath() {
    // Detect if we're in a subdirectory (admin/ or student/)
    var path = window.location.pathname;
    if (path.indexOf('/admin/') !== -1 || path.indexOf('/student/') !== -1) {
        return '../';
    }
    return './';
}

function renderNavbar() {
    var user = DB.users.getLoggedIn();
    var base = getBasePath();
    var nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    var container = document.createElement('div');
    container.className = 'nav-container';
    
    // Logo
    var logo = document.createElement('a');
    logo.href = base + 'index.html';
    logo.className = 'nav-logo';
    logo.textContent = 'PromisEd';
    container.appendChild(logo);
    
    // Navigation Links
    var linksDiv = document.createElement('div');
    linksDiv.className = 'nav-links';
    
    if (!user) {
        // Guest Navigation
        linksDiv.innerHTML = '<a href="' + base + 'index.html">Home</a>' +
            '<a href="' + base + 'student/catalog.html">Courses</a>' +
            '<a href="' + base + 'login.html" class="btn-nav">Login</a>' +
            '<a href="' + base + 'register.html" class="btn-nav btn-primary">Register</a>';
    } else if (user.role === 'admin') {
        // Admin Navigation
        linksDiv.innerHTML = '<a href="' + base + 'admin/dashboard.html">Dashboard</a>' +
            '<a href="' + base + 'admin/courses.html">Courses</a>' +
            '<a href="' + base + 'admin/categories.html">Categories</a>' +
            '<a href="' + base + 'admin/students.html">Students</a>' +
            '<span class="nav-user">Welcome, ' + user.name + '</span>' +
            '<a href="#" onclick="DB.users.logout(); return false;" class="btn-nav">Logout</a>';
    } else {
        // Student Navigation
        linksDiv.innerHTML = '<a href="' + base + 'index.html">Home</a>' +
            '<a href="' + base + 'student/dashboard.html">My Courses</a>' +
            '<a href="' + base + 'student/catalog.html">Browse</a>' +
            '<a href="' + base + 'student/wishlist.html">Wishlist</a>' +
            '<span class="nav-user">Hi, ' + user.name + '</span>' +
            '<a href="#" onclick="DB.users.logout(); return false;" class="btn-nav">Logout</a>';
    }
    
    container.appendChild(linksDiv);
    nav.appendChild(container);
    
    // Insert at top of body
    document.body.insertBefore(nav, document.body.firstChild);
}

// Auto-render when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    renderNavbar();
});
