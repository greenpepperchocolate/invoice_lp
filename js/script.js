
(function () {
  'use strict';

  // =====================
  // Global CTA destination
  // =====================
  var CTA_URL = 'https://invoice-converter-4ang.onrender.com/';

  // 小さなユーティリティ
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function closest(el, sel) {
    if (!el) return null;
    if (el.closest) return el.closest(sel);
    // 古いブラウザ向けフォールバック
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(sel)) return node;
      node = node.parentElement;
    }
    return null;
  }

  // =====================
  // FAQ Toggle
  // =====================
  function initFAQ() {
    var faqItems = $all('.faq-item');
    faqItems.forEach(function (item) {
      var question = $('.faq-question', item);
      if (!question) return;
      question.addEventListener('click', function () {
        var isActive = item.classList.contains('active');
        faqItems.forEach(function (i) { i.classList.remove('active'); });
        if (!isActive) item.classList.add('active');
      });
    });
  }

  // =====================
  // Smooth scroll for nav
  // =====================
  function initSmoothScroll() {
    var navLinks = $all('a[href^="#"]');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var target = $(href);
        if (!target) return;
        e.preventDefault();
        var header = $('.header');
        var headerHeight = header ? header.offsetHeight : 0;
        var top = (target.getBoundingClientRect().top + window.pageYOffset) - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  // =====================
  // Header bg on scroll
  // =====================
  function initHeaderScroll() {
    var header = $('.header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
      }
    });
  }

  // =====================
  // Appear animations
  // =====================
  function initAppearAnimations() {
    var els = $all('.problem-item, .feature-item, .pricing-card, .step');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('fade-in-up');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // =====================
  // Mobile menu toggle (expose if needed)
  // =====================
  window.toggleMobileMenu = function () {
    var nav = $('.nav');
    if (nav) nav.classList.toggle('mobile-open');
  };

  // =====================
  // CTA handling (all force redirect)
  // =====================
  function trackEvent(eventName, data) {
    try {
      // ここで各種解析ツールへ送信する処理に差し替え
      console.log('Event tracked:', eventName, data || {});
    } catch (err) {
      // 解析で失敗しても本処理に影響しないよう握りつぶす
    }
  }

  function handleCTAClick(e) {
    if (e) e.preventDefault();
    var btn = e && e.target ? closest(e.target, '.btn-primary, .btn-secondary') : null;
    var text = btn && btn.textContent ? btn.textContent.trim() : 'unknown';
    var sec = btn ? closest(btn, 'section') : null;
    var secClass = sec && sec.className ? sec.className : 'unknown';

    trackEvent('cta_redirect', { to: CTA_URL, button_text: text, button_location: secClass });

    // 遷移（同タブ）
    window.location.assign(CTA_URL);
  }

  function initCTA() {
    // 既存のCTAにクリックを付与し、hrefも書き換え
    var ctas = $all('.btn-primary, .btn-secondary');
    ctas.forEach(function (btn) {
      if (btn.tagName && btn.tagName.toLowerCase() === 'a') {
        btn.setAttribute('href', CTA_URL);
        // 新規タブにしたい場合：
        // btn.setAttribute('target', '_blank'); btn.setAttribute('rel', 'noopener');
      }
      btn.addEventListener('click', handleCTAClick);
    });

    // 動的追加にも効くようデリゲーション（重複実行は防げる）
    document.addEventListener('click', function (e) {
      var target = closest(e.target, '.btn-primary, .btn-secondary');
      if (target) handleCTAClick(e);
    });

    // クリック計測（任意）
    document.addEventListener('click', function (e) {
      var el = closest(e.target, '.btn-primary, .btn-secondary');
      if (!el) return;
      var txt = el.textContent ? el.textContent.trim() : '';
      var section = closest(el, 'section');
      var loc = section && section.className ? section.className : 'unknown';
      trackEvent('cta_click', { button_text: txt, button_location: loc });
    });
  }

  // =====================
  // Lazy load images
  // =====================
  function initLazyImages() {
    var imgs = $all('img[data-src]');
    if (!('IntersectionObserver' in window)) {
      // フォールバック：即時読み込み
      imgs.forEach(function (img) { img.src = img.getAttribute('data-src'); img.classList.remove('lazy'); });
      return;
    }
    var imgIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          var ds = img.getAttribute('data-src');
          if (ds) img.src = ds;
          img.classList.remove('lazy');
          imgIO.unobserve(img);
        }
      });
    });
    imgs.forEach(function (img) { imgIO.observe(img); });
  }

  // =====================
  // Scroll depth tracking
  // =====================
  function initScrollDepth() {
    var maxDepth = 0;
    window.addEventListener('scroll', function () {
      var denom = (document.body.scrollHeight - window.innerHeight);
      if (denom <= 0) return;
      var depth = Math.round((window.scrollY / denom) * 100);
      if (depth <= maxDepth) return;
      maxDepth = depth;
      if (maxDepth >= 25 && maxDepth < 50) trackEvent('scroll_depth', { depth: '25%' });
      else if (maxDepth >= 50 && maxDepth < 75) trackEvent('scroll_depth', { depth: '50%' });
      else if (maxDepth >= 75 && maxDepth < 90) trackEvent('scroll_depth', { depth: '75%' });
      else if (maxDepth >= 90) trackEvent('scroll_depth', { depth: '90%' });
    });
  }

  // =====================
  // Force scroll to top on page load
  // =====================
  function forceScrollToTop() {
    window.scrollTo(0, 0);
    // Also reset browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  // =====================
  // Init on DOM ready
  // =====================
  function init() {
    forceScrollToTop();
    initFAQ();
    initSmoothScroll();
    initHeaderScroll();
    initAppearAnimations();
    initCTA();
    initLazyImages();
    initScrollDepth();
  }

  // ページロード時とリロード時の両方でトップに戻る
  window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
  });
  
  window.addEventListener('load', function() {
    setTimeout(function() {
      window.scrollTo(0, 0);
    }, 50);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

