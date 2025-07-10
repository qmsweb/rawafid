// دالة لتحميل الموارد بشكل متسلسل
async function loadResources() {
    try {
        // 1. إظهار شاشة تحميل
        showLoadingIndicator();
        
        // 2. تحميل التوب بار مع منع التخزين المؤقت
        const topbarHtml = await fetch(getWithTimestamp('topbar.html'))
            .then(validateResponse);
        
        // 3. إدراج التوب بار في الصفحة
        document.getElementById('topbar-container').innerHTML = topbarHtml;
        
        // 4. تحميل CSS بشكل غير متزامن
        await loadCSS(getWithTimestamp('topbar.css'));
        
        // 5. تهيئة التوب بار
        initializeTopbar();
        
    } catch (error) {
        console.error('فشل تحميل الموارد:', error);
        showErrorUI();
    } finally {
        // 6. إخفاء شاشة التحمل بعد الانتهاء
        hideLoadingIndicator();
        // 7. إظهار المحتوى الرئيسي
        document.body.style.visibility = 'visible';
    }
}

// الدوال المساعدة
function getWithTimestamp(url) {
    return `${url}?v=${new Date().getTime()}`;
}

function validateResponse(response) {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
}

async function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = () => reject(new Error(`فشل تحميل CSS: ${url}`));
        document.head.appendChild(link);
    });
}

function initializeTopbar() {
    // ربط الأحداث للأزرار
    document.getElementById('menuBtn')?.addEventListener('click', handleMenuClick);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearchClick);
    document.getElementById('logoBtn')?.addEventListener('click', () => {
        window.location.href = getWithTimestamp('index.html');
    });

    // تهيئة قائمة الشاشة الكاملة
const fullMenu = document.getElementById("fullMenu");
if (fullMenu) {
    fullMenu.addEventListener("click", (e) => {
        if (e.target === fullMenu) {
            fullMenu.classList.add("hidden");
        }
    });

    // إغلاق عند الضغط على الروابط
    fullMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            fullMenu.classList.add("hidden");
        });
    });

    // زر الإغلاق
    document.getElementById("closeMenuBtn")?.addEventListener("click", () => {
        fullMenu.classList.add("hidden");
    });
}


    // ضبط الهامش العلوي للمحتوى
    adjustBodyPadding();
}

function handleMenuClick() {
    const fullMenu = document.getElementById("fullMenu");
    if (fullMenu) {
        fullMenu.classList.toggle("hidden");
    }
}

function handleSearchClick() {
    alert("ميزة البحث قيد التطوير");
}

function adjustBodyPadding() {
    const topbar = document.getElementById('topbar');
    if (topbar) {
        const height = topbar.offsetHeight;
        document.body.style.paddingTop = `${height}px`;
    }
}

function showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loader.innerHTML = `<div style="font-family: Arial; font-size: 18px;">جاري التحميل...</div>`;
    document.body.prepend(loader);
}

function hideLoadingIndicator() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.remove();
}

function showErrorUI() {
    alert("حدث خطأ أثناء تحميل التوب بار.");
}

// بدء التحميل عند اكتمال DOM
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'hidden';
    loadResources();
});
