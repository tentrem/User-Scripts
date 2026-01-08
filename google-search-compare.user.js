// ==UserScript==
// @name         Google Search Compare
// @version      1.0.0
// @description  Keyboard shortcuts to compare Google search results with other search engines
// @author       tentremvibe
// @match        https://www.google.com/search*
// @match        https://www.google.co.id/search*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ============================================
  // SEARCH ENGINES CONFIG
  // ============================================
  const ENGINES = {
    'g': { name: 'DuckDuckGo', key: 'G', url: 'https://duckduckgo.com/?q=' },
    'k': { name: 'Kagi', key: 'K', url: 'https://kagi.com/search?q=' },
    'p': { name: 'Perplexity', key: 'P', url: 'https://www.perplexity.ai/search?q=' }
  };

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
        .gsc-hint {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #303134;
            border: 1px solid #5f6368;
            border-radius: 8px;
            padding: 12px 16px;
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 13px;
            color: #e8eaed;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
            pointer-events: none;
        }

        .gsc-hint.show {
            opacity: 1;
            transform: translateY(0);
        }

        .gsc-hint-title {
            color: #8ab4f8;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .gsc-hint-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .gsc-hint-key {
            display: inline-block;
            padding: 2px 6px;
            background: #202124;
            border: 1px solid #5f6368;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 11px;
            color: #bdc1c6;
        }

        .gsc-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: #303134;
            border: 1px solid #8ab4f8;
            border-radius: 12px;
            padding: 20px 32px;
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 16px;
            color: #e8eaed;
            z-index: 100000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            opacity: 0;
            transition: all 0.2s ease;
            pointer-events: none;
            text-align: center;
        }

        .gsc-toast.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .gsc-toast-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }
    `);

  // ============================================
  // FUNCTIONS
  // ============================================
  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function showToast(engine) {
    let toast = document.getElementById('gsc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gsc-toast';
      toast.className = 'gsc-toast';
      document.body.appendChild(toast);
    }

    const icons = {
      'g': '🦆',
      'k': '🟡',
      'p': '🔮'
    };

    toast.innerHTML = `
            <div class="gsc-toast-icon">${icons[engine] || '🔍'}</div>
            <div>Opening in <strong>${ENGINES[engine].name}</strong>...</div>
        `;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 800);
  }

  function openInEngine(engineKey) {
    const engine = ENGINES[engineKey];
    if (!engine) return;

    const query = getQuery();
    if (!query) return;

    showToast(engineKey);
    setTimeout(() => {
      window.open(engine.url + encodeURIComponent(query), '_blank');
    }, 300);
  }

  // ============================================
  // KEYBOARD HANDLER
  // ============================================
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.matches('input, textarea, [contenteditable]')) return;

    // Alt + Key combinations
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      const key = e.key.toLowerCase();
      if (ENGINES[key]) {
        e.preventDefault();
        openInEngine(key);
      }
    }

    // Show/hide hint on Alt key
    if (e.key === 'Alt') {
      showHint();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      hideHint();
    }
  });

  // ============================================
  // HINT UI
  // ============================================
  let hint = null;

  function createHint() {
    hint = document.createElement('div');
    hint.className = 'gsc-hint';
    hint.innerHTML = `
            <div class="gsc-hint-title">⌨️ Compare with:</div>
            ${Object.entries(ENGINES).map(([key, engine]) => `
                <div class="gsc-hint-item">
                    <span class="gsc-hint-key">Alt+${engine.key}</span>
                    <span>${engine.name}</span>
                </div>
            `).join('')}
        `;
    document.body.appendChild(hint);
  }

  function showHint() {
    if (!hint) createHint();
    hint.classList.add('show');
  }

  function hideHint() {
    if (hint) hint.classList.remove('show');
  }

  // ============================================
  // INIT
  // ============================================
  console.log('[Google Search Compare] Loaded. Press Alt to see shortcuts.');
})();
