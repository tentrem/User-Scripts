// ==UserScript==
// @name         Google Search Enhanced v3
// @version      3.0.0
// @description  Kagi-style enhancements: Visual Block/Boost UI, Reorder Results
// @author       tentremvibe
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
  // CONFIGURATION
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
    'txt': { name: 'Text', icon: '📝' },
    'csv': { name: 'CSV', icon: '📊' },
    'json': { name: 'JSON', icon: '📋' },
    'xml': { name: 'XML', icon: '📋' },
    'py': { name: 'Python', icon: '🐍' },
    'js': { name: 'JS', icon: '📜' },
    'sql': { name: 'SQL', icon: '🗃️' },
    'md': { name: 'Markdown', icon: '📝' }
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



  const DEFAULT_BLOCKED = ['pinterest.com', 'w3schools.com'];
  const DEFAULT_BOOSTED = ['stackoverflow.com', 'github.com', 'developer.mozilla.org'];

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
    /* ========== Base Wrapper ========== */
    .gse-wrapper { display: inline-flex; align-items: center; gap: 4px; margin-right: 12px; }
    .gse-container { display: inline-flex; align-items: center; position: relative; }

    .gse-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px; color: #bdc1c6; background: transparent;
      border: none; border-radius: 18px; cursor: pointer;
      font-family: Google Sans, Roboto, Arial, sans-serif;
      font-size: 14px; white-space: nowrap; transition: all 0.2s;
    }
    .gse-btn:hover { background: rgba(138,180,248,0.08); }
    .gse-btn.active { color: #8ab4f8; background: rgba(138,180,248,0.1); }

    .gse-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0;
      min-width: 180px; max-height: 350px; overflow-y: auto;
      background: #303134; border: 1px solid #5f6368;
      border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      z-index: 99999; opacity: 0; visibility: hidden;
      transform: translateY(-4px); transition: all 0.15s ease;
    }
    .gse-dropdown.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .gse-dropdown::-webkit-scrollbar { width: 6px; }
    .gse-dropdown::-webkit-scrollbar-thumb { background: #5f6368; border-radius: 3px; }

    .gse-search { position: sticky; top: 0; padding: 8px; background: #303134; border-bottom: 1px solid #5f6368; }
    .gse-search input {
      width: 100%; padding: 6px 10px; background: #202124;
      border: 1px solid #5f6368; border-radius: 4px;
      color: #e8eaed; font-size: 12px; box-sizing: border-box;
    }
    .gse-search input:focus { border-color: #8ab4f8; outline: none; }

    .gse-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; color: #e8eaed; font-size: 13px;
      cursor: pointer; transition: background 0.1s;
    }
    .gse-item:hover { background: rgba(138,180,248,0.12); }
    .gse-item.selected { background: rgba(138,180,248,0.2); color: #8ab4f8; }
    .gse-item.hidden { display: none; }
    .gse-icon { width: 18px; text-align: center; }
    .gse-divider { height: 20px; width: 1px; background: #5f6368; margin: 0 4px; }
    .gse-clear { margin-left: 4px; font-size: 10px; opacity: 0.7; }

    /* ========== Visual Action Buttons (NEW!) ========== */
    .gse-actions {
      display: inline-flex; align-items: center; gap: 2px;
      margin-left: 8px; opacity: 0; transition: opacity 0.15s;
    }
    .g:hover .gse-actions, .MjjYud:hover .gse-actions { opacity: 1; }

    .gse-action-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%;
      border: 1px solid transparent; background: transparent;
      color: #9aa0a6; font-size: 12px; cursor: pointer;
      transition: all 0.15s ease;
    }
    .gse-action-btn:hover { background: rgba(255,255,255,0.1); border-color: #5f6368; }
    .gse-action-btn.pin:hover { color: #4CAF50; border-color: #4CAF50; }
    .gse-action-btn.boost:hover { color: #2196F3; border-color: #2196F3; }
    .gse-action-btn.block:hover { color: #f44336; border-color: #f44336; }
    .gse-action-btn.more:hover { color: #8ab4f8; }

    .gse-action-btn.active-pin { color: #4CAF50; background: rgba(76,175,80,0.15); }
    .gse-action-btn.active-boost { color: #2196F3; background: rgba(33,150,243,0.15); }
    .gse-action-btn.active-block { color: #f44336; background: rgba(244,67,54,0.15); }

    /* Action Dropdown Menu */
    .gse-action-dropdown {
      position: absolute; top: 100%; right: 0;
      min-width: 180px; background: #303134;
      border: 1px solid #5f6368; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      z-index: 100000; display: none;
    }
    .gse-action-dropdown.show { display: block; }
    .gse-action-dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; color: #e8eaed; font-size: 13px;
      cursor: pointer; transition: background 0.1s;
    }
    .gse-action-dropdown-item:hover { background: rgba(138,180,248,0.12); }
    .gse-action-dropdown-item:first-child { border-radius: 8px 8px 0 0; }
    .gse-action-dropdown-item:last-child { border-radius: 0 0 8px 8px; }
    .gse-action-dropdown-item.danger:hover { background: rgba(244,67,54,0.12); color: #f44336; }
    .gse-action-dropdown-divider { height: 1px; background: #5f6368; margin: 4px 0; }

    /* ========== Toast Notification ========== */
    .gse-toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #303134; color: #e8eaed;
      padding: 12px 24px; border-radius: 8px;
      border: 1px solid #5f6368;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-size: 14px; z-index: 100001;
      opacity: 0; transition: all 0.3s ease;
    }
    .gse-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .gse-toast-icon { margin-right: 8px; }
    .gse-toast-undo {
      margin-left: 16px; color: #8ab4f8; cursor: pointer;
      text-decoration: underline;
    }



    /* ========== Boosted/Blocked Styles ========== */
    .gse-blocked { opacity: 0.25; position: relative; }
    .gse-blocked:hover { opacity: 0.5; }
    .gse-hidden { display: none !important; }

    .gse-boosted {
      border-left: 3px solid #4CAF50 !important;
      padding-left: 12px !important;
      background: linear-gradient(90deg, rgba(76,175,80,0.08) 0%, transparent 100%) !important;
    }
    .gse-boosted-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; margin-left: 8px;
      background: rgba(76,175,80,0.15); color: #4CAF50;
      border-radius: 4px; font-size: 11px; font-weight: 500;
    }

    /* Reorder separator */
    .gse-reorder-separator {
      margin: 16px 0; padding: 8px 0;
      border-top: 1px dashed #5f6368;
      color: #9aa0a6; font-size: 12px; text-align: center;
    }

    /* ========== Filter Panel ========== */
    .gse-panel {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 420px; max-height: 70vh; background: #303134;
      border: 1px solid #5f6368; border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100001; display: none;
    }
    .gse-panel.show { display: block; }
    .gse-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 100000; display: none;
    }
    .gse-overlay.show { display: block; }

    .gse-panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 18px; background: #202124;
      border-bottom: 1px solid #5f6368; border-radius: 12px 12px 0 0;
    }
    .gse-panel-title { color: #e8eaed; font-size: 15px; font-weight: 500; }
    .gse-panel-close { background: none; border: none; color: #9aa0a6; font-size: 20px; cursor: pointer; }
    .gse-panel-close:hover { color: #e8eaed; }

    .gse-panel-body { padding: 14px; max-height: 45vh; overflow-y: auto; }
    .gse-panel-section { margin-bottom: 18px; }
    .gse-panel-label {
      display: flex; align-items: center; gap: 6px;
      color: #8ab4f8; font-size: 12px; text-transform: uppercase;
      margin-bottom: 10px; font-weight: 500;
    }

    .gse-site {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; background: #202124; border-radius: 6px; margin-bottom: 6px;
    }
    .gse-site-name { color: #e8eaed; font-size: 13px; font-family: monospace; }
    .gse-site-del { background: none; border: none; color: #9aa0a6; cursor: pointer; font-size: 14px; }
    .gse-site-del:hover { color: #f44336; }

    .gse-add { display: flex; gap: 8px; }
    .gse-input {
      flex: 1; padding: 8px 10px; background: #202124; border: 1px solid #5f6368;
      border-radius: 6px; color: #e8eaed; font-size: 13px;
    }
    .gse-input:focus { border-color: #8ab4f8; outline: none; }
    .gse-add-btn {
      padding: 8px 16px; background: #8ab4f8; border: none; border-radius: 6px;
      color: #202124; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .gse-add-btn:hover { background: #aecbfa; }

    .gse-panel-footer {
      padding: 12px 18px; background: #202124;
      border-top: 1px solid #5f6368; border-radius: 0 0 12px 12px;
      display: flex; align-items: center; gap: 10px; font-size: 12px; color: #9aa0a6;
    }
    .gse-panel-footer input[type="checkbox"] { accent-color: #8ab4f8; }
  `);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getQuery = () => new URLSearchParams(window.location.search).get('q') || '';
  const getRegion = () => new URLSearchParams(window.location.search).get('cr') || '';
  const getFiletype = () => { const m = getQuery().match(/filetype:(\S+)/i); return m ? m[1] : ''; };

  const cleanQuery = q => q.replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '').replace(/filetype:\S+/gi, '').replace(/\s+/g, ' ').trim();

  const buildQuery = (q, lensKey, filetype) => {
    if (lensKey && lensKey !== 'all') {
      const lens = LENSES[lensKey];
      if (lens.sites?.length) q += ` (${lens.sites.map(s => `site:${s}`).join(' OR ')})`;
    }
    if (filetype) q += ` filetype:${filetype}`;
    return q;
  };

  const detectLens = () => {
    const q = getQuery();
    for (const [k, v] of Object.entries(LENSES)) {
      if (k === 'all') continue;
      if (v.sites?.some(s => q.includes(`site:${s}`))) return k;
    }
    return 'all';
  };

  const navigate = (query, region = null) => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    if (region !== null) region === '' ? url.searchParams.delete('cr') : url.searchParams.set('cr', region);
    window.location.href = url.toString();
  };

  // Site Filter Data
  const getBlocked = () => { try { return JSON.parse(GM_getValue('blocked', JSON.stringify(DEFAULT_BLOCKED))); } catch { return [...DEFAULT_BLOCKED]; } };
  const getBoosted = () => { try { return JSON.parse(GM_getValue('boosted', JSON.stringify(DEFAULT_BOOSTED))); } catch { return [...DEFAULT_BOOSTED]; } };
  const getHideBlocked = () => GM_getValue('hideBlocked', false);
  const saveBlocked = s => GM_setValue('blocked', JSON.stringify(s));
  const saveBoosted = s => GM_setValue('boosted', JSON.stringify(s));
  const saveHideBlocked = h => GM_setValue('hideBlocked', h);

  const extractDomain = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; } };
  const matchDomain = (d, p) => d && p && (d === p || d.endsWith('.' + p));
  const isBlocked = d => getBlocked().some(s => matchDomain(d, s));
  const isBoosted = d => getBoosted().some(s => matchDomain(d, s));


  // ============================================
  // TOAST NOTIFICATION
  // ============================================
  let toastTimeout = null;
  function showToast(message, icon = '✓', undoCallback = null) {
    let toast = document.getElementById('gse-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gse-toast';
      toast.className = 'gse-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span class="gse-toast-icon">${icon}</span>${message}${undoCallback ? '<span class="gse-toast-undo">Undo</span>' : ''}`;

    if (undoCallback) {
      toast.querySelector('.gse-toast-undo').addEventListener('click', () => {
        undoCallback();
        toast.classList.remove('show');
      });
    }

    clearTimeout(toastTimeout);
    setTimeout(() => toast.classList.add('show'), 10);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ============================================
  // ACTION BUTTONS (Visual Block/Boost UI)
  // ============================================
  function createActionButtons(domain, resultElement) {
    const container = document.createElement('span');
    container.className = 'gse-actions';

    const blocked = getBlocked();
    const boosted = getBoosted();
    const isCurrentlyBlocked = blocked.some(s => matchDomain(domain, s));
    const isCurrentlyBoosted = boosted.some(s => matchDomain(domain, s));

    // Boost button
    const boostBtn = document.createElement('button');
    boostBtn.className = `gse-action-btn boost ${isCurrentlyBoosted ? 'active-boost' : ''}`;
    boostBtn.innerHTML = '⬆';
    boostBtn.title = isCurrentlyBoosted ? 'Remove boost' : 'Boost this site';
    boostBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (isCurrentlyBoosted) {
        saveBoosted(boosted.filter(s => s !== domain));
        showToast(`Removed boost: ${domain}`, '↩');
      } else {
        const newBoosted = [...boosted, domain];
        saveBoosted(newBoosted);
        saveBlocked(blocked.filter(s => s !== domain));
        showToast(`Boosted: ${domain}`, '⬆️', () => saveBoosted(boosted));
      }
      refreshResults();
    });

    // Block button
    const blockBtn = document.createElement('button');
    blockBtn.className = `gse-action-btn block ${isCurrentlyBlocked ? 'active-block' : ''}`;
    blockBtn.innerHTML = '✕';
    blockBtn.title = isCurrentlyBlocked ? 'Unblock this site' : 'Block this site';
    blockBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (isCurrentlyBlocked) {
        saveBlocked(blocked.filter(s => s !== domain));
        showToast(`Unblocked: ${domain}`, '↩');
      } else {
        const newBlocked = [...blocked, domain];
        saveBlocked(newBlocked);
        saveBoosted(boosted.filter(s => s !== domain));
        showToast(`Blocked: ${domain}`, '🚫', () => saveBlocked(blocked));
      }
      refreshResults();
    });

    // More options button
    const moreBtn = document.createElement('button');
    moreBtn.className = 'gse-action-btn more';
    moreBtn.innerHTML = '⋮';
    moreBtn.title = 'More options';

    const dropdown = document.createElement('div');
    dropdown.className = 'gse-action-dropdown';
    dropdown.innerHTML = `
      <div class="gse-action-dropdown-item" data-action="more">🔍 More from ${domain}</div>
      <div class="gse-action-dropdown-item" data-action="less">🔇 Less from ${domain}</div>
      <div class="gse-action-dropdown-divider"></div>
      <div class="gse-action-dropdown-item" data-action="archive">📜 Open in Archive</div>
      <div class="gse-action-dropdown-item" data-action="cache">📋 Open Google Cache</div>
      <div class="gse-action-dropdown-divider"></div>
      <div class="gse-action-dropdown-item danger" data-action="block-all">🚫 Block all from ${domain}</div>
    `;

    dropdown.addEventListener('click', e => {
      const item = e.target.closest('.gse-action-dropdown-item');
      if (!item) return;
      const action = item.dataset.action;
      const link = resultElement.querySelector('a[href^="http"]');
      const url = link?.href || '';

      switch (action) {
        case 'more':
          navigate(getQuery() + ` site:${domain}`);
          break;
        case 'less':
          navigate(getQuery() + ` -site:${domain}`);
          break;
        case 'archive':
          window.open(`https://web.archive.org/web/${url}`, '_blank');
          break;
        case 'cache':
          window.open(`https://webcache.googleusercontent.com/search?q=cache:${url}`, '_blank');
          break;
        case 'block-all':
          const newBlocked = [...getBlocked(), domain];
          saveBlocked(newBlocked);
          saveBoosted(getBoosted().filter(s => s !== domain));
          showToast(`Blocked: ${domain}`, '🚫');
          refreshResults();
          break;
      }
      dropdown.classList.remove('show');
    });

    moreBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.gse-action-dropdown.show').forEach(d => d.classList.remove('show'));
      dropdown.classList.toggle('show');
    });

    container.appendChild(boostBtn);
    container.appendChild(blockBtn);
    container.appendChild(moreBtn);
    container.appendChild(dropdown);

    // Close dropdown on outside click
    document.addEventListener('click', e => {
      if (!container.contains(e.target)) dropdown.classList.remove('show');
    });

    return container;
  }


  // ============================================
  // REORDER RESULTS
  // ============================================
  function reorderResults(container, results) {
    const boosted = getBoosted();
    const blocked = getBlocked();
    const hideBlocked = getHideBlocked();

    // Categorize results
    const boostedResults = [];
    const normalResults = [];

    results.forEach(r => {
      const link = r.querySelector('a[href^="http"]');
      if (!link) return;
      const domain = extractDomain(link.href);
      if (!domain) return;

      const resultData = { element: r, domain, url: link.href, title: r.querySelector('h3')?.textContent || '', snippet: r.querySelector('[data-sncf]')?.textContent || '' };

      if (boosted.some(s => matchDomain(domain, s))) {
        boostedResults.push(resultData);
      } else {
        normalResults.push(resultData);
      }
    });

    // Clear container
    results.forEach(r => r.remove());

    // Add boosted results first
    if (boostedResults.length > 0) {
      boostedResults.forEach(r => {
        r.element.classList.add('gse-boosted');
        // Add badge if not exists
        const h3 = r.element.querySelector('h3');
        if (h3 && !h3.querySelector('.gse-boosted-badge')) {
          const badge = document.createElement('span');
          badge.className = 'gse-boosted-badge';
          badge.innerHTML = '⭐ Boosted';
          h3.appendChild(badge);
        }
        container.appendChild(r.element);
      });

      // Add separator
      const separator = document.createElement('div');
      separator.className = 'gse-reorder-separator';
      separator.textContent = '── Other Results ──';
      container.appendChild(separator);
    }

    // Add normal results
    normalResults.forEach(r => {
      const isBlockedResult = blocked.some(s => matchDomain(r.domain, s));
      if (isBlockedResult && hideBlocked) {
        r.element.classList.add('gse-hidden');
      } else if (isBlockedResult) {
        r.element.classList.add('gse-blocked');
      }
      container.appendChild(r.element);
    });
  }

  // ============================================
  // PROCESS RESULTS
  // ============================================
  function processResults() {
    const container = document.querySelector('#rso');
    if (!container) return;

    const results = Array.from(container.querySelectorAll('.g, .MjjYud')).filter(r => {
      // Must have a link and not be inside special features
      const link = r.querySelector('a[href^="http"]');
      if (!link) return false;
      if (r.closest('[data-attrid="wa:/description"]') ||
        r.closest('.kp-wholepage') ||
        r.closest('.ULSxyf') ||
        r.closest('.M8OgIe') ||
        r.closest('.related-question-pair')) return false;
      return true;
    });

    // Add action buttons to each result
    results.forEach(r => {
      if (r.dataset.gseProcessed === 'true') return;
      r.dataset.gseProcessed = 'true';

      const link = r.querySelector('a[href^="http"]');
      if (!link) return;
      const domain = extractDomain(link.href);
      if (!domain) return;

      // Find cite or URL area
      const cite = r.querySelector('cite');
      if (cite && !cite.querySelector('.gse-actions')) {
        const actions = createActionButtons(domain, r);
        cite.appendChild(actions);
      }
    });

    // Reorder results
    reorderResults(container, results);
  }

  function refreshResults() {
    // Reset processed state
    document.querySelectorAll('[data-gse-processed]').forEach(el => {
      el.dataset.gseProcessed = '';
      el.classList.remove('gse-boosted', 'gse-blocked', 'gse-hidden');
      const badge = el.querySelector('.gse-boosted-badge');
      if (badge) badge.remove();
    });

    // Remove separators
    document.querySelectorAll('.gse-reorder-separator').forEach(el => el.remove());

    // Reprocess
    processResults();
    renderPanel();
  }

  // ============================================
  // UI BUILDERS
  // ============================================
  const closeAll = () => document.querySelectorAll('.gse-dropdown.show').forEach(d => d.classList.remove('show'));

  function createDropdown(id, label, items, current, onSelect, searchable = false) {
    const c = document.createElement('div');
    c.className = 'gse-container';

    const isActive = current !== '' && current !== 'all';
    const data = items[current] || items[''] || items['all'];

    const btn = document.createElement('button');
    btn.className = `gse-btn ${isActive ? 'active' : ''}`;
    btn.innerHTML = isActive
      ? `<span>${data.icon || ''}</span><span>${data.name}</span><span class="gse-clear" data-clear>✕</span>`
      : `${data?.icon || '📌'} ${label} ▾`;

    const dd = document.createElement('div');
    dd.className = 'gse-dropdown';

    if (searchable) {
      const s = document.createElement('div');
      s.className = 'gse-search';
      s.innerHTML = `<input type="text" placeholder="Search...">`;
      dd.appendChild(s);
      s.querySelector('input').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        dd.querySelectorAll('.gse-item').forEach(i => i.classList.toggle('hidden', !i.dataset.name.includes(q)));
      });
      s.addEventListener('click', e => e.stopPropagation());
    }

    Object.entries(items).forEach(([k, v]) => {
      const item = document.createElement('div');
      item.className = `gse-item ${current === k ? 'selected' : ''}`;
      item.dataset.key = k;
      item.dataset.name = v.name.toLowerCase();
      item.innerHTML = `<span class="gse-icon">${v.icon || '○'}</span><span>${v.name}</span>`;
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
  // FILTER PANEL
  // ============================================
  function createFilterPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'gse-overlay';
    overlay.id = 'gse-overlay';

    const panel = document.createElement('div');
    panel.className = 'gse-panel';
    panel.id = 'gse-panel';
    panel.innerHTML = `
      <div class="gse-panel-header">
        <span class="gse-panel-title">🔧 Site Filter Settings</span>
        <button class="gse-panel-close">×</button>
      </div>
      <div class="gse-panel-body">
        <div class="gse-panel-section">
          <div class="gse-panel-label"><span>🚫</span> Blocked Sites</div>
          <div id="gse-blocked"></div>
          <div class="gse-add">
            <input class="gse-input" id="gse-blocked-in" placeholder="domain.com">
            <button class="gse-add-btn" id="gse-blocked-add">+ Block</button>
          </div>
        </div>
        <div class="gse-panel-section">
          <div class="gse-panel-label"><span>⭐</span> Boosted Sites</div>
          <div id="gse-boosted"></div>
          <div class="gse-add">
            <input class="gse-input" id="gse-boosted-in" placeholder="domain.com">
            <button class="gse-add-btn" id="gse-boosted-add">+ Boost</button>
          </div>
        </div>
      </div>
      <div class="gse-panel-footer">
        <input type="checkbox" id="gse-hide">
        <label for="gse-hide">Hide blocked sites completely</label>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    panel.querySelector('.gse-panel-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    panel.querySelector('#gse-blocked-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gse-blocked-in');
      if (inp.value.trim()) {
        const b = getBlocked(); b.push(inp.value.trim()); saveBlocked(b);
        saveBoosted(getBoosted().filter(s => s !== inp.value.trim()));
        inp.value = '';
        showToast(`Blocked: ${inp.value.trim()}`, '🚫');
        renderPanel();
        refreshResults();
      }
    });

    panel.querySelector('#gse-boosted-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gse-boosted-in');
      if (inp.value.trim()) {
        const b = getBoosted(); b.push(inp.value.trim()); saveBoosted(b);
        saveBlocked(getBlocked().filter(s => s !== inp.value.trim()));
        inp.value = '';
        showToast(`Boosted: ${inp.value.trim()}`, '⭐');
        renderPanel();
        refreshResults();
      }
    });

    panel.querySelector('#gse-hide').addEventListener('change', e => {
      saveHideBlocked(e.target.checked);
      refreshResults();
    });
  }

  function renderPanel() {
    const bl = document.getElementById('gse-blocked');
    const bo = document.getElementById('gse-boosted');
    const hide = document.getElementById('gse-hide');
    if (!bl || !bo || !hide) return;

    bl.innerHTML = getBlocked().map(s => `<div class="gse-site"><span class="gse-site-name">${s}</span><button class="gse-site-del" data-s="${s}" data-t="b">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:12px;padding:8px;">No blocked sites</div>';
    bo.innerHTML = getBoosted().map(s => `<div class="gse-site"><span class="gse-site-name">${s}</span><button class="gse-site-del" data-s="${s}" data-t="o">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:12px;padding:8px;">No boosted sites</div>';
    hide.checked = getHideBlocked();

    bl.querySelectorAll('.gse-site-del').forEach(b => b.addEventListener('click', () => {
      saveBlocked(getBlocked().filter(x => x !== b.dataset.s));
      showToast(`Unblocked: ${b.dataset.s}`, '↩');
      renderPanel();
      refreshResults();
    }));
    bo.querySelectorAll('.gse-site-del').forEach(b => b.addEventListener('click', () => {
      saveBoosted(getBoosted().filter(x => x !== b.dataset.s));
      showToast(`Removed boost: ${b.dataset.s}`, '↩');
      renderPanel();
      refreshResults();
    }));
  }

  const openPanel = () => {
    renderPanel();
    document.getElementById('gse-overlay').classList.add('show');
    document.getElementById('gse-panel').classList.add('show');
  };
  const closePanel = () => {
    document.getElementById('gse-overlay').classList.remove('show');
    document.getElementById('gse-panel').classList.remove('show');
  };

  // ============================================
  // INJECTION
  // ============================================
  function inject() {
    if (document.querySelector('.gse-wrapper')) return;

    const nav = document.querySelector('div[role="navigation"] > div:first-child') ||
      document.querySelector('.crJ18e') || document.querySelector('.IUOThf');
    if (!nav) { setTimeout(inject, 500); return; }

    const lens = detectLens(), region = getRegion(), ft = getFiletype();

    const wrapper = document.createElement('div');
    wrapper.className = 'gse-wrapper';

    // Lenses
    wrapper.appendChild(createDropdown('lens', 'Lenses', LENSES, lens, k => {
      navigate(buildQuery(cleanQuery(getQuery()), k, getFiletype()));
    }));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gse-divider' }));

    // Region
    wrapper.appendChild(createDropdown('region', 'Region', REGIONS, region, k => {
      const url = new URL(window.location.href);
      k === '' ? url.searchParams.delete('cr') : url.searchParams.set('cr', k);
      window.location.href = url.toString();
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gse-divider' }));

    // Filetype
    wrapper.appendChild(createDropdown('ft', 'Filetype', FILETYPES, ft, k => {
      navigate(buildQuery(cleanQuery(getQuery()), detectLens(), k));
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gse-divider' }));

    // Filter button
    const filterBtn = document.createElement('button');
    filterBtn.className = 'gse-btn';
    filterBtn.innerHTML = '🔧 Filter';
    filterBtn.addEventListener('click', openPanel);
    wrapper.appendChild(filterBtn);

    nav.insertBefore(wrapper, nav.firstChild);

    document.addEventListener('click', e => { if (!wrapper.contains(e.target)) closeAll(); });

    createFilterPanel();
    processResults();
  }

  // ============================================
  // INIT
  // ============================================
  setTimeout(inject, 300);
  new MutationObserver(() => {
    if (!document.querySelector('.gse-wrapper')) setTimeout(inject, 100);
    // Only process new results, not reorder every time
    document.querySelectorAll('.g:not([data-gse-processed]), .MjjYud:not([data-gse-processed])').forEach(r => {
      const link = r.querySelector('a[href^="http"]');
      if (!link) return;
      const domain = extractDomain(link.href);
      if (!domain) return;
      r.dataset.gseProcessed = 'true';
      const cite = r.querySelector('cite');
      if (cite && !cite.querySelector('.gse-actions')) {
        cite.appendChild(createActionButtons(domain, r));
      }
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
