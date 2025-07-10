// بدء التحميل عند اكتمال DOM
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.visibility = 'hidden';
  loadResources();
});

// دالة لتحميل الموارد بشكل متسلسل
async function loadResources() {
  try {
    // 1. إظهار شاشة تحميل
    showLoadingIndicator();

    // 2. تحميل التوب بار من ملف HTML (مع منع التخزين المؤقت)
    const topbarHtml = await fetch(getWithTimestamp('topbar.html'))
      .then(validateResponse);

    // 3. إدراج التوب بار في الصفحة
    const container = document.getElementById('topbar-container');
    if (container) container.innerHTML = topbarHtml;
    else throw new Error("العنصر #topbar-container غير موجود!");

    // 4. تحميل CSS الخاص بالتوب بار
    await loadCSS(getWithTimestamp('topbar.css'));

    // 5. تهيئة التوب بار بعد تحميله
    initializeTopbar();

  } catch (error) {
    console.error('فشل تحميل الموارد:', error);
    showErrorUI();
  } finally {
    // 6. إزالة شاشة التحميل
    hideLoadingIndicator();

    // 7. إظهار المحتوى
    document.body.style.visibility = 'visible';
  }
}

// ⚙️ تحميل CSS بشكل ديناميكي
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

// ✅ معالجة الاستجابة من السيرفر
function validateResponse(response) {
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.text();
}

// 🕒 إلحاق الوقت لمنع التخزين المؤقت
function getWithTimestamp(url) {
  return `${url}?v=${new Date().getTime()}`;
}

// 🧠 تهيئة أحداث التوب بار
function initializeTopbar() {
  // أزرار رئيسية
  document.getElementById('menuBtn')?.addEventListener('click', handleMenuClick);
  document.getElementById('searchBtn')?.addEventListener('click', handleSearchClick);
  document.getElementById('logoBtn')?.addEventListener('click', () => {
    window.location.href = getWithTimestamp('index.html');
  });

  // إعداد قائمة الشاشة الكاملة
  const fullMenu = document.getElementById("fullMenu");
  if (fullMenu) {
    fullMenu.addEventListener("click", (e) => {
      if (e.target === fullMenu) fullMenu.classList.add("hidden");
    });

    fullMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        fullMenu.classList.add("hidden");
      });
    });

    document.getElementById("closeMenuBtn")?.addEventListener("click", () => {
      fullMenu.classList.add("hidden");
    });
  }

  // ضبط padding علوي للمحتوى بناء على ارتفاع التوب بار
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

// 🌀 شاشة التحميل
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
  alert("حدث خطأ أثناء تحميل التوب بار. تأكد من وجود الملفات: topbar.html و topbar.css");
}
