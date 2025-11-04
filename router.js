// Simple client-side router
(function() {
  function initRouter() {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');

    function showPage(pageId) {
      // Hide all pages
      pages.forEach(page => {
        page.classList.remove('active');
      });

      // Show selected page
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      // Update nav links
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('active');
        }
      });

      // Scroll to top
      window.scrollTo(0, 0);
    }

    function handleRoute() {
      const hash = window.location.hash.slice(1) || '/';
      const route = hash === '/' ? 'home' : hash.slice(1);
      showPage(route);
    }

    // Handle initial route
    handleRoute();

    // Handle hash changes
    window.addEventListener('hashchange', handleRoute);

    // Handle nav link clicks
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        window.location.hash = page === 'home' ? '/' : `/${page}`;
      });
    });

    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
        }
      });
    }
  }

  // Initialize router when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
})();

