/* ==========================================================================
   DYNAMIC FOOTER COPYRIGHT SCRIPT (footer-year.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    const copyrightHtml = `&copy; ${currentYear} <span class="brand-text">MOB EXTRA</span>. All Rights Reserved.`;

    // Automatically find all copyright containers across every page and update them
    const copyrightElements = document.querySelectorAll('.footer-copyright');
    copyrightElements.forEach(el => {
        el.innerHTML = copyrightHtml;
    });
});
