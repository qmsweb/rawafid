// ملف loadTopbar.js
document.addEventListener('DOMContentLoaded', function() {
    // 1. تحميل التوب بار
    fetch('topbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // 2. إدراج التوب بار في الصفحة
            document.getElementById('topbar-container').innerHTML = html;
            
            // 3. ربط الأحداث بعد التحميل
            bindTopbarEvents();
        })
        .catch(error => {
            console.error('Error loading topbar:', error);
        });

    // دالة لربط أحداث التوب بار
    function bindTopbarEvents() {
        // زر القائمة
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', function() {
                console.log('تم النقر على زر القائمة');
                // يمكنك هنا تنفيذ أي أكواد لفتح القائمة الجانبية
            });
        }
        
        // زر البحث
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                console.log('تم النقر على زر البحث');
                // يمكنك هنا تنفيذ أي أكواد لفتح شريط البحث
            });
        }
        
        // زر الشعار
        const logoBtn = document.getElementById('logoBtn');
        if (logoBtn) {
            logoBtn.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
    }
});
