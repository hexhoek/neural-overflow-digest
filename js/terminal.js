/* ═══════════════════════════════════════════════════
   NEURAL OVERFLOW DIGEST — Terminal JS
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  var ISSUES_PATH = 'issues/';
  var MANIFEST = ISSUES_PATH + 'index.json';

  /* ── Utilities ───────────────────────────────────── */

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return { issue: p.get('issue'), lang: p.get('lang') || 'EN' };
  }

  function dots(maxLen, usedLen) {
    var count = maxLen - usedLen;
    return count > 2 ? ' ' + '.'.repeat(count) + ' ' : ' ';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* ── Index Page ──────────────────────────────────── */

  function initIndex() {
    var listEl = document.getElementById('issue-list');
    if (!listEl) return;

    fetch(MANIFEST, { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var issues = data.issues || [];
        var html = '';

        issues.forEach(function (iss) {
          var titleStr = '[' + iss.number + '] ' + iss.title.toUpperCase();
          var dotStr = dots(50, titleStr.length + iss.date.length);
          var defaultLang = iss.langs[0] || 'EN';
          var readHref = 'reader.html?issue=' + iss.number + '&lang=' + defaultLang;
          var listenHref = iss.podcast ? 'podcast.html?issue=' + iss.number + '&lang=' + defaultLang : '';

          html += '<li class="issue-item">' +
            '<div class="issue-info">' +
            '<span class="issue-number">[' + iss.number + ']</span> ' +
            '<span class="issue-title">' + escapeHtml(iss.title.toUpperCase()) + '</span>' +
            '<span class="issue-dots">' + dotStr + '</span>' +
            '<span class="issue-date">' + iss.date + '</span>' +
            '</div>' +
            '<div class="issue-desc">' + escapeHtml(iss.description) + '</div>' +
            '<div class="issue-actions">';

          if (listenHref) {
            html += '<a class="issue-action issue-action-listen" href="' + listenHref + '" aria-label="Podcast for issue ' + iss.number + '">&gt; PODCAST</a>';
          }

          html += '<a class="issue-action" href="' + readHref + '" aria-label="Zine for issue ' + iss.number + '">&gt; ZINE</a>' +
            '</div></li>';
        });

        listEl.innerHTML = html;
      })
      .catch(function () {
        listEl.innerHTML = '<li class="error-message">ERROR: FAILED TO LOAD MANIFEST</li>';
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

    fetch(MANIFEST, { cache: 'no-cache' })
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

        setupLangToggle(contentEl, meta, params.lang, 'reader.html');
        loadIssueText(contentEl, meta, params.lang);
      })
      .catch(function () {
        contentEl.innerHTML = '<div class="error-message">ERROR: FAILED TO LOAD MANIFEST</div>';
      });
  }

  function loadIssueText(contentEl, meta, lang) {
    var prefix = meta.filePrefix || ('issue-' + meta.number + (meta.slug ? '-' + meta.slug : ''));
    var file = ISSUES_PATH + prefix + '_' + lang + '.txt';

    fetch(file)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (text) {
        contentEl.innerHTML = '<pre>' + escapeHtml(text) + '</pre>';
      })
      .catch(function () {
        contentEl.innerHTML = '<div class="error-message">TRANSMISSION NOT AVAILABLE IN THIS FREQUENCY</div>';
      });
  }

  function setupLangToggle(contentEl, meta, currentLang, page) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('.lang-link');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || !href.includes(page)) return;

      e.preventDefault();

      var p = new URLSearchParams(href.split('?')[1]);
      var newLang = p.get('lang');
      if (newLang === currentLang) return;

      var newUrl = page + '?issue=' + meta.number + '&lang=' + newLang;
      window.history.pushState(null, '', newUrl);

      document.querySelectorAll('.lang-link').forEach(function (el) {
        var elLang = new URLSearchParams(el.getAttribute('href').split('?')[1]).get('lang');
        el.classList.toggle('active', elLang === newLang);
      });

      currentLang = newLang;

      if (contentEl) {
        loadIssueText(contentEl, meta, newLang);
      }
    });
  }

  /* ── Podcast Page — Web Audio API Equalizer ──────── */

  function initPodcast() {
    var titleEl = document.getElementById('podcast-issue-title');
    var langLinksEl = document.getElementById('podcast-lang-links');
    var canvas = document.getElementById('oscilloscope');
    var audioEl = document.getElementById('podcast-audio');
    var playBtn = document.getElementById('podcast-play');
    var stopBtn = document.getElementById('podcast-stop');
    var timeEl = document.getElementById('podcast-time');
    var barEl = document.getElementById('podcast-bar');
    var fillEl = document.getElementById('podcast-fill');

    if (!audioEl || !canvas) return;

    var ctx = canvas.getContext('2d');
    var params = getParams();
    if (!params.issue) return;

    var audioCtx = null;
    var analyser = null;
    var source = null;
    var dataArray = null;
    var animId = null;
    var currentLang = params.lang;

    // Resize canvas to match display size
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw grid (oscilloscope background)
    function drawGrid() {
      var w = canvas.offsetWidth;
      var h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
      ctx.lineWidth = 0.5;

      // Horizontal lines
      for (var i = 0; i <= 8; i++) {
        var y = (h / 8) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical lines
      for (var j = 0; j <= 10; j++) {
        var x = (w / 10) * j;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Center line (brighter)
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }

    // Draw idle flatline
    function drawFlatline() {
      var w = canvas.offsetWidth;
      var h = canvas.offsetHeight;
      drawGrid();

      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    drawFlatline();

    fetch(MANIFEST, { cache: 'no-cache' })
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

        if (!meta || !meta.podcast) return;

        if (titleEl) {
          titleEl.textContent = 'Issue #' + meta.number + ': ' + meta.title.toUpperCase();
        }

        // Build lang toggle
        if (langLinksEl) {
          var lhtml = '';
          meta.langs.forEach(function (lang) {
            if (meta.podcast[lang]) {
              var isActive = lang === currentLang;
              lhtml += '<a class="lang-link' + (isActive ? ' active' : '') +
                '" href="podcast.html?issue=' + meta.number + '&lang=' + lang +
                '" aria-label="Switch to ' + lang + '">[' + lang + ']</a> ';
            }
          });
          langLinksEl.innerHTML = lhtml;
        }

        // Set initial audio
        audioEl.src = ISSUES_PATH + meta.podcast[currentLang];

        // Lang toggle for podcast
        document.addEventListener('click', function (e) {
          var link = e.target.closest('.lang-link');
          if (!link) return;
          var href = link.getAttribute('href');
          if (!href || !href.includes('podcast.html')) return;
          e.preventDefault();

          var p = new URLSearchParams(href.split('?')[1]);
          var newLang = p.get('lang');
          if (newLang === currentLang || !meta.podcast[newLang]) return;

          currentLang = newLang;
          var wasPlaying = !audioEl.paused;
          audioEl.src = ISSUES_PATH + meta.podcast[newLang];
          audioEl.load();

          window.history.pushState(null, '', 'podcast.html?issue=' + meta.number + '&lang=' + newLang);

          document.querySelectorAll('.lang-link').forEach(function (el) {
            var elLang = new URLSearchParams(el.getAttribute('href').split('?')[1]).get('lang');
            el.classList.toggle('active', elLang === newLang);
          });

          if (wasPlaying) {
            audioEl.play().then(function () {
              ensureAudioCtx();
            });
          }
        });
      });

    // Web Audio API setup
    function ensureAudioCtx() {
      if (audioCtx) return;

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source = audioCtx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.fftSize);
    }

    // Draw oscilloscope waveform
    function drawWaveform() {
      animId = requestAnimationFrame(drawWaveform);

      if (!analyser || audioEl.paused) return;

      analyser.getByteTimeDomainData(dataArray);

      var w = canvas.offsetWidth;
      var h = canvas.offsetHeight;

      drawGrid();

      // Glow effect
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 10;

      // Main waveform line
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.beginPath();

      var sliceWidth = w / dataArray.length;
      var x = 0;

      for (var i = 0; i < dataArray.length; i++) {
        var v = dataArray[i] / 128.0;
        var y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();

      // Fainter trail (afterglow)
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      x = 0;
      for (var j = 0; j < dataArray.length; j++) {
        var v2 = dataArray[j] / 128.0;
        var y2 = (v2 * h) / 2;
        if (j === 0) ctx.moveTo(x, y2);
        else ctx.lineTo(x, y2);
        x += sliceWidth;
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    // Play / Pause
    playBtn.addEventListener('click', function () {
      if (audioEl.paused) {
        audioEl.play().then(function () {
          ensureAudioCtx();
          if (audioCtx.state === 'suspended') audioCtx.resume();
          playBtn.textContent = '[❚❚ PAUSE]';
          playBtn.classList.add('playing');
          drawWaveform();
        });
      } else {
        audioEl.pause();
        playBtn.textContent = '[▶ PLAY]';
        playBtn.classList.remove('playing');
        if (animId) cancelAnimationFrame(animId);
      }
    });

    // Stop
    stopBtn.addEventListener('click', function () {
      audioEl.pause();
      audioEl.currentTime = 0;
      playBtn.textContent = '[▶ PLAY]';
      playBtn.classList.remove('playing');
      fillEl.style.width = '0%';
      if (animId) cancelAnimationFrame(animId);
      drawFlatline();
    });

    // Progress
    audioEl.addEventListener('timeupdate', function () {
      if (audioEl.duration) {
        var pct = (audioEl.currentTime / audioEl.duration) * 100;
        fillEl.style.width = pct + '%';
        timeEl.textContent = fmt(audioEl.currentTime) + ' / ' + fmt(audioEl.duration);
      }
    });

    // Seek
    barEl.addEventListener('click', function (e) {
      if (audioEl.duration) {
        var rect = barEl.getBoundingClientRect();
        var x = e.clientX - rect.left;
        audioEl.currentTime = (x / rect.width) * audioEl.duration;
      }
    });

    // Ended
    audioEl.addEventListener('ended', function () {
      playBtn.textContent = '[▶ PLAY]';
      playBtn.classList.remove('playing');
      if (animId) cancelAnimationFrame(animId);
      drawFlatline();
    });
  }

  /* ── Keyboard Navigation ───────────────────────── */

  function initKeyboardNav() {
    var focusIndex = -1;

    document.addEventListener('keydown', function (e) {
      if (e.key === 's' || e.key === 'S') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
        document.body.classList.toggle('scanlines');
        return;
      }

      var items = document.querySelectorAll('.issue-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        focusIndex = Math.min(focusIndex + 1, items.length - 1);
        updateFocus(items, focusIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        focusIndex = Math.max(focusIndex - 1, 0);
        updateFocus(items, focusIndex);
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
    initPodcast();
  });

  window.addEventListener('popstate', function () {
    initReader();
  });

})();
