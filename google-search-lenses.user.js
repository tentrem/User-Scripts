// ==UserScript==
// @name         Google Search Enhanced
// @version      1.0.0
// @description  Kagi-style search lenses with clean query bar - no site: operators visible
// @author       nganuvibe
// @match        https://www.google.com/search*
// @match        https://www.google.co.id/search*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ============================================
  // LENS CONFIGURATION
  // ============================================
  const LENSES = {
    all: { name: 'All', icon: '', sites: [] },
    forums: { name: 'Forums', icon: '💬', sites: ['reddit.com', 'stackoverflow.com', 'stackexchange.com', 'news.ycombinator.com', 'discourse.org'] },
    news: { name: 'News', icon: '📰', sites: ['reuters.com', 'apnews.com', 'bbc.com', 'cnn.com', 'theguardian.com', 'nytimes.com', 'bloomberg.com', 'techcrunch.com', 'theverge.com', 'arstechnica.com', 'wired.com', 'kompas.com', 'detik.com', 'tempo.co'] },
    academic: { name: 'Academic', icon: '🎓', sites: ['*.edu', 'scholar.google.com', 'arxiv.org', 'researchgate.net', 'academia.edu', 'sciencedirect.com', 'nature.com', 'ncbi.nlm.nih.gov'] },
    cybersecurity: { name: 'Security', icon: '🔐', sites: ['cve.mitre.org', 'nvd.nist.gov', 'attack.mitre.org', 'cisa.gov', 'exploit-db.com', 'bleepingcomputer.com', 'thehackernews.com', 'virustotal.com', 'any.run', 'shodan.io'] },
    programming: { name: 'Code', icon: '💻', sites: ['github.com', 'gitlab.com', 'stackoverflow.com', 'docs.python.org', 'developer.mozilla.org', 'devdocs.io', 'dev.to', 'npmjs.com'] },
    jobs: { name: 'Jobs', icon: '💼', sites: ['linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'jobstreet.com', 'kalibrr.com', 'glints.com', 'remoteok.com', 'weworkremotely.com'] },
    recipes: { name: 'Recipes', icon: '🍳', sites: ['allrecipes.com', 'epicurious.com', 'seriouseats.com', 'tasty.co', 'cookpad.com', 'food52.com'] },
    fediverse: { name: 'Fediverse', icon: '🐘', sites: ['mastodon.social', 'fosstodon.org', 'lemmy.world', 'lemmy.ml', 'kbin.social'] },
    archive: { name: 'Archive', icon: '📜', sites: ['web.archive.org', 'archive.org', 'archive.is', 'archive.ph'] }
  };

  const FILETYPES = {
    '': { name: 'Any', icon: '📁' },
    'pdf': { name: 'PDF', icon: '📕' },
    'doc': { name: 'Word', icon: '📘' },
    'xls': { name: 'Excel', icon: '📗' },
    'ppt': { name: 'PPT', icon: '📙' },
    'csv': { name: 'CSV', icon: '📊' },
    'json': { name: 'JSON', icon: '📋' },
    'py': { name: 'Python', icon: '🐍' },
    'js': { name: 'JS', icon: '📜' }
  };

  const REGIONS = {
    '': { name: 'Any Region', icon: '🌍' },
    'countryID': { name: 'Indonesia', icon: '🇮🇩' },
    'countryUS': { name: 'United States', icon: '🇺🇸' },
    'countryGB': { name: 'United Kingdom', icon: '🇬🇧' },
    'countrySG': { name: 'Singapore', icon: '🇸🇬' },
    'countryMY': { name: 'Malaysia', icon: '🇲🇾' },
    'countryAU': { name: 'Australia', icon: '🇦🇺' },
    'countryJP': { name: 'Japan', icon: '🇯🇵' },
    'countryDE': { name: 'Germany', icon: '🇩🇪' },
    'countryFR': { name: 'France', icon: '🇫🇷' },
    'countryCA': { name: 'Canada', icon: '🇨🇦' },
    'countryIN': { name: 'India', icon: '🇮🇳' },
    'countryKR': { name: 'South Korea', icon: '🇰🇷' },
    'countryNL': { name: 'Netherlands', icon: '🇳🇱' },
    'countryBR': { name: 'Brazil', icon: '🇧🇷' }
  };

  const DEFAULT_BLOCKED = ['pinterest.com', 'quora.com', 'w3schools.com'];
  const DEFAULT_BOOSTED = ['stackoverflow.com', 'github.com', 'developer.mozilla.org'];

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
    .gsl-wrapper { display: inline-flex; align-items: center; gap: 8px; margin-right: 12px; }
    .gsl-container { display: inline-flex; align-items: center; position: relative; }

    /* Kagi-style button - minimalist pill */
    .gsl-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 14px; color: #9aa0a6;
      background: #202124; border: 1px solid #3c4043;
      border-radius: 18px; cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px; white-space: nowrap; transition: all 0.15s;
    }
    .gsl-btn:hover { background: #303134; border-color: #5f6368; color: #e8eaed; }
    .gsl-btn.active {
      background: #303134; border-color: #5f6368; color: #e8eaed;
    }
    .gsl-btn .gsl-toggle {
      width: 10px; height: 10px; border-radius: 50%;
      background: #5f6368; transition: background 0.15s;
    }
    .gsl-btn.active .gsl-toggle { background: #a78bfa; }
    .gsl-btn .gsl-arrow { font-size: 10px; opacity: 0.6; margin-left: 2px; }

    /* Lens toggle - same style but with toggle indicator */
    .gsl-lens-toggle {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 14px; color: #9aa0a6;
      background: #202124; border: 1px solid #3c4043;
      border-radius: 18px; cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px; white-space: nowrap; transition: all 0.15s;
    }
    .gsl-lens-toggle:hover { background: #303134; border-color: #5f6368; color: #e8eaed; }
    .gsl-lens-toggle.active {
      background: #303134; border-color: #5f6368; color: #e8eaed;
    }
    .gsl-lens-toggle .gsl-toggle {
      width: 10px; height: 10px; border-radius: 50%;
      background: #5f6368; transition: background 0.15s;
    }
    .gsl-lens-toggle.active .gsl-toggle { background: #a78bfa; }

    .gsl-dropdown {
      position: absolute; top: calc(100% + 6px); left: 0;
      min-width: 180px; max-height: 350px; overflow-y: auto;
      background: #202124; border: 1px solid #3c4043;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 99999; opacity: 0; visibility: hidden;
      transform: translateY(-4px); transition: all 0.15s ease;
    }
    .gsl-dropdown.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .gsl-dropdown::-webkit-scrollbar { width: 6px; }
    .gsl-dropdown::-webkit-scrollbar-thumb { background: #3c4043; border-radius: 3px; }

    .gsl-search { position: sticky; top: 0; padding: 8px; background: #202124; border-bottom: 1px solid #3c4043; }
    .gsl-search input {
      width: 100%; padding: 8px 12px; background: #303134;
      border: 1px solid #3c4043; border-radius: 8px;
      color: #e8eaed; font-size: 13px; box-sizing: border-box;
    }
    .gsl-search input:focus { border-color: #a78bfa; outline: none; }

    .gsl-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; color: #9aa0a6; font-size: 13px;
      cursor: pointer; transition: all 0.1s;
    }
    .gsl-item:hover { background: #303134; color: #e8eaed; }
    .gsl-item.selected { background: #303134; color: #a78bfa; }
    .gsl-item.hidden { display: none; }
    .gsl-icon { width: 20px; text-align: center; font-size: 14px; }
    .gsl-divider { display: none; }

    /* Site Filter Styles */
    .gsl-blocked { opacity: 0.25; position: relative; }
    .gsl-blocked:hover { opacity: 0.5; }
    .gsl-hidden { display: none !important; }
    .gsl-boosted {
      border-left: 3px solid #4CAF50 !important;
      padding-left: 10px !important;
      background: rgba(76,175,80,0.05) !important;
    }

    .gsl-action {
      display: inline-block; margin-left: 6px; padding: 2px 5px;
      background: #303134; border: 1px solid #5f6368; border-radius: 3px;
      color: #9aa0a6; font-size: 10px; cursor: pointer;
      opacity: 0; transition: opacity 0.15s;
    }
    .g:hover .gsl-action { opacity: 1; }
    .gsl-action:hover { background: #3c4043; color: #8ab4f8; border-color: #8ab4f8; }

    /* Filter Panel */
    .gsl-panel {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 400px; max-height: 70vh; background: #303134;
      border: 1px solid #5f6368; border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100001; display: none;
    }
    .gsl-panel.show { display: block; }
    .gsl-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 100000; display: none;
    }
    .gsl-overlay.show { display: block; }

    .gsl-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; background: #202124; border-bottom: 1px solid #5f6368;
    }
    .gsl-title { color: #e8eaed; font-size: 15px; font-weight: 500; }
    .gsl-close { background: none; border: none; color: #9aa0a6; font-size: 20px; cursor: pointer; }

    .gsl-body { padding: 12px; max-height: 45vh; overflow-y: auto; }
    .gsl-section { margin-bottom: 16px; }
    .gsl-label { color: #8ab4f8; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }

    .gsl-site {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 8px; background: #202124; border-radius: 4px; margin-bottom: 4px;
    }
    .gsl-site-name { color: #e8eaed; font-size: 12px; font-family: monospace; }
    .gsl-site-del { background: none; border: none; color: #9aa0a6; cursor: pointer; }
    .gsl-site-del:hover { color: #f44336; }

    .gsl-add { display: flex; gap: 6px; }
    .gsl-input {
      flex: 1; padding: 6px 8px; background: #202124; border: 1px solid #5f6368;
      border-radius: 4px; color: #e8eaed; font-size: 12px;
    }
    .gsl-add-btn {
      padding: 6px 12px; background: #8ab4f8; border: none; border-radius: 4px;
      color: #202124; font-size: 12px; cursor: pointer;
    }
    .gsl-footer {
      padding: 10px 16px; background: #202124; border-top: 1px solid #5f6368;
      display: flex; align-items: center; gap: 8px; font-size: 11px; color: #9aa0a6;
    }

    /* ========== MOBILE RESPONSIVE ========== */
    @media (max-width: 768px) {
      .gsl-wrapper {
        flex-wrap: wrap; gap: 6px; margin: 8px 0;
        width: 100%; justify-content: flex-start;
      }

      .gsl-btn, .gsl-lens-toggle {
        padding: 10px 14px; font-size: 14px;
        min-height: 44px; /* Touch-friendly */
      }

      .gsl-toggle { width: 12px; height: 12px; }

      .gsl-dropdown {
        position: fixed !important;
        top: auto !important; bottom: 0 !important;
        left: 0 !important; right: 0 !important;
        width: 100% !important; max-width: 100% !important;
        min-width: 100% !important;
        max-height: 60vh;
        border-radius: 16px 16px 0 0;
        transform: translateY(100%);
        transition: transform 0.25s ease;
      }
      .gsl-dropdown.show {
        transform: translateY(0);
      }

      .gsl-item {
        padding: 14px 16px; font-size: 15px;
        min-height: 48px;
      }

      .gsl-search input {
        padding: 12px 14px; font-size: 16px;
        min-height: 44px;
      }

      /* Filter Panel - Full screen on mobile */
      .gsl-panel {
        position: fixed !important;
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100% !important; max-width: 100% !important;
        max-height: 100vh !important;
        border-radius: 0;
        transform: none;
      }

      .gsl-header { padding: 16px; }
      .gsl-title { font-size: 17px; }
      .gsl-close { font-size: 28px; padding: 8px; }

      .gsl-body { padding: 16px; max-height: calc(100vh - 140px); }
      .gsl-label { font-size: 13px; margin-bottom: 10px; }

      .gsl-site {
        padding: 12px; margin-bottom: 8px;
      }
      .gsl-site-name { font-size: 14px; }
      .gsl-site-del { font-size: 20px; padding: 8px; }

      .gsl-input { padding: 12px; font-size: 16px; min-height: 44px; }
      .gsl-add-btn { padding: 12px 16px; font-size: 14px; min-height: 44px; }

      .gsl-footer { padding: 16px; font-size: 14px; }
      .gsl-footer input[type="checkbox"] {
        width: 20px; height: 20px;
      }
    }

    /* Extra small screens */
    @media (max-width: 400px) {
      .gsl-btn, .gsl-lens-toggle {
        padding: 8px 10px; font-size: 13px;
      }
    }
  `);

  // ============================================
  // STATE - Store lens in URL param + sessionStorage for persistence
  // ============================================
  const LENS_PARAM = 'gsl_lens';
  const FT_PARAM = 'gsl_ft';
  const STORAGE_KEY = 'gsl_active_lens';
  const FT_STORAGE_KEY = 'gsl_active_ft';

  function getCurrentLens() {
    return new URLSearchParams(window.location.search).get(LENS_PARAM) || 'all';
  }

  function getCurrentFiletype() {
    return new URLSearchParams(window.location.search).get(FT_PARAM) || '';
  }

  function getRegion() {
    return new URLSearchParams(window.location.search).get('cr') || '';
  }

  function getRawQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  // Save active lens to sessionStorage
  function saveLensToStorage(lens, ft) {
    if (lens && lens !== 'all') {
      sessionStorage.setItem(STORAGE_KEY, lens);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    if (ft) {
      sessionStorage.setItem(FT_STORAGE_KEY, ft);
    } else {
      sessionStorage.removeItem(FT_STORAGE_KEY);
    }
  }

  // Get saved lens from sessionStorage
  function getSavedLens() {
    return sessionStorage.getItem(STORAGE_KEY) || 'all';
  }

  function getSavedFiletype() {
    return sessionStorage.getItem(FT_STORAGE_KEY) || '';
  }

  // Auto-restore lens on page load if URL doesn't have it
  function autoRestoreLens() {
    const urlLens = new URLSearchParams(window.location.search).get(LENS_PARAM);
    const urlFt = new URLSearchParams(window.location.search).get(FT_PARAM);
    const savedLens = getSavedLens();
    const savedFt = getSavedFiletype();

    // Prevent redirect loop - check if we just redirected
    const lastRedirect = sessionStorage.getItem('gsl_last_redirect');
    const now = Date.now();
    if (lastRedirect && (now - parseInt(lastRedirect)) < 2000) {
      // Redirected less than 2 seconds ago, skip to prevent loop
      return false;
    }

    // If URL has no lens but we have a saved one, redirect to apply it
    if (!urlLens && savedLens !== 'all') {
      const query = getCleanQuery();
      if (query) {
        // Mark that we're about to redirect
        sessionStorage.setItem('gsl_last_redirect', now.toString());
        navigate(query, savedLens, savedFt || '');
        return true; // Will redirect
      }
    }

    // Sync: save current URL lens to storage
    saveLensToStorage(urlLens || 'all', urlFt || '');
    return false;
  }

  // Clean query - remove any site: or filetype: operators we might have added
  function getCleanQuery() {
    let q = getRawQuery();
    // Remove site: operators that match our lenses
    q = q.replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '');
    // Remove filetype:
    q = q.replace(/filetype:\S+/gi, '');
    return q.replace(/\s+/g, ' ').trim();
  }

  // Build the actual search query with lens applied
  function buildSearchQuery(cleanQuery, lensKey, filetype) {
    let q = cleanQuery;
    if (lensKey && lensKey !== 'all') {
      const lens = LENSES[lensKey];
      if (lens.sites?.length) {
        q += ` (${lens.sites.map(s => `site:${s}`).join(' OR ')})`;
      }
    }
    if (filetype) {
      q += ` filetype:${filetype}`;
    }
    return q;
  }

  // Navigate with CLEAN URL - remove all unnecessary params
  function navigate(cleanQuery, lensKey, filetype, region = null) {
    // Save lens to storage before navigation
    saveLensToStorage(lensKey, filetype);

    // Build fresh URL with only essential params
    const baseUrl = window.location.origin + '/search';
    const url = new URL(baseUrl);

    // Build actual query with filters
    const fullQuery = buildSearchQuery(cleanQuery, lensKey, filetype);
    url.searchParams.set('q', fullQuery);

    // Store lens/filetype selection in custom params
    if (lensKey && lensKey !== 'all') {
      url.searchParams.set(LENS_PARAM, lensKey);
    }

    if (filetype) {
      url.searchParams.set(FT_PARAM, filetype);
    }

    // Preserve region if set
    const currentRegion = region !== null ? region : getRegion();
    if (currentRegion) {
      url.searchParams.set('cr', currentRegion);
    }

    window.location.href = url.toString();
  }

  // ============================================
  // CLEAN THE SEARCH BAR (KEY FEATURE!)
  // ============================================
  let searchBarCleaned = false;
  let formHooked = false;

  function cleanSearchBar() {
    const searchInput = document.querySelector('textarea[name="q"], input[name="q"]');
    if (!searchInput) return;

    // Clean function to remove site: operators from input value
    const cleanInputValue = () => {
      const currentValue = searchInput.value;
      const cleaned = currentValue
        .replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '')
        .replace(/filetype:\S+/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (currentValue !== cleaned) {
        // Preserve cursor position
        const cursorPos = searchInput.selectionStart;
        const diff = currentValue.length - cleaned.length;
        searchInput.value = cleaned;
        // Restore cursor, adjusted for removed characters
        const newPos = Math.max(0, cursorPos - diff);
        searchInput.setSelectionRange(newPos, newPos);
      }
    };

    // Clean on initial load if not focused
    if (!searchBarCleaned && document.activeElement !== searchInput) {
      cleanInputValue();
      searchBarCleaned = true;
    }

    // Hook form and input to preserve lens on submit
    if (!formHooked) {
      formHooked = true;

      // Clean when user focuses on search bar
      searchInput.addEventListener('focus', () => {
        setTimeout(cleanInputValue, 10);
      });

      // Clean as user types (debounced)
      let cleanTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(cleanTimeout);
        cleanTimeout = setTimeout(() => {
          // Only clean if there are site: operators (don't interrupt normal typing)
          if (/site:/i.test(searchInput.value)) {
            cleanInputValue();
          }
        }, 100);
      });

      // Intercept Enter key on search input
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          // Clean before navigate
          const userQuery = searchInput.value
            .replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '')
            .replace(/filetype:\S+/gi, '')
            .trim();
          if (userQuery) {
            navigate(userQuery, getCurrentLens(), getCurrentFiletype());
          }
        }
      }, true); // Use capture phase to intercept before Google

      // Also hook the form submit
      const form = searchInput.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const userQuery = searchInput.value
            .replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '')
            .replace(/filetype:\S+/gi, '')
            .trim();
          if (userQuery) {
            navigate(userQuery, getCurrentLens(), getCurrentFiletype());
          }
        }, true);
      }

      // Intercept any search button clicks
      document.querySelectorAll('button[type="submit"], button[aria-label*="earch"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const currentInput = document.querySelector('textarea[name="q"], input[name="q"]');
          if (currentInput && getCurrentLens() !== 'all') {
            e.preventDefault();
            e.stopPropagation();
            const userQuery = currentInput.value
              .replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '')
              .replace(/filetype:\S+/gi, '')
              .trim();
            navigate(userQuery, getCurrentLens(), getCurrentFiletype());
          }
        }, true);
      });

      // Watch for navigation attempts and intercept to preserve lens
      // This catches suggestion clicks, voice search, etc.
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      const interceptNavigation = (url) => {
        if (getCurrentLens() === 'all' && getCurrentFiletype() === '') return false;

        try {
          const parsedUrl = new URL(url, window.location.origin);
          if (parsedUrl.pathname === '/search' && parsedUrl.searchParams.has('q')) {
            let query = parsedUrl.searchParams.get('q');
            // Clean any existing site: operators
            query = query.replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '').replace(/filetype:\S+/gi, '').trim();
            if (query && !parsedUrl.searchParams.has(LENS_PARAM)) {
              navigate(query, getCurrentLens(), getCurrentFiletype());
              return true; // Navigation intercepted
            }
          }
        } catch (e) { /* ignore */ }
        return false;
      };

      history.pushState = function (...args) {
        if (args[2] && interceptNavigation(args[2])) return;
        return originalPushState.apply(this, args);
      };

      history.replaceState = function (...args) {
        if (args[2] && interceptNavigation(args[2])) return;
        return originalReplaceState.apply(this, args);
      };

      // Also intercept link clicks to /search
      document.addEventListener('click', (e) => {
        if (getCurrentLens() === 'all' && getCurrentFiletype() === '') return;

        const link = e.target.closest('a[href*="/search?"]');
        if (link && link.href) {
          if (interceptNavigation(link.href)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }, true);
    }
  }

  // Site Filter Data
  const getBlocked = () => { try { return JSON.parse(GM_getValue('blocked', JSON.stringify(DEFAULT_BLOCKED))); } catch { return [...DEFAULT_BLOCKED]; } };
  const getBoosted = () => { try { return JSON.parse(GM_getValue('boosted', JSON.stringify(DEFAULT_BOOSTED))); } catch { return [...DEFAULT_BOOSTED]; } };
  const getHideBlocked = () => GM_getValue('hideBlocked', false);
  const saveBlocked = s => GM_setValue('blocked', JSON.stringify(s));
  const saveBoosted = s => GM_setValue('boosted', JSON.stringify(s));
  const saveHideBlocked = h => GM_setValue('hideBlocked', h);

  const extractDomain = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; } };
  const matchDomain = (d, p) => d && p && (d === p || d.endsWith('.' + p));

  // ============================================
  // UI BUILDERS
  // ============================================
  const closeAll = () => document.querySelectorAll('.gsl-dropdown.show').forEach(d => d.classList.remove('show'));

  function createLensButton(currentLens) {
    const c = document.createElement('div');
    c.className = 'gsl-container';

    const isActive = currentLens !== 'all';
    const data = LENSES[currentLens];

    const btn = document.createElement('button');
    btn.className = `gsl-lens-toggle ${isActive ? 'active' : ''}`;
    btn.innerHTML = `<span class="gsl-toggle"></span><span>${isActive ? data.name : 'Lenses'}</span><span class="gsl-arrow">▾</span>`;

    const dd = document.createElement('div');
    dd.className = 'gsl-dropdown';

    Object.entries(LENSES).forEach(([k, v]) => {
      const item = document.createElement('div');
      item.className = `gsl-item ${currentLens === k ? 'selected' : ''}`;
      item.dataset.key = k;
      item.innerHTML = `<span class="gsl-icon">${v.icon || '○'}</span><span>${v.name}</span>`;
      item.addEventListener('click', () => {
        navigate(getCleanQuery(), k, getCurrentFiletype());
        closeAll();
      });
      dd.appendChild(item);
    });

    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeAll();
      dd.classList.toggle('show');
    });

    c.appendChild(btn);
    c.appendChild(dd);
    return c;
  }

  function createDropdown(label, items, current, onSelect, searchable = false) {
    const c = document.createElement('div');
    c.className = 'gsl-container';

    const isActive = current !== '' && current !== 'all';
    const data = items[current] || items[''] || items['all'];

    const btn = document.createElement('button');
    btn.className = `gsl-btn ${isActive ? 'active' : ''}`;
    btn.innerHTML = `<span class="gsl-toggle"></span><span>${isActive ? data.name : label}</span><span class="gsl-arrow">▾</span>`;

    const dd = document.createElement('div');
    dd.className = 'gsl-dropdown';

    if (searchable) {
      const s = document.createElement('div');
      s.className = 'gsl-search';
      s.innerHTML = `<input type="text" placeholder="Search...">`;
      dd.appendChild(s);
      s.querySelector('input').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        dd.querySelectorAll('.gsl-item').forEach(i => i.classList.toggle('hidden', !i.dataset.name.includes(q)));
      });
      s.addEventListener('click', e => e.stopPropagation());
    }

    Object.entries(items).forEach(([k, v]) => {
      const item = document.createElement('div');
      item.className = `gsl-item ${current === k ? 'selected' : ''}`;
      item.dataset.key = k;
      item.dataset.name = v.name.toLowerCase();
      item.innerHTML = `<span class="gsl-icon">${v.icon || '○'}</span><span>${v.name}</span>`;
      item.addEventListener('click', () => { onSelect(k); closeAll(); });
      dd.appendChild(item);
    });

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (e.target.dataset.clear !== undefined) { onSelect(''); return; }
      closeAll();
      dd.classList.toggle('show');
    });

    c.appendChild(btn);
    c.appendChild(dd);
    return c;
  }

  // ============================================
  // SITE FILTER PANEL
  // ============================================
  function createFilterPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'gsl-overlay';
    overlay.id = 'gsl-overlay';

    const panel = document.createElement('div');
    panel.className = 'gsl-panel';
    panel.id = 'gsl-panel';
    panel.innerHTML = `
      <div class="gsl-header">
        <span class="gsl-title">🔧 Site Filter</span>
        <button class="gsl-close">×</button>
      </div>
      <div class="gsl-body">
        <div class="gsl-section">
          <div class="gsl-label">🚫 Blocked</div>
          <div id="gsl-blocked"></div>
          <div class="gsl-add">
            <input class="gsl-input" id="gsl-blocked-in" placeholder="domain.com">
            <button class="gsl-add-btn" id="gsl-blocked-add">+</button>
          </div>
        </div>
        <div class="gsl-section">
          <div class="gsl-label">⭐ Boosted</div>
          <div id="gsl-boosted"></div>
          <div class="gsl-add">
            <input class="gsl-input" id="gsl-boosted-in" placeholder="domain.com">
            <button class="gsl-add-btn" id="gsl-boosted-add">+</button>
          </div>
        </div>
      </div>
      <div class="gsl-footer">
        <input type="checkbox" id="gsl-hide"> <label for="gsl-hide">Hide blocked completely</label>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    panel.querySelector('.gsl-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    panel.querySelector('#gsl-blocked-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gsl-blocked-in');
      if (inp.value.trim()) {
        const b = getBlocked(); b.push(inp.value.trim()); saveBlocked(b);
        saveBoosted(getBoosted().filter(s => s !== inp.value.trim()));
        inp.value = ''; renderPanel(); processResults();
      }
    });

    panel.querySelector('#gsl-boosted-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gsl-boosted-in');
      if (inp.value.trim()) {
        const b = getBoosted(); b.push(inp.value.trim()); saveBoosted(b);
        saveBlocked(getBlocked().filter(s => s !== inp.value.trim()));
        inp.value = ''; renderPanel(); processResults();
      }
    });

    panel.querySelector('#gsl-hide').addEventListener('change', e => {
      saveHideBlocked(e.target.checked);
      processResults();
    });
  }

  function renderPanel() {
    const bl = document.getElementById('gsl-blocked');
    const bo = document.getElementById('gsl-boosted');
    const hide = document.getElementById('gsl-hide');

    bl.innerHTML = getBlocked().map(s => `<div class="gsl-site"><span class="gsl-site-name">${s}</span><button class="gsl-site-del" data-s="${s}" data-t="b">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:11px;">None</div>';
    bo.innerHTML = getBoosted().map(s => `<div class="gsl-site"><span class="gsl-site-name">${s}</span><button class="gsl-site-del" data-s="${s}" data-t="o">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:11px;">None</div>';
    hide.checked = getHideBlocked();

    bl.querySelectorAll('.gsl-site-del').forEach(b => b.addEventListener('click', () => {
      saveBlocked(getBlocked().filter(x => x !== b.dataset.s)); renderPanel(); processResults();
    }));
    bo.querySelectorAll('.gsl-site-del').forEach(b => b.addEventListener('click', () => {
      saveBoosted(getBoosted().filter(x => x !== b.dataset.s)); renderPanel(); processResults();
    }));
  }

  const openPanel = () => { renderPanel(); document.getElementById('gsl-overlay').classList.add('show'); document.getElementById('gsl-panel').classList.add('show'); };
  const closePanel = () => { document.getElementById('gsl-overlay').classList.remove('show'); document.getElementById('gsl-panel').classList.remove('show'); };

  // ============================================
  // PROCESS SEARCH RESULTS
  // ============================================
  function processResults() {
    const hide = getHideBlocked();
    const blocked = getBlocked();
    const boosted = getBoosted();

    document.querySelectorAll('#search .g, #rso .g, .MjjYud').forEach(r => {
      if (r.dataset.gslDone === 'true') return;

      const cite = r.querySelector('cite');
      if (!cite) return;

      if (r.closest('[data-attrid="wa:/description"]') ||
        r.closest('.kp-wholepage') ||
        r.closest('.ULSxyf') ||
        r.closest('.M8OgIe') ||
        r.closest('.related-question-pair')) {
        return;
      }

      const mainLink = r.querySelector('a[href^="http"]');
      if (!mainLink) return;

      const d = extractDomain(mainLink.href);
      if (!d) return;

      const isBlockedResult = blocked.some(s => matchDomain(d, s));
      const isBoostedResult = boosted.some(s => matchDomain(d, s));

      if (!isBlockedResult && !isBoostedResult) return;

      r.dataset.gslDone = 'true';
      r.classList.remove('gsl-blocked', 'gsl-boosted', 'gsl-hidden');

      if (isBlockedResult) {
        if (hide) {
          r.style.display = 'none';
          r.classList.add('gsl-hidden');
        } else {
          r.style.display = '';
          r.classList.add('gsl-blocked');
        }
      } else if (isBoostedResult) {
        r.style.display = '';
        r.classList.add('gsl-boosted');
      }

      if (cite && !cite.querySelector('.gsl-action')) {
        const domain = d;
        const btn = document.createElement('span');
        btn.className = 'gsl-action';
        btn.textContent = '⚙';
        btn.title = 'Block/Boost';
        btn.addEventListener('click', ev => {
          ev.preventDefault(); ev.stopPropagation();
          const action = prompt(`Domain: ${domain}\n\nType 'b' to block, 'o' to boost, 'r' to remove:`);
          if (action === 'b') { const bl = getBlocked(); bl.push(domain); saveBlocked(bl); saveBoosted(getBoosted().filter(x => x !== domain)); }
          else if (action === 'o') { const bo = getBoosted(); bo.push(domain); saveBoosted(bo); saveBlocked(getBlocked().filter(x => x !== domain)); }
          else if (action === 'r') { saveBlocked(getBlocked().filter(x => x !== domain)); saveBoosted(getBoosted().filter(x => x !== domain)); }
          document.querySelectorAll('[data-gsl-done]').forEach(el => el.dataset.gslDone = '');
          processResults();
        });
        cite.appendChild(btn);
      }
    });
  }

  // ============================================
  // INJECTION
  // ============================================
  function inject() {
    if (document.querySelector('.gsl-wrapper')) return;

    const nav = document.querySelector('div[role="navigation"] > div:first-child') ||
      document.querySelector('.crJ18e') || document.querySelector('.IUOThf');
    if (!nav) { setTimeout(inject, 500); return; }

    const currentLens = getCurrentLens();
    const region = getRegion();
    const ft = getCurrentFiletype();

    const wrapper = document.createElement('div');
    wrapper.className = 'gsl-wrapper';

    // Lens toggle (Kagi-style)
    wrapper.appendChild(createLensButton(currentLens));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gsl-divider' }));

    // Region
    wrapper.appendChild(createDropdown('Region', REGIONS, region, k => {
      const url = new URL(window.location.href);
      k === '' ? url.searchParams.delete('cr') : url.searchParams.set('cr', k);
      window.location.href = url.toString();
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gsl-divider' }));

    // Filetype
    wrapper.appendChild(createDropdown('Filetype', FILETYPES, ft, k => {
      navigate(getCleanQuery(), currentLens, k);
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gsl-divider' }));

    // Filter button
    const filterBtn = document.createElement('button');
    filterBtn.className = 'gsl-btn';
    filterBtn.innerHTML = '🔧 Filter';
    filterBtn.addEventListener('click', openPanel);
    wrapper.appendChild(filterBtn);

    nav.insertBefore(wrapper, nav.firstChild);

    document.addEventListener('click', e => { if (!wrapper.contains(e.target)) closeAll(); });

    createFilterPanel();
    processResults();

    // CLEAN THE SEARCH BAR!
    cleanSearchBar();
  }

  // ============================================
  // INIT
  // ============================================
  // First, check if we need to restore lens from sessionStorage
  if (autoRestoreLens()) {
    // Will redirect, don't continue
    return;
  }

  setTimeout(inject, 300);
  new MutationObserver(() => {
    if (!document.querySelector('.gsl-wrapper')) setTimeout(inject, 100);
    cleanSearchBar(); // Keep cleaning the search bar
    processResults();
  }).observe(document.body, { childList: true, subtree: true });
})();
