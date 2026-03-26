/**
 * ============================================================
 * theme.js — Light / Dark Theme Toggle for GamerFeed
 * ============================================================
 * 
 * This file handles:
 *   1. Loading the saved theme from localStorage on page load.
 *   2. Toggling between "light" and "dark" themes.
 *   3. Persisting the user's choice so it survives page reloads.
 * 
 * HOW IT WORKS:
 *   - The <body> element gets a class of "light-theme" when light
 *     mode is active. Dark mode is the default (no extra class).
 *   - CSS variables in each stylesheet respond to the class to
 *     swap colours.
 *   - The toggle button's inner SVG icon changes between a sun
 *     (to switch to light) and a moon (to switch to dark).
 * 
 * USAGE:
 *   Include this script AFTER config.js in every HTML page:
 *     <script src="../js/config.js"></script>
 *     <script src="../js/theme.js"></script>
 * 
 *   Place a button in the header with id="themeToggleBtn":
 *     <button id="themeToggleBtn" class="btn-theme" aria-label="Toggle theme"></button>
 */

(function () {
  "use strict";

  /**
   * Applies the given theme to the page.
   * @param {"light"|"dark"} theme — The theme to apply.
   */
  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }

    /* Update the toggle button icon (if it exists on the page) */
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      /* Show moon icon when in light mode (click to go dark),
         show sun icon when in dark mode (click to go light) */
      btn.innerHTML = theme === "light" ? SVG_ICONS.moon : SVG_ICONS.sun;
      btn.title = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
    }
  }

  /**
   * Reads the saved theme from localStorage.
   * Falls back to "dark" if nothing is saved.
   * @returns {"light"|"dark"}
   */
  function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  }

  /**
   * Toggles the theme and saves the new preference.
   */
  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }

  /* ── Initialise on page load ──────────────────────────────── */
  /* Apply saved theme immediately so there is no flash of wrong colours */
  applyTheme(getSavedTheme());

  /* Bind the toggle button once the DOM is ready */
  document.addEventListener("DOMContentLoaded", function () {
    /* Re-apply in case body wasn't ready during the first call */
    applyTheme(getSavedTheme());

    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  });
})();
