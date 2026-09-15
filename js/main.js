/* =====================================================================
   Future Homes Infra - Core UI runtime
   Nav + footer injection, custom cursor, magnetic buttons, page
   transitions, scroll reveal, counters, toasts, modals, WhatsApp widget.
   ===================================================================== */
(function () {
  "use strict";

  var C = window.FH ? window.FH.CONFIG : {};
  var BASE = document.body.getAttribute("data-base") || "";
  var PAGE = document.body.getAttribute("data-page") || "";

  /* ------------------------------------------------------------------ */
  /* Icons                                                              */
  /* ------------------------------------------------------------------ */
  var I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="8" height="18"/><rect x="13" y="8" width="8" height="13"/><path d="M6 7h2M6 11h2M6 15h2M16 12h2M16 16h2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 10 12 4l9 6"/><path d="M5 10v9h14v-9"/><path d="M2 21h20"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m20 6-11 11-5-5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3 5 6v6c0 5 3 7.5 7 9 4-1.5 7-4 7-9V6Z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5"/><path d="M17 5a3 3 0 0 1 0 6M19 20c0-2.4-.9-4-2.3-5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2-.3.2-.6.1a9 9 0 0 1-2.7-1.7 10 10 0 0 1-1.8-2.3c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.7-.9-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.2 4.2 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.5-.4ZM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l.5-3.5H13V7.4c0-1 .3-1.7 1.8-1.7H17V2.6A25 25 0 0 0 14.2 2C11.6 2 9.8 3.5 9.8 6.8v2.7H7v3.5h2.8V22Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    gp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 11v2.6h3.8a3.3 3.3 0 0 1-3.8 2.4 4.2 4.2 0 1 1 2.9-7.2l1.9-1.9A6.9 6.9 0 1 0 12 19c3.9 0 6.5-2.7 6.5-6.6 0-.5-.1-1-.1-1.4Z"/></svg>'
  };

  /* ------------------------------------------------------------------ */
  /* Navigation / Footer                                                */
  /* ------------------------------------------------------------------ */
  var NAV = [
    { label: "Home", href: "index.html", icon: "home" },
    { label: "Projects", href: "projects.html", icon: "layers" },
    { label: "Plot Status", href: "plot-status.html", icon: "grid" },
    { label: "Flat Status", href: "flat-status.html", icon: "building" },
    { label: "Location", href: "location.html", icon: "pin" },
    { label: "Gallery", href: "gallery.html", icon: "image" },
    { label: "Bank Details", href: "bank-details.html", icon: "bank" },
    { label: "EMI Calculator", href: "emi-calculator.html", icon: "calc" },
    { label: "Contact", href: "contact.html", icon: "phone" }
  ];

  function buildNav() {
    var host = document.getElementById("fh-nav");
    if (!host) return;
    var links = NAV.map(function (n) {
      var active = PAGE === n.href.replace(".html", "") || (PAGE === "home" && n.href === "index.html");
      return '<a href="' + BASE + n.href + '"' + (active ? ' class="is-active"' : "") + '>' + n.label + "</a>";
    }).join("");
    host.className = "fh-nav";
    host.innerHTML =
      '<div class="container fh-nav__inner">' +
        '<a class="fh-nav__brand" href="' + BASE + 'index.html">' +
          '<span class="fh-nav__logo">FH</span>' +
          '<div class="fh-nav__brand-text">' +
            '<b class="fh-nav__title">' + C.brand + '</b>' +
            '<span class="fh-nav__tagline">Building Better Tomorrow</span>' +
          '</div>' +
        '</a>' +
        '<nav class="fh-nav__links" id="fhNavDrawer">' +
          '<button class="fh-nav__drawer-close" id="fhDrawerClose" aria-label="Close Menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
          links +
          '<a href="' + BASE + 'contact.html#enquiry" class="nav-login" data-no-transition>Get Quotation</a>' +
        '</nav>' +
        '<div class="fh-nav__backdrop" id="fhNavBackdrop"></div>' +
        '<div class="fh-nav__actions">' +
          '<button class="theme-toggle" id="themeToggle" aria-label="Toggle Theme" title="Toggle Light / Dark Mode">' +
            '<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>' +
            '<svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
          '</button>' +
          '<a class="btn btn--primary btn--sm fh-nav__login-btn" href="' + BASE + 'admin/login.html" data-magnetic>' + I.user + ' Login</a>' +
          '<button class="fh-nav__toggle" aria-label="Menu" id="fhNavToggle"><span></span></button>' +
        '</div>' +
      '</div>';

    setTimeout(function () {
      // Intentionally removed document.body.appendChild to keep links in desktop header
    }, 0);
  }

  function buildFooter() {
    var host = document.getElementById("fh-footer");
    if (!host) return;
    var max = 6;
    var quick = NAV.slice(1, max).map(function (n) { return "<li><a href=" + '"' + BASE + n.href + '"' + ">" + n.label + "</a></li>"; }).join("");
    quick += '<li><a href="' + BASE + 'emi-calculator.html">EMI Calculator</a></li>';
    host.className = "fh-footer";
    host.innerHTML =
      '<div class="container fh-footer__inner">' +
        '<div class="fh-footer__grid">' +
          '<div class="fh-footer__brand">' +
            '<a class="fh-nav__brand" href="' + BASE + 'index.html"><span class="fh-nav__logo">FH</span><span><b>' + C.brand + '</b><span>Building Better Tomorrow</span></span></a>' +
            "<p>Premium residential plots and modern living spaces in carefully selected locations. A property inventory portal built on trust, transparency and clarity.</p>" +
            '<div class="socials">' +
              '<a href="' + C.social.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + I.fb + "</a>" +
              '<a href="' + C.social.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + I.ig + "</a>" +
              '<a href="' + C.social.google + '" target="_blank" rel="noopener" aria-label="Google">' + I.gp + "</a>" +
            "</div>" +
          "</div>" +
          "<div><h4>Quick Links</h4><ul>" + quick + "</ul></div>" +
          '<div><h4>Company</h4><ul>' +
            '<li><a href="' + BASE + 'about.html">About Us</a></li>' +
            '<li><a href="' + BASE + 'projects.html">Our Projects</a></li>' +
            '<li><a href="' + BASE + 'contact.html">Contact</a></li>' +
            '<li><a href="' + BASE + 'gallery.html">Gallery</a></li>' +
            '<li><a href="' + BASE + 'admin/login.html">Admin Panel</a></li>' +
          "</ul></div>" +
          '<div><h4>Legal</h4><ul>' +
            '<li><a href="' + BASE + 'privacy-policy.html">Privacy Policy</a></li>' +
            '<li><a href="' + BASE + 'terms.html">Terms &amp; Conditions</a></li>' +
            '<li><a href="' + BASE + 'refund-policy.html">Refund &amp; Cancellation</a></li>' +
            '<li><a href="' + BASE + 'privacy-policy.html#mobile">Mobile &amp; Device Policy</a></li>' +
          "</ul></div>" +
          "<div><h4>Contact</h4><ul>" +
            '<li><a href="tel:' + C.phoneRaw + '">' + I.phone.replace("viewBox", 'width="14" height="14" viewBox') + " " + C.phone + "</a></li>" +
            '<li><a href="https://wa.me/' + C.whatsapp + '" target="_blank" rel="noopener">' + I.wa.replace("viewBox", 'width="14" height="14" viewBox') + " WhatsApp</a></li>" +
            '<li><a href="mailto:' + C.email + '">' + I.mail.replace("viewBox", 'width="14" height="14" viewBox') + " " + C.email + "</a></li>" +
            "<li>" + C.office + "</li>" +
            "<li>" + C.hours + "</li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="fh-footer__bottom">' +
          "<span>&copy; 2026 " + C.brand + ". All Rights Reserved.</span>" +
          '<div class="fh-footer__legal">' +
            '<a href="' + BASE + 'privacy-policy.html">Privacy Policy</a>' +
            '<a href="' + BASE + 'terms.html">Terms &amp; Conditions</a>' +
            '<a href="' + BASE + 'refund-policy.html">Refund Policy</a>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Custom cursor                                                      */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var ring = document.createElement("div");
    var dot = document.createElement("div");
    ring.className = "fh-cursor";
    dot.className = "fh-cursor-dot";
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.classList.add("fh-cursor-on");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    var hoverSel = "a, button, .card, .gallery-item, input, select, textarea, .plot-unit, .tabs button";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSel)) ring.classList.remove("is-hover");
    });
    document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
    document.addEventListener("mouseleave", function () { ring.style.opacity = "0"; dot.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { ring.style.opacity = "1"; dot.style.opacity = "1"; });
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                   */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var strength = 0.35;
    document.addEventListener("mousemove", function (e) {
      var el = e.target.closest("[data-magnetic]");
      if (!el) return;
      var r = el.getBoundingClientRect();
      var relX = e.clientX - (r.left + r.width / 2);
      var relY = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + relX * strength + "px," + relY * strength + "px)";
      el.style.transition = "transform 0.08s linear";
    });
    document.addEventListener("mouseout", function (e) {
      var el = e.target.closest("[data-magnetic]");
      if (!el) return;
      if (el.contains(e.relatedTarget)) return;
      el.style.transform = "";
      el.style.transition = "transform 0.5s var(--ease)";
    });
    // Glow follow for .btn
    document.addEventListener("mousemove", function (e) {
      var b = e.target.closest(".btn");
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", (e.clientX - r.left) + "px");
      b.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Theme Switcher (Light / Dark Mode)                                 */
  /* ------------------------------------------------------------------ */
  function initTheme() {
    var saved = localStorage.getItem("fh_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    function doToggle(e) {
      if (e) e.preventDefault();
      var cur = document.documentElement.getAttribute("data-theme") || "dark";
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("fh_theme", next);
    }

    btn.addEventListener("click", doToggle);
    btn.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") doToggle(e);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Page transitions                                                   */
  /* ------------------------------------------------------------------ */
  function initTransition() {
    if ('ontouchstart' in window || window.innerWidth <= 1080) return;
    var el = document.createElement("div");
    el.className = "fh-transition";
    el.innerHTML = '<div class="fh-transition__panel"></div><div class="fh-transition__panel"></div><div class="fh-transition__panel"></div><div class="fh-transition__panel"></div><div class="fh-transition__panel"></div><div class="fh-transition__brand">' + C.brand + "</div>";
    document.body.appendChild(el);

    function resetTransition() {
      el.classList.remove("is-active");
      document.body.classList.remove("no-scroll");
    }

    /* Safety resets — multiple events to handle mobile bfcache and back nav */
    window.addEventListener("pageshow", resetTransition);
    window.addEventListener("popstate", resetTransition);
    /* Always reset on DOMContentLoaded — catches stuck overlays from prev page */
    resetTransition();
    /* Belt-and-suspenders: hard reset after 1.5s no matter what */
    setTimeout(resetTransition, 1500);

    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      if (href.indexOf("#") !== -1 || /^(mailto:|tel:|https?:)/.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Check if target page is current page
      var currentPath = window.location.pathname.split("/").pop() || "index.html";
      var targetPath = href.split("#")[0].split("?")[0];
      if (targetPath === currentPath) return;

      e.preventDefault();
      el.classList.add("is-active");
      document.body.classList.add("no-scroll");
      
      // Auto cleanup timer to prevent permanent freezing
      setTimeout(resetTransition, 900);
      setTimeout(function () { window.location.href = href; }, 430);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal + counters + progress                                      */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    /* On touch / mobile — reveal everything immediately so no element is ever hidden */
    if ('ontouchstart' in window || window.innerWidth <= 1080) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    /* Immediately reveal items already in viewport on load */
    items.forEach(function (i) {
      var rect = i.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        i.classList.add("is-in");
      }
    });
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px 0px 0px" });
    items.forEach(function (i) {
      if (!i.classList.contains("is-in")) io.observe(i);
    });
  }

  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        if (el.hasAttribute("data-counted")) return;
        el.setAttribute("data-counted", "");
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var start = performance.now(), dur = 1500;
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { if (!e.hasAttribute("data-counted")) io.observe(e); });
  }

  function initProgress() {
    var bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:0;left:0;height:2px;width:0;background:linear-gradient(90deg,#146bff,#6aa4ff);z-index:9999;box-shadow:0 0 12px #146bff;transition:width .1s linear";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Nav behaviour + preloader                                          */
  /* ------------------------------------------------------------------ */
  function initNavBehaviour() {
    var nav = document.querySelector(".fh-nav");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function getDrawer() { return document.getElementById("fhNavDrawer"); }
    function getBackdrop() { return document.getElementById("fhNavBackdrop"); }

    function closeNav() {
      nav.classList.remove("is-open");
      var drawer = getDrawer();
      var backdrop = getBackdrop();
      if (drawer) drawer.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    }

    function openNav() {
      nav.classList.add("is-open");
      var drawer = getDrawer();
      var backdrop = getBackdrop();
      if (backdrop) {
        backdrop.classList.add("is-open");
      }
      if (drawer) {
        drawer.classList.add("is-open");
      }
      document.body.classList.add("no-scroll");
    }

    function handleToggle(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      nav.classList.contains("is-open") ? closeNav() : openNav();
    }

    var toggle = document.getElementById("fhNavToggle");
    if (toggle) {
      toggle.addEventListener("click", handleToggle);
      toggle.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") handleToggle(e);
      });
    }

    /* Close on drawer close button */
    var drawerClose = document.getElementById("fhDrawerClose");
    if (drawerClose) {
      drawerClose.addEventListener("click", closeNav);
      drawerClose.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") closeNav();
      });
    }

    /* Close on backdrop click */
    var backdrop = getBackdrop();
    if (backdrop) {
      backdrop.addEventListener("click", closeNav);
      backdrop.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") closeNav();
      });
    }

    /* Close on link click */
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      var drawer = getDrawer();
      if (a && drawer && drawer.contains(a)) {
        closeNav();
      }
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
    });
  }

  function initPreloader() {
    /* Always clear no-scroll on load to prevent frozen pages (especially mobile) */
    document.body.classList.remove("no-scroll");
    var el = document.createElement("div");
    el.className = "fh-loader";
    el.innerHTML = '<div class="fh-loader__mark">FH</div>';
    document.body.appendChild(el);
    function done() {
      el.classList.add("is-done");
      document.body.classList.remove("no-scroll");
    }
    window.addEventListener("load", function () {
      setTimeout(done, 260);
    });
    /* Hard fallback: always hide after 1.5s no matter what */
    setTimeout(done, 1500);
  }

  /* ------------------------------------------------------------------ */
  /* Toast + Modal helpers                                              */
  /* ------------------------------------------------------------------ */
  function toast(title, msg) {
    var stack = document.querySelector(".toast-stack");
    if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="toast__icon"></span><div><strong></strong><p></p></div>';
    el.querySelector("strong").textContent = title;
    el.querySelector("p").textContent = msg || "";
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 380);
    }, 3800);
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.add("is-open");
    document.body.classList.add("no-scroll");
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }

  function initModalBindings() {
    document.addEventListener("click", function (e) {
      var open = e.target.closest("[data-modal-open]");
      if (open) { e.preventDefault(); openModal(open.getAttribute("data-modal-open")); return; }
      var close = e.target.closest("[data-modal-close]");
      if (close) {
        e.preventDefault();
        var m = close.closest(".modal");
        if (m) { m.classList.remove("is-open"); document.body.classList.remove("no-scroll"); }
        return;
      }
      if (e.target.classList && e.target.classList.contains("modal")) {
        e.target.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".modal.is-open, .lightbox.is-open").forEach(function (m) {
        m.classList.remove("is-open");
      });
      document.body.classList.remove("no-scroll");
    });
  }

  /* ------------------------------------------------------------------ */
  /* WhatsApp widget                                                    */
  /* ------------------------------------------------------------------ */
  function initWhatsApp() {
    if (document.body.getAttribute("data-wa") === "off") return;
    var msg = encodeURIComponent("Hi " + C.brand + ", I would like to know more about your projects.");
    var quick = [
      { t: "Plot availability", m: "Hi, please share available plots and pricing." },
      { t: "Flat availability", m: "Hi, please share available flats and pricing." },
      { t: "Book a site visit", m: "Hi, I would like to book a site visit." },
      { t: "EMI / payment plan", m: "Hi, please share the payment plan and EMI details." },
      { t: "Request quotation", m: "Hi, please generate a quotation for me." }
    ].map(function (q) {
      return '<a target="_blank" rel="noopener" href="https://wa.me/' + C.whatsapp + "?text=" + encodeURIComponent(q.m) + '">' + q.t + "<span>&rsaquo;</span></a>";
    }).join("");

    var el = document.createElement("div");
    el.className = "wa-widget";
    el.innerHTML =
      '<div class="wa-panel">' +
        '<div class="wa-panel__head"><span class="av">FH</span><div><b>' + C.brand + '</b><small>Typically replies within minutes</small></div></div>' +
        '<div class="wa-panel__body"><div class="wa-bubble">Hello! Welcome to ' + C.brand + '. How can we help you today?</div><div class="wa-quick">' + quick + "</div></div>" +
        '<div class="wa-panel__foot">Secure chat via WhatsApp Business</div>' +
      "</div>" +
      '<a class="wa-fab" href="https://wa.me/' + C.whatsapp + "?text=" + msg + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + I.wa + "</a>";
    document.body.appendChild(el);

    var fab = el.querySelector(".wa-fab");
    fab.addEventListener("click", function (e) {
      e.preventDefault();
      el.classList.toggle("is-open");
    });
    el.querySelectorAll(".wa-quick a").forEach(function (a) {
      a.addEventListener("click", function () { el.classList.remove("is-open"); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
  function boot() {
    buildNav();
    buildFooter();
    initTheme();
    initCursor();
    initMagnetic();
    initTransition();
    initReveal();
    initCounters();
    initProgress();
    initNavBehaviour();
    initModalBindings();
    initWhatsApp();
    initPreloader();
    document.addEventListener("fh:refresh", function () { initReveal(); initCounters(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* Public UI API */
  window.FHUI = { toast: toast, openModal: openModal, closeModal: closeModal, icons: I };
})();
