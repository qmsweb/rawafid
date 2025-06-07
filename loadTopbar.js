// دالة لمنع التخزين المؤقت بإضافة طابع زمني
function getWithTimestamp(url) {
    const timestamp = new Date().getTime();
    return `${url}?v=${timestamp}`;
}

document.addEventListener('DOMContentLoaded', function() {
    // 1. تحميل التوب بار مع منع التخزين المؤقت
    fetch(getWithTimestamp('topbar.html'))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // 2. إدراج التوب بار في الصفحة
            const container = document.getElementById('topbar-container');
            if (!container) {
                throw new Error('Container element not found');
            }
            container.innerHTML = html;
            
            // 3. تحميل CSS مع منع التخزين المؤقت
            loadCSS(getWithTimestamp('topbar.css'));
            
            // 4. ربط الأحداث
            bindTopbarEvents();
            adjustBodyPadding();
        })
        .catch(error => {
            console.error('Failed to load topbar:', error);
            showErrorUI();
        });

    // دالة لتحميل CSS ديناميكياً
    function loadCSS(cssUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.onload = () => console.log('CSS loaded successfully');
        link.onerror = () => console.error('Failed to load CSS');
        document.head.appendChild(link);
    }

    // دالة لربط أحداث التوب بار
    function bindTopbarEvents() {
        // تأخير الربط لضمان تحميل العناصر
        setTimeout(() => {
            const menuBtn = document.getElementById('menuBtn');
            const searchBtn = document.getElementById('searchBtn');
            const logoBtn = document.getElementById('logoBtn');
            
            if (menuBtn) {
                menuBtn.addEventListener('click', handleMenuClick);
            }
            
            if (searchBtn) {
                searchBtn.addEventListener('click', handleSearchClick);
            }
            
            if (logoBtn) {
                logoBtn.addEventListener('click', () => {
                    window.location.href = getWithTimestamp('index.html');
                });
            }
        }, 100);
    }

    function handleMenuClick() {
        console.log('تم فتح القائمة الجانبية');
        // أضف هنا كود فتح القائمة
    }

    function handleSearchClick() {
        console.log('تم فتح شريط البحث');
        // أضف هنا كود البحث
    }

    function adjustBodyPadding() {
        const topbar = document.querySelector('.topbar');
        if (topbar) {
            const height = topbar.offsetHeight;
            document.body.style.paddingTop = `${height}px`;
            console.log(`تم ضبط الهوامش: ${height}px`);
        }
    }

    function showErrorUI() {
        const container = document.getElementById('topbar-container') || document.body;
        container.innerHTML = `
            <div style="
                background: #ffebee;
                color: #c62828;
                padding: 15px;
                border-left: 4px solid #c62828;
                margin: 10px;
                font-family: Arial, sans-serif;
            ">
                <strong>خطأ في تحميل التوب بار:</strong> يرجى تحديث الصفحة (F5)
            </div>
            ${container.innerHTML}
        `;
    }
});
