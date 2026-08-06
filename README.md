# 🚀 CODM Public Test Server Download Hub

A fast, mobile-friendly hub for Call of Duty: Mobile (CODM) players to access direct, high-speed download links for the official CODM Public Test Server (PTB) builds across both iOS (TestFlight) and Android (APK).

![CODM PTB Hub Banner](assets/images/favicon.png)

---

## ✨ Features

* **Direct iOS & Android Links:** Immediate access to TestFlight slots and direct APK downloads without ad-block walls or shorteners.
* **Region-Specific Downloads:** Organized download mirrors for Global, Garena, and localized PTB releases.
* **Server Status Updates:** Displays current test build status (Active vs. Ended) and operational timelines.
* **Installation & Setup Guides:** Clear instructions on how to install CODM test builds, overwrite cache issues, and manage storage requirements.
* **Fully Responsive Mobile Design:** Designed specifically for Android and iOS mobile browsers with zero clutter and high contrast.
* **Integrated CODM Tools:** Quick navigation to utility tools like **SlimeSpace** for invisible name generation.

---

## 🛠️ Built With

* **HTML5** — Modern, lightweight structure featuring OpenGraph social previews and meta tags.
* **CSS3** — Responsive layouts with mobile-first media queries and clean UI accents.
* **JavaScript (ES6)** — Fast client-side logic for dynamic link updating and interactive UI elements.

---

## 🌐 Live Site

Access the live download hub here:  
👉 **[CODM Public Test Server Hub](https://mob-extra.github.io/CODM.TestServer.DL.Link/)**

---

## ⚙️ Deployment & Repository Setup

This repository uses **GitHub Actions** to automatically build and host the live static pages directly on GitHub Pages upon pushing to the `main` branch.

### Local Updating via Termux

To push updates from your Android terminal:

```bash
# Navigate to the PTB Hub project directory
cd /storage/emulated/0/Download/VileTempest_CODmTestServerDLink

# Verify remote repository connection
git remote -v

# Stage, commit, and push updates
git add .
git commit -m "Update PTB download links and build status"
git push origin main
