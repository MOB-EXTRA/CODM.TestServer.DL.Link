/**
 * ==========================================
 * CENTRALIZED DATA LOADER & PTB HUB CONTROLLER
 * ==========================================
 */

// Global tracking variables
let featuredPlayers = []; 

// 1. SINGLE Global entry point for the YouTube Iframe API
window.onYouTubeIframeAPIReady = function() {
    initFeaturedPlayers();
};

// Dynamically load the official YouTube Iframe API script
(function() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

/**
 * Sequential Fallback Data Loader for Shared Config (GitHub Pages)
 * Uses fetch() and function-scoped evaluation to prevent 'const' redeclaration errors.
 */
async function loadSharedConfigWithFallback() {
    const repoConfigs = [
        { url: "https://mob-extra.github.io/MOBEXTRA.github.shared-data-repo.1/codm-test-server/codm-config.js", name: "Repository 1" },
        { url: "https://mob-extra.github.io/MOBEXTRA.github.shared-data-repo.2/codm-test-server/codm-config.js", name: "Repository 2" },
        { url: "https://mob-extra.github.io/MOBEXTRA.github.shared-data-repo.3/codm-test-server/codm-config.js", name: "Repository 3" }
    ];

    let currentIndex = 0;
    const repoSourceLabel = document.getElementById("currentRepoLabel");

    async function attemptLoad() {
        if (currentIndex >= repoConfigs.length) {
            console.error("Critical Error: All repositories failed.");
            if (repoSourceLabel) {
                repoSourceLabel.innerHTML = `<span style="color: var(--danger);">All sources failed! Please <a href="https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ" target="_blank" rel="noopener noreferrer" style="color: var(--gold); text-decoration: underline;">contact the site admin via YouTube</a>.</span>`;
            }
            waitForData(); // Proceed to handle the failure state visually
            return;
        }

        const currentRepo = repoConfigs[currentIndex];

        try {
            const response = await fetch(currentRepo.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const scriptText = await response.text();

            // Safely evaluate the config script in a isolated scope and assign to window
            // This prevents "Identifier has already been declared" errors during retries/fallbacks
            const evaluateConfig = new Function(`
                ${scriptText}
                if (typeof testServerData !== 'undefined') window.testServerData = testServerData;
                if (typeof notARobot !== 'undefined') window.notARobot = notARobot;
            `);
            
            evaluateConfig();

            if (typeof window.testServerData !== "undefined") {
                console.log(`Config successfully loaded from ${currentRepo.name}`);
                if (repoSourceLabel) {
                    repoSourceLabel.innerHTML = `
                        <span>${currentRepo.name}</span>
                        <span class="sync-badge">Synchronized</span>
                    `;
                }
                waitForData();
            } else {
                throw new Error("Configuration loaded but data objects were not found.");
            }

        } catch (error) {
            console.warn(`Repository #${currentIndex + 1} (${currentRepo.name}) failed. Switching to next repository...`, error);
            currentIndex++;
            attemptLoad(); // Automatically falls back to the next repository
        }
    }

    attemptLoad();
}

/**
 * Helper function to manage selection locking.
 */
function setSelectionLock(lock) {
    if (lock) {
        document.body.classList.add("page-locked");
    } else {
        document.body.classList.remove("page-locked");
    }
}

// Prevent context menus and text selection globally when locked
document.addEventListener('contextmenu', (e) => {
    if (document.body.classList.contains('page-locked') && !e.target.closest('#verifySection')) {
        e.preventDefault();
    }
});

document.addEventListener('selectstart', (e) => {
    if (document.body.classList.contains('page-locked') && !e.target.closest('#verifySection')) {
        e.preventDefault();
    }
});

document.addEventListener('copy', (e) => {
    if (document.body.classList.contains('page-locked')) {
        e.preventDefault();
    }
});

/**
 * Compares DOM elements with window.testServerData and updates them dynamically.
 */
function loadLinks() {
    const lastUpdated = document.getElementById("lastUpdated");
    const badgeContainer = document.getElementById("buildBadgeContainer");
    const serverClosedSection = document.getElementById("serverClosedSection");

    const data = window.testServerData;

    try {
        if (typeof data === "undefined") {
            throw new Error("Data not loaded");
        }

        let statusBadge = "";
        if (data.status === 1) {
            statusBadge = `<span class="lu-status-badge"><i class="fa-solid fa-wifi fa-beat-fade"></i> Live</span>`;
        } else if (data.status === 0) {
            statusBadge = `<span class="lu-status-badge offline"><i class="fa-solid fa-triangle-exclamation fa-beat-fade"></i> Closed</span>`;
        } else {
            statusBadge = `<span class="lu-status-badge unknown">Unknown</span>`;
        }
        
        lastUpdated.innerHTML = `
            ${statusBadge} Last Updated: <strong>${data.lastUpdated}</strong>
        `;

        if (badgeContainer) {
            badgeContainer.innerHTML = `
                <div class="build-info-wrapper">
                    <div class="build-meta-row">
                        <span class="badge-season">${data.season}</span>
                        <span class="badge-date"><i class="fa-regular fa-calendar"></i> ${data.releaseDate}</span>
                    </div>
                    <p class="build-desc">${data.updateDescription}</p>
                </div>
            `;
        }

        data.links.forEach((link, index) => {
            const deviceEl = document.getElementById(`device-${index}`);
            const iconEl = document.getElementById(`icon-${index}`);
            const urlEl = document.getElementById(`url-${index}`);
            const anchorEl = document.getElementById(`anchor-${index}`);
            
            if (deviceEl && urlEl && anchorEl) {
                const currentUrl = urlEl.innerText.trim();
                const expectedUrl = link.url.trim();
                
                let faIcon = '<i class="fa-brands fa-android"></i>';
                let imgFile = 'codm-ts-logo-A.png';
                
                if (link.device.toLowerCase().includes('ios')) {
                    faIcon = '<i class="fa-brands fa-apple"></i>';
                    imgFile = 'codm-ts-logo-ios.png';
                } else if (link.device.includes('32-bit')) {
                    imgFile = 'codm-ts-logo-A.png';
                } else if (link.device.includes('64-bit')) {
                    imgFile = 'codm-ts-logo-A.png';
                }

                if (currentUrl !== expectedUrl || (iconEl && !iconEl.src.includes(imgFile))) {
                    urlEl.innerText = link.url;
                    anchorEl.href = link.url;
                    if (iconEl) iconEl.src = `assets/images/${imgFile}`;
                    deviceEl.innerHTML = `${faIcon} ${link.device}`;
                }
                
                const linkBox = deviceEl.closest('.link-box');
                if (linkBox) {
                    const titleEl = linkBox.querySelector('.link-title');
                    const linkStatus = (link.status !== undefined) ? link.status : data.status;
                    let badgeHtml = "";
                    
                    if (linkStatus === 1) {
                        badgeHtml = `<span class="lu-status-badge"><i class="fa-solid fa-wifi fa-beat-fade"></i> TEST SERVER LIVE</span>`;
                    } else if (linkStatus === 0) {
                        badgeHtml = `<span class="lu-status-badge offline"><i class="fa-solid fa-triangle-exclamation fa-beat-fade"></i> TEST SERVER CLOSED</span>`;
                    } else {
                        badgeHtml = `<span class="lu-status-badge unknown">Unknown</span>`;
                    }
                    
                    let existingBadge = titleEl.querySelector('.lu-status-badge');
                    if (existingBadge) {
                        existingBadge.outerHTML = badgeHtml;
                    } else {
                        titleEl.insertAdjacentHTML('beforeend', badgeHtml);
                    }
                }
            }
        });

        if (data.status === 1) {
            if (serverClosedSection) serverClosedSection.style.display = "none";
            injectVerificationSection();
            setTimeout(() => { showVerification(); }, 1000);
        } else {
            if (serverClosedSection) serverClosedSection.style.display = "block";
            const linksContainer = document.getElementById("linksContainer");
            if (linksContainer) {
                linksContainer.classList.add("links-locked");
                linksContainer.classList.remove("links-unlocked");
            }
        }
    } catch (error) {
        lastUpdated.innerHTML = `<i class="fa-solid fa-rocket"></i> Last Updated: <strong>Unavailable</strong>`;
        console.error(error);
    }
}

function forceShowLinks() {
    const serverClosedSection = document.getElementById("serverClosedSection");
    const data = window.testServerData;
    if (typeof data === "undefined" || !data.links) return;

    if (serverClosedSection) {
        serverClosedSection.style.display = "none";
    }

    injectVerificationSection();
    showVerification(); 

    const verifySection = document.getElementById("verifySection");
    if (verifySection) {
        verifySection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function copyLink(id, button) {
    const text = document.getElementById(id).innerText.trim();

    navigator.clipboard.writeText(text)
        .then(() => {
            const original = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-copy"></i> Copied!`;
            setTimeout(() => { button.innerHTML = original; }, 1500);
        })
        .catch(() => { alert("Unable to copy the link."); });
}

function injectVerificationSection() {
    if (document.getElementById("verifySection")) return;

    const verifyHTML = `
        <div id="verifySection" class="verify-section" style="display: none;">
          <div class="verify-box">
            <h2>Verification Required</h2>
            <p class="verify-text">
              To keep this redirection hub stable and secure from automated scripts, please verify your session using the latest access code provided in the video below.
            </p> 
              
            <input type="text" id="verifyCode" placeholder="Enter verification code" />
            
            <a id="videoSource" target="_blank" rel="noopener noreferrer">
              <i class="fa-regular fa-circle-play"></i> Watch Video to Retrieve Code
            </a>
            
            <div class="disclaimer-checkbox-container">
              <label class="custom-checkbox-label">
                <input type="checkbox" id="disclaimerCheckbox" />
                <span class="checkbox-box"></span>
                <span class="checkbox-text">
                  I acknowledge that <strong>MOB EXTRA</strong> acts as an independent portal for official developer links. I agree that <strong>MOB EXTRA</strong> does not host these packages and is not responsible for their content. I proceed at my own risk and discretion.
                </span>
              </label>
            </div>
            
            <button id="unlockButton" class="btn-locked" disabled><i class="fa-solid fa-lock"></i> Verify & Access Downloads</button>
          </div>
        </div>
    `;

    const linksSectionWrapper = document.querySelector(".links-section-wrapper");
    if (linksSectionWrapper) {
        linksSectionWrapper.insertAdjacentHTML('afterend', verifyHTML);
    }

    const unlockBtn = document.getElementById("unlockButton");
    if (unlockBtn) unlockBtn.addEventListener("click", unlockLinks);
    
    const verifyCodeInput = document.getElementById("verifyCode");
    if (verifyCodeInput) {
        verifyCodeInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") unlockLinks();
        });
    }

    const disclaimerBox = document.getElementById("disclaimerCheckbox");
    if (disclaimerBox) disclaimerBox.addEventListener("change", updateButtonStatus);
}

function showVerification() {
    if (typeof window.notARobot === "undefined") return;

    const videoSource = document.getElementById("videoSource");
    const verifySection = document.getElementById("verifySection");

    if (videoSource) videoSource.href = window.notARobot.codeSource;
    if (verifySection) verifySection.style.display = "flex";
    
    const linksContainer = document.getElementById("linksContainer");
    if (linksContainer) {
        linksContainer.classList.add("links-locked");
        linksContainer.classList.remove("links-unlocked");
    }
    
    setSelectionLock(true);
    
    const checkbox = document.getElementById("disclaimerCheckbox");
    if (checkbox) checkbox.checked = false;
    
    updateButtonStatus();
}

function updateButtonStatus() {
    const unlockBtn = document.getElementById("unlockButton");
    const checkbox = document.getElementById("disclaimerCheckbox");
    if (!unlockBtn) return;

    if (checkbox && checkbox.checked) {
        unlockBtn.classList.remove("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Verify & Access Downloads`;
        unlockBtn.disabled = false;
    } else {
        unlockBtn.classList.add("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Accept Disclaimer Above`;
        unlockBtn.disabled = true;
    }
}

function unlockLinks() {
    const checkbox = document.getElementById("disclaimerCheckbox");
    const codeInput = document.getElementById("verifyCode");
    const notARobotData = window.notARobot;

    if (checkbox && !checkbox.checked) {
        alert("You must acknowledge and accept the disclaimer to access the downloads.");
        return;
    }

    if (!codeInput || codeInput.value.trim() === "") {
        alert("Please enter the verification code.");
        return;
    }

    if (codeInput.value.trim() !== notARobotData.code) {
        alert("Incorrect verification code.");
        return;
    }

    const verifySection = document.getElementById("verifySection");
    if (verifySection) verifySection.style.display = "none";

    const linksContainer = document.getElementById("linksContainer");
    if (linksContainer) {
        linksContainer.classList.remove("links-locked");
        linksContainer.classList.add("links-unlocked");
        linksContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setSelectionLock(false);
}

function setLoaderState(state) {
    const loaders = document.querySelectorAll(".progress-loader");
    const loadingBox = document.querySelector(".hero-banner-wrapper .loading-box");
    const badgeContainer = document.getElementById('buildBadgeContainer');
    
    if (state === 'start') {
        loaders.forEach(loader => loader.classList.add("active"));
        if (loadingBox) loadingBox.classList.remove("hidden");
        if (badgeContainer) badgeContainer.classList.remove('visible');
    } else if (state === 'finish') {
        loaders.forEach(loader => {
            loader.classList.remove("active");
            loader.classList.add("finished");
        });
        if (loadingBox) loadingBox.classList.add("hidden");
        setTimeout(() => {
            if (badgeContainer) badgeContainer.classList.add('visible');
        }, 50); 
    }
}

function animateTextSequence(elementId, messages, duration) {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const intervalTime = duration / messages.length;
    let index = 0;
    element.innerHTML = messages[0];

    const timer = setInterval(() => {
        index++;
        if (index < messages.length) {
            element.innerHTML = messages[index];
        } else {
            clearInterval(timer);
        }
    }, intervalTime);

    return timer;
}

function waitForData() {
    const FAKE_DELAY = 5000;
    
    const statusMessages = [
        "Connecting to repository network...",
        "Checking primary & backup nodes...",
        "Syncing shared configuration manifest...",
        "Finalizing live server status..."
    ];
    
    const linkMessages = [
        `<i class="fa-solid fa-network-wired"></i> Accessing repository network...`,
        `<i class="fa-solid fa-cloud-arrow-down"></i> Fetching configuration data...`,
        `<i class="fa-solid fa-server"></i> Synchronizing build versions...`,
        `<i class="fa-regular fa-circle-check"></i> Manifest payload validated.`,
        `<i class="fa-solid fa-magnifying-glass"></i> Processing download packages...`,
        `<i class="fa-regular fa-circle-check"></i> Android & iOS links cached.`,
        `<i class="fa-solid fa-shield-halved"></i> Setting up verification guard...`,
        `<i class="fa-solid fa-code"></i> Finalizing deployment interface...`
    ];
    
    setLoaderState('start');

    const statusTimer = animateTextSequence('statusMsg', statusMessages, FAKE_DELAY);
    const linksTimer = animateTextSequence('loadingText', linkMessages, FAKE_DELAY);

    const startTime = Date.now();

    const checkData = setInterval(() => {
        if (typeof window.testServerData !== "undefined" && typeof window.notARobot !== "undefined") {
            clearInterval(checkData);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, FAKE_DELAY - elapsed);

            setTimeout(() => {
                clearInterval(statusTimer);
                clearInterval(linksTimer);
                setLoaderState('finish');
                loadLinks();
            }, remaining);
        }
    }, 100);

    setTimeout(() => {
        setLoaderState('finish');
        clearInterval(checkData);
        clearInterval(statusTimer);
        clearInterval(linksTimer);
        loadLinks();
    }, FAKE_DELAY + 500);
}

function loadFeaturedVideos() {
    const section = document.getElementById("featuredVideosSection");

    if (typeof featuredVideos === "undefined" || featuredVideos.length === 0) {
        if(section) section.innerHTML = "";
        return;
    }

    let html = `
        <div class="featured-videos">
            <h2 class="section-title">Featured Content</h2>
    `;

    featuredVideos.forEach((video, index) => {
        const match = video.url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
        if (!match) return;

        const id = match[1];

        html += `
            <div class="video-card">
                <div class="video-title">${video.title}</div>
                <div class="video-container">
                    <div id="featuredPlayer_${index}" data-video-id="${id}"></div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    section.innerHTML = html;

    if (window.YT && window.YT.Player) {
        initFeaturedPlayers();
    }
}

function loadChannels() {
    const logoGroup = document.getElementById("logoGroup");
    if (logoGroup && typeof channelData !== "undefined") {
        logoGroup.innerHTML = channelData.map(channel => `
            <a href="${channel.url}" target="_blank" rel="noopener noreferrer" title="${channel.name}">
                <img src="${channel.logo}" alt="${channel.name} Logo" class="yt-channels-logo" />
            </a>
        `).join("");
    }
}

function initFeaturedPlayers() {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') return; 
    if (typeof featuredVideos === "undefined") return;
    if (featuredPlayers.length > 0) return;

    featuredVideos.forEach((video, index) => {
        const elementId = `featuredPlayer_${index}`;
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        const videoId = targetElement.getAttribute('data-video-id');

        const player = new YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'autoplay': 0,
                'rel': 0,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': function(e) {
                    const iframe = document.getElementById(elementId);
                    if (iframe) {
                        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    }
                }
            }
        });
        
        featuredPlayers.push(player);
    });
}

// Automatically trigger data fallback loading and UI components when DOM loads
window.addEventListener("DOMContentLoaded", () => {
    loadSharedConfigWithFallback();
    loadFeaturedVideos();
    loadChannels();

    const unlockBtn = document.getElementById("unlockButton");
    if (unlockBtn) {
        unlockBtn.addEventListener("click", unlockLinks);
    }
    
    const verifyCodeInput = document.getElementById("verifyCode");
    if (verifyCodeInput) {
        verifyCodeInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                unlockLinks();
            }
        });
    }

    const disclaimerBox = document.getElementById("disclaimerCheckbox");
    if (disclaimerBox) {
        disclaimerBox.addEventListener("change", updateButtonStatus);
    }

    const toggleBtn = document.getElementById("toggleIntroBtn");
    const drawer = document.getElementById("introContentDrawer");

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener("click", () => {
            drawer.classList.toggle("expanded");
            toggleBtn.classList.toggle("active");

            const label = toggleBtn.querySelector("span");
            if (drawer.classList.contains("expanded")) {
                label.textContent = "Show Less";
            } else {
                label.textContent = "Read More";
            }
        });
    }
    
    const shareBtn = document.getElementById("shareSiteBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            let shareTitle = 'CODM Test Server Download Links | MOB EXTRA';
            let shareText = 'Get instant access to the latest official Call of Duty: Mobile Test Server download links!\n\n';
    
            const data = window.testServerData;
            if (typeof data !== "undefined") {
                shareTitle = `CODM Test Server - ${data.season} Hub | MOB EXTRA`;
                shareText = `COD Mobile Public Test Build Download\n\n` +
                            `Season: ${data.season}\n` +
                            `Release Date: ${data.releaseDate}\n` +
                            `Platforms: Android (APK 32/64-Bit) & iOS (TestFlight)\n` +
                            `Update Info: ${data.updateDescription}\n\n` +
                            `Get download links here: `;
            }

            const shareData = {
                title: shareTitle,
                text: shareText,
                url: window.location.href
            };
    
            if (navigator.share) {
                navigator.share(shareData)
                    .catch((err) => console.log('Error sharing:', err));
            } else {
                navigator.clipboard.writeText(`${shareText}${window.location.href}`)
                    .then(() => {
                        const originalText = shareBtn.innerHTML;
                        shareBtn.innerHTML = `<i class="fa-solid fa-check"></i> Link Copied!`;
                        setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                    })
                    .catch(() => {
                        alert("Could not copy link automatically. Please copy the URL from your address bar!");
                    });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});
