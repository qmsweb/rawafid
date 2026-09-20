/* ============================================================
   نظام الثيمات الموحّد - روافد
   أيقونة القمر/الشمس في الهيدر تُبدّل الوضع مباشرة عند النقر
   ============================================================ */
(function () {
  'use strict';

  var THEMES = ['light', 'dark'];

  function getCurrent() {
    var t = document.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) !== -1 ? t : 'light';
  }

  function applyTheme(id, save) {
    if (THEMES.indexOf(id) === -1) id = 'light';
    document.documentElement.setAttribute('data-theme', id);
    if (save !== false) {
      try { localStorage.setItem('rawafed-theme', id); } catch (e) {}
    }
    updateLabels(id);
  }

  /* عكس التوافق مع الصفحات القديمة التي تستدعي toggleTheme() */
  function toggleTheme() {
    var cur = getCurrent();
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }
  window.toggleTheme = toggleTheme;

  function updateLabels(id) {
    var next = id === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي';
    var navBtn = document.getElementById('theme-toggle-btn');
    if (navBtn) {
      navBtn.setAttribute('aria-label', next);
      navBtn.setAttribute('title', next);
    }
    var sideBtn = document.getElementById('sidebar-theme-toggle');
    if (sideBtn) sideBtn.setAttribute('aria-label', next);
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem('rawafed-theme'); } catch (e) {}
    applyTheme(THEMES.indexOf(saved) !== -1 ? saved : 'light', false);

    var navBtn = document.getElementById('theme-toggle-btn');
    var sideBtn = document.getElementById('sidebar-theme-toggle');

    if (navBtn) {
      navBtn.addEventListener('click', function (e) { e.preventDefault(); toggleTheme(); });
    }
    if (sideBtn) {
      sideBtn.addEventListener('click', function (e) { e.preventDefault(); toggleTheme(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();