document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    
    // فتح القائمة
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // منع التمرير عند فتح القائمة
    });
    
    // إغلاق القائمة
    closeMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = ''; // إعادة تمكين التمرير
    });
    
    // إغلاق القائمة عند النقر على رابط
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});
