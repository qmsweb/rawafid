/* ============================================================
   نظام الواجهة الموحد - روافد
   يدير: الثيمات + قائمة التنقل في الجوال
   ============================================================ */
(function () {
  'use strict';

  var THEMES = ['light', 'dark'];
  var STORAGE_KEY = 'rawafed-theme';

  /* ==========================================================
     1. الثيمات
     ========================================================== */
  function getCurrentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) !== -1 ? t : 'light';
  }

  function applyTheme(id, save) {
    if (THEMES.indexOf(id) === -1) id = 'light';
    document.documentElement.setAttribute('data-theme', id);
    if (save !== false) {
      try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
    }
    updateThemeLabels(id);
  }

  function toggleTheme() {
    var cur = getCurrentTheme();
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }
  window.toggleTheme = toggleTheme;

  function updateThemeLabels(id) {
    var nextLabel = id === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي';
    var buttons = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-label', nextLabel);
      btn.setAttribute('title', nextLabel);
    });
  }

  /* ==========================================================
     2. قائمة التنقل في الجوال
     ========================================================== */
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var navLinks = document.getElementById('nav-links');
    var overlay = document.getElementById('nav-overlay');

    if (!toggle || !navLinks || !overlay) return;

    function setMenuOpen(isOpen) {
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navLinks.classList.toggle('is-open', isOpen);
      overlay.classList.toggle('is-visible', isOpen);
      overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    function openMenu() {
      setMenuOpen(true);
    }

    function toggleMenu() {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    }

    toggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    // إغلاق القائمة عند تغيير حجم النافذة إلى سطح مكتب
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  /* ==========================================================
     3. التهيئة
     ========================================================== */
  function init() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    applyTheme(THEMES.indexOf(saved) !== -1 ? saved : 'light', false);

    var themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    themeButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); toggleTheme(); });
    });

    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
