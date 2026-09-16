/* =====================================================================
   Future Homes Infra - Public site renderers
   One runtime handles every public page; the body[data-page] value picks
   the renderer. All data flows through FH.* (API-ready).
   ===================================================================== */
(function () {
  "use strict";
  if (!window.FH) return;
  var CFG = FH.CONFIG;
  var PAGE = document.body.getAttribute("data-page") || "";
  var CURRENCY = CFG.currency;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function money(n) { return CURRENCY + Number(n || 0).toLocaleString("en-IN"); }
  function moneyShort(n) { n = Number(n || 0); if (n >= 10000000) return CURRENCY + (n / 10000000).toFixed(2) + " Cr"; if (n >= 100000) return CURRENCY + (n / 100000).toFixed(2) + " L"; return money(n); }
  function qs(k) { return new URLSearchParams(location.search).get(k) || ""; }
  function statusClass(s) { return String(s).toLowerCase().replace(/[^a-z]/g, ""); }
  function badge(s) { return '<span class="badge badge--' + statusClass(s) + '">' + esc(s) + "</span>"; }
  function projectById(id) { return FH.store.get("projects").filter(function (p) { return p.id === id; })[0]; }
  function projectName(id) { var p = projectById(id); return p ? p.name : id; }
  function toast(t, m) { if (window.FHUI) FHUI.toast(t, m); }

  /* ------------------------------------------------------------------ */
  /* Shared: unit detail modal                                          */
  /* ------------------------------------------------------------------ */
  var unitModal, unitBody;
  function ensureUnitModal() {
    if (unitModal) return;
    unitModal = document.createElement("div");
    unitModal.className = "modal";
    unitModal.id = "unitModal";
    unitModal.innerHTML =
      '<div class="modal__box">' +
        '<div class="modal__head"><h3 id="unitModalTitle">Unit Details</h3>' +
        '<button class="modal__close" data-modal-close aria-label="Close">&times;</button></div>' +
        '<div class="modal__body" id="unitModalBody"></div>' +
        '<div class="modal__foot" id="unitModalFoot"></div>' +
      "</div>";
    document.body.appendChild(unitModal);
    unitBody = $("#unitModalBody", unitModal);
  }

  function openUnit(kind, unit) {
    ensureUnitModal();
    var p = projectById(unit.projectId);
    $("#unitModalTitle", unitModal).textContent = (kind === "flat" ? "Flat " : "Plot ") + unit.number + " \u00B7 " + (p ? p.name : "");
    var rows;
    if (kind === "flat") {
      rows = [
        ["Project", p ? p.name : unit.projectId],
        ["Flat Number", unit.number],
        ["Wing / Floor", unit.wing + " / Floor " + unit.floor],
        ["Flat Type", unit.flatType],
        ["Super Built Area", unit.superArea + " Sq.Ft."],
        ["Carpet Area", unit.carpetArea + " Sq.Ft."],
        ["Facing", unit.facing],
        ["Rate", money(unit.rate) + " / Sq.Ft."],
        ["Estimated Value", money(unit.rate * unit.superArea)],
        ["Status", badge(unit.status)]
      ];
    } else {
      rows = [
        ["Project", p ? p.name : unit.projectId],
        ["Plot Number", unit.number],
        ["Area", unit.area + " Sq.Ft."],
        ["Plot Type", unit.plotType],
        ["Facing", unit.facing],
        ["Rate", money(unit.rate) + " / Sq.Ft."],
        ["Estimated Value", money(unit.rate * unit.area)],
        ["Status", badge(unit.status)]
      ];
    }
    unitBody.innerHTML = '<div class="detail-list">' + rows.map(function (r) {
      return "<div><dt>" + esc(r[0]) + "</dt><dd><b>" + r[1] + "</b></dd></div>";
    }).join("") + "</div>";
    $("#unitModalFoot", unitModal).innerHTML =
      '<a class="btn btn--ghost" href="location.html" data-no-transition>Project Map</a>' +
      '<button class="btn btn--dark" data-enquire="' + kind + '" data-id="' + esc(unit.id) + '">Request Enquiry</button>' +
      '<a class="btn btn--primary" href="contact.html#enquiry" data-no-transition>Generate Quotation</a>';
    FHUI.openModal("unitModal");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-enquire]");
    if (!btn) return;
    e.preventDefault();
    var kind = btn.getAttribute("data-enquire");
    var id = btn.getAttribute("data-id");
    var base = kind === "flat" ? FH.store.get("flats") : FH.store.get("plots");
    var unit = base.filter(function (u) { return u.id === id; })[0];
    if (!unit) return;
    addEnquiry({
      name: "Website Visitor",
      phone: "",
      email: "",
      interest: kind === "flat" ? "Flat" : "Plot",
      projectId: unit.projectId,
      budget: "",
      message: "Enquiry for " + (kind === "flat" ? "Flat " : "Plot ") + unit.number + " - " + projectName(unit.projectId)
    });
    FHUI.closeModal("unitModal");
    toast("Enquiry recorded", "Our executive will contact you shortly.");
  });

  /* ------------------------------------------------------------------ */
  /* Enquiries                                                          */
  /* ------------------------------------------------------------------ */
  function addEnquiry(data) {
    var list = FH.store.get("enquiries").slice();
    var rec = {
      id: FH.store.nextId ? FH.store.nextId("ENQ", list) : "ENQ-" + (1001 + list.length),
      name: data.name, phone: data.phone, email: data.email, interest: data.interest,
      projectId: data.projectId, budget: data.budget, message: data.message,
      date: new Date().toISOString().slice(0, 10), executive: "Unassigned", status: "New", notes: []
    };
    list.unshift(rec);
    FH.store.set("enquiries", list);
    return rec;
  }

  /* ------------------------------------------------------------------ */
  /* Project card                                                       */
  /* ------------------------------------------------------------------ */
  function projectCard(p) {
    var plots = FH.store.get("plots").filter(function (x) { return x.projectId === p.id; });
    var flats = FH.store.get("flats").filter(function (x) { return x.projectId === p.id; });
    var avail = plots.filter(function (x) { return x.status === "Available"; }).length + flats.filter(function (x) { return x.status === "Available"; }).length;
    var total = plots.length + flats.length;
    var mediaHtml = p.image ? '<img src="' + esc(p.image) + '" style="width:100%;height:100%;object-fit:cover">' : '<div class="art ' + (p.art || "art--blue") + '">' + esc(p.name.split(" ")[0]) + "</div>";
    return '<article class="card" data-reveal>' +
      '<div class="card__media">' + mediaHtml +
        '<span class="badge badge--' + statusClass(p.status) + '" style="position:absolute;top:14px;left:14px;background:#fff">' + esc(p.status) + "</span></div>" +
      '<div class="card__body">' +
        "<h3>" + esc(p.name) + "</h3>" +
        '<div class="card__meta"><span>Project Type: ' + esc(p.type) + "</span><span>Location: " + esc(p.location) + "</span></div>" +
        '<div class="flex-between"><div><small class="muted" style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase">Starting</small><div style="font-weight:700;color:var(--blue-deep)">' + moneyShort(p.startPrice) + "</div></div>" +
        '<div style="text-align:right"><small class="muted" style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase">Available</small><div style="font-weight:700">' + avail + " / " + total + "</div></div></div>" +
        '<div class="card__actions"><a class="btn btn--primary btn--sm" href="project-detail.html?id=' + p.id + '" data-magnetic>View Project</a>' +
        '<a class="btn btn--ghost btn--sm" href="' + (flats.length ? "flat-status.html" : "plot-status.html") + '?project=' + p.id + '" data-magnetic>Check Availability</a></div>' +
      "</div></article>";
  }

  /* ------------------------------------------------------------------ */
  /* HOME                                                               */
  /* ------------------------------------------------------------------ */
  function renderHome() {
    var c = $("#homeStats");
    if (c) {
      var s = FH.stats();
      var items = [
        ["Total Projects", s.totalProjects], ["Total Plots", s.totalPlots], ["Available Plots", s.availablePlots],
        ["Total Flats", s.totalFlats], ["Available Flats", s.availableFlats], ["Happy Families", s.happyFamilies]
      ];
      c.innerHTML = items.map(function (i) {
        return '<div class="stat"><b data-count="' + i[1] + '">0</b><span>' + i[0] + "</span></div>";
      }).join("");
      if (window.FHUI) initCountsIn(c);
    }
    var f = $("#featuredProjects");
    if (f) f.innerHTML = FH.store.get("projects").slice(0, 3).map(projectCard).join("");
    buildHeroSelects();
    var toggle = $("#searchToggle");
    if (toggle) {
      function switchTab(e) {
        var b = e.target.closest("button"); if (!b) return;
        if (e) e.preventDefault();
        $$("button", toggle).forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var kind = b.getAttribute("data-kind") || "plot";
        updateHeroSelects(kind);
      }
      toggle.addEventListener("click", switchTab);
    }
    var form = $("#heroSearch");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = ($("#searchToggle .is-active") || {}).getAttribute ? $("#searchToggle .is-active").getAttribute("data-kind") : "plot";
      var params = new URLSearchParams();
      if ($("#hsProject") && $("#hsProject").value) params.set("project", $("#hsProject").value);
      if ($("#hsLocation") && $("#hsLocation").value) params.set("location", $("#hsLocation").value);
      if ($("#hsFacing") && $("#hsFacing").value) params.set("facing", $("#hsFacing").value);
      if ($("#hsArea") && $("#hsArea").value) params.set("area", $("#hsArea").value);
      if ($("#hsBudget") && $("#hsBudget").value) params.set("budget", $("#hsBudget").value);
      window.location.href = (kind === "flat" ? "flat-status.html?" : "plot-status.html?") + params.toString();
    });
  }

  function initCountsIn(scope) {
    $$("[data-count]", scope).forEach(function (el) {
      if (el.hasAttribute("data-counted")) return;
      el.setAttribute("data-counted", "");
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var start = performance.now();
      (function step(now) {
        var p = Math.min((now - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN");
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }

  function updateHeroSelects(kind) {
    var projSel = $("#hsProject"), locSel = $("#hsLocation"), facingSel = $("#hsFacing");
    if (!projSel) return;
    var projects = FH.store.get("projects");
    var plots = FH.store.get("plots");
    var flats = FH.store.get("flats");

    var filteredProjects = projects.filter(function (p) {
      if (kind === "flat") {
        return (p.type && p.type.indexOf("Flat") > -1) || flats.some(function (f) { return f.projectId === p.id; });
      } else {
        return (p.type && p.type.indexOf("Plot") > -1) || plots.some(function (pl) { return pl.projectId === p.id; });
      }
    });

    var currentVal = projSel.value;
    projSel.innerHTML = '<option value="">All Projects</option>' + filteredProjects.map(function (p) {
      return '<option value="' + p.id + '">' + esc(p.name) + "</option>";
    }).join("");
    if (filteredProjects.some(function (p) { return p.id === currentVal; })) {
      projSel.value = currentVal;
    }

    if (locSel) {
      var currentLoc = locSel.value;
      var locs = filteredProjects.map(function (p) { return p.location; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
      locSel.innerHTML = '<option value="">All Locations</option>' + locs.map(function (l) { return "<option>" + esc(l) + "</option>"; }).join("");
      if (locs.indexOf(currentLoc) > -1) locSel.value = currentLoc;
    }

    if (facingSel) {
      var unitSource = (kind === "flat") ? flats : plots;
      var uniqueFacings = [];
      unitSource.forEach(function (u) {
        if (u.facing) {
          var f = String(u.facing).trim();
          if (f && !uniqueFacings.some(function(x) { return x.toLowerCase() === f.toLowerCase(); })) {
            uniqueFacings.push(f);
          }
        }
      });
      var defaults = ["East", "West", "North", "South", "North-East", "South-East", "North-West", "South-West"];
      defaults.forEach(function(d) {
        if (!uniqueFacings.some(function(x) { return x.toLowerCase() === d.toLowerCase(); })) {
          uniqueFacings.push(d);
        }
      });
      var curFacing = facingSel.value;
      facingSel.innerHTML = '<option value="">Any Facing</option>' + uniqueFacings.map(function (f) {
        return '<option value="' + esc(f) + '">' + esc(f) + '</option>';
      }).join("");
      if (curFacing && uniqueFacings.some(function(x) { return x.toLowerCase() === curFacing.toLowerCase(); })) {
        facingSel.value = curFacing;
      }
      if (facingSel._rebuildCustom) facingSel._rebuildCustom();
    }

    if (projSel._rebuildCustom) projSel._rebuildCustom();
    if (locSel && locSel._rebuildCustom) locSel._rebuildCustom();
  }

  function initCustomSelects(scope) {
    if ('ontouchstart' in window || window.innerWidth <= 1080) return;
    scope = scope || document;
    $$(".select", scope).forEach(function (selectEl) {
      if (selectEl.closest("#adminModal") || selectEl.closest("#unitModal") || selectEl.closest(".admin-main")) return;

      if (selectEl.hasAttribute("data-customized")) {
        if (selectEl._rebuildCustom) selectEl._rebuildCustom();
        return;
      }
      selectEl.setAttribute("data-customized", "true");
      selectEl.style.display = "none";

      var wrapper = document.createElement("div");
      wrapper.className = "custom-select";

      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-select__trigger";

      var labelSpan = document.createElement("span");
      labelSpan.className = "custom-select__label";

      var arrowIcon = document.createElement("span");
      arrowIcon.innerHTML = '<svg class="custom-select__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

      trigger.appendChild(labelSpan);
      trigger.appendChild(arrowIcon.firstChild);
      wrapper.appendChild(trigger);

      /* ---- dropdown: appended to body for guaranteed top-layer stacking ---- */
      var dropdown = document.createElement("div");
      dropdown.className = "custom-select__dropdown";
      document.body.appendChild(dropdown);          /* portal to body */

      selectEl.parentNode.insertBefore(wrapper, selectEl);

      function updateTriggerLabel() {
        var selectedOpt = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
        labelSpan.textContent = selectedOpt ? selectedOpt.textContent : "";
      }

      function positionDropdown() {
        var rect = trigger.getBoundingClientRect();
        var spaceBelow = window.innerHeight - rect.bottom;
        var dropH = Math.min(260, selectEl.options.length * 42 + 12);
        var topPos = (spaceBelow < dropH + 8 && rect.top > dropH + 8)
          ? (rect.top - dropH - 4)
          : (rect.bottom + 4);
        dropdown.style.position = "fixed";
        dropdown.style.top  = topPos + "px";
        dropdown.style.left = rect.left + "px";
        dropdown.style.width = rect.width + "px";
        dropdown.style.zIndex = "2147483647";
        dropdown.style.maxHeight = "260px";
        dropdown.style.overflowY = "auto";
      }

      function resetDropdown() {
        dropdown.style.cssText = "";
      }

      function selectItem(opt, item, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        selectEl.value = opt.value;
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        updateTriggerLabel();
        $$(".custom-select__option", dropdown).forEach(function (o) { o.classList.remove("is-selected"); });
        item.classList.add("is-selected");
        wrapper.classList.remove("is-open");
        dropdown.classList.remove("is-open");
        resetDropdown();
      }

      function buildOptions() {
        dropdown.innerHTML = "";
        Array.prototype.slice.call(selectEl.options).forEach(function (opt) {
          var item = document.createElement("div");
          item.className = "custom-select__option" + (String(opt.value) === String(selectEl.value) ? " is-selected" : "");
          item.textContent = opt.textContent;
          item.setAttribute("data-value", opt.value);

          item.addEventListener("click", function (e) { selectItem(opt, item, e); });
          dropdown.appendChild(item);
        });
        updateTriggerLabel();
      }

      selectEl._rebuildCustom = buildOptions;
      buildOptions();

      selectEl.addEventListener("change", updateTriggerLabel);

      var lastSelectToggle = 0;
      function toggleDropdown(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var now = Date.now();
        if (now - lastSelectToggle < 250) return;
        lastSelectToggle = now;

        var wasOpen = wrapper.classList.contains("is-open");

        /* close every open dropdown */
        $$(".custom-select.is-open").forEach(function (cs) {
          cs.classList.remove("is-open");
        });
        $$(".custom-select__dropdown.is-open", document.body).forEach(function (dd) {
          dd.classList.remove("is-open");
          dd.style.cssText = "";
        });

        if (!wasOpen) {
          positionDropdown();
          wrapper.classList.add("is-open");
          dropdown.classList.add("is-open");
          /* reposition on scroll while open */
          function onScrollReposition() {
            if (wrapper.classList.contains("is-open")) {
              positionDropdown();
            } else {
              window.removeEventListener("scroll", onScrollReposition, true);
            }
          }
          window.addEventListener("scroll", onScrollReposition, true);
        }
      }

      trigger.addEventListener("click", toggleDropdown);
    });
  }

  /* Document click to close custom dropdowns when clicking outside */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".custom-select") || e.target.closest(".custom-select__dropdown")) return;
    $$(".custom-select.is-open").forEach(function (cs) { cs.classList.remove("is-open"); });
    document.querySelectorAll(".custom-select__dropdown.is-open").forEach(function (dd) {
      dd.classList.remove("is-open");
    });
  });

  function buildHeroSelects() {
    if ($("#heroSearch")) initCustomSelects($("#heroSearch"));
    var activeBtn = $("#searchToggle .is-active");
    var kind = activeBtn && activeBtn.getAttribute ? activeBtn.getAttribute("data-kind") : "plot";
    updateHeroSelects(kind);
  }

  function buildPlotFacingSelect(sel, projectId) {
    if (!sel) return;
    var plots = FH.store.get("plots") || [];
    if (projectId) {
      plots = plots.filter(function(p) { return p.projectId === projectId; });
    }
    var uniqueFacings = [];
    plots.forEach(function (p) {
      if (p.facing) {
        var f = String(p.facing).trim();
        if (f && !uniqueFacings.some(function(x) { return x.toLowerCase() === f.toLowerCase(); })) {
          uniqueFacings.push(f);
        }
      }
    });
    var defaults = ["East", "West", "North", "South", "North-East", "South-East", "North-West", "South-West"];
    defaults.forEach(function(d) {
      if (!uniqueFacings.some(function(x) { return x.toLowerCase() === d.toLowerCase(); })) {
        uniqueFacings.push(d);
      }
    });
    var cur = sel.value;
    sel.innerHTML = '<option value="">Any Facing</option>' + uniqueFacings.map(function (f) {
      return '<option value="' + esc(f) + '">' + esc(f) + '</option>';
    }).join("");
    if (cur && uniqueFacings.some(function(x) { return x.toLowerCase() === cur.toLowerCase(); })) {
      sel.value = cur;
    }
    if (sel._rebuildCustom) sel._rebuildCustom();
  }

  function buildFlatFacingSelect(sel, projectId) {
    if (!sel) return;
    var flats = FH.store.get("flats") || [];
    if (projectId) {
      flats = flats.filter(function(f) { return f.projectId === projectId; });
    }
    var uniqueFacings = [];
    flats.forEach(function (f) {
      if (f.facing) {
        var facingStr = String(f.facing).trim();
        if (facingStr && !uniqueFacings.some(function(x) { return x.toLowerCase() === facingStr.toLowerCase(); })) {
          uniqueFacings.push(facingStr);
        }
      }
    });
    var defaults = ["East", "West", "North", "South", "North-East", "South-East", "North-West", "South-West"];
    defaults.forEach(function(d) {
      if (!uniqueFacings.some(function(x) { return x.toLowerCase() === d.toLowerCase(); })) {
        uniqueFacings.push(d);
      }
    });
    var cur = sel.value;
    sel.innerHTML = '<option value="">Any Facing</option>' + uniqueFacings.map(function (f) {
      return '<option value="' + esc(f) + '">' + esc(f) + '</option>';
    }).join("");
    if (cur && uniqueFacings.some(function(x) { return x.toLowerCase() === cur.toLowerCase(); })) {
      sel.value = cur;
    }
    if (sel._rebuildCustom) sel._rebuildCustom();
  }

  /* ------------------------------------------------------------------ */
  /* PROJECTS list                                                      */
  /* ------------------------------------------------------------------ */
  function renderProjects() {
    var grid = $("#projectsGrid");
    if (!grid) return;
    buildHeroSelects();
    var fType = $("#pfType"), fLoc = $("#pfLocation"), fStatus = $("#pfStatus"), fBudget = $("#pfBudget");
    var projects = FH.store.get("projects");
    if (fLoc) fLoc.innerHTML = '<option value="">All Locations</option>' + projects.map(function (p) { return p.location; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (l) { return "<option>" + esc(l) + "</option>"; }).join("");
    function apply() {
      var t = fType && fType.value, l = fLoc && fLoc.value, s = fStatus && fStatus.value, b = fBudget && fBudget.value;
      var list = projects.filter(function (p) {
        if (t && p.type !== t) return false;
        if (l && p.location !== l) return false;
        if (s && p.status !== s) return false;
        if (b) { var parts = b.split("-").map(Number); if (p.startPrice < parts[0] || p.startPrice > parts[1]) return false; }
        return true;
      });
      grid.innerHTML = list.length ? list.map(projectCard).join("") : '<div class="table-empty" style="grid-column:1/-1">No projects match your filters.</div>';
      document.dispatchEvent(new Event("fh:refresh"));
    }
    ["#pfType", "#pfLocation", "#pfStatus", "#pfBudget"].forEach(function (id) {
      var el = $(id); if (el) el.addEventListener("change", apply);
    });
    var reset = $("#pfReset");
    if (reset) reset.addEventListener("click", function () { [fType, fLoc, fStatus, fBudget].forEach(function (e) { if (e) { e.value = ""; e.dispatchEvent(new Event("change", { bubbles: true })); } }); apply(); toast("Filters cleared", "Showing all projects."); });
    apply();
  }

  /* ------------------------------------------------------------------ */
  /* PLOT STATUS                                                        */
  /* ------------------------------------------------------------------ */
  var plotState = {};
  function renderPlotStatus() {
    var table = $("#plotTable");
    if (!table) return;
    buildProjectSelect($("#psProject"));
    buildPlotFacingSelect($("#psFacing"));
    buildStatCards("#plotSummary", "plot");
    plotState = {
      project: qs("project"), location: qs("location"), type: qs("type"), facing: qs("facing"), area: qs("area"), status: qs("status")
    };
    if ($("#psProject") && plotState.project) $("#psProject").value = plotState.project;
    if ($("#psType") && plotState.type) $("#psType").value = plotState.type;
    if ($("#psFacing") && plotState.facing) $("#psFacing").value = plotState.facing;
    if ($("#psArea") && plotState.area) $("#psArea").value = plotState.area;
    if ($("#psStatus") && plotState.status) $("#psStatus").value = plotState.status;
    bindPlotFilters();
    renderPlotTable();
    renderPlotMap();
    initCustomSelects($(".filter-bar"));

    if ($("#psProject")) {
      $("#psProject").addEventListener("change", function () {
        buildPlotFacingSelect($("#psFacing"), $("#psProject").value);
      });
    }

    // View Report Button scroll & filter
    var btnReport = $(".filter-actions button.btn--primary");
    if (btnReport) {
      btnReport.addEventListener("click", function () {
        renderPlotTable();
        renderPlotMap();
        table.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("Report updated", "Filtered plot list displayed.");
      });
    }

    var reset = $("#psReset");
    if (reset) reset.addEventListener("click", function () {
      plotState = { project: "", location: "", type: "", facing: "", area: "", status: "" };
      ["#psProject", "#psType", "#psFacing", "#psArea", "#psStatus"].forEach(function (id) { var e = $(id); if (e) { e.value = ""; e.dispatchEvent(new Event("change", { bubbles: true })); } });
      buildPlotFacingSelect($("#psFacing"));
      renderPlotTable(); renderPlotMap(); toast("Report reset", "Showing complete plot inventory.");
    });
  }

  function buildProjectSelect(sel) {
    if (!sel) return;
    var projects = FH.store.get("projects").filter(function (p) { return FH.store.get("plots").some(function (x) { return x.projectId === p.id; }); });
    sel.innerHTML = '<option value="">All Projects</option>' + projects.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
  }

  function bindPlotFilters() {
    var map = { "#psProject": "project", "#psType": "type", "#psFacing": "facing", "#psArea": "area", "#psStatus": "status" };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("change", function () {
        if (id === "#psProject") plotState.project = el.value;
        else if (id === "#psFacing") plotState.facing = el.value;
        else if (id === "#psArea") plotState.area = el.value;
        else if (id === "#psType") plotState.type = el.value;
        else if (id === "#psStatus") plotState.status = el.value;
        renderPlotTable();
        renderPlotMap();
      });
    });
  }

  function filterUnits(list) {
    return list.filter(function (u) {
      if (plotState.project && u.projectId !== plotState.project) return false;
      if (plotState.location) {
        var pObj = projectById(u.projectId);
        if (!pObj || pObj.location !== plotState.location) return false;
      }
      if (plotState.type && String(u.plotType || "").trim().toLowerCase() !== String(plotState.type).trim().toLowerCase()) return false;
      if (plotState.facing && String(u.facing || "").trim().toLowerCase() !== String(plotState.facing).trim().toLowerCase()) return false;
      if (plotState.status && String(u.status || "").trim().toLowerCase() !== String(plotState.status).trim().toLowerCase()) return false;
      if (plotState.area) {
        var p = plotState.area.split("-").map(Number);
        var a = u.area || u.superArea;
        if (a < p[0] || a > p[1]) return false;
      }
      return true;
    });
  }

  function renderPlotTable() {
    var list = filterUnits(FH.store.get("plots"));
    var tb = $("#plotTableBody");
    if (!tb) return;
    if (!list.length) { tb.innerHTML = '<tr><td colspan="7"><div class="table-empty">No plots match the selected criteria.</div></td></tr>'; return; }
    tb.innerHTML = list.map(function (u) {
      return "<tr><td><b>" + esc(u.number) + "</b></td><td>" + u.area.toLocaleString("en-IN") + '</td><td>' + esc(u.plotType) + "</td><td>" + esc(u.facing) + "</td><td>" + money(u.rate) + "</td><td>" + badge(u.status) + "</td>" +
        '<td><div class="actions"><button class="btn btn--sm btn--ghost" data-view="plot" data-id="' + u.id + '">View</button>' +
        '<button class="btn btn--sm btn--ghost" data-view="plot" data-id="' + u.id + '">Details</button>' +
        '<a class="btn btn--sm btn--primary" href="contact.html#enquiry" data-no-transition>Quotation</a></div></td></tr>';
    }).join("");
  }

  function renderPlotMap() {
    var map = $("#plotMap");
    if (!map) return;
    var list = filterUnits(FH.store.get("plots"));
    if (!list.length) { map.innerHTML = '<div style="color:#9aa7b5;padding:20px">No plots to display.</div>'; return; }
    map.innerHTML = list.slice(0, 120).map(function (u) {
      return '<button class="plot-unit" data-status="' + esc(u.status) + '" data-view="plot" data-id="' + u.id + '">' + esc(u.number) + "</button>";
    }).join("");
  }

  function buildStatCards(sel, kind) {
    var host = $(sel); if (!host) return;
    var s = FH.stats();
    var items = kind === "plot"
      ? [["Total Plots", s.totalPlots, ""], ["Available", s.availablePlots, "Available"], ["Booked", s.bookedPlots, "Booked"], ["Agreement", s.agreementPlots, "Agreement"], ["Sale Deed", s.saleDeedPlots, "Sale Deed"], ["Hold", s.holdPlots, "Hold"]]
      : [["Total Flats", s.totalFlats, ""], ["Available", s.availableFlats, "Available"], ["Booked", s.bookedFlats, "Booked"], ["Agreement To Sale", s.agreementFlats, "Agreement"], ["Sold", s.soldFlats, "Sold"]];
    host.innerHTML = items.map(function (i) {
      return '<div class="stat" style="cursor:pointer" data-filter-status="' + i[2] + '" title="Click to filter by ' + i[0] + '"><b data-count="' + i[1] + '">0</b><span>' + i[0] + "</span></div>";
    }).join("");
    initCountsIn(host);

    // Make summary stat cards clickable to filter
    host.addEventListener("click", function (e) {
      var statEl = e.target.closest("[data-filter-status]");
      if (!statEl) return;
      var statusVal = statEl.getAttribute("data-filter-status");
      if (kind === "plot") {
        plotState.status = statusVal;
        if ($("#psStatus")) $("#psStatus").value = statusVal;
        renderPlotTable();
        renderPlotMap();
      } else {
        if ($("#fsStatus")) $("#fsStatus").value = statusVal;
        var evt = new Event("change");
        if ($("#fsStatus")) $("#fsStatus").dispatchEvent(evt);
      }
      toast("Filter Applied", statusVal ? "Showing " + statusVal + " units." : "Showing all units.");
    });
  }

  /* ------------------------------------------------------------------ */
  /* FLAT STATUS                                                        */
  /* ------------------------------------------------------------------ */
  function renderFlatStatus() {
    var table = $("#flatTable");
    if (!table) return;
    var proj = $("#fsProject");
    if (proj) {
      var projects = FH.store.get("projects").filter(function (p) { return FH.store.get("flats").some(function (x) { return x.projectId === p.id; }); });
      proj.innerHTML = '<option value="">All Projects</option>' + projects.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    }
    buildFlatFacingSelect($("#fsFacing"));
    buildStatCards("#flatSummary", "flat");
    
    var fProject = $("#fsProject"), fType = $("#fsType"), fWing = $("#fsWing"), fFloor = $("#fsFloor"), fFacing = $("#fsFacing"), fStatus = $("#fsStatus"), fArea = $("#fsArea");
    if (fProject && qs("project")) fProject.value = qs("project");
    if (fFacing && qs("facing")) fFacing.value = qs("facing");
    if (fType && qs("type")) fType.value = qs("type");
    if (fStatus && qs("status")) fStatus.value = qs("status");
    if (fArea && qs("area")) fArea.value = qs("area");

    if (fProject) {
      fProject.addEventListener("change", function () {
        buildFlatFacingSelect($("#fsFacing"), fProject.value);
      });
    }

    function apply() {
      var reqLocation = qs("location");
      var list = FH.store.get("flats").filter(function (u) {
        if (proj && proj.value && u.projectId !== proj.value) return false;
        if (reqLocation) {
          var pObj = projectById(u.projectId);
          if (!pObj || pObj.location !== reqLocation) return false;
        }
        if (fType && fType.value && String(u.flatType || "").trim().toLowerCase() !== String(fType.value).trim().toLowerCase()) return false;
        if (fWing && fWing.value && String(u.wing || "").trim().toLowerCase() !== String(fWing.value).trim().toLowerCase()) return false;
        if (fFloor && fFloor.value && String(u.floor) !== fFloor.value) return false;
        if (fFacing && fFacing.value && String(u.facing || "").trim().toLowerCase() !== String(fFacing.value).trim().toLowerCase()) return false;
        if (fStatus && fStatus.value && String(u.status || "").trim().toLowerCase() !== String(fStatus.value).trim().toLowerCase()) return false;
        if (fArea && fArea.value) {
          var pArea = fArea.value.split("-").map(Number);
          var a = u.superArea || u.carpetArea;
          if (a < pArea[0] || a > pArea[1]) return false;
        }
        return true;
      });
      var tb = $("#flatTableBody");
      if (!list.length) { tb.innerHTML = '<tr><td colspan="9"><div class="table-empty">No flats match the selected criteria.</div></td></tr>'; return; }
      tb.innerHTML = list.map(function (u) {
        return "<tr><td><b>" + esc(u.number) + "</b></td><td>" + esc(u.wing) + "</td><td>" + u.floor + "</td><td>" + esc(u.flatType) + "</td><td>" + u.superArea.toLocaleString("en-IN") + "</td><td>" + esc(u.facing) + "</td><td>" + money(u.rate) + "</td><td>" + badge(u.status) + "</td>" +
          '<td><div class="actions"><button class="btn btn--sm btn--ghost" data-view="flat" data-id="' + u.id + '">View</button>' +
          '<a class="btn btn--sm btn--primary" href="contact.html#enquiry" data-no-transition>Quotation</a>' +
          '<button class="btn btn--sm btn--dark" data-enquire="flat" data-id="' + u.id + '">Enquire</button></div></td></tr>';
      }).join("");
    }
    [proj, fType, fWing, fFloor, fFacing, fStatus, fArea].forEach(function (el) { if (el) el.addEventListener("change", apply); });

    var btnReport = $(".filter-actions button.btn--primary");
    if (btnReport) {
      btnReport.addEventListener("click", function () {
        apply();
        table.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("Report updated", "Filtered flat list displayed.");
      });
    }

    var reset = $("#fsReset");
    if (reset) reset.addEventListener("click", function () { [proj, fType, fWing, fFloor, fFacing, fStatus, fArea].forEach(function (e) { if (e) { e.value = ""; e.dispatchEvent(new Event("change", { bubbles: true })); } }); buildFlatFacingSelect($("#fsFacing")); apply(); toast("Report reset", "Showing complete flat inventory."); });
    apply();
    initCustomSelects($(".filter-bar"));
  }

  /* ------------------------------------------------------------------ */
  /* LOCATION                                                           */
  /* ------------------------------------------------------------------ */
  function renderLocation() {
    var grid = $("#locationGrid"); if (!grid) return;
    grid.innerHTML = FH.store.get("projects").map(function (p) {
      return '<article class="card" data-reveal><div class="card__body">' +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="muted" style="font-size:.9rem">' + esc(p.address) + "</p>" +
        '<div class="detail-list"><div><dt>City</dt><dd><b>' + esc(p.city) + "</b></dd></div>" +
        "<div><dt>State</dt><dd><b>" + esc(p.state) + "</b></dd></div>" +
        "<div><dt>Connectivity</dt><dd><b>" + esc(p.location) + "</b></dd></div></div>" +
        '<div class="card__actions"><a class="btn btn--sm btn--primary" href="project-detail.html?id=' + p.id + '" data-magnetic>View Project</a></div>' +
      "</div></article>";
    }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* GALLERY                                                            */
  /* ------------------------------------------------------------------ */
  function renderGallery() {
    var grid = $("#galleryGrid"); if (!grid) return;
    var tabs = $("#galleryTabs");
    var cats = ["All", "Project Images", "Plot Images", "Flat Images", "Construction Updates"];
    var active = "All";
    var projFilter = $("#galleryProject");
    if (projFilter) {
      projFilter.innerHTML = '<option value="">All Projects</option>' + FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    }
    if (tabs) tabs.innerHTML = cats.map(function (c, i) { return '<button type="button" class="' + (i === 0 ? "is-active" : "") + '" data-cat="' + c + '">' + c + "</button>"; }).join("");
    function draw() {
      var list = FH.store.get("gallery").filter(function (g) {
        if (active !== "All" && g.category !== active) return false;
        if (projFilter && projFilter.value && g.projectId !== projFilter.value) return false;
        return true;
      });
      grid.innerHTML = list.length ? list.map(function (g) {
        var mediaHtml = g.image ? '<img src="' + esc(g.image) + '" style="width:100%;height:100%;object-fit:cover">' : '<div class="art ' + (g.art || "art--blue") + '">' + esc(g.category) + '</div>';
        return '<div class="gallery-item" data-lightbox="' + g.id + '">' + mediaHtml + '<div class="gallery-item__overlay"><small>' + esc(projectName(g.projectId)) + " &middot; " + esc(g.category) + "</small><b>" + esc(g.title) + "</b></div></div>";
      }).join("") : '<div class="table-empty" style="grid-column:1/-1">No images in this category yet.</div>';
    }
    if (tabs) tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]"); if (!b) return;
      active = b.getAttribute("data-cat");
      $$("button", tabs).forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      draw();
    });
    if (projFilter) projFilter.addEventListener("change", draw);
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox__close" aria-label="Close">&times;</button><div class="lightbox__stage"><div id="lbMedia"></div><div class="lightbox__cap"><div><small id="lbCat"></small><b id="lbTitle" style="display:block;font-size:1.1rem"></b></div><small id="lbDate"></small></div></div>';
    document.body.appendChild(lb);
    grid.addEventListener("click", function (e) {
      var item = e.target.closest("[data-lightbox]"); if (!item) return;
      var g = FH.store.get("gallery").filter(function (x) { return x.id === item.getAttribute("data-lightbox"); })[0];
      if (!g) return;
      var stage = $("#lbMedia");
      if (g.image) {
        stage.className = "";
        stage.innerHTML = '<img src="' + esc(g.image) + '" style="max-width:100%;max-height:75vh;object-fit:contain;border-radius:12px">';
      } else {
        stage.className = "art " + (g.art || "art--blue");
        stage.textContent = g.title;
      }
      $("#lbTitle").textContent = g.title + " \u00B7 " + projectName(g.projectId);
      $("#lbCat").textContent = g.category;
      $("#lbDate").textContent = "Uploaded " + g.date;
      lb.classList.add("is-open");
      document.body.classList.add("no-scroll");
    });
    lb.addEventListener("click", function (e) { lb.classList.remove("is-open"); document.body.classList.remove("no-scroll"); });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* BANK DETAILS                                                       */
  /* ------------------------------------------------------------------ */
  function renderBank() {
    var card = $("#bankCard"); if (!card) return;
    var typeSel = $("#bankType"), projSel = $("#bankProject");
    function projectsForType() {
      var plots = FH.store.get("plots"), flats = FH.store.get("flats");
      return FH.store.get("projects").filter(function (p) {
        if (!typeSel || !typeSel.value) return true;
        if (typeSel.value === "Plot Project") return plots.some(function (x) { return x.projectId === p.id; });
        return flats.some(function (x) { return x.projectId === p.id; });
      });
    }
    function fillProjects() {
      var list = projectsForType();
      projSel.innerHTML = list.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
      draw();
    }
    function draw() {
      var banks = FH.store.get("banks");
      var b = banks.filter(function (x) { return x.projectId === projSel.value; })[0];
      if (!b) { card.innerHTML = '<p class="muted">Bank details are not configured for this project. Please contact the sales office.</p>'; return; }
      if (b.visible === false) { card.innerHTML = '<p style="color:#9aa7b5">Bank details for this project are currently hidden by the administrator for security reasons.</p>'; return; }
      card.innerHTML = '<div class="flex-between" style="margin-bottom:22px"><h3 style="margin:0;color:#fff">' + esc(projectName(b.projectId)) + '</h3>' + badge("Available") + "</div>" +
        '<div class="bank-card__rows">' +
        [["Account Name", b.accountName], ["Account Number", b.accountNumber], ["IFSC Code", b.ifsc], ["Bank Name", b.bankName], ["Branch", b.branch]].map(function (r) {
          return '<div class="bank-row"><span>' + r[0] + "</span><b>" + esc(r[1]) + "</b></div>";
        }).join("") + "</div>" +
        '<div class="flex-between" style="margin-top:24px"><div class="qr-box"><div class="art art--ink" style="width:100%;height:100%;border-radius:8px;font-size:.7rem">SCAN QR</div></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--light btn--sm" id="bankDownload" data-magnetic>Download</button><button class="btn btn--light btn--sm" id="bankShare" data-magnetic>Share</button></div></div>';
      var dl = $("#bankDownload");
      if (dl) dl.addEventListener("click", function () { downloadText("Future Homes Infra - Bank Details", bankText(b)); });
      var sh = $("#bankShare");
      if (sh) sh.addEventListener("click", function () { shareText("Bank Details", bankText(b)); });
    }
    function bankText(b) {
      return "Future Homes Infra - Bank Details\n\nProject: " + projectName(b.projectId) + "\nAccount Name: " + b.accountName + "\nAccount Number: " + b.accountNumber + "\nIFSC: " + b.ifsc + "\nBank: " + b.bankName + "\nBranch: " + b.branch;
    }
    if (typeSel) typeSel.addEventListener("change", fillProjects);
    if (projSel) projSel.addEventListener("change", draw);
    fillProjects();
  }

  function downloadText(title, text) {
    var blob = new Blob([text], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".txt";
    document.body.appendChild(a); a.click(); a.remove();
    toast("Download started", "Your file is being saved.");
  }
  function shareText(title, text) {
    if (navigator.share) navigator.share({ title: title, text: text }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Copied", "Details copied to clipboard."); });
    else toast("Share unavailable", "Sharing is not supported on this browser.");
  }

  /* ------------------------------------------------------------------ */
  /* EMI CALCULATOR                                                     */
  /* ------------------------------------------------------------------ */
  function renderEmi() {
    var form = $("#emiForm"); if (!form) return;
    var pv = $("#emiValue"), dp = $("#emiDown"), rate = $("#emiRate"), tenure = $("#emiTenure"), loan = $("#emiLoan");
    function calc() {
      var value = Math.max(0, Number(pv.value) || 0);
      var down = Math.min(value, Math.max(0, Number(dp.value) || 0));
      var principal = Math.max(0, value - down);
      if (loan) loan.value = principal;
      var r = (Number(rate.value) || 0) / 12 / 100;
      var n = (Number(tenure.value) || 0) * 12;
      var emi = 0, totalPay = 0, totalInt = 0;
      if (principal > 0 && n > 0) {
        emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        totalPay = emi * n;
        totalInt = totalPay - principal;
      }
      $("#emiMonthly").textContent = money(Math.round(emi));
      $("#emiPrincipal").textContent = money(Math.round(principal));
      $("#emiInterest").textContent = money(Math.round(totalInt));
      $("#emiTotal").textContent = money(Math.round(totalPay));
      var pPct = totalPay > 0 ? (principal / totalPay) * 100 : 0;
      var iPct = totalPay > 0 ? (totalInt / totalPay) * 100 : 0;
      var barP = $("#emiBarP"), barI = $("#emiBarI");
      if (barP) barP.style.width = pPct.toFixed(1) + "%";
      if (barI) barI.style.width = iPct.toFixed(1) + "%";
      $("#emiSplitP").textContent = pPct.toFixed(1) + "% of total payment";
      $("#emiSplitI").textContent = iPct.toFixed(1) + "% of total payment";
      window.__emi = { value: value, down: down, principal: principal, rate: Number(rate.value) || 0, tenure: Number(tenure.value) || 0, emi: emi, totalInt: totalInt, totalPay: totalPay };
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); calc(); toast("EMI calculated", "Scroll for the repayment summary."); });
    [pv, dp, rate, tenure].forEach(function (el) { if (el) el.addEventListener("input", calc); });
    var dl = $("#emiDownload");
    if (dl) dl.addEventListener("click", function () {
      var d = window.__emi || {};
      if (window.FHPdf) {
        FHPdf.generateEmiPdf(d);
      } else {
        downloadText("Future Homes Infra - EMI Calculation",
          "Future Homes Infra - EMI Calculation\n\nProperty Value: " + money(d.value) + "\nDown Payment: " + money(d.down) +
          "\nLoan Amount: " + money(d.principal) + "\nInterest Rate: " + d.rate + "% p.a.\nTenure: " + d.tenure + " years" +
          "\n\nMonthly EMI: " + money(Math.round(d.emi)) + "\nTotal Interest: " + money(Math.round(d.totalInt)) + "\nTotal Payment: " + money(Math.round(d.totalPay)));
      }
    });
    calc();
  }

  /* ------------------------------------------------------------------ */
  /* CONTACT                                                            */
  /* ------------------------------------------------------------------ */
  function renderContact() {
    var form = $("#enquiryForm"); if (!form) return;
    var projSel = $("#eqProject");
    if (projSel) projSel.innerHTML = '<option value="">Select Project</option>' + FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    if (location.hash === "#enquiry") setTimeout(function () { form.scrollIntoView({ behavior: "smooth", block: "center" }); }, 400);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$(".field[data-validate]", form).forEach(function (f) {
        var input = $("input, select, textarea", f);
        var valid = input.value.trim() !== "" && !(input.type === "email" && !/^\S+@\S+\.\S+$/.test(input.value)) && !(input.type === "tel" && input.value.replace(/\D/g, "").length < 10);
        f.classList.toggle("has-error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) { toast("Check the form", "Please complete the highlighted fields."); return; }
      var rec = addEnquiry({
        name: $("#eqName").value, phone: $("#eqPhone").value, email: $("#eqEmail").value,
        interest: $("#eqInterest").value, projectId: $("#eqProject").value, budget: $("#eqBudget").value,
        message: $("#eqMessage").value
      });
      form.reset();
      toast("Enquiry submitted", "Reference " + rec.id + ". Our team will reach out shortly.");
      var box = $("#enquirySuccess");
      if (box) { box.classList.remove("hidden"); $("#enquiryRef").textContent = rec.id; }
    });
  }

  /* ------------------------------------------------------------------ */
  /* PROJECT DETAIL                                                     */
  /* ------------------------------------------------------------------ */
  function renderProjectDetail() {
    var host = $("#projectDetail"); if (!host) return;
    var id = qs("id");
    var p = projectById(id) || FH.store.get("projects")[0];
    var plots = FH.store.get("plots").filter(function (x) { return x.projectId === p.id; });
    var flats = FH.store.get("flats").filter(function (x) { return x.projectId === p.id; });
    var availP = plots.filter(function (x) { return x.status === "Available"; }).length;
    var availF = flats.filter(function (x) { return x.status === "Available"; }).length;

    document.title = p.name + " | Future Homes Infra";
    if ($("#pdName")) $("#pdName").textContent = p.name;
    if ($("#pdCrumb")) $("#pdCrumb").textContent = p.name;
    if ($("#pdLocation")) $("#pdLocation").textContent = p.address;

    var mediaContainer = $(".split__media");
    if (mediaContainer) {
      if (p.image) {
        mediaContainer.innerHTML = '<img src="' + esc(p.image) + '" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius-lg);box-shadow:var(--shadow)">';
      } else {
        mediaContainer.innerHTML = '<div class="art ' + (p.art || "art--blue") + '" id="pdArt" style="aspect-ratio:4/3;border-radius:var(--radius-lg);font-size:2rem">' + esc(p.name) + '</div>';
      }
    }

    var html =
      '<div class="stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:32px">' +
        '<div class="stat"><b>' + plots.length + '</b><span>Total Plots</span></div>' +
        '<div class="stat"><b>' + availP + '</b><span>Available Plots</span></div>' +
        '<div class="stat"><b>' + flats.length + '</b><span>Total Flats</span></div>' +
      "</div>";

    // 1. Project Overview / Description
    var descText = p.description ? String(p.description).trim() : "";
    html += "<h2>Project Overview</h2>";
    if (descText) {
      var paragraphs = descText.split(/\n+/).map(function (para) {
        return "<p>" + esc(para) + "</p>";
      }).join("");
      html += paragraphs;
    } else {
      html += "<p>" + esc(p.name) + " is a " + esc(p.status.toLowerCase()) + " residential development located at " + esc(p.address) + ".</p>";
    }

    // 2. Highlights
    var hlText = p.highlights ? String(p.highlights).trim() : "";
    if (hlText) {
      var hlItems = hlText.split(/\n+/).filter(function (line) { return line.trim().length > 0; });
      if (hlItems.length) {
        html += "<h2>Highlights</h2><ul>" + hlItems.map(function (h) {
          return "<li>" + esc(h.replace(/^[-*•]\s*/, "")) + "</li>";
        }).join("") + "</ul>";
      }
    }

    // 3. Availability Summary
    html += "<h2>Availability</h2>";
    if (plots.length || flats.length) {
      if (plots.length) {
        html += '<p><b>Plots:</b> ' + availP + ' of ' + plots.length + ' available. <a href="plot-status.html?project=' + p.id + '" data-no-transition>View plot status report</a></p>';
      }
      if (flats.length) {
        html += '<p><b>Flats:</b> ' + availF + ' of ' + flats.length + ' available. <a href="flat-status.html?project=' + p.id + '" data-no-transition>View flat status report</a></p>';
      }
    } else {
      html += '<p class="muted">Inventory details for this project will be updated soon.</p>';
    }

    // 4. Location Advantages
    var locText = p.locationAdvantages ? String(p.locationAdvantages).trim() : "";
    if (locText) {
      var locItems = locText.split(/\n+/).filter(function (line) { return line.trim().length > 0; });
      if (locItems.length) {
        html += "<h2>Location Advantages</h2><div class=\"grid grid-2\">" + locItems.map(function (locLine) {
          var parts = locLine.split(/:(.+)/);
          var title = parts[0] ? parts[0].trim().replace(/^[-*•]\s*/, "") : locLine;
          var sub = parts[1] ? parts[1].trim() : "";
          return '<div class="feature"><span class="feature__icon">' + (window.FHUI ? FHUI.icons.pin : "") + '</span><div><h4>' + esc(title) + '</h4>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div></div>';
        }).join("") + "</div>";
      }
    }

    host.innerHTML = html;

    var gGrid = $("#galleryGrid");
    if (gGrid) {
      var imgs = FH.store.get("gallery").filter(function (g) { return g.projectId === p.id; });
      gGrid.innerHTML = imgs.length ? imgs.map(function (g) {
        var imgContent = g.image ? '<img src="' + esc(g.image) + '" style="width:100%;height:100%;object-fit:cover">' : '<div class="art ' + (g.art || "art--blue") + '">' + esc(g.category) + '</div>';
        return '<a class="gallery-item" href="gallery.html">' + imgContent + '<div class="gallery-item__overlay"><small>' + esc(g.category) + '</small><b>' + esc(g.title) + "</b></div></a>";
      }).join("") : '<div class="table-empty" style="grid-column:1/-1">No images uploaded for this project yet.</div>';
    }
    document.dispatchEvent(new Event("fh:refresh"));
  }

  /* ------------------------------------------------------------------ */
  /* ABOUT                                                              */
  /* ------------------------------------------------------------------ */
  function renderAbout() {
    var s = $("#aboutStats");
    if (s) {
      s.innerHTML = [["12+", "Years of Trust"], ["5", "Landmark Projects"], ["1,240+", "Happy Families"], ["100%", "Clear Titles"]].map(function (i) {
        return '<div class="stat"><b>' + i[0] + "</b><span>" + i[1] + "</span></div>";
      }).join("");
    }
  }

  /* ------------------------------------------------------------------ */
  /* Dispatch                                                           */
  /* ------------------------------------------------------------------ */
  var routes = {
    home: renderHome, projects: renderProjects, "plot-status": renderPlotStatus,
    "flat-status": renderFlatStatus, location: renderLocation, gallery: renderGallery,
    "bank-details": renderBank, "emi-calculator": renderEmi, contact: renderContact,
    "project-detail": renderProjectDetail, about: renderAbout
  };
  function run() {
    if (routes[PAGE]) routes[PAGE]();
    initCustomSelects();
    document.dispatchEvent(new Event("fh:refresh"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
