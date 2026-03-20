/* ═══════════════════════════════════════════════════
   NEURAL OVERFLOW DIGEST — Terminal JS
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const ISSUES_PATH = 'issues/';
  const MANIFEST = ISSUES_PATH + 'index.json';

  /* ── Utilities ───────────────────────────────────── */

  function getParams() {
    const p = new URLSearchParams(window.location.search);
    return { issue: p.get('issue'), lang: p.get('lang') || 'EN' };
  }

  function dots(maxLen, usedLen) {
    const count = maxLen - usedLen;
    return count > 2 ? ' ' + '.'.repeat(count) + ' ' : ' ';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Index Page ──────────────────────────────────── */

  function initIndex() {
    const listEl = document.getElementById('issue-list');

    if (!listEl) return;

    fetch(MANIFEST)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var issues = data.issues || [];
        var html = '';

        issues.forEach(function (iss) {
          var titleStr = '[' + iss.number + '] ' + iss.title.toUpperCase();
          var dotStr = dots(50, titleStr.length + iss.date.length);
          var defaultLang = iss.langs[0] || 'EN';
          var href = 'reader.html?issue=' + iss.number + '&lang=' + defaultLang;

          html += '<li class="issue-item">' +
            '<a class="issue-block" href="' + href + '" aria-label="Read issue ' + iss.number + ': ' + iss.title + '">' +
            '<span class="issue-number">[' + iss.number + ']</span> ' +
            '<span class="issue-title">' + escapeHtml(iss.title.toUpperCase()) + '</span>' +
            '<span class="issue-dots">' + dotStr + '</span>' +
            '<span class="issue-date">' + iss.date + '</span>' +
            '<span class="issue-desc">' + escapeHtml(iss.description) + '</span>' +
            '</a></li>';
        });

        listEl.innerHTML = html;
      })
      .catch(function () {
        if (listEl) {
          listEl.innerHTML = '<li class="error-message">ERROR: FAILED TO LOAD MANIFEST</li>';
        }
      });
  }

  /* ── Reader Page ─────────────────────────────────── */

  function initReader() {
    var contentEl = document.getElementById('reader-content');
    var titleEl = document.getElementById('reader-issue-title');
    var langLinksEl = document.getElementById('lang-links');

    if (!contentEl) return;

    var params = getParams();
    if (!params.issue) {
      contentEl.innerHTML = '<div class="error-message">NO ISSUE SPECIFIED</div>';
      return;
    }

    // Load manifest first to get issue metadata
    fetch(MANIFEST)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var issues = data.issues || [];
        var meta = null;

        for (var i = 0; i < issues.length; i++) {
          if (issues[i].number === params.issue) {
            meta = issues[i];
            break;
          }
        }

        if (!meta) {
          contentEl.innerHTML = '<div class="error-message">ISSUE NOT FOUND IN MANIFEST</div>';
          return;
        }

        if (titleEl) {
          titleEl.textContent = 'Issue #' + meta.number + ': ' + meta.title.toUpperCase();
        }

        // Build language toggle
        if (langLinksEl) {
          var lhtml = '';
          meta.langs.forEach(function (lang) {
            var isActive = lang === params.lang;
            lhtml += '<a class="lang-link' + (isActive ? ' active' : '') +
              '" href="reader.html?issue=' + meta.number + '&lang=' + lang +
              '" aria-label="Switch to ' + lang + '">[' + lang + ']</a> ';
          });
          langLinksEl.innerHTML = lhtml;
        }

        // Intercept lang links for no-reload switch
        setupLangToggle(contentEl, meta, params.lang);

        // Load the text
        loadIssueText(contentEl, meta.number, meta.slug, params.lang);
      })
      .catch(function () {
        contentEl.innerHTML = '<div class="error-message">ERROR: FAILED TO LOAD MANIFEST</div>';
      });
  }

  function loadIssueText(contentEl, number, slug, lang) {
    var file = ISSUES_PATH + 'issue-' + number + '-' + slug + '_' + lang + '.txt';

    fetch(file)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (text) {
        contentEl.innerHTML = '<pre>' + escapeHtml(text) + '</pre>';
      })
      .catch(function () {
        contentEl.innerHTML = '<div class="error-message">' +
          'TRANSMISSION NOT AVAILABLE IN THIS FREQUENCY' + '</div>';
      });
  }

  function setupLangToggle(contentEl, meta, currentLang) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('.lang-link');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || !href.includes('reader.html')) return;

      e.preventDefault();

      var p = new URLSearchParams(href.split('?')[1]);
      var newLang = p.get('lang');
      if (newLang === currentLang) return;

      // Update URL without reload
      var newUrl = 'reader.html?issue=' + meta.number + '&lang=' + newLang;
      window.history.pushState(null, '', newUrl);

      // Update active state
      document.querySelectorAll('.lang-link').forEach(function (el) {
        var elLang = new URLSearchParams(el.getAttribute('href').split('?')[1]).get('lang');
        el.classList.toggle('active', elLang === newLang);
      });

      // Load new text
      currentLang = newLang;
      loadIssueText(contentEl, meta.number, meta.slug, newLang);
    });
  }

  /* ── Effects ─────────────────────────────────────── */

  function typeEffect(el, text) {
    el.textContent = '';
    var i = 0;

    function tick() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(tick, 40);
      } else {
        el.innerHTML = text + '<span class="cursor">█</span>';
      }
    }

    tick();
  }

  /* ── Keyboard Navigation (arrows + enter) ────────── */

  function initKeyboardNav() {
    var focusIndex = -1;

    document.addEventListener('keydown', function (e) {
      // Scanline toggle
      if (e.key === 's' || e.key === 'S') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        document.body.classList.toggle('scanlines');
        return;
      }

      var items = document.querySelectorAll('.issue-block');
      if (!items.length) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        focusIndex = Math.min(focusIndex + 1, items.length - 1);
        updateFocus(items, focusIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        focusIndex = Math.max(focusIndex - 1, 0);
        updateFocus(items, focusIndex);
      } else if (e.key === 'Enter' && focusIndex >= 0 && focusIndex < items.length) {
        e.preventDefault();
        items[focusIndex].click();
      }
    });
  }

  function updateFocus(items, index) {
    items.forEach(function (el, i) {
      el.classList.toggle('kb-focus', i === index);
    });
    items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ── Scanlines ─────────────────────────────────── */

  function initScanlines() {
    document.body.classList.add('scanlines');
  }

  /* ── Init ────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initScanlines();
    initKeyboardNav();
    initIndex();
    initReader();
  });

  // Handle browser back/forward in reader
  window.addEventListener('popstate', function () {
    initReader();
  });

})();
