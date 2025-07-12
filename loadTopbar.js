document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');

    // فتح القائمة
    menuToggle.addEventListener('click', function () {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // إغلاق القائمة
    closeMenu.addEventListener('click', function () {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });

    // إغلاق عند النقر على الروابط
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});
