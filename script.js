document.addEventListener("DOMContentLoaded", () => {
  /* --------------------- TAB SWITCH SCRIPT (keeps your tab behaviour) --------------------- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const skillBars = document.querySelectorAll(".skill-bar span");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");

      if (btn.dataset.tab === "skills") {
        skillBars.forEach((bar) => {
          bar.style.width = (bar.dataset.width || bar.getAttribute('data-width')) + "%";
        });
      } else {
        skillBars.forEach((bar) => (bar.style.width = "0"));
      }
    });
  });

  /* --------------------- SCROLL PAGE NAVIGATION (robust + debug) --------------------- */

  // Page order - edit if your file names differ
  const pages = ["index.html", "about.html", "projects.html", "contact.html"];

  function getCurrentPageFilename() {
    // get last path segment
    let path = window.location.pathname;
    let file = path.substring(path.lastIndexOf("/") + 1);
    // if empty (e.g. served as / or file://.../folder/), treat as index.html
    if (!file) file = "index.html";
    return file;
  }

  function goToPage(filename) {
    if (!filename) return;
    console.log("Navigate ->", filename);
    // Use location.href so links work for both local and server
    window.location.href = filename;
  }

  function goToNextPage() {
    const current = getCurrentPageFilename();
    console.log("Current page:", current);
    const idx = pages.indexOf(current);
    if (idx === -1) {
      console.warn("Current page not found in pages list:", current);
      return;
    }
    if (idx < pages.length - 1) goToPage(pages[idx + 1]);
  }

  function goToPrevPage() {
    const current = getCurrentPageFilename();
    console.log("Current page:", current);
    const idx = pages.indexOf(current);
    if (idx === -1) {
      console.warn("Current page not found in pages list:", current);
      return;
    }
    if (idx > 0) goToPage(pages[idx - 1]);
  }

  // guard to avoid double-triggering while navigating
  let isNavigating = false;
  function navigationGuard(fn) {
    if (isNavigating) return;
    isNavigating = true;
    try { fn(); } finally {
      setTimeout(() => { isNavigating = false; }, 900); // allow next nav after 900ms
    }
  }

  // wheel (desktop)
  window.addEventListener("wheel", (e) => {
    // ignore tiny scrolls
    if (Math.abs(e.deltaY) < 40) return;
    // ignore if user is interacting with input/textarea
    const active = document.activeElement && ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName);
    if (active) return;
    if (e.deltaY > 0) navigationGuard(goToNextPage);
    else navigationGuard(goToPrevPage);
  }, { passive: true });

  // keyboard (optional)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") navigationGuard(goToNextPage);
    if (e.key === "ArrowUp") navigationGuard(goToPrevPage);
  });

  // touch support (mobile): detect vertical swipe
  let touchStartY = null;
  window.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (touchStartY === null) return;
    const touchEndY = (e.changedTouches && e.changedTouches[0].clientY) || null;
    if (touchEndY === null) { touchStartY = null; return; }
    const diff = touchStartY - touchEndY;
    // small threshold
    if (Math.abs(diff) < 50) { touchStartY = null; return; }
    if (diff > 0) navigationGuard(goToNextPage);
    else navigationGuard(goToPrevPage);
    touchStartY = null;
  }, { passive: true });

  // Debug helper: print pages list and current page at load
  console.log("Scroll-nav pages:", pages);
  console.log("Detected current page:", getCurrentPageFilename());

});
