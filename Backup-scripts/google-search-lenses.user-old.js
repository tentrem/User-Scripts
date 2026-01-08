// ==UserScript==
// @name         Google Search Lenses + Region
// @version      1.4.0
// @description  Add Kagi-style search lenses and region filter to Google Search
// @author       tentremvibe
// @match        https://www.google.com/search*
// @match        https://www.google.co.id/search*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ============================================
  // LENS CONFIGURATION
  // ============================================
  const LENSES = {
    all: { name: 'All', icon: '', sites: [], filetype: null },
    forums: {
      name: 'Forums', icon: '💬',
      sites: ['reddit.com', 'stackoverflow.com', 'stackexchange.com', 'news.ycombinator.com', 'discourse.org'],
      filetype: null
    },
    academic: {
      name: 'Academic', icon: '🎓',
      sites: ['*.edu', 'scholar.google.com', 'arxiv.org', 'researchgate.net', 'academia.edu', 'sciencedirect.com', 'springer.com', 'ieee.org', 'acm.org', 'jstor.org', 'nature.com', 'ncbi.nlm.nih.gov'],
      filetype: null
    },
    cybersecurity: {
      name: 'Security', icon: '🔐',
      sites: ['cve.mitre.org', 'nvd.nist.gov', 'attack.mitre.org', 'cisa.gov', 'exploit-db.com', 'securityweek.com', 'bleepingcomputer.com', 'thehackernews.com', 'krebsonsecurity.com', 'darkreading.com', 'virustotal.com', 'any.run', 'hybrid-analysis.com', 'shodan.io', 'elastic.co/security-labs', 'crowdstrike.com/blog', 'sentinelone.com/labs', 'mandiant.com', 'talosintelligence.com'],
      filetype: null
    },
    programming: {
      name: 'Code', icon: '💻',
      sites: ['github.com', 'gitlab.com', 'stackoverflow.com', 'docs.python.org', 'docs.microsoft.com', 'developer.mozilla.org', 'devdocs.io', 'geeksforgeeks.org', 'dev.to', 'npmjs.com', 'pypi.org'],
      filetype: null
    },
    pdfs: { name: 'PDFs', icon: '📄', sites: [], filetype: 'pdf' }
  };

  // ============================================
  // FULL REGION LIST (Google cr= parameter)
  // ============================================
  const REGIONS = {
    '': { name: 'Any Region', icon: '🌍' },
    // Popular (top)
    'countryID': { name: 'Indonesia', icon: '🇮🇩' },
    'countryUS': { name: 'United States', icon: '🇺🇸' },
    'countryGB': { name: 'United Kingdom', icon: '🇬🇧' },
    'countrySG': { name: 'Singapore', icon: '🇸🇬' },
    'countryMY': { name: 'Malaysia', icon: '🇲🇾' },
    'countryAU': { name: 'Australia', icon: '🇦🇺' },
    'countryJP': { name: 'Japan', icon: '🇯🇵' },
    // A
    'countryAF': { name: 'Afghanistan', icon: '🇦🇫' },
    'countryAL': { name: 'Albania', icon: '🇦🇱' },
    'countryDZ': { name: 'Algeria', icon: '🇩🇿' },
    'countryAS': { name: 'American Samoa', icon: '🇦🇸' },
    'countryAD': { name: 'Andorra', icon: '🇦🇩' },
    'countryAO': { name: 'Angola', icon: '🇦🇴' },
    'countryAI': { name: 'Anguilla', icon: '🇦🇮' },
    'countryAQ': { name: 'Antarctica', icon: '🇦🇶' },
    'countryAG': { name: 'Antigua and Barbuda', icon: '🇦🇬' },
    'countryAR': { name: 'Argentina', icon: '🇦🇷' },
    'countryAM': { name: 'Armenia', icon: '🇦🇲' },
    'countryAW': { name: 'Aruba', icon: '🇦🇼' },
    'countryAT': { name: 'Austria', icon: '🇦🇹' },
    'countryAZ': { name: 'Azerbaijan', icon: '🇦🇿' },
    // B
    'countryBS': { name: 'Bahamas', icon: '🇧🇸' },
    'countryBH': { name: 'Bahrain', icon: '🇧🇭' },
    'countryBD': { name: 'Bangladesh', icon: '🇧🇩' },
    'countryBB': { name: 'Barbados', icon: '🇧🇧' },
    'countryBY': { name: 'Belarus', icon: '🇧🇾' },
    'countryBE': { name: 'Belgium', icon: '🇧🇪' },
    'countryBZ': { name: 'Belize', icon: '🇧🇿' },
    'countryBJ': { name: 'Benin', icon: '🇧🇯' },
    'countryBM': { name: 'Bermuda', icon: '🇧🇲' },
    'countryBT': { name: 'Bhutan', icon: '🇧🇹' },
    'countryBO': { name: 'Bolivia', icon: '🇧🇴' },
    'countryBA': { name: 'Bosnia and Herzegovina', icon: '🇧🇦' },
    'countryBW': { name: 'Botswana', icon: '🇧🇼' },
    'countryBR': { name: 'Brazil', icon: '🇧🇷' },
    'countryBN': { name: 'Brunei', icon: '🇧🇳' },
    'countryBG': { name: 'Bulgaria', icon: '🇧🇬' },
    'countryBF': { name: 'Burkina Faso', icon: '🇧🇫' },
    'countryBI': { name: 'Burundi', icon: '🇧🇮' },
    // C
    'countryKH': { name: 'Cambodia', icon: '🇰🇭' },
    'countryCM': { name: 'Cameroon', icon: '🇨🇲' },
    'countryCA': { name: 'Canada', icon: '🇨🇦' },
    'countryCV': { name: 'Cape Verde', icon: '🇨🇻' },
    'countryKY': { name: 'Cayman Islands', icon: '🇰🇾' },
    'countryCF': { name: 'Central African Republic', icon: '🇨🇫' },
    'countryTD': { name: 'Chad', icon: '🇹🇩' },
    'countryCL': { name: 'Chile', icon: '🇨🇱' },
    'countryCN': { name: 'China', icon: '🇨🇳' },
    'countryCO': { name: 'Colombia', icon: '🇨🇴' },
    'countryKM': { name: 'Comoros', icon: '🇰🇲' },
    'countryCG': { name: 'Congo', icon: '🇨🇬' },
    'countryCD': { name: 'Congo (DRC)', icon: '🇨🇩' },
    'countryCK': { name: 'Cook Islands', icon: '🇨🇰' },
    'countryCR': { name: 'Costa Rica', icon: '🇨🇷' },
    'countryCI': { name: 'Côte d\'Ivoire', icon: '🇨🇮' },
    'countryHR': { name: 'Croatia', icon: '🇭🇷' },
    'countryCU': { name: 'Cuba', icon: '🇨🇺' },
    'countryCY': { name: 'Cyprus', icon: '🇨🇾' },
    'countryCZ': { name: 'Czech Republic', icon: '🇨🇿' },
    // D
    'countryDK': { name: 'Denmark', icon: '🇩🇰' },
    'countryDJ': { name: 'Djibouti', icon: '🇩🇯' },
    'countryDM': { name: 'Dominica', icon: '🇩🇲' },
    'countryDO': { name: 'Dominican Republic', icon: '🇩🇴' },
    // E
    'countryEC': { name: 'Ecuador', icon: '🇪🇨' },
    'countryEG': { name: 'Egypt', icon: '🇪🇬' },
    'countrySV': { name: 'El Salvador', icon: '🇸🇻' },
    'countryGQ': { name: 'Equatorial Guinea', icon: '🇬🇶' },
    'countryER': { name: 'Eritrea', icon: '🇪🇷' },
    'countryEE': { name: 'Estonia', icon: '🇪🇪' },
    'countryET': { name: 'Ethiopia', icon: '🇪🇹' },
    // F
    'countryFK': { name: 'Falkland Islands', icon: '🇫🇰' },
    'countryFO': { name: 'Faroe Islands', icon: '🇫🇴' },
    'countryFJ': { name: 'Fiji', icon: '🇫🇯' },
    'countryFI': { name: 'Finland', icon: '🇫🇮' },
    'countryFR': { name: 'France', icon: '🇫🇷' },
    'countryGF': { name: 'French Guiana', icon: '🇬🇫' },
    'countryPF': { name: 'French Polynesia', icon: '🇵🇫' },
    // G
    'countryGA': { name: 'Gabon', icon: '🇬🇦' },
    'countryGM': { name: 'Gambia', icon: '🇬🇲' },
    'countryGE': { name: 'Georgia', icon: '🇬🇪' },
    'countryDE': { name: 'Germany', icon: '🇩🇪' },
    'countryGH': { name: 'Ghana', icon: '🇬🇭' },
    'countryGI': { name: 'Gibraltar', icon: '🇬🇮' },
    'countryGR': { name: 'Greece', icon: '🇬🇷' },
    'countryGL': { name: 'Greenland', icon: '🇬🇱' },
    'countryGD': { name: 'Grenada', icon: '🇬🇩' },
    'countryGP': { name: 'Guadeloupe', icon: '🇬🇵' },
    'countryGU': { name: 'Guam', icon: '🇬🇺' },
    'countryGT': { name: 'Guatemala', icon: '🇬🇹' },
    'countryGG': { name: 'Guernsey', icon: '🇬🇬' },
    'countryGN': { name: 'Guinea', icon: '🇬🇳' },
    'countryGW': { name: 'Guinea-Bissau', icon: '🇬🇼' },
    'countryGY': { name: 'Guyana', icon: '🇬🇾' },
    // H
    'countryHT': { name: 'Haiti', icon: '🇭🇹' },
    'countryHN': { name: 'Honduras', icon: '🇭🇳' },
    'countryHK': { name: 'Hong Kong', icon: '🇭🇰' },
    'countryHU': { name: 'Hungary', icon: '🇭🇺' },
    // I
    'countryIS': { name: 'Iceland', icon: '🇮🇸' },
    'countryIN': { name: 'India', icon: '🇮🇳' },
    'countryIR': { name: 'Iran', icon: '🇮🇷' },
    'countryIQ': { name: 'Iraq', icon: '🇮🇶' },
    'countryIE': { name: 'Ireland', icon: '🇮🇪' },
    'countryIM': { name: 'Isle of Man', icon: '🇮🇲' },
    'countryIL': { name: 'Israel', icon: '🇮🇱' },
    'countryIT': { name: 'Italy', icon: '🇮🇹' },
    // J
    'countryJM': { name: 'Jamaica', icon: '🇯🇲' },
    'countryJE': { name: 'Jersey', icon: '🇯🇪' },
    'countryJO': { name: 'Jordan', icon: '🇯🇴' },
    // K
    'countryKZ': { name: 'Kazakhstan', icon: '🇰🇿' },
    'countryKE': { name: 'Kenya', icon: '🇰🇪' },
    'countryKI': { name: 'Kiribati', icon: '🇰🇮' },
    'countryKW': { name: 'Kuwait', icon: '🇰🇼' },
    'countryKG': { name: 'Kyrgyzstan', icon: '🇰🇬' },
    // L
    'countryLA': { name: 'Laos', icon: '🇱🇦' },
    'countryLV': { name: 'Latvia', icon: '🇱🇻' },
    'countryLB': { name: 'Lebanon', icon: '🇱🇧' },
    'countryLS': { name: 'Lesotho', icon: '🇱🇸' },
    'countryLR': { name: 'Liberia', icon: '🇱🇷' },
    'countryLY': { name: 'Libya', icon: '🇱🇾' },
    'countryLI': { name: 'Liechtenstein', icon: '🇱🇮' },
    'countryLT': { name: 'Lithuania', icon: '🇱🇹' },
    'countryLU': { name: 'Luxembourg', icon: '🇱🇺' },
    // M
    'countryMO': { name: 'Macau', icon: '🇲🇴' },
    'countryMK': { name: 'North Macedonia', icon: '🇲🇰' },
    'countryMG': { name: 'Madagascar', icon: '🇲🇬' },
    'countryMW': { name: 'Malawi', icon: '🇲🇼' },
    'countryMV': { name: 'Maldives', icon: '🇲🇻' },
    'countryML': { name: 'Mali', icon: '🇲🇱' },
    'countryMT': { name: 'Malta', icon: '🇲🇹' },
    'countryMH': { name: 'Marshall Islands', icon: '🇲🇭' },
    'countryMQ': { name: 'Martinique', icon: '🇲🇶' },
    'countryMR': { name: 'Mauritania', icon: '🇲🇷' },
    'countryMU': { name: 'Mauritius', icon: '🇲🇺' },
    'countryYT': { name: 'Mayotte', icon: '🇾🇹' },
    'countryMX': { name: 'Mexico', icon: '🇲🇽' },
    'countryFM': { name: 'Micronesia', icon: '🇫🇲' },
    'countryMD': { name: 'Moldova', icon: '🇲🇩' },
    'countryMC': { name: 'Monaco', icon: '🇲🇨' },
    'countryMN': { name: 'Mongolia', icon: '🇲🇳' },
    'countryME': { name: 'Montenegro', icon: '🇲🇪' },
    'countryMS': { name: 'Montserrat', icon: '🇲🇸' },
    'countryMA': { name: 'Morocco', icon: '🇲🇦' },
    'countryMZ': { name: 'Mozambique', icon: '🇲🇿' },
    'countryMM': { name: 'Myanmar', icon: '🇲🇲' },
    // N
    'countryNA': { name: 'Namibia', icon: '🇳🇦' },
    'countryNR': { name: 'Nauru', icon: '🇳🇷' },
    'countryNP': { name: 'Nepal', icon: '🇳🇵' },
    'countryNL': { name: 'Netherlands', icon: '🇳🇱' },
    'countryNC': { name: 'New Caledonia', icon: '🇳🇨' },
    'countryNZ': { name: 'New Zealand', icon: '🇳🇿' },
    'countryNI': { name: 'Nicaragua', icon: '🇳🇮' },
    'countryNE': { name: 'Niger', icon: '🇳🇪' },
    'countryNG': { name: 'Nigeria', icon: '🇳🇬' },
    'countryNU': { name: 'Niue', icon: '🇳🇺' },
    'countryNF': { name: 'Norfolk Island', icon: '🇳🇫' },
    'countryKP': { name: 'North Korea', icon: '🇰🇵' },
    'countryNO': { name: 'Norway', icon: '🇳🇴' },
    // O
    'countryOM': { name: 'Oman', icon: '🇴🇲' },
    // P
    'countryPK': { name: 'Pakistan', icon: '🇵🇰' },
    'countryPW': { name: 'Palau', icon: '🇵🇼' },
    'countryPS': { name: 'Palestine', icon: '🇵🇸' },
    'countryPA': { name: 'Panama', icon: '🇵🇦' },
    'countryPG': { name: 'Papua New Guinea', icon: '🇵🇬' },
    'countryPY': { name: 'Paraguay', icon: '🇵🇾' },
    'countryPE': { name: 'Peru', icon: '🇵🇪' },
    'countryPH': { name: 'Philippines', icon: '🇵🇭' },
    'countryPN': { name: 'Pitcairn Islands', icon: '🇵🇳' },
    'countryPL': { name: 'Poland', icon: '🇵🇱' },
    'countryPT': { name: 'Portugal', icon: '🇵🇹' },
    'countryPR': { name: 'Puerto Rico', icon: '🇵🇷' },
    // Q
    'countryQA': { name: 'Qatar', icon: '🇶🇦' },
    // R
    'countryRE': { name: 'Réunion', icon: '🇷🇪' },
    'countryRO': { name: 'Romania', icon: '🇷🇴' },
    'countryRU': { name: 'Russia', icon: '🇷🇺' },
    'countryRW': { name: 'Rwanda', icon: '🇷🇼' },
    // S
    'countryWS': { name: 'Samoa', icon: '🇼🇸' },
    'countrySM': { name: 'San Marino', icon: '🇸🇲' },
    'countryST': { name: 'São Tomé and Príncipe', icon: '🇸🇹' },
    'countrySA': { name: 'Saudi Arabia', icon: '🇸🇦' },
    'countrySN': { name: 'Senegal', icon: '🇸🇳' },
    'countryRS': { name: 'Serbia', icon: '🇷🇸' },
    'countrySC': { name: 'Seychelles', icon: '🇸🇨' },
    'countrySL': { name: 'Sierra Leone', icon: '🇸🇱' },
    'countrySK': { name: 'Slovakia', icon: '🇸🇰' },
    'countrySI': { name: 'Slovenia', icon: '🇸🇮' },
    'countrySB': { name: 'Solomon Islands', icon: '🇸🇧' },
    'countrySO': { name: 'Somalia', icon: '🇸🇴' },
    'countryZA': { name: 'South Africa', icon: '🇿🇦' },
    'countryKR': { name: 'South Korea', icon: '🇰🇷' },
    'countrySS': { name: 'South Sudan', icon: '🇸🇸' },
    'countryES': { name: 'Spain', icon: '🇪🇸' },
    'countryLK': { name: 'Sri Lanka', icon: '🇱🇰' },
    'countrySD': { name: 'Sudan', icon: '🇸🇩' },
    'countrySR': { name: 'Suriname', icon: '🇸🇷' },
    'countrySZ': { name: 'Eswatini', icon: '🇸🇿' },
    'countrySE': { name: 'Sweden', icon: '🇸🇪' },
    'countryCH': { name: 'Switzerland', icon: '🇨🇭' },
    'countrySY': { name: 'Syria', icon: '🇸🇾' },
    // T
    'countryTW': { name: 'Taiwan', icon: '🇹🇼' },
    'countryTJ': { name: 'Tajikistan', icon: '🇹🇯' },
    'countryTZ': { name: 'Tanzania', icon: '🇹🇿' },
    'countryTH': { name: 'Thailand', icon: '🇹🇭' },
    'countryTL': { name: 'Timor-Leste', icon: '🇹🇱' },
    'countryTG': { name: 'Togo', icon: '🇹🇬' },
    'countryTK': { name: 'Tokelau', icon: '🇹🇰' },
    'countryTO': { name: 'Tonga', icon: '🇹🇴' },
    'countryTT': { name: 'Trinidad and Tobago', icon: '🇹🇹' },
    'countryTN': { name: 'Tunisia', icon: '🇹🇳' },
    'countryTR': { name: 'Turkey', icon: '🇹🇷' },
    'countryTM': { name: 'Turkmenistan', icon: '🇹🇲' },
    'countryTC': { name: 'Turks and Caicos', icon: '🇹🇨' },
    'countryTV': { name: 'Tuvalu', icon: '🇹🇻' },
    // U
    'countryUG': { name: 'Uganda', icon: '🇺🇬' },
    'countryUA': { name: 'Ukraine', icon: '🇺🇦' },
    'countryAE': { name: 'United Arab Emirates', icon: '🇦🇪' },
    'countryUY': { name: 'Uruguay', icon: '🇺🇾' },
    'countryUZ': { name: 'Uzbekistan', icon: '🇺🇿' },
    // V
    'countryVU': { name: 'Vanuatu', icon: '🇻🇺' },
    'countryVA': { name: 'Vatican City', icon: '🇻🇦' },
    'countryVE': { name: 'Venezuela', icon: '🇻🇪' },
    'countryVN': { name: 'Vietnam', icon: '🇻🇳' },
    'countryVI': { name: 'U.S. Virgin Islands', icon: '🇻🇮' },
    // W
    'countryWF': { name: 'Wallis and Futuna', icon: '🇼🇫' },
    // Y
    'countryYE': { name: 'Yemen', icon: '🇾🇪' },
    // Z
    'countryZM': { name: 'Zambia', icon: '🇿🇲' },
    'countryZW': { name: 'Zimbabwe', icon: '🇿🇼' }
  };

  // ============================================
  // STYLES
  // ============================================
  GM_addStyle(`
        .gl-wrapper {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-right: 12px;
        }

        .gl-container {
            display: inline-flex;
            align-items: center;
            position: relative;
        }

        .gl-btn {
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

        .gl-btn:hover {
            background: rgba(138,180,248,0.08);
        }

        .gl-btn.active {
            color: #8ab4f8;
            background: rgba(138,180,248,0.1);
        }

        .gl-btn svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .gl-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            min-width: 200px;
            max-height: 400px;
            overflow-y: auto;
            background: #303134;
            border: 1px solid #5f6368;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            z-index: 99999;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-4px);
            transition: all 0.15s ease;
        }

        .gl-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .gl-dropdown::-webkit-scrollbar {
            width: 8px;
        }
        .gl-dropdown::-webkit-scrollbar-track {
            background: #202124;
            border-radius: 4px;
        }
        .gl-dropdown::-webkit-scrollbar-thumb {
            background: #5f6368;
            border-radius: 4px;
        }
        .gl-dropdown::-webkit-scrollbar-thumb:hover {
            background: #80868b;
        }

        .gl-search {
            position: sticky;
            top: 0;
            padding: 8px;
            background: #303134;
            border-bottom: 1px solid #5f6368;
        }

        .gl-search input {
            width: 100%;
            padding: 8px 12px;
            background: #202124;
            border: 1px solid #5f6368;
            border-radius: 4px;
            color: #e8eaed;
            font-size: 13px;
            outline: none;
        }

        .gl-search input:focus {
            border-color: #8ab4f8;
        }

        .gl-search input::placeholder {
            color: #9aa0a6;
        }

        .gl-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            color: #e8eaed;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.1s;
        }

        .gl-item:hover {
            background: rgba(138,180,248,0.12);
        }

        .gl-item.selected {
            background: rgba(138,180,248,0.2);
            color: #8ab4f8;
        }

        .gl-item.hidden {
            display: none;
        }

        .gl-icon {
            width: 20px;
            text-align: center;
            font-size: 16px;
        }

        .gl-divider {
            height: 20px;
            width: 1px;
            background: #5f6368;
            margin: 0 4px;
        }

        .gl-clear {
            margin-left: 4px;
            font-size: 10px;
            opacity: 0.7;
            cursor: pointer;
        }
        .gl-clear:hover { opacity: 1; }
    `);

  // ============================================
  // FUNCTIONS
  // ============================================
  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function getRegion() {
    return new URLSearchParams(window.location.search).get('cr') || '';
  }

  function cleanQuery(q) {
    return q
      .replace(/\(?(site:\S+\s*(OR\s*)?)+\)?/gi, '')
      .replace(/filetype:\S+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildQuery(q, key) {
    if (key === 'all') return q;
    const lens = LENSES[key];
    if (lens.sites?.length) {
      q += ` (${lens.sites.map(s => `site:${s}`).join(' OR ')})`;
    }
    if (lens.filetype) q += ` filetype:${lens.filetype}`;
    return q;
  }

  function detectLens() {
    const q = getQuery();
    for (const [key, lens] of Object.entries(LENSES)) {
      if (key === 'all') continue;
      if (lens.filetype && q.includes(`filetype:${lens.filetype}`)) return key;
      if (lens.sites?.some(s => q.includes(`site:${s}`))) return key;
    }
    return 'all';
  }

  function search(query, region = null) {
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);

    if (region !== null) {
      if (region === '') {
        url.searchParams.delete('cr');
      } else {
        url.searchParams.set('cr', region);
      }
    }

    window.location.href = url.toString();
  }

  function setRegion(region) {
    const url = new URL(window.location.href);
    if (region === '') {
      url.searchParams.delete('cr');
    } else {
      url.searchParams.set('cr', region);
    }
    window.location.href = url.toString();
  }

  // ============================================
  // UI
  // ============================================
  function createLensDropdown(currentLens) {
    const container = document.createElement('div');
    container.className = 'gl-container';
    container.id = 'gl-lenses';

    const isActive = currentLens !== 'all';
    const lensData = LENSES[currentLens];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gl-btn ${isActive ? 'active' : ''}`;

    if (!isActive) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" style="fill:currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> Lenses ▾`;
    } else {
      btn.innerHTML = `<span>${lensData.icon}</span><span>${lensData.name}</span><span class="gl-clear" data-action="clear">✕</span>`;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'gl-dropdown';
    dropdown.innerHTML = Object.entries(LENSES).map(([key, lens]) => `
            <div class="gl-item ${currentLens === key ? 'selected' : ''}" data-lens="${key}">
                <span class="gl-icon">${lens.icon || '○'}</span>
                <span>${lens.name}</span>
            </div>
        `).join('');

    container.appendChild(btn);
    container.appendChild(dropdown);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.dataset.action === 'clear') {
        search(cleanQuery(getQuery()));
        return;
      }
      document.querySelectorAll('.gl-dropdown.show').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown.classList.toggle('show');
    });

    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.gl-item');
      if (!item) return;
      search(buildQuery(cleanQuery(getQuery()), item.dataset.lens));
    });

    return container;
  }

  function createRegionDropdown(currentRegion) {
    const container = document.createElement('div');
    container.className = 'gl-container';
    container.id = 'gl-region';

    const isActive = currentRegion !== '';
    const regionData = REGIONS[currentRegion] || REGIONS[''];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gl-btn ${isActive ? 'active' : ''}`;

    if (!isActive) {
      btn.innerHTML = `🌍 Region ▾`;
    } else {
      btn.innerHTML = `<span>${regionData.icon}</span><span>${regionData.name}</span><span class="gl-clear" data-action="clear">✕</span>`;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'gl-dropdown';

    // Add search input
    const searchDiv = document.createElement('div');
    searchDiv.className = 'gl-search';
    searchDiv.innerHTML = `<input type="text" placeholder="Search region..." />`;
    dropdown.appendChild(searchDiv);

    // Add items
    const itemsContainer = document.createElement('div');
    itemsContainer.innerHTML = Object.entries(REGIONS).map(([key, region]) => `
            <div class="gl-item ${currentRegion === key ? 'selected' : ''}" data-region="${key}" data-name="${region.name.toLowerCase()}">
                <span class="gl-icon">${region.icon}</span>
                <span>${region.name}</span>
            </div>
        `).join('');
    dropdown.appendChild(itemsContainer);

    container.appendChild(btn);
    container.appendChild(dropdown);

    // Search filter
    const searchInput = searchDiv.querySelector('input');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      itemsContainer.querySelectorAll('.gl-item').forEach(item => {
        const name = item.dataset.name;
        item.classList.toggle('hidden', !name.includes(query));
      });
    });

    searchInput.addEventListener('click', (e) => e.stopPropagation());

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.dataset.action === 'clear') {
        setRegion('');
        return;
      }
      document.querySelectorAll('.gl-dropdown.show').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown.classList.toggle('show');
      if (dropdown.classList.contains('show')) {
        setTimeout(() => searchInput.focus(), 50);
      }
    });

    itemsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.gl-item');
      if (!item) return;
      setRegion(item.dataset.region);
    });

    return container;
  }

  function inject() {
    if (document.querySelector('.gl-wrapper')) return;

    const navBar = document.querySelector('div[role="navigation"] > div:first-child') ||
      document.querySelector('.crJ18e') ||
      document.querySelector('.IUOThf');

    if (!navBar) {
      setTimeout(inject, 500);
      return;
    }

    const currentLens = detectLens();
    const currentRegion = getRegion();

    const wrapper = document.createElement('div');
    wrapper.className = 'gl-wrapper';

    wrapper.appendChild(createLensDropdown(currentLens));

    const divider = document.createElement('div');
    divider.className = 'gl-divider';
    wrapper.appendChild(divider);

    wrapper.appendChild(createRegionDropdown(currentRegion));

    navBar.insertBefore(wrapper, navBar.firstChild);

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.querySelectorAll('.gl-dropdown.show').forEach(d => d.classList.remove('show'));
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    setTimeout(inject, 300);

    new MutationObserver(() => {
      if (!document.querySelector('.gl-wrapper')) {
        setTimeout(inject, 100);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
