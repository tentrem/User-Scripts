// ==UserScript==
// @name         Google Search Enhanced
// @version      2.0.0
// @description  Kagi-style enhancements: Lenses, Region, Filetype, Site Block/Boost
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

  // ============================================
  // FILETYPE CONFIGURATION
  // ============================================
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

  // ============================================
  // REGION CONFIGURATION (Shortened)
  // ============================================
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

  // ============================================
  // DEFAULT BLOCKED/BOOSTED
  // ============================================
  const DEFAULT_BLOCKED = ['pinterest.com', 'quora.com', 'w3schools.com'];
  const DEFAULT_BOOSTED = ['stackoverflow.com', 'github.com', 'developer.mozilla.org'];

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
        /* Wrapper */
        .gl-wrapper { display: inline-flex; align-items: center; gap: 4px; margin-right: 12px; }
        .gl-container { display: inline-flex; align-items: center; position: relative; }

        .gl-btn {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 6px 12px; color: #bdc1c6; background: transparent;
            border: none; border-radius: 18px; cursor: pointer;
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 14px; white-space: nowrap; transition: all 0.2s;
        }
        .gl-btn:hover { background: rgba(138,180,248,0.08); }
        .gl-btn.active { color: #8ab4f8; background: rgba(138,180,248,0.1); }

        .gl-dropdown {
            position: absolute; top: calc(100% + 4px); left: 0;
            min-width: 180px; max-height: 350px; overflow-y: auto;
            background: #303134; border: 1px solid #5f6368;
            border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            z-index: 99999; opacity: 0; visibility: hidden;
            transform: translateY(-4px); transition: all 0.15s ease;
        }
        .gl-dropdown.show { opacity: 1; visibility: visible; transform: translateY(0); }
        .gl-dropdown::-webkit-scrollbar { width: 6px; }
        .gl-dropdown::-webkit-scrollbar-thumb { background: #5f6368; border-radius: 3px; }

        .gl-search { position: sticky; top: 0; padding: 8px; background: #303134; border-bottom: 1px solid #5f6368; }
        .gl-search input {
            width: 100%; padding: 6px 10px; background: #202124;
            border: 1px solid #5f6368; border-radius: 4px;
            color: #e8eaed; font-size: 12px; box-sizing: border-box;
        }
        .gl-search input:focus { border-color: #8ab4f8; outline: none; }

        .gl-item {
            display: flex; align-items: center; gap: 8px;
            padding: 8px 12px; color: #e8eaed; font-size: 13px;
            cursor: pointer; transition: background 0.1s;
        }
        .gl-item:hover { background: rgba(138,180,248,0.12); }
        .gl-item.selected { background: rgba(138,180,248,0.2); color: #8ab4f8; }
        .gl-item.hidden { display: none; }
        .gl-icon { width: 18px; text-align: center; }
        .gl-divider { height: 20px; width: 1px; background: #5f6368; margin: 0 4px; }
        .gl-clear { margin-left: 4px; font-size: 10px; opacity: 0.7; }

        /* Site Filter Styles */
        .gsf-blocked { opacity: 0.25; position: relative; }
        .gsf-blocked:hover { opacity: 0.5; }
        .gsf-blocked::after {
            content: '🚫'; position: absolute; top: 0; right: 0;
            font-size: 12px; padding: 2px;
        }
        .gsf-boosted {
            border-left: 3px solid #4CAF50 !important;
            padding-left: 10px !important;
            background: rgba(76,175,80,0.05) !important;
        }
        .gsf-hidden { display: none !important; }

        .gsf-action {
            display: inline-block; margin-left: 6px; padding: 2px 5px;
            background: #303134; border: 1px solid #5f6368; border-radius: 3px;
            color: #9aa0a6; font-size: 10px; cursor: pointer;
            opacity: 0; transition: opacity 0.15s;
        }
        .g:hover .gsf-action { opacity: 1; }
        .gsf-action:hover { background: #3c4043; color: #8ab4f8; border-color: #8ab4f8; }

        /* Filter Panel */
        .gsf-panel {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 400px; max-height: 70vh; background: #303134;
            border: 1px solid #5f6368; border-radius: 12px;
            box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100001; display: none;
        }
        .gsf-panel.show { display: block; }
        .gsf-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); z-index: 100000; display: none;
        }
        .gsf-overlay.show { display: block; }

        .gsf-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px; background: #202124; border-bottom: 1px solid #5f6368;
        }
        .gsf-title { color: #e8eaed; font-size: 15px; font-weight: 500; }
        .gsf-close { background: none; border: none; color: #9aa0a6; font-size: 20px; cursor: pointer; }

        .gsf-body { padding: 12px; max-height: 45vh; overflow-y: auto; }
        .gsf-section { margin-bottom: 16px; }
        .gsf-label { color: #8ab4f8; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }

        .gsf-site {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 8px; background: #202124; border-radius: 4px; margin-bottom: 4px;
        }
        .gsf-site-name { color: #e8eaed; font-size: 12px; font-family: monospace; }
        .gsf-site-del { background: none; border: none; color: #9aa0a6; cursor: pointer; }
        .gsf-site-del:hover { color: #f44336; }

        .gsf-add { display: flex; gap: 6px; }
        .gsf-input {
            flex: 1; padding: 6px 8px; background: #202124; border: 1px solid #5f6368;
            border-radius: 4px; color: #e8eaed; font-size: 12px;
        }
        .gsf-add-btn {
            padding: 6px 12px; background: #8ab4f8; border: none; border-radius: 4px;
            color: #202124; font-size: 12px; cursor: pointer;
        }
        .gsf-footer {
            padding: 10px 16px; background: #202124; border-top: 1px solid #5f6368;
            display: flex; align-items: center; gap: 8px; font-size: 11px; color: #9aa0a6;
        }
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
  // UI BUILDERS
  // ============================================
  const closeAll = () => document.querySelectorAll('.gl-dropdown.show').forEach(d => d.classList.remove('show'));

  function createDropdown(id, label, items, current, onSelect, searchable = false) {
    const c = document.createElement('div');
    c.className = 'gl-container';

    const isActive = current !== '' && current !== 'all';
    const data = items[current] || items[''] || items['all'];

    const btn = document.createElement('button');
    btn.className = `gl-btn ${isActive ? 'active' : ''}`;
    btn.innerHTML = isActive
      ? `<span>${data.icon || ''}</span><span>${data.name}</span><span class="gl-clear" data-clear>✕</span>`
      : `${data?.icon || '📌'} ${label} ▾`;

    const dd = document.createElement('div');
    dd.className = 'gl-dropdown';

    if (searchable) {
      const s = document.createElement('div');
      s.className = 'gl-search';
      s.innerHTML = `<input type="text" placeholder="Search...">`;
      dd.appendChild(s);
      s.querySelector('input').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        dd.querySelectorAll('.gl-item').forEach(i => i.classList.toggle('hidden', !i.dataset.name.includes(q)));
      });
      s.addEventListener('click', e => e.stopPropagation());
    }

    Object.entries(items).forEach(([k, v]) => {
      const item = document.createElement('div');
      item.className = `gl-item ${current === k ? 'selected' : ''}`;
      item.dataset.key = k;
      item.dataset.name = v.name.toLowerCase();
      item.innerHTML = `<span class="gl-icon">${v.icon || '○'}</span><span>${v.name}</span>`;
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
    overlay.className = 'gsf-overlay';
    overlay.id = 'gsf-overlay';

    const panel = document.createElement('div');
    panel.className = 'gsf-panel';
    panel.id = 'gsf-panel';
    panel.innerHTML = `
            <div class="gsf-header">
                <span class="gsf-title">🔧 Site Filter</span>
                <button class="gsf-close">×</button>
            </div>
            <div class="gsf-body">
                <div class="gsf-section">
                    <div class="gsf-label">🚫 Blocked</div>
                    <div id="gsf-blocked"></div>
                    <div class="gsf-add">
                        <input class="gsf-input" id="gsf-blocked-in" placeholder="domain.com">
                        <button class="gsf-add-btn" id="gsf-blocked-add">+</button>
                    </div>
                </div>
                <div class="gsf-section">
                    <div class="gsf-label">⭐ Boosted</div>
                    <div id="gsf-boosted"></div>
                    <div class="gsf-add">
                        <input class="gsf-input" id="gsf-boosted-in" placeholder="domain.com">
                        <button class="gsf-add-btn" id="gsf-boosted-add">+</button>
                    </div>
                </div>
            </div>
            <div class="gsf-footer">
                <input type="checkbox" id="gsf-hide"> <label for="gsf-hide">Hide blocked completely</label>
            </div>
        `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    panel.querySelector('.gsf-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    panel.querySelector('#gsf-blocked-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gsf-blocked-in');
      if (inp.value.trim()) {
        const b = getBlocked(); b.push(inp.value.trim()); saveBlocked(b);
        saveBoosted(getBoosted().filter(s => s !== inp.value.trim()));
        inp.value = ''; renderPanel(); processResults();
      }
    });

    panel.querySelector('#gsf-boosted-add').addEventListener('click', () => {
      const inp = panel.querySelector('#gsf-boosted-in');
      if (inp.value.trim()) {
        const b = getBoosted(); b.push(inp.value.trim()); saveBoosted(b);
        saveBlocked(getBlocked().filter(s => s !== inp.value.trim()));
        inp.value = ''; renderPanel(); processResults();
      }
    });

    panel.querySelector('#gsf-hide').addEventListener('change', e => {
      saveHideBlocked(e.target.checked);
      processResults();
    });
  }

  function renderPanel() {
    const bl = document.getElementById('gsf-blocked');
    const bo = document.getElementById('gsf-boosted');
    const hide = document.getElementById('gsf-hide');

    bl.innerHTML = getBlocked().map(s => `<div class="gsf-site"><span class="gsf-site-name">${s}</span><button class="gsf-site-del" data-s="${s}" data-t="b">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:11px;">None</div>';
    bo.innerHTML = getBoosted().map(s => `<div class="gsf-site"><span class="gsf-site-name">${s}</span><button class="gsf-site-del" data-s="${s}" data-t="o">×</button></div>`).join('') || '<div style="color:#5f6368;font-size:11px;">None</div>';
    hide.checked = getHideBlocked();

    bl.querySelectorAll('.gsf-site-del').forEach(b => b.addEventListener('click', () => {
      saveBlocked(getBlocked().filter(x => x !== b.dataset.s)); renderPanel(); processResults();
    }));
    bo.querySelectorAll('.gsf-site-del').forEach(b => b.addEventListener('click', () => {
      saveBoosted(getBoosted().filter(x => x !== b.dataset.s)); renderPanel(); processResults();
    }));
  }

  const openPanel = () => { renderPanel(); document.getElementById('gsf-overlay').classList.add('show'); document.getElementById('gsf-panel').classList.add('show'); };
  const closePanel = () => { document.getElementById('gsf-overlay').classList.remove('show'); document.getElementById('gsf-panel').classList.remove('show'); };

  // ============================================
  // PROCESS SEARCH RESULTS
  // ============================================
  function processResults() {
    const hide = getHideBlocked();
    const blocked = getBlocked();
    const boosted = getBoosted();

    // Target only actual search result items (must have cite element = actual result)
    // This avoids blocking AI Overview, Knowledge Panel, and other Google features
    document.querySelectorAll('#search .g, #rso .g, .MjjYud').forEach(r => {
      // Skip if already processed
      if (r.dataset.gsfDone === 'true') return;

      // MUST have a cite element - this indicates it's an actual search result
      const cite = r.querySelector('cite');
      if (!cite) return;

      // Skip if inside AI Overview or special Google features
      if (r.closest('[data-attrid="wa:/description"]') ||  // AI Overview
        r.closest('.kp-wholepage') ||                     // Knowledge Panel
        r.closest('.ULSxyf') ||                           // AI Mode container
        r.closest('.M8OgIe') ||                           // Featured snippet wrapper
        r.closest('.related-question-pair')) {            // People also ask
        return;
      }

      // Find the main link (first http link)
      const mainLink = r.querySelector('a[href^="http"]');
      if (!mainLink) return;

      const d = extractDomain(mainLink.href);
      if (!d) return;

      const isBlockedResult = blocked.some(s => matchDomain(d, s));
      const isBoostedResult = boosted.some(s => matchDomain(d, s));

      if (!isBlockedResult && !isBoostedResult) return;

      r.dataset.gsfDone = 'true';
      r.classList.remove('gsf-blocked', 'gsf-boosted', 'gsf-hidden');

      if (isBlockedResult) {
        if (hide) {
          r.style.display = 'none';
          r.classList.add('gsf-hidden');
        } else {
          r.style.display = '';
          r.classList.add('gsf-blocked');
        }
      } else if (isBoostedResult) {
        r.style.display = '';
        r.classList.add('gsf-boosted');
      }

      // Quick action button
      if (cite && !cite.querySelector('.gsf-action')) {
        const domain = d; // Store domain for closure
        const btn = document.createElement('span');
        btn.className = 'gsf-action';
        btn.textContent = '⚙';
        btn.title = 'Block/Boost';
        btn.addEventListener('click', ev => {
          ev.preventDefault(); ev.stopPropagation();
          const action = prompt(`Domain: ${domain}\n\nType 'b' to block, 'o' to boost, 'r' to remove:`);
          if (action === 'b') { const bl = getBlocked(); bl.push(domain); saveBlocked(bl); saveBoosted(getBoosted().filter(x => x !== domain)); }
          else if (action === 'o') { const bo = getBoosted(); bo.push(domain); saveBoosted(bo); saveBlocked(getBlocked().filter(x => x !== domain)); }
          else if (action === 'r') { saveBlocked(getBlocked().filter(x => x !== domain)); saveBoosted(getBoosted().filter(x => x !== domain)); }
          // Reset all processed flags and reprocess
          document.querySelectorAll('[data-gsf-done]').forEach(el => el.dataset.gsfDone = '');
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
    if (document.querySelector('.gl-wrapper')) return;

    const nav = document.querySelector('div[role="navigation"] > div:first-child') ||
      document.querySelector('.crJ18e') || document.querySelector('.IUOThf');
    if (!nav) { setTimeout(inject, 500); return; }

    const lens = detectLens(), region = getRegion(), ft = getFiletype();

    const wrapper = document.createElement('div');
    wrapper.className = 'gl-wrapper';

    // Lenses
    wrapper.appendChild(createDropdown('lens', 'Lenses', LENSES, lens, k => {
      navigate(buildQuery(cleanQuery(getQuery()), k, getFiletype()));
    }));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gl-divider' }));

    // Region
    wrapper.appendChild(createDropdown('region', 'Region', REGIONS, region, k => {
      const url = new URL(window.location.href);
      k === '' ? url.searchParams.delete('cr') : url.searchParams.set('cr', k);
      window.location.href = url.toString();
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gl-divider' }));

    // Filetype
    wrapper.appendChild(createDropdown('ft', 'Filetype', FILETYPES, ft, k => {
      navigate(buildQuery(cleanQuery(getQuery()), detectLens(), k));
    }, true));

    wrapper.appendChild(Object.assign(document.createElement('div'), { className: 'gl-divider' }));

    // Filter button
    const filterBtn = document.createElement('button');
    filterBtn.className = 'gl-btn';
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
    if (!document.querySelector('.gl-wrapper')) setTimeout(inject, 100);
    processResults();
  }).observe(document.body, { childList: true, subtree: true });
})();
