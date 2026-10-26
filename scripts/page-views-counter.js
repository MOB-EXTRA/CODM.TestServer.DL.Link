/* ==========================================================================
   Auto-Injecting Global View Counter Component (Top & Bottom Support)
   ========================================================================== */
(function initGlobalViewCounter() {
  const BASE_OFFSET = 16420; // Permanent base offset

  // 1. Dynamic CSS Injection for consistent styling
  function injectCounterStyles() {
    if (document.getElementById("auto-view-counter-styles")) return;
    const style = document.createElement("style");
    style.id = "auto-view-counter-styles";
    style.textContent = `
      .top-views-container,
      .auto-footer-views-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--surface-2, #181818);
        border: 1px solid var(--border, #303030);
        border-radius: var(--radius-sm, 10px);
        text-align: center;
        box-sizing: border-box;
      }
      .top-views-container {
        margin: 12px auto 6px auto;
        width: fit-content;
      }
      .auto-footer-views-container {
        margin: 20px 24px;
      }
      .top-views-container .views-label,
      .auto-footer-views-container .views-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted, #bdbdbd);
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .top-views-container .views-number,
      .auto-footer-views-container .views-number {
        font-size: 13px;
        font-weight: 800;
        color: var(--gold, #FFB800);
        font-family: "Roboto", sans-serif;
        letter-spacing: 0.3px;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Auto-Inject HTML Widget at Webpage Bottom (if not already present)
  function injectCounterHTML() {
    // Check if bottom container already exists to avoid duplicates
    if (!document.querySelector(".auto-footer-views-container")) {
      const footerWidget = document.createElement("div");
      footerWidget.className = "auto-footer-views-container";
      footerWidget.innerHTML = `
        <span class="views-label">Total Website Views:</span>
        <span class="views-number config-page-views-count">Loading...</span>
      `;
      
      const cardElement = document.querySelector(".card");
      if (cardElement) {
        cardElement.appendChild(footerWidget);
      } else {
        document.body.appendChild(footerWidget);
      }
    }

    // Return ALL counter elements on the page (both top header & bottom injected ones)
    return document.querySelectorAll("#page-views-count, .config-page-views-count");
  }

  // 3. Increment & Fetch Global Count with correct V2 property path
  function fetchAndRenderViews(targets) {
    fetch(
      "https://api.counterapi.dev/v2/mob-extra-site-views/vile-tempest-site-views/up",
    )
      .then((res) => {
        if (!res.ok) throw new Error("API response not OK");
        return res.json();
      })
      .then((data) => {
        // Target up_count inside the nested data object correctly
        const count = data.data?.up_count ?? data.up_count ?? data.count;

        if (typeof count === "number") {
          const totalViews = BASE_OFFSET + count;
          targets.forEach((el) => {
            el.textContent = totalViews.toLocaleString(); // Updates both top and bottom instances
          });
        } else {
          throw new Error("Invalid count response");
        }
      })
      .catch((err) => {
        console.warn("View counter fallback active:", err);
        targets.forEach((el) => {
          el.textContent = BASE_OFFSET.toLocaleString();
        });
      });
  }

  // Execute after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectCounterStyles();
      const targets = injectCounterHTML();
      fetchAndRenderViews(targets);
    });
  } else {
    injectCounterStyles();
    const targets = injectCounterHTML();
    fetchAndRenderViews(targets);
  }
})();
