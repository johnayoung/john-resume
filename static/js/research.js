(function () {
  'use strict';

  var toolbar = document.getElementById('toolbar');
  var searchInput = document.getElementById('source-search');
  var searchWrap = searchInput.closest('.toolbar__search');
  var clearBtn = document.getElementById('search-clear');
  var countEl = document.getElementById('result-count');
  var emptyEl = document.getElementById('empty-state');
  var resetBtn = document.getElementById('empty-reset');
  var toTopBtn = document.getElementById('to-top');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.rsrc'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.pillar'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.theme-chip'));
  var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="class-filter"]'));
  var total = cards.length;

  /* Sticky offset: sections and cards scroll below the real toolbar height. */
  function setStickyOffset() {
    document.documentElement.style.setProperty('--sticky-offset', (toolbar.offsetHeight + 16) + 'px');
  }
  setStickyOffset();
  window.addEventListener('resize', setStickyOffset);

  /* Stuck state: sentinel sits just above the toolbar in the DOM. */
  var sentinel = document.getElementById('toolbar-sentinel');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      toolbar.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ── Filtering ─────────────────────────────────────────────────────── */
  function activeClass() {
    for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i].value;
    return 'all';
  }

  function applyFilters() {
    var q = searchInput.value.trim().toLowerCase();
    var cls = activeClass();
    var shown = 0;
    var perSection = {};

    cards.forEach(function (card) {
      var okClass = cls === 'all' || card.getAttribute('data-class') === cls;
      var okText = !q || card.getAttribute('data-search').indexOf(q) !== -1;
      var visible = okClass && okText;
      card.hidden = !visible;
      if (visible) {
        shown++;
        var pid = card.getAttribute('data-pillar');
        perSection[pid] = (perSection[pid] || 0) + 1;
      }
    });

    sections.forEach(function (sec) {
      var pid = sec.getAttribute('data-pillar');
      var n = perSection[pid] || 0;
      sec.hidden = n === 0;
      var badge = sec.querySelector('.pillar__count');
      if (badge) badge.textContent = n + (n === 1 ? ' source' : ' sources');
    });

    chips.forEach(function (chip) {
      var pid = chip.getAttribute('data-pillar');
      var n = perSection[pid] || 0;
      chip.querySelector('span').textContent = n;
      chip.classList.toggle('is-empty', n === 0);
    });

    countEl.textContent = shown + ' / ' + total + ' sources';
    emptyEl.classList.toggle('is-visible', shown === 0);
    searchWrap.classList.toggle('has-value', q.length > 0);
  }

  var debounceTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 120);
  });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      applyFilters();
    }
  });
  radios.forEach(function (r) { r.addEventListener('change', applyFilters); });

  function resetFilters() {
    searchInput.value = '';
    radios.forEach(function (r) { r.checked = r.value === 'all'; });
    applyFilters();
    searchInput.focus();
  }
  clearBtn.addEventListener('click', resetFilters);
  resetBtn.addEventListener('click', resetFilters);

  /* "/" focuses search (ignored while typing in a field) */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  /* ── Scroll-spy on theme chips ─────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var pid = entry.target.getAttribute('data-pillar');
        chips.forEach(function (chip) {
          chip.classList.toggle('is-active', chip.getAttribute('data-pillar') === pid);
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ── Per-card deep links ───────────────────────────────────────────── */
  Array.prototype.slice.call(document.querySelectorAll('.rsrc__anchor')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.closest('.rsrc').id;
      var url = location.origin + location.pathname + '#' + id;
      history.replaceState(null, '', '#' + id);
      function done() {
        btn.classList.add('is-copied');
        btn.textContent = 'copied';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.textContent = '#';
        }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
      } else {
        done();
      }
    });
  });

  /* ── Back to top ───────────────────────────────────────────────────── */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      toTopBtn.classList.toggle('is-visible', window.scrollY > 900);
      ticking = false;
    });
  }, { passive: true });
  toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    searchInput.focus();
  });
})();
