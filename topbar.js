document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const blurOverlay = document.getElementById('blurOverlay');
    
    // Toggle menu when menu button is clicked
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        blurOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close menu when close button is clicked
    closeMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        blurOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close menu when clicking on overlay
    blurOverlay.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        blurOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close menu when clicking on a menu item
    const menuItems = document.querySelectorAll('.menu-items a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            blurOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});
