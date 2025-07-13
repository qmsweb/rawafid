document.addEventListener('DOMContentLoaded', function () {
    // تأكد من وجود العناصر قبل ربط الأحداث
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileMenu) {
        // فتح القائمة
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMenu && mobileMenu) {
        // إغلاق القائمة
        closeMenu.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // إغلاق عند الضغط على روابط القائمة
    if (mobileLinks.length > 0 && mobileMenu) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});
