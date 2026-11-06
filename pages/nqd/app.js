(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var nav = document.getElementById("nqd-nav");
  var navToggle = nav ? nav.querySelector(".nqd-nav__toggle") : null;
  var navMenu = nav ? nav.querySelector(".nqd-nav__menu") : null;

  function setNav(open) {
    if (!nav || !navToggle) {
      return;
    }
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
  }

  if (navMenu) {
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
  }

  document.addEventListener("click", function (event) {
    if (nav && nav.classList.contains("is-open") && !nav.contains(event.target)) {
      setNav(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav && nav.classList.contains("is-open")) {
      setNav(false);
      if (navToggle) {
        navToggle.focus();
      }
    }
  });

  window.addEventListener("resize", function () {
    if (nav && window.innerWidth > 780 && nav.classList.contains("is-open")) {
      setNav(false);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (link.classList.contains("nqd-skip")) {
        return;
      }
      var hash = link.getAttribute("href");
      if (!hash || hash === "#") {
        return;
      }
      var target = document.querySelector(hash);
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start"
      });
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", hash);
        }
      } catch (error) {
        void error;
      }
      if (nav && nav.classList.contains("is-open")) {
        setNav(false);
      }
    });
  });

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".nqd-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".nqd-timeline__panel"));

  function activateTab(index, moveFocus) {
    if (!tabs.length) {
      return;
    }
    tabs.forEach(function (tab, tabIndex) {
      var selected = tabIndex === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel, panelIndex) {
      var selected = panelIndex === index;
      panel.hidden = !selected;
      if (selected) {
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });
    if (tabs[index]) {
      tabs[index].scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
    if (moveFocus) {
      tabs[index].focus();
    }
  }

  if (tabs.length) {
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(index, false);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowLeft") {
          next = index + 1;
        }
        if (event.key === "ArrowRight") {
          next = index - 1;
        }
        if (event.key === "Home") {
          next = 0;
        }
        if (event.key === "End") {
          next = tabs.length - 1;
        }
        if (next === null) {
          return;
        }
        event.preventDefault();
        activateTab((next + tabs.length) % tabs.length, true);
      });
    });
  }

  var conceptButtons = Array.prototype.slice.call(document.querySelectorAll(".nqd-concept__toggle"));

  function setConcept(button, open) {
    var card = button.closest(".nqd-concept");
    var detailId = button.getAttribute("aria-controls");
    var detail = detailId ? document.getElementById(detailId) : null;
    var icon = button.querySelector("i");
    button.setAttribute("aria-expanded", String(open));
    if (card) {
      card.classList.toggle("is-open", open);
    }
    if (detail) {
      detail.hidden = !open;
    }
    if (icon) {
      icon.textContent = open ? "−" : "+";
    }
  }

  conceptButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";
      conceptButtons.forEach(function (other) {
        if (other !== button) {
          setConcept(other, false);
        }
      });
      setConcept(button, !isOpen);
    });
  });

  var tip = document.getElementById("nqd-floating-tip");
  var refs = Array.prototype.slice.call(document.querySelectorAll(".nqd-ref"));

  if (tip && refs.length) {
    var currentRef = null;
    var pinnedRef = null;

    function positionTip(ref) {
      var rect = ref.getBoundingClientRect();
      var width = tip.offsetWidth;
      var height = tip.offsetHeight;
      var pad = 12;
      var left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
      var top = rect.top - height - 12;
      if (top < pad) {
        top = rect.bottom + 12;
      }
      if (top + height > window.innerHeight - pad) {
        top = Math.max(pad, window.innerHeight - height - pad);
      }
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }

    function showTip(ref) {
      currentRef = ref;
      tip.textContent = ref.getAttribute("data-tip") || "";
      tip.style.left = "-9999px";
      tip.style.top = "-9999px";
      tip.classList.add("is-visible");
      tip.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(function () {
        positionTip(ref);
      });
    }

    function hideTip(force, ref) {
      if (!force && pinnedRef) {
        return;
      }
      if (!force && ref && currentRef !== ref) {
        return;
      }
      tip.classList.remove("is-visible");
      tip.setAttribute("aria-hidden", "true");
      currentRef = null;
    }

    refs.forEach(function (ref) {
      ref.addEventListener("pointerenter", function () {
        if (!pinnedRef) {
          showTip(ref);
        }
      });
      ref.addEventListener("pointerleave", function () {
        if (pinnedRef !== ref) {
          hideTip(false, ref);
        }
      });
      ref.addEventListener("focus", function () {
        if (pinnedRef && pinnedRef !== ref) {
          pinnedRef.classList.remove("is-open");
          pinnedRef = null;
        }
        showTip(ref);
      });
      ref.addEventListener("blur", function () {
        if (pinnedRef !== ref) {
          hideTip(false, ref);
        }
      });
      ref.addEventListener("click", function () {
        if (pinnedRef === ref) {
          ref.classList.remove("is-open");
          pinnedRef = null;
          hideTip(true);
          return;
        }
        if (pinnedRef) {
          pinnedRef.classList.remove("is-open");
        }
        pinnedRef = ref;
        ref.classList.add("is-open");
        showTip(ref);
      });
    });

    document.addEventListener("click", function (event) {
      if (pinnedRef && !pinnedRef.contains(event.target) && event.target !== tip) {
        pinnedRef.classList.remove("is-open");
        pinnedRef = null;
        hideTip(true);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && pinnedRef) {
        pinnedRef.classList.remove("is-open");
        pinnedRef = null;
        hideTip(true);
      }
    });

    window.addEventListener("scroll", function () {
      if (currentRef && tip.classList.contains("is-visible")) {
        positionTip(currentRef);
      }
    }, { passive: true });

    window.addEventListener("resize", function () {
      if (currentRef && tip.classList.contains("is-visible")) {
        positionTip(currentRef);
      }
    });
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (element) {
      var frame = 0;

      function reset() {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        element.classList.remove("is-tilting");
        element.style.setProperty("--nqd-rx", "0deg");
        element.style.setProperty("--nqd-ry", "0deg");
      }

      element.addEventListener("pointermove", function (event) {
        var rect = element.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 8;
        var ry = (px - 0.5) * 10;
        if (frame) {
          window.cancelAnimationFrame(frame);
        }
        frame = window.requestAnimationFrame(function () {
          element.classList.add("is-tilting");
          element.style.setProperty("--nqd-rx", rx.toFixed(2) + "deg");
          element.style.setProperty("--nqd-ry", ry.toFixed(2) + "deg");
          frame = 0;
        });
      });

      element.addEventListener("pointerleave", reset);
      element.addEventListener("pointercancel", reset);
    });
  }

  var revealElements = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (revealElements.length && "IntersectionObserver" in window && !reduceMotion.matches) {
    var pending = revealElements.filter(function (element) {
      return element.getBoundingClientRect().top > window.innerHeight * 0.92;
    });

    pending.forEach(function (element) {
      element.classList.add("is-pending");
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.remove("is-pending");
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -50px 0px"
    });

    pending.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nqd-nav__menu a[href^='#']"));

  if (navLinks.length && "IntersectionObserver" in window) {
    var sections = navLinks.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-42% 0px -52% 0px",
      threshold: 0
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();
