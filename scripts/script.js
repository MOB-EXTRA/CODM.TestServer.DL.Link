// Global tracking variable for featured video players
let featuredPlayers = []; 

// 1. SINGLE Global entry point for the YouTube Iframe API
window.onYouTubeIframeAPIReady = function() {
    // Only initialize featured videos now
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
 * Helper function to generate the HTML string for all download links.
 * Prevents code duplication between active and forced states.
 */
function setSelectionLock(lock) {
    if (lock) {
        document.body.classList.add("page-locked");
    } else {
        document.body.classList.remove("page-locked");
    }
}

// Prevent context menus and text selection globally outside the verification box when locked
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

function renderLinksHtml() {
    if (typeof testServerData === "undefined" || !testServerData.links) return "";

    return testServerData.links.map((link, index) => {
        const linkStatus = (link.status !== undefined) ? link.status : testServerData.status;
        let statusBadge = "";
        
        if (linkStatus === 1) {
            statusBadge = `<span class="lu-status-badge">Live</span>`;
        } else if (linkStatus === 0) {
            statusBadge = `<span class="lu-status-badge offline">Closed</span>`;
        } else {
            statusBadge = `<span class="lu-status-badge unknown">Unknown</span>`;
        }

        return `
            <div class="link-box">
                <div class="link-title">
                  <span>${link.device}</span>
                  ${statusBadge}
                </div>
                <div class="link-row">
                    <img src="assets/images/${link.icon}" alt="App Icon" class="link-app-icon">
                    <div class="link" id="link${index}">${link.url}</div>
                </div>
                <div class="link-actions">
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="download-btn">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                    <button onclick="copyLink('link${index}', this)">
                         <i class="fa-regular fa-copy"></i> Copy Link
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Compares hardcoded DOM elements with testServerData.links 
 * and updates them if discrepancies are found, while injecting dynamic statuses.
 */
function loadLinks() {
    const lastUpdated = document.getElementById("lastUpdated");
    const badgeContainer = document.getElementById("buildBadgeContainer");
    const serverClosedSection = document.getElementById("serverClosedSection");

    try {
        if (typeof testServerData === "undefined") {
            throw new Error("Data not loaded");
        }

        // 1. Define Global Server Status Badge
        let statusBadge = "";
        if (testServerData.status === 1) {
            statusBadge = `<span class="lu-status-badge">Live</span>`;
        } else if (testServerData.status === 0) {
            statusBadge = `<span class="lu-status-badge offline">Closed</span>`;
        } else {
            statusBadge = `<span class="lu-status-badge unknown">Unknown</span>`;
        }
        
        // 2. Inject Last Updated metadata date and Status Badge
        lastUpdated.innerHTML = `
            ${statusBadge} Last Updated: <strong>${testServerData.lastUpdated}</strong>
        `;

        // 3. Inject Dynamic Season/Build Info
        if (badgeContainer) {
            badgeContainer.innerHTML = `
                <div class="build-info-wrapper">
                    <div class="build-meta-row">
                        <span class="badge-season">${testServerData.season}</span>
                        <span class="badge-date"><i class="fa-regular fa-calendar"></i> ${testServerData.releaseDate}</span>
                    </div>
                    <p class="build-desc">${testServerData.updateDescription}</p>
                </div>
            `;
        }

        // 4. Compare hardcoded HTML elements with links.js and update if data differs
        testServerData.links.forEach((link, index) => {
            const deviceEl = document.getElementById(`device-${index}`);
            const iconEl = document.getElementById(`icon-${index}`);
            const urlEl = document.getElementById(`url-${index}`);
            const anchorEl = document.getElementById(`anchor-${index}`);
            
            if (deviceEl && iconEl && urlEl && anchorEl) {
                const currentUrl = urlEl.innerText.trim();
                const expectedUrl = link.url.trim();
                
                // Compare and update if links.js contains newer/different data
                if (currentUrl !== expectedUrl || !iconEl.src.includes(link.icon)) {
                    urlEl.innerText = link.url;
                    anchorEl.href = link.url;
                    iconEl.src = `assets/images/${link.icon}`;
                    deviceEl.innerHTML = link.device;
                }
                
                // Dynamically update individual link status badges inside the card title
                const linkBox = deviceEl.closest('.link-box');
                if (linkBox) {
                    const titleEl = linkBox.querySelector('.link-title');
                    const linkStatus = (link.status !== undefined) ? link.status : testServerData.status;
                    let badgeHtml = "";
                    
                    if (linkStatus === 1) {
                        badgeHtml = `<span class="lu-status-badge">Live</span>`;
                    } else if (linkStatus === 0) {
                        badgeHtml = `<span class="lu-status-badge offline">Closed</span>`;
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

        // 5. Control Notification Section (Section 3) and Verification based on status
        if (testServerData.status === 1) {
            if (serverClosedSection) serverClosedSection.style.display = "none";
            
            injectVerificationSection();
            
            setTimeout(() => {
                showVerification(); 
            }, 1000);
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
    if (typeof testServerData === "undefined" || !testServerData.links) return;

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

    navigator.clipboard
        .writeText(text)
        .then(() => {
            const original = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-copy"></i> Copied!`;
            
            setTimeout(() => {
                button.innerHTML = original;
            }, 1500);
        })
        .catch(() => {
            alert("Unable to copy the link.");
        });
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
}

function showVerification() {
    if (typeof notARobot === "undefined") return;

    const videoSource = document.getElementById("videoSource");
    const verifySection = document.getElementById("verifySection");

    if (videoSource) videoSource.href = notARobot.codeSource;
    if (verifySection) verifySection.style.display = "flex";
    
    // Apply blur and locking to links container
    const linksContainer = document.getElementById("linksContainer");
    if (linksContainer) {
        linksContainer.classList.add("links-locked");
        linksContainer.classList.remove("links-unlocked");
    }
    
    setSelectionLock(true); // Lock text selection and highlighting across devices
    
    // Reset checkbox state upon display panel invocation
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
    const code = document.getElementById("verifyCode").value.trim();

    if (checkbox && !checkbox.checked) {
        alert("You must acknowledge and accept the disclaimer to access the downloads.");
        return;
    }

    if (code === "") {
        alert("Please enter the verification code.");
        return;
    }

    if (code !== notARobot.code) {
        alert("Incorrect verification code.");
        return;
    }

    // Hide verification section and unblur links container
    const verifySection = document.getElementById("verifySection");
    if (verifySection) verifySection.style.display = "none";

    const linksContainer = document.getElementById("linksContainer");
    if (linksContainer) {
        linksContainer.classList.remove("links-locked");
        linksContainer.classList.add("links-unlocked");
        
        // Auto-scroll to the links section smoothly upon successful verification
        linksContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setSelectionLock(false); // Re-enable normal text selection and copying once verified
}


/**
 * Manages the state of all progress loaders on the page.
 * @param {string} state - 'start' or 'finish'
 */
function setLoaderState(state) {
    const loaders = document.querySelectorAll(".progress-loader");
    const loadingBox = document.querySelector(".hero-banner-wrapper .loading-box");
    const badgeContainer = document.getElementById('buildBadgeContainer');
    
    if (state === 'start') {
        loaders.forEach(loader => loader.classList.add("active"));
        if (loadingBox) loadingBox.classList.remove("hidden"); // Show loading box
        if (badgeContainer) badgeContainer.classList.remove('visible');
    } else if (state === 'finish') {
        loaders.forEach(loader => {
            loader.classList.remove("active");
            loader.classList.add("finished");
        });
        
        // Hide the loading box completely once data is loaded
        if (loadingBox) loadingBox.classList.add("hidden");
        
        setTimeout(() => {
            if (badgeContainer) badgeContainer.classList.add('visible');
        }, 50); 
    }
}

/**
 * Animates text updates over a set duration.
 * @param {string} elementId - The ID of the span to update.
 * @param {Array} messages - The array of strings to cycle through.
 * @param {number} duration - Total time in ms.
 */
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
    const FAKE_DELAY = 5000; // adjustable delay
    
    const statusMessages = [
        "Initializing deployment node...",
        "Establishing secure connection...",
        "Authenticating server manifest...",
        "Syncing configuration protocols...",
        "Checking test server status..."
    ];
    
    const linkMessages = [
        `<i class="fa-solid fa-cloud-arrow-down"></i> Fetching latest build info...`,
        `<i class="fa-solid fa-server"></i> Getting version information...`,
        `<i class="fa-solid fa-magnifying-glass"></i> Syncing iOS TestFlight registry...`,
        `<i class="fa-regular fa-circle-check"></i> iOS registry validated.`,
        `<i class="fa-solid fa-magnifying-glass"></i> Syncing Android (32-bit) assets...`,
        `<i class="fa-regular fa-circle-check"></i> Android (32-bit) assets cached.`,
        `<i class="fa-solid fa-magnifying-glass"></i> Syncing Android (64-bit) assets...`,
        `<i class="fa-regular fa-circle-check"></i> Android (64-bit) assets cached.`,
        `<i class="fa-solid fa-shield-halved"></i> Checking test server status...`,
        `<i class="fa-solid fa-code"></i> Finalizing deployment interface...`
    ];
    
    setLoaderState('start');

    // Start both animations
    const statusTimer = animateTextSequence('statusMsg', statusMessages, FAKE_DELAY);
    const linksTimer = animateTextSequence('loadingText', linkMessages, FAKE_DELAY);

    const startTime = Date.now();

    // Check for data loop
    const checkData = setInterval(() => {
        if (typeof testServerData !== "undefined" && typeof notARobot !== "undefined") {
            clearInterval(checkData);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, FAKE_DELAY - elapsed);

            setTimeout(() => {
                // Clear both timers
                clearInterval(statusTimer);
                clearInterval(linksTimer);
                setLoaderState('finish');
                loadLinks();
            }, remaining);
        }
    }, 100);

    // Safety Fallback
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
        section.innerHTML = "";
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
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        return; 
    }
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

window.addEventListener("load", () => {
    waitForData();
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

            if (typeof testServerData !== "undefined") {
                shareTitle = `CODM Test Server - ${testServerData.season} Hub | MOB EXTRA`;
                shareText = `Get instant access to the latest ${testServerData.season} build (${testServerData.updateDescription})!\n\n`;
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
