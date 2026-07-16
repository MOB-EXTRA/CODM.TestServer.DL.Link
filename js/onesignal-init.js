/*
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "4b75140a-e41f-40c1-8181-32ee5635f953",
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: "OneSignalSDKWorker.js",
    serviceWorkerParam: {
      scope: "/CODM.TestServer.DL.Link/"
    },
    notifyButton: {
      enable: true,
      showOnMobile: true,
      size: 'medium',
      theme: 'dark',
      position: 'bottom-right',
      text: {
        'tip.state.unsubscribed': 'Get Test Build Alerts',
        'tip.state.subscribed': "You're all set!",
        'dialog.main.title': 'Public Test Build Updates',
        'dialog.main.button.subscribe': 'NOTIFY ME',
        'dialog.main.button.unsubscribe': 'STOP ALERTS'
      }
    }
  });
}); */

window.OneSignalDeferred = window.OneSignalDeferred || [];

OneSignalDeferred.push(async function(OneSignal) {
  // 1. Initialize OneSignal first
  await OneSignal.init({
    appId: "4b75140a-e41f-40c1-8181-32ee5635f953",
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: "OneSignalSDKWorker.js",
    serviceWorkerParam: {
      scope: "/CODM.TestServer.DL.Link/"
    },
    notifyButton: {
      enable: true,
      showOnMobile: true,
      size: 'medium',
      theme: 'dark',
      position: 'bottom-right',
      text: {
        'tip.state.unsubscribed': 'Get Test Build Alerts',
        'tip.state.subscribed': "You're all set!",
        'dialog.main.title': 'Public Test Build Updates',
        'dialog.main.button.subscribe': 'NOTIFY ME',
        'dialog.main.button.unsubscribe': 'STOP ALERTS'
      }
    }
  });

  // 2. Check if user is already subscribed (Now we know it's accurate)
  const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
  if (isSubscribed) {
    localStorage.removeItem('mob_banner_last_dismissed');
    return; // Exit script, don't show banner
  }

  // 3. Check the 3-day cooldown logic
  const lastDismissed = localStorage.getItem('mob_banner_last_dismissed');
  if (lastDismissed) {
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const timePassed = Date.now() - parseInt(lastDismissed, 10);
    if (timePassed < threeDaysInMs) return;
  }

  // 4. Show Banner after delay
  setTimeout(() => {
    const banner = document.createElement('div');
    banner.id = 'mob-notification-banner';
    banner.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; background: #1a1a1a;
        color: #e0e0e0; padding: 16px; z-index: 99999; text-align: center;
        border-bottom: 2px solid #e6b91e; box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
    `;

    banner.innerHTML = `
        <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.4; color: #ffffff;">
            <strong>Want to receive an alert as soon as the new CODM Public Test Build is live?</strong> 
            <br>
            <span style="font-size: 13px; color: #b0b0b0;">Notifications are currently blocked by this app view. To get real-time updates, please open this site in your mobile browser (Chrome/Safari).</span>
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="mob-action-btn" style="background: #e6b91e; color: #000; border: none; padding: 10px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                Open in System Browser
            </button>
            <button id="mob-later-btn" style="background: transparent; color: #aaa; border: 1px solid #666; padding: 8px; font-size: 12px; border-radius: 4px; cursor: pointer;">
                Maybe later
            </button>
            <button id="mob-dismiss-btn" style="background: transparent; color: #666; border: none; padding: 4px; font-size: 11px; text-decoration: underline; cursor: pointer; margin-top: 5px;">
                No, thanks, I don't want to get notified
            </button>
        </div>
    `;

    document.body.prepend(banner);

    // Event Listeners
    document.getElementById('mob-dismiss-btn').addEventListener('click', function() {
        banner.remove();
        localStorage.setItem('mob_banner_last_dismissed', Date.now().toString());
    });

    document.getElementById('mob-later-btn').addEventListener('click', function() {
        banner.remove();
    });

    document.getElementById('mob-action-btn').addEventListener('click', function() {
        alert("Tip: Tap the three dots (⋮) in the top-right corner of your screen and select 'Open in Browser'.");
        banner.remove();
    });
  }, 8000);
});
