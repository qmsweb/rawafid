// بدء التحميل عند اكتمال DOM
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.visibility = 'hidden';
  document.documentElement.style.scrollBehavior = 'smooth'; // لحركات التمرير السلسة
  loadResources();
});

// دالة لتحميل الموارد بشكل متسلسل
async function loadResources() {
  try {
    // 1. إظهار شاشة تحميل
    showLoadingIndicator();

    // 2. تحميل التوب بار من ملف HTML (مع منع التخزين المؤقت)
    const topbarHtml = await fetch(getWithTimestamp('topbar.html'))
      .then(validateResponse)
      .catch(err => {
        throw new Error(`فشل تحميل التوب بار: ${err.message}`);
      });

    // 3. إدراج التوب بار في الصفحة
    const container = document.getElementById('topbar-container');
    if (!container) throw new Error("العنصر #topbar-container غير موجود!");
    
    container.innerHTML = topbarHtml;

    // 4. تحميل CSS الخاص بالتوب بار
    await loadCSS(getWithTimestamp('topbar.css'));

    // 5. تهيئة التوب بار بعد تحميله
    await initializeTopbar();

    // 6. تحميل الخطوط إذا لزم الأمر
    await loadFonts();

  } catch (error) {
    console.error('فشل تحميل الموارد:', error);
    showErrorUI(error.message);
  } finally {
    // 7. إزالة شاشة التحميل
    hideLoadingIndicator();

    // 8. إظهار المحتوى بسلاسة
    setTimeout(() => {
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.style.opacity = '1', 50);
    }, 100);
  }
}

// تحميل CSS بشكل ديناميكي
async function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`فشل تحميل ملف CSS: ${url}`));
    document.head.appendChild(link);
  });
}

// تحميل الخطوط المخصصة
async function loadFonts() {
  try {
    await document.fonts.ready;
  } catch (err) {
    console.warn('تحذير: فشل تحميل الخطوط', err);
  }
}

// معالجة الاستجابة من السيرفر
function validateResponse(response) {
  if (!response.ok) {
    throw new Error(`خطأ HTTP! الحالة: ${response.status}`);
  }
  return response.text();
}

// إلحاق الوقت لمنع التخزين المؤقت
function getWithTimestamp(url) {
  const timestamp = new Date().getTime();
  return `${url}?v=${timestamp}`;
}

// تهيئة أحداث التوب بار
async function initializeTopbar() {
  try {
    // أزرار رئيسية
    document.getElementById('menuBtn')?.addEventListener('click', toggleFullMenu);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearchClick);
    document.getElementById('logoBtn')?.addEventListener('click', () => {
      window.location.href = getWithTimestamp('index.html');
    });

    // إعداد قائمة الشاشة الكاملة
    const fullMenu = document.getElementById("fullMenu");
    if (fullMenu) {
      fullMenu.addEventListener("click", (e) => {
        if (e.target === fullMenu) toggleFullMenu();
      });

      fullMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", toggleFullMenu);
      });

      document.getElementById("closeMenuBtn")?.addEventListener("click", toggleFullMenu);
    }

    // ضبط padding علوي للمحتوى بناء على ارتفاع التوب بار
    adjustBodyPadding();

    // إضافة حدث resize لتعديل الـ padding عند تغيير حجم الشاشة
    window.addEventListener('resize', debounce(adjustBodyPadding, 100));

  } catch (err) {
    console.error('خطأ في تهيئة التوب بار:', err);
    throw err;
  }
}

function toggleFullMenu() {
  const fullMenu = document.getElementById("fullMenu");
  if (fullMenu) {
    fullMenu.classList.toggle("active");
    document.body.style.overflow = fullMenu.classList.contains("active") ? 'hidden' : '';
  }
}

function handleSearchClick() {
  // يمكن استبدال هذا بتنفيذ حقيقي لميزة البحث
  const searchBox = document.createElement('div');
  searchBox.innerHTML = `
    <div style="position:fixed; top:100px; right:20px; background:white; padding:20px; z-index:1001; box-shadow:0 0 10px rgba(0,0,0,0.2);">
      <input type="text" placeholder="ابحث هنا..." style="padding:8px; width:200px;">
      <button onclick="this.parentNode.remove()">إغلاق</button>
    </div>
  `;
  document.body.appendChild(searchBox);
}

function adjustBodyPadding() {
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const height = topbar.offsetHeight;
    document.body.style.paddingTop = `${height}px`;
  }
}

// شاشة التحميل
function showLoadingIndicator() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a2a6c, #3a7bd5, #00d2ff);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 1.5rem;
    direction: rtl;
  `;
  loader.innerHTML = `
    <div class="loader-content">
      <div class="spinner"></div>
      <p>جاري تحميل التطبيق...</p>
    </div>
    <style>
      .spinner {
        border: 5px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top: 5px solid white;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.prepend(loader);
}

function hideLoadingIndicator() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
}

function showErrorUI(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
    text-align: center;
    font-family: Arial, sans-serif;
    direction: rtl;
  `;
  errorDiv.innerHTML = `
    <h2 style="color: #d32f2f;">حدث خطأ!</h2>
    <p>${message || 'حدث خطأ أثناء تحميل الصفحة'}</p>
    <button onclick="window.location.reload()" style="
      margin-top: 20px;
      padding: 10px 20px;
      background: #1a2a6c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    ">إعادة المحاولة</button>
  `;
  document.body.appendChild(errorDiv);
}

// دالة لتنفيذ الأحداث بعد تأخير (لمنع التكرار السريع)
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
