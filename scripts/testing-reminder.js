/**
 * Testing Environment Fixed Top Reminder (Universal Staging Version)
 * Forces a tiny, ultra-thin single-line warning bar at the absolute top of the screen.
 */
(function() {
    // 🌟 CONFIGURATION: Change this URL to your main/live site for each project!
    const MAIN_SITE_URL = "https://mob-extra.github.io/CODM.TestServer.DL.Link/"; 

    function injectBanner() {
        if (document.getElementById("testing-site-banner")) return;

        const reminder = document.createElement("div");
        reminder.id = "testing-site-banner";

        // 🌟 Ultra-thin styles (Minimal padding, no wrapping, reduced heights)
        reminder.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background-color: #1c1400 !important;
            border-bottom: 1px solid #e0a905 !important;
            color: #eaeaea !important;
            padding: 2px 8px !important; /* Shrunk padding to absolute minimum */
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 9.5px !important;  /* Tiny elegant font */
            line-height: 1.2 !important;
            font-weight: 500 !important;
            z-index: 2147483647 !important;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 20px !important; /* Locks the height to be extremely small */
        `;

        // 🌟 Modified layout: strict 'nowrap' ensures it never breaks to 2 lines
        reminder.innerHTML = `
            <div style="max-width: 800px; width: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; margin: 0 auto !important; flex-wrap: nowrap !important;">
                <div style="display: flex !important; align-items: center !important; gap: 4px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important;">
                    <span id="warning-pulse-icon" style="color: #e0a905 !important; font-size: 10px !important; display: inline-flex !important; align-items: center !important;">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </span>
                    <span style="letter-spacing: 0.1px !important; white-space: nowrap !important;">
                        <strong>PREVIEW HUB:</strong> Staging site (updates may contain bugs).  Visit
                    </span>
                </div>
                <a id="testing-site-main-btn" href="${MAIN_SITE_URL}" target="_blank" style="
                    background-color: #e0a905 !important;
                    color: #111 !important;
                    text-decoration: none !important;
                    padding: 1px 5px !important;
                    border-radius: 2px !important;
                    font-weight: 700 !important;
                    font-size: 8px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.2px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 2px !important;
                    transition: all 0.2s ease !important;
                    white-space: nowrap !important;
                    height: 14px !important;
                    box-sizing: border-box !important;
                ">
                    Live Site <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 7px !important;"></i>
                </a>
            </div>
        `;

        // Inject the CSS animations & button hover effects
        if (!document.getElementById("banner-pulse-style")) {
            const animationStyle = document.createElement("style");
            animationStyle.id = "banner-pulse-style";
            animationStyle.innerHTML = `
                #warning-pulse-icon {
                    animation: warnPulse 1.8s infinite ease-in-out !important;
                }
                @keyframes warnPulse {
                    0% { opacity: 0.4; transform: scale(0.95); }
                    50% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0.4; transform: scale(0.95); }
                }
                #testing-site-main-btn:hover {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5) !important;
                }
            `;
            document.head.appendChild(animationStyle);
        }

        document.documentElement.appendChild(reminder);

        // Dynamically shift layout downward just enough for the new smaller height (exactly 20px)
        document.documentElement.style.setProperty('padding-top', '20px', 'important');
    }

    if (document.readyState === "interactive" || document.readyState === "complete") {
        injectBanner();
    } else {
        document.addEventListener("DOMContentLoaded", injectBanner);
    }
})();
