// ==UserScript==
// @name         Google Dorking Toolkit
// @version      1.1.0
// @description  Advanced Google Dorking tools: Quick operators, Security templates, Dork builder, Saved dorks library
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
  // SECURITY DORK TEMPLATES
  // ============================================
  const DORK_TEMPLATES = {
    recon: {
      name: '🔍 Recon',
      dorks: [
        { name: 'Subdomains', query: 'site:*.{domain}', desc: 'Find subdomains' },
        { name: 'Directory Listing', query: 'site:{domain} intitle:"index of /"', desc: 'Find exposed directories' },
        { name: 'Related Sites', query: 'related:{domain}', desc: 'Find similar sites' },
        { name: 'Cached Version', query: 'cache:{domain}', desc: 'View cached version' },
        { name: 'All Documents', query: 'site:{domain} filetype:pdf OR filetype:doc OR filetype:xls', desc: 'Find documents' }
      ]
    },
    admin: {
      name: '🔐 Login/Admin',
      dorks: [
        { name: 'Login Pages', query: 'site:{domain} inurl:login OR inurl:signin OR inurl:auth', desc: 'Find login pages' },
        { name: 'Admin Panels', query: 'site:{domain} inurl:admin OR inurl:administrator OR inurl:cpanel', desc: 'Find admin panels' },
        { name: 'Dashboard', query: 'site:{domain} inurl:dashboard OR inurl:portal', desc: 'Find dashboards' },
        { name: 'Password Reset', query: 'site:{domain} inurl:reset OR inurl:forgot', desc: 'Find password reset pages' }
      ]
    },
    files: {
      name: '📁 Files',
      dorks: [
        { name: 'Config Files', query: 'site:{domain} filetype:env OR filetype:ini OR filetype:conf', desc: 'Find config files' },
        { name: 'Backup Files', query: 'site:{domain} filetype:bak OR filetype:old OR filetype:backup', desc: 'Find backups' },
        { name: 'Log Files', query: 'site:{domain} filetype:log', desc: 'Find log files' },
        { name: 'SQL Dumps', query: 'site:{domain} filetype:sql', desc: 'Find SQL dumps' },
        { name: 'Git Exposed', query: 'site:{domain} inurl:.git', desc: 'Find exposed git repos' }
      ]
    },
    errors: {
      name: '⚠️ Errors',
      dorks: [
        { name: 'PHP Errors', query: 'site:{domain} "PHP Parse error" OR "PHP Warning"', desc: 'Find PHP errors' },
        { name: 'SQL Errors', query: 'site:{domain} "MySQL error" OR "SQL syntax"', desc: 'Find SQL errors' },
        { name: 'Stack Traces', query: 'site:{domain} "Exception" OR "Traceback"', desc: 'Find stack traces' }
      ]
    },
    secrets: {
      name: '🔑 Secrets',
      dorks: [
        { name: 'Password Files', query: 'site:{domain} filetype:txt "password"', desc: 'Find password files' },
        { name: 'API Keys', query: 'site:{domain} "api_key" OR "apikey"', desc: 'Find API keys' },
        { name: 'AWS Keys', query: 'site:{domain} "AKIA" OR "aws_access_key"', desc: 'Find AWS credentials' }
      ]
    },
    osint: {
      name: '🕵️ OSINT',
      dorks: [
        { name: 'LinkedIn Employees', query: 'site:linkedin.com "{domain}"', desc: 'Find employees' },
        { name: 'GitHub Code', query: 'site:github.com "{domain}"', desc: 'Find code on GitHub' },
        { name: 'Pastebin Leaks', query: 'site:pastebin.com "{domain}"', desc: 'Find leaks' }
      ]
    }
  };

  // ============================================
  // QUICK OPERATORS
  // ============================================
  const OPERATORS = [
    { op: 'site:', placeholder: 'domain.com' },
    { op: 'inurl:', placeholder: 'admin' },
    { op: 'intitle:', placeholder: 'login' },
    { op: 'intext:', placeholder: 'password' },
    { op: 'filetype:', placeholder: 'pdf' },
    { op: 'before:', placeholder: '2024-01-01' },
    { op: 'after:', placeholder: '2024-01-01' },
    { op: '-', placeholder: 'exclude' }
  ];

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
        /* Container in nav bar */
        .gd-container {
            display: inline-flex;
            align-items: center;
            position: relative;
            margin-right: 8px;
        }

        .gd-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            color: #bdc1c6;
            background: transparent;
            border: none;
            border-radius: 18px;
            cursor: pointer;
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 14px;
            line-height: 20px;
            white-space: nowrap;
            transition: all 0.2s;
        }

        .gd-btn:hover { background: rgba(138,180,248,0.08); }
        .gd-btn.active { color: #8ab4f8; background: rgba(138,180,248,0.1); }

        /* Main Panel */
        .gd-panel {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            width: 420px;
            background: #303134;
            border: 1px solid #5f6368;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 99999;
            display: none;
            overflow: hidden;
        }

        .gd-panel.show { display: block; }

        /* Panel Header */
        .gd-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #202124;
            border-bottom: 1px solid #5f6368;
        }

        .gd-panel-title {
            color: #8ab4f8;
            font-size: 14px;
            font-weight: 500;
        }

        .gd-panel-close {
            background: none;
            border: none;
            color: #9aa0a6;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
        }

        .gd-panel-close:hover { color: #e8eaed; }

        /* Tabs */
        .gd-tabs {
            display: flex;
            gap: 4px;
            padding: 8px 12px;
            background: #202124;
            border-bottom: 1px solid #3c4043;
            flex-wrap: wrap;
        }

        .gd-tab {
            padding: 4px 10px;
            background: transparent;
            border: 1px solid #5f6368;
            border-radius: 12px;
            color: #9aa0a6;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.15s;
        }

        .gd-tab:hover, .gd-tab.active {
            background: rgba(138,180,248,0.15);
            border-color: #8ab4f8;
            color: #8ab4f8;
        }

        /* Quick Operators */
        .gd-operators {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            padding: 10px 12px;
            background: #252527;
            border-bottom: 1px solid #3c4043;
        }

        .gd-op-btn {
            padding: 4px 8px;
            background: #303134;
            color: #bdc1c6;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 11px;
            font-family: 'Roboto Mono', monospace;
            cursor: pointer;
            transition: all 0.15s;
        }

        .gd-op-btn:hover {
            background: #3c4043;
            border-color: #8ab4f8;
            color: #8ab4f8;
        }

        /* Dork Items */
        .gd-dorks {
            max-height: 280px;
            overflow-y: auto;
        }

        .gd-dork-item {
            display: flex;
            flex-direction: column;
            padding: 10px 14px;
            cursor: pointer;
            transition: background 0.1s;
            border-bottom: 1px solid #3c4043;
        }

        .gd-dork-item:hover { background: rgba(138,180,248,0.08); }
        .gd-dork-item:last-child { border-bottom: none; }

        .gd-dork-name {
            color: #e8eaed;
            font-size: 13px;
            font-weight: 500;
        }

        .gd-dork-query {
            color: #8ab4f8;
            font-size: 11px;
            font-family: 'Roboto Mono', monospace;
            margin-top: 3px;
            word-break: break-all;
        }

        /* Panel Actions */
        .gd-actions {
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #202124;
            border-top: 1px solid #5f6368;
        }

        .gd-action-btn {
            flex: 1;
            padding: 8px 12px;
            background: #303134;
            border: 1px solid #5f6368;
            border-radius: 6px;
            color: #e8eaed;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.15s;
        }

        .gd-action-btn:hover {
            background: #3c4043;
            border-color: #8ab4f8;
        }

        .gd-action-btn.primary {
            background: #8ab4f8;
            color: #202124;
            border-color: #8ab4f8;
        }

        .gd-action-btn.primary:hover {
            background: #aecbfa;
        }

        /* Modal Overlay */
        .gd-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 100000;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .gd-modal-overlay.show { display: flex; }

        .gd-modal {
            width: 90%;
            max-width: 500px;
            background: #303134;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }

        .gd-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background: #202124;
            border-bottom: 1px solid #5f6368;
        }

        .gd-modal-title {
            color: #e8eaed;
            font-size: 16px;
            font-weight: 500;
        }

        .gd-modal-close {
            background: none;
            border: none;
            color: #9aa0a6;
            font-size: 22px;
            cursor: pointer;
        }

        .gd-modal-close:hover { color: #e8eaed; }

        .gd-modal-body {
            padding: 16px;
            max-height: 50vh;
            overflow-y: auto;
        }

        .gd-modal-footer {
            display: flex;
            gap: 8px;
            padding: 14px 18px;
            background: #202124;
            border-top: 1px solid #5f6368;
            justify-content: flex-end;
        }

        /* Form */
        .gd-form-group {
            margin-bottom: 14px;
        }

        .gd-form-label {
            display: block;
            color: #9aa0a6;
            font-size: 11px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .gd-form-input {
            width: 100%;
            padding: 9px 11px;
            background: #202124;
            border: 1px solid #5f6368;
            border-radius: 4px;
            color: #e8eaed;
            font-size: 13px;
            box-sizing: border-box;
        }

        .gd-form-input:focus {
            outline: none;
            border-color: #8ab4f8;
        }

        .gd-form-row {
            display: flex;
            gap: 10px;
        }

        .gd-form-row .gd-form-group { flex: 1; }

        .gd-preview {
            padding: 10px;
            background: #202124;
            border: 1px solid #5f6368;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            color: #8ab4f8;
            word-break: break-all;
            min-height: 36px;
        }

        /* Saved Dorks */
        .gd-saved-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #202124;
            border-radius: 6px;
            margin-bottom: 8px;
        }

        .gd-saved-info { flex: 1; min-width: 0; }

        .gd-saved-name {
            color: #e8eaed;
            font-size: 13px;
            font-weight: 500;
        }

        .gd-saved-query {
            color: #9aa0a6;
            font-size: 11px;
            font-family: monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 2px;
        }

        .gd-saved-actions {
            display: flex;
            gap: 4px;
            margin-left: 10px;
        }

        .gd-saved-actions button {
            padding: 5px 8px;
            background: #303134;
            border: none;
            border-radius: 4px;
            color: #bdc1c6;
            font-size: 11px;
            cursor: pointer;
        }

        .gd-saved-actions button:hover {
            background: #3c4043;
            color: #8ab4f8;
        }

        .gd-empty {
            text-align: center;
            padding: 24px;
            color: #5f6368;
            font-size: 13px;
        }

        /* Scrollbar */
        .gd-dorks::-webkit-scrollbar,
        .gd-modal-body::-webkit-scrollbar {
            width: 6px;
        }

        .gd-dorks::-webkit-scrollbar-track,
        .gd-modal-body::-webkit-scrollbar-track {
            background: #202124;
        }

        .gd-dorks::-webkit-scrollbar-thumb,
        .gd-modal-body::-webkit-scrollbar-thumb {
            background: #5f6368;
            border-radius: 3px;
        }
    `);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function getSearchInput() {
    return document.querySelector('textarea[name="q"], input[name="q"]');
  }

  function getQuery() {
    const input = getSearchInput();
    return input ? input.value : '';
  }

  function setQuery(query) {
    const input = getSearchInput();
    if (input) {
      input.value = query;
      input.focus();
    }
  }

  function appendToQuery(text) {
    const current = getQuery();
    setQuery(current ? `${current} ${text}` : text);
  }

  function executeSearch(query) {
    setQuery(query);
    const form = document.querySelector('form[role="search"], form[action="/search"]');
    if (form) form.submit();
  }

  function getSavedDorks() {
    try { return JSON.parse(GM_getValue('savedDorks', '[]')); }
    catch { return []; }
  }

  function saveDorks(dorks) {
    GM_setValue('savedDorks', JSON.stringify(dorks));
  }

  function addSavedDork(name, query) {
    const dorks = getSavedDorks();
    dorks.push({ id: Date.now(), name, query });
    saveDorks(dorks);
  }

  function deleteSavedDork(id) {
    saveDorks(getSavedDorks().filter(d => d.id !== id));
  }

  // ============================================
  // BUILD MAIN UI
  // ============================================
  function buildUI() {
    // Main container
    const container = document.createElement('div');
    container.className = 'gd-container';
    container.id = 'gd-dorking';

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'gd-btn';
    toggleBtn.innerHTML = '🔍 Dorking ▾';

    // Panel
    const panel = document.createElement('div');
    panel.className = 'gd-panel';

    // Panel Header
    panel.innerHTML = `
            <div class="gd-panel-header">
                <span class="gd-panel-title">🔍 Google Dorking Toolkit</span>
                <button class="gd-panel-close">×</button>
            </div>
        `;

    // Quick Operators
    const opsBar = document.createElement('div');
    opsBar.className = 'gd-operators';
    OPERATORS.forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'gd-op-btn';
      btn.textContent = op.op;
      btn.addEventListener('click', () => {
        if (op.op === '-') {
          const term = prompt('Exclude term:', op.placeholder);
          if (term) appendToQuery(`-${term}`);
        } else {
          const value = prompt(`Enter value for ${op.op}`, op.placeholder);
          if (value) appendToQuery(`${op.op}${value}`);
        }
      });
      opsBar.appendChild(btn);
    });
    panel.appendChild(opsBar);

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'gd-tabs';
    let activeCategory = Object.keys(DORK_TEMPLATES)[0];

    Object.entries(DORK_TEMPLATES).forEach(([key, cat]) => {
      const tab = document.createElement('button');
      tab.className = `gd-tab ${key === activeCategory ? 'active' : ''}`;
      tab.textContent = cat.name;
      tab.dataset.category = key;
      tabs.appendChild(tab);
    });
    panel.appendChild(tabs);

    // Dorks list
    const dorksContainer = document.createElement('div');
    dorksContainer.className = 'gd-dorks';
    panel.appendChild(dorksContainer);

    function renderDorks() {
      const cat = DORK_TEMPLATES[activeCategory];
      dorksContainer.innerHTML = cat.dorks.map(dork => `
                <div class="gd-dork-item" data-query="${dork.query}">
                    <span class="gd-dork-name">${dork.name}</span>
                    <span class="gd-dork-query">${dork.query}</span>
                </div>
            `).join('');

      dorksContainer.querySelectorAll('.gd-dork-item').forEach(item => {
        item.addEventListener('click', () => {
          let query = item.dataset.query;
          if (query.includes('{domain}')) {
            const domain = prompt('Enter target domain:', 'example.com');
            if (!domain) return;
            query = query.replace(/\{domain\}/g, domain);
          }
          executeSearch(query);
          panel.classList.remove('show');
        });
      });
    }

    tabs.addEventListener('click', (e) => {
      if (e.target.classList.contains('gd-tab')) {
        tabs.querySelectorAll('.gd-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.category;
        renderDorks();
      }
    });

    renderDorks();

    // Actions
    const actions = document.createElement('div');
    actions.className = 'gd-actions';
    actions.innerHTML = `
            <button class="gd-action-btn" id="gd-btn-builder">🛠️ Builder</button>
            <button class="gd-action-btn" id="gd-btn-saved">📚 Saved</button>
        `;
    panel.appendChild(actions);

    // Event listeners
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
    });

    panel.querySelector('.gd-panel-close').addEventListener('click', () => {
      panel.classList.remove('show');
    });

    panel.addEventListener('click', (e) => e.stopPropagation());

    container.appendChild(toggleBtn);
    container.appendChild(panel);

    return container;
  }

  // ============================================
  // BUILDER MODAL
  // ============================================
  function createBuilderModal() {
    const overlay = document.createElement('div');
    overlay.className = 'gd-modal-overlay';
    overlay.id = 'gd-builder-modal';

    overlay.innerHTML = `
            <div class="gd-modal">
                <div class="gd-modal-header">
                    <span class="gd-modal-title">🛠️ Dork Builder</span>
                    <button class="gd-modal-close">×</button>
                </div>
                <div class="gd-modal-body">
                    <div class="gd-form-group">
                        <label class="gd-form-label">Target Domain</label>
                        <input type="text" class="gd-form-input" id="gd-b-domain" placeholder="example.com">
                    </div>
                    <div class="gd-form-row">
                        <div class="gd-form-group">
                            <label class="gd-form-label">inurl:</label>
                            <input type="text" class="gd-form-input" id="gd-b-inurl" placeholder="admin">
                        </div>
                        <div class="gd-form-group">
                            <label class="gd-form-label">intitle:</label>
                            <input type="text" class="gd-form-input" id="gd-b-intitle" placeholder="login">
                        </div>
                    </div>
                    <div class="gd-form-row">
                        <div class="gd-form-group">
                            <label class="gd-form-label">intext:</label>
                            <input type="text" class="gd-form-input" id="gd-b-intext" placeholder="password">
                        </div>
                        <div class="gd-form-group">
                            <label class="gd-form-label">filetype:</label>
                            <input type="text" class="gd-form-input" id="gd-b-filetype" placeholder="pdf">
                        </div>
                    </div>
                    <div class="gd-form-group">
                        <label class="gd-form-label">Exclude (comma separated)</label>
                        <input type="text" class="gd-form-input" id="gd-b-exclude" placeholder="pinterest, medium">
                    </div>
                    <div class="gd-form-group">
                        <label class="gd-form-label">Preview</label>
                        <div class="gd-preview" id="gd-b-preview">Build your dork...</div>
                    </div>
                </div>
                <div class="gd-modal-footer">
                    <button class="gd-action-btn" id="gd-b-save">💾 Save</button>
                    <button class="gd-action-btn primary" id="gd-b-search">🔍 Search</button>
                </div>
            </div>
        `;

    function updatePreview() {
      const parts = [];
      const domain = overlay.querySelector('#gd-b-domain').value.trim();
      if (domain) parts.push(`site:${domain}`);

      ['inurl', 'intitle', 'intext', 'filetype'].forEach(field => {
        const val = overlay.querySelector(`#gd-b-${field}`).value.trim();
        if (val) parts.push(`${field}:${val}`);
      });

      const exclude = overlay.querySelector('#gd-b-exclude').value.trim();
      if (exclude) {
        exclude.split(',').forEach(t => {
          if (t.trim()) parts.push(`-${t.trim()}`);
        });
      }

      const query = parts.join(' ');
      overlay.querySelector('#gd-b-preview').textContent = query || 'Build your dork...';
      return query;
    }

    overlay.querySelectorAll('.gd-form-input').forEach(input => {
      input.addEventListener('input', updatePreview);
    });

    overlay.querySelector('.gd-modal-close').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    overlay.querySelector('#gd-b-save').addEventListener('click', () => {
      const query = updatePreview();
      if (!query) return alert('Build a query first!');
      const name = prompt('Name for this dork:');
      if (name) {
        addSavedDork(name, query);
        alert('Saved!');
      }
    });

    overlay.querySelector('#gd-b-search').addEventListener('click', () => {
      const query = updatePreview();
      if (query) {
        executeSearch(query);
        overlay.classList.remove('show');
      }
    });

    return overlay;
  }

  // ============================================
  // SAVED DORKS MODAL
  // ============================================
  function createSavedModal() {
    const overlay = document.createElement('div');
    overlay.className = 'gd-modal-overlay';
    overlay.id = 'gd-saved-modal';

    overlay.innerHTML = `
            <div class="gd-modal">
                <div class="gd-modal-header">
                    <span class="gd-modal-title">📚 Saved Dorks</span>
                    <button class="gd-modal-close">×</button>
                </div>
                <div class="gd-modal-body" id="gd-saved-list"></div>
                <div class="gd-modal-footer">
                    <button class="gd-action-btn" id="gd-s-export">📤 Export</button>
                    <button class="gd-action-btn" id="gd-s-import">📥 Import</button>
                </div>
            </div>
        `;

    function render() {
      const list = overlay.querySelector('#gd-saved-list');
      const dorks = getSavedDorks();

      if (!dorks.length) {
        list.innerHTML = '<div class="gd-empty">No saved dorks yet</div>';
        return;
      }

      list.innerHTML = dorks.map(d => `
                <div class="gd-saved-item" data-id="${d.id}">
                    <div class="gd-saved-info">
                        <div class="gd-saved-name">${d.name}</div>
                        <div class="gd-saved-query">${d.query}</div>
                    </div>
                    <div class="gd-saved-actions">
                        <button data-action="use">Use</button>
                        <button data-action="delete">🗑️</button>
                    </div>
                </div>
            `).join('');

      list.querySelectorAll('.gd-saved-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        const dork = dorks.find(d => d.id === id);

        item.querySelector('[data-action="use"]').addEventListener('click', () => {
          executeSearch(dork.query);
          overlay.classList.remove('show');
        });

        item.querySelector('[data-action="delete"]').addEventListener('click', () => {
          if (confirm(`Delete "${dork.name}"?`)) {
            deleteSavedDork(id);
            render();
          }
        });
      });
    }

    overlay.querySelector('.gd-modal-close').addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    overlay.querySelector('#gd-s-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(getSavedDorks(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'saved-dorks.json';
      a.click();
    });

    overlay.querySelector('#gd-s-import').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const imported = JSON.parse(ev.target.result);
            const merged = [...getSavedDorks(), ...imported.map(d => ({ ...d, id: Date.now() + Math.random() }))];
            saveDorks(merged);
            render();
            alert(`Imported ${imported.length} dorks!`);
          } catch { alert('Invalid file'); }
        };
        reader.readAsText(file);
      });
      input.click();
    });

    overlay.renderList = render;
    return overlay;
  }

  // ============================================
  // INJECTION
  // ============================================
  function inject() {
    if (document.getElementById('gd-dorking')) return;

    // Find nav bar (same as Lenses script)
    const navBar = document.querySelector('div[role="navigation"] > div:first-child') ||
      document.querySelector('.crJ18e') ||
      document.querySelector('.IUOThf');

    if (!navBar) {
      setTimeout(inject, 500);
      return;
    }

    // Build and inject UI
    const mainUI = buildUI();
    const builderModal = createBuilderModal();
    const savedModal = createSavedModal();

    // Insert after existing wrappers or at beginning
    const existingWrapper = navBar.querySelector('.gl-wrapper');
    if (existingWrapper) {
      existingWrapper.after(mainUI);
    } else {
      navBar.insertBefore(mainUI, navBar.firstChild);
    }

    document.body.appendChild(builderModal);
    document.body.appendChild(savedModal);

    // Connect action buttons
    document.getElementById('gd-btn-builder').addEventListener('click', () => {
      document.querySelector('.gd-panel').classList.remove('show');
      builderModal.classList.add('show');
    });

    document.getElementById('gd-btn-saved').addEventListener('click', () => {
      document.querySelector('.gd-panel').classList.remove('show');
      savedModal.renderList();
      savedModal.classList.add('show');
    });

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gd-container')) {
        document.querySelector('.gd-panel')?.classList.remove('show');
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  setTimeout(inject, 300);

  new MutationObserver(() => {
    if (!document.getElementById('gd-dorking')) {
      setTimeout(inject, 100);
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
