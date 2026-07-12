function loadLinks() {
    const container = document.getElementById("linksContainer");
    const lastUpdated = document.getElementById("lastUpdated");

    try {
        // Check if the data has been loaded
        if (typeof testServerData === "undefined") {
            throw new Error("Data not loaded");
        }

        lastUpdated.innerHTML = `
        <i class="fa-solid fa-rocket"></i>
        Last Updated: <strong>${testServerData.lastUpdated}</strong>`;

        if (testServerData.status === 1) {
            container.innerHTML = "";

            testServerData.links.forEach((link, index) => {
                container.innerHTML += `
                    <div class="link-box">

                        <div class="link-title">
                            ${link.device}
                        </div>

                        <div class="link" id="link${index}">
                            ${link.url}
                        </div>

                        <button onclick="copyLink('link${index}', this)">
                             <i class="fa-regular fa-copy"></i>
                             Copy Link
                        </button>

                    </div>
                `;
            });

            showVerification();
        } else {
            container.innerHTML = `
                <div class="server-closed">

                    <h2><i class="fa-solid fa-circle-exclamation"></i> Test Server is Closed</h2>

                    <p>
                        The Call of Duty: Mobile Test Server is currently unavailable.
                    </p>

                    <p>
                        Stay tuned for future updates from the official developers.
                    </p>

                </div>
            `;
        }
    } catch (error) {
        lastUpdated.innerHTML = `<i class="fa-solid fa-rocket"></i> Last Updated: <strong>Unavailable</strong>`;

        container.innerHTML = `
            <div class="load-error">

                <h2><i class="fa-solid fa-triangle-exclamation"></i> Unable to Load Download Links</h2>

                <p>
                    The download link data could not be loaded at this time.
                </p>

                <p>
                    Please refresh the page and try again. If the issue persists,
                    the download link data may be temporarily unavailable.
                </p>

            </div>
        `;

        console.error(error);
    }
}

function copyLink(id, button) {
    const text = document.getElementById(id).innerText.trim();

    navigator.clipboard
        .writeText(text)
        .then(() => {
            const original = button.innerHTML;

            button.innerHTML = `
            <i class="fa-solid fa-copy"></i>
            Copied!`;

            setTimeout(() => {
                button.innerHTML = original;
            }, 1500);
        })
        .catch(() => {
            alert("Unable to copy the link.");
        });
}

function showVerification() {
    if (typeof notARobot === "undefined") {
        return;
    }

    // Button link
    document.getElementById("videoSource").href = notARobot.source;

    // Embedded YouTube video
    const iframe = document.getElementById("videoEmbed");

    if (iframe) {
        let embedUrl = notARobot.source;

        // Convert youtu.be links
        if (embedUrl.includes("youtu.be/")) {
            const id = embedUrl.split("youtu.be/")[1].split("?")[0];

            embedUrl = "https://www.youtube.com/embed/" + id;
        }

        // Convert watch?v= links
        else if (embedUrl.includes("watch?v=")) {
            const id = embedUrl.split("watch?v=")[1].split("&")[0];

            embedUrl = "https://www.youtube.com/embed/" + id;
        }

        iframe.src = embedUrl;
    }

    document.getElementById("verifyOverlay").style.display = "flex";
}

function unlockLinks() {
    const code = document.getElementById("verifyCode").value.trim();

    if (code === "") {
        alert("Please enter the verification code.");

        return;
    }

    if (code !== notARobot.code) {
        alert("Incorrect verification code.");

        return;
    }

    document.getElementById("verifyOverlay").style.display = "none";
}

function waitForData() {
    const container = document.getElementById("linksContainer");

    let dots = 1;

    container.innerHTML = `
    <div class="loading-box">
        <div class="loader"></div>
        <p id="loadingText">Loading official download links.</p>
    </div>`;

    const loadingText = document.getElementById("loadingText");

    const loadingAnimation = setInterval(() => {
        loadingText.textContent = "Loading official download links" + ".".repeat(dots);

        dots++;

        if (dots > 3) {
            dots = 1;
        }
    }, 300);

    const startTime = Date.now();

    const checkData = setInterval(() => {
        if (typeof testServerData !== "undefined" && typeof notARobot !== "undefined") {
            clearInterval(checkData);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1000 - elapsed);

            setTimeout(() => {
                clearInterval(loadingAnimation);

                loadLinks();
            }, remaining);
        }
    }, 100);

    setTimeout(() => {
        if (typeof testServerData === "undefined" || typeof notARobot === "undefined") {
            clearInterval(checkData);
            clearInterval(loadingAnimation);

            loadLinks();
        }
    }, 3000);
}

function loadFeaturedVideos() {

    const section =
        document.getElementById("featuredVideosSection");

    if (
        typeof featuredVideos === "undefined" ||
        featuredVideos.length === 0
    ) {

        section.innerHTML = "";

        return;

    }

    let html = `
        <div class="featured-videos">

            <h2>Featured Videos</h2>

    `;

    featuredVideos.forEach((video) => {

    const match =
        video.url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);

    if (!match) return;

    const id = match[1];

    html += `
        <div class="video-card">

            <div class="video-title">
                ${video.title}
            </div>

            <div class="video-container">

                <iframe
                    src="https://www.youtube.com/embed/${id}"
                    allowfullscreen>
                </iframe>

            </div>

        </div>
    `;

    });

    html += `</div>`;

    section.innerHTML = html;

}

window.addEventListener("load", () => {

    waitForData();

    loadFeaturedVideos();

    document
        .getElementById("unlockButton")
        .addEventListener("click", unlockLinks);

    document
        .getElementById("verifyCode")
        .addEventListener("keydown", function(e){

            if(e.key === "Enter"){

                unlockLinks();

            }

        });

});