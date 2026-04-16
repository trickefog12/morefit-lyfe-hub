// Service worker registration disabled.
// Previously cached app shells could pin users to broken/stale builds,
// preventing the site from loading. The /service-worker.js file now acts
// as a kill-switch that unregisters itself and clears caches.
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Make sure any previously installed worker is removed.
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((reg) => reg.unregister().catch(() => {}));
    }).catch(() => {});

    // Clear caches left over from older versions.
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key).catch(() => {}));
      }).catch(() => {});
    }
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((reg) => reg.unregister().catch(() => {}));
    }).catch(() => {});
  }
}
