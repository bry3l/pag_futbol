(() => {
  const STORAGE_PREFIX = 'cr7-observabilidad:';
  const EVENTS_KEY = `${STORAGE_PREFIX}eventos`;
  const META_KEY = `${STORAGE_PREFIX}meta`;
  const startedAt = Date.now();
  let memoryEvents = [];
  let memoryMeta = {};

  function readJson(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function getEvents() {
    const stored = readJson(EVENTS_KEY, null);
    return Array.isArray(stored) ? stored : memoryEvents;
  }

  function getMeta() {
    const stored = readJson(META_KEY, null);
    return stored && typeof stored === 'object' ? stored : memoryMeta;
  }

  function saveMeta(meta) {
    memoryMeta = { ...getMeta(), ...meta };
    writeJson(META_KEY, memoryMeta);
  }

  function record(type, data = {}) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      timestamp: new Date().toISOString(),
      page: window.location.pathname || 'desconocida',
      data
    };
    const events = [...getEvents(), event].slice(-500);
    memoryEvents = events;
    writeJson(EVENTS_KEY, events);
    return event;
  }

  function supports(name) {
    return name in window;
  }

  function getConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return { supported: false };
    return {
      supported: true,
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink ?? null,
      rtt: connection.rtt ?? null,
      saveData: connection.saveData ?? null
    };
  }

  function getCapabilities() {
    return {
      performance: supports('performance'),
      performanceObserver: supports('PerformanceObserver'),
      localStorage: (() => {
        try {
          const testKey = `${STORAGE_PREFIX}test`;
          window.localStorage.setItem(testKey, '1');
          window.localStorage.removeItem(testKey);
          return true;
        } catch {
          return false;
        }
      })(),
      visibility: typeof document.visibilityState === 'string',
      online: typeof navigator.onLine === 'boolean',
      connection: Boolean(navigator.connection || navigator.mozConnection || navigator.webkitConnection)
    };
  }

  function getNavigation() {
    if (!window.performance) return { supported: false };
    const entry = performance.getEntriesByType?.('navigation')?.[0];
    if (entry) {
      return {
        supported: true,
        type: entry.type,
        startTime: entry.startTime,
        domInteractive: entry.domInteractive,
        domContentLoaded: entry.domContentLoadedEventEnd,
        loadEvent: entry.loadEventEnd,
        duration: entry.duration
      };
    }
    return {
      supported: true,
      timing: performance.timing ? {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd
      } : null
    };
  }

  function getSnapshot() {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      navigation: getNavigation(),
      currentSession: { startedAt: new Date(startedAt).toISOString(), elapsedMs: Date.now() - startedAt },
      viewport: { width: window.innerWidth || null, height: window.innerHeight || null, devicePixelRatio: window.devicePixelRatio || 1 },
      online: typeof navigator.onLine === 'boolean' ? navigator.onLine : null,
      connection: getConnection(),
      capabilities: getCapabilities(),
      meta: getMeta(),
      events: getEvents()
    };
  }

  function instrument() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest?.('a, button, [role="button"], [role="tab"], input, select, textarea');
      if (!target) return;
      record('interaction', {
        element: target.tagName.toLowerCase(),
        role: target.getAttribute('role'),
        text: target.textContent.trim().slice(0, 120),
        href: target.getAttribute('href') || null,
        id: target.id || null
      });
    }, true);

    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window && event.target.tagName) {
        record('resource-error', { element: event.target.tagName.toLowerCase(), source: event.target.src || event.target.href || null });
        return;
      }
      record('javascript-error', { message: event.message, source: event.filename, line: event.lineno, column: event.colno });
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
      record('promise-rejection', { reason: String(event.reason?.message || event.reason || 'Razón desconocida') });
    });

    document.addEventListener('visibilitychange', () => {
      record('visibility', { state: document.visibilityState });
    });

    window.addEventListener('resize', () => {
      saveMeta({ lastViewport: { width: window.innerWidth, height: window.innerHeight } });
    }, { passive: true });

    window.addEventListener('online', () => record('network', { online: true }));
    window.addEventListener('offline', () => record('network', { online: false }));

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener?.('change', () => record('connection-change', getConnection()));
    saveMeta({ firstSeenAt: getMeta().firstSeenAt || new Date().toISOString(), capabilities: getCapabilities() });
    record('page-view', { referrer: document.referrer || null });
  }

  window.CR7Observability = {
    getSnapshot,
    record,
    clear: () => {
      memoryEvents = [];
      memoryMeta = {};
      try {
        window.localStorage.removeItem(EVENTS_KEY);
        window.localStorage.removeItem(META_KEY);
      } catch {
        // El dashboard seguirá funcionando en memoria si el almacenamiento está bloqueado.
      }
    },
    storagePrefix: STORAGE_PREFIX
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instrument, { once: true });
  } else {
    instrument();
  }
})();
