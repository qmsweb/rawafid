document.addEventListener('DOMContentLoaded', function() {
    // تحميل التوب بار
    fetch('topbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(html => {
            document.getElementById('topbar-container').innerHTML = html;
            bindTopbarEvents();
            adjustBodyPadding();
        })
        .catch(error => console.error('Error loading topbar:', error));

    function bindTopbarEvents() {
        // زر القائمة
        document.getElementById('menuBtn')?.addEventListener('click', function() {
            console.log('تم النقر على زر القائمة');
            // يمكنك إضافة فتح القائمة الجانبية هنا
        });
        
        // زر البحث
        document.getElementById('searchBtn')?.addEventListener('click', function() {
            console.log('تم النقر على زر البحث');
            // يمكنك إضافة فتح شريط البحث هنا
        });
        
        // زر الشعار
        document.getElementById('logoBtn')?.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    function adjustBodyPadding() {
        // إضافة هامش أعلى الصفحة لتعويض التوب بار الثابت
        const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 70;
        document.body.style.paddingTop = `${topbarHeight}px`;
    }
});
