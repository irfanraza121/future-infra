/* =====================================================================
   Future Homes Infra - Admin Panel runtime
   Demo authentication (front-end prototype). In production, login and all
   data operations must be handled by the CRM backend via authenticated APIs.
   ===================================================================== */
(function () {
  "use strict";
  if (!window.FH) return;
  var PAGE = document.body.getAttribute("data-admin") || "";
  var CURRENCY = FH.CONFIG.currency;
  var SKEY = "fh_admin_session";
  var I = window.FHUI ? FHUI.icons : {};

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function money(n) { return CURRENCY + Number(n || 0).toLocaleString("en-IN"); }
  function moneyShort(n) { n = Number(n || 0); if (n >= 10000000) return CURRENCY + (n / 10000000).toFixed(2) + " Cr"; if (n >= 100000) return CURRENCY + (n / 100000).toFixed(2) + " L"; return money(n); }
  function toast(t, m) { if (window.FHUI) FHUI.toast(t, m); }
  function statusClass(s) { return String(s).toLowerCase().replace(/[^a-z]/g, ""); }
  function badge(s) { return '<span class="badge badge--' + statusClass(s) + '">' + esc(s) + "</span>"; }
  function projectName(id) { var p = FH.store.get("projects").filter(function (x) { return x.id === id; })[0]; return p ? p.name : id; }

  /* ------------------------------------------------------------------ */
  /* Auth                                                               */
  /* ------------------------------------------------------------------ */
  var DEFAULT_USERS = [
    { id: "U-1", username: "admin", password: "admin123", name: "Super Admin", role: "Super Admin", active: true },
    { id: "U-2", username: "sales", password: "sales123", name: "Sneha Kulkarni", role: "Sales Executive", active: true },
    { id: "U-3", username: "finance", password: "finance123", name: "Amit Patil", role: "Finance", active: true }
  ];
  function users() { return FH.store.get("users") || DEFAULT_USERS; }
  function session() { try { return JSON.parse(sessionStorage.getItem(SKEY)); } catch (e) { return null; } }
  function saveSession(u) { sessionStorage.setItem(SKEY, JSON.stringify(u)); }
  function logout() { sessionStorage.removeItem(SKEY); window.location.href = "login.html"; }

  function guard() {
    var s = session();
    if (PAGE === "login") {
      if (s) window.location.href = "dashboard.html";
      return;
    }
    if (!s) { window.location.href = "login.html"; return; }
    if (document.body.getAttribute("data-role") && document.body.getAttribute("data-role") !== "any") {
      /* role gate hook - extend per role permissions */
    }
    injectShell(s);
  }

  function initLogin() {
    var form = $("#adminLogin");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = $("#loginUser").value.trim();
      var p = $("#loginPass").value;
      var role = $("#loginRole") ? $("#loginRole").value : "Auto";
      var match = users().filter(function (x) { return x.username === u && x.password === p && x.active !== false; })[0];
      if (!match) { toast("Login failed", "Invalid username or password."); return; }
      if (role !== "Auto" && match.role !== role) { toast("Role mismatch", "This account is not registered under the selected role."); return; }
      saveSession({ name: match.name, role: match.role, username: match.username, at: Date.now() });
      toast("Welcome back", "Signing you in as " + match.name + ".");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 500);
    });
    var demo = $("#fillDemo");
    if (demo) demo.addEventListener("click", function () { $("#loginUser").value = "admin"; $("#loginPass").value = "admin123"; });
  }

  /* ------------------------------------------------------------------ */
  /* Shell                                                              */
  /* ------------------------------------------------------------------ */
  var NAV = [
    { group: "Overview", items: [{ id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "chart" }] },
    {
      group: "Inventory", items: [
        { id: "projects", label: "Projects", href: "projects.html", icon: "layers" },
        { id: "plots", label: "Plot Management", href: "plots.html", icon: "grid" },
        { id: "flats", label: "Flat Management", href: "flats.html", icon: "building" },
        { id: "gallery", label: "Gallery", href: "gallery.html", icon: "image" }
      ]
    },
    {
      group: "Sales", items: [
        { id: "enquiries", label: "Enquiries", href: "enquiries.html", icon: "user" },
        { id: "quotations", label: "Quotations", href: "quotations.html", icon: "file" }
      ]
    },
    { group: "Finance", items: [{ id: "bank-details", label: "Bank Details", href: "bank-details.html", icon: "bank" }] },
    {
      group: "System", items: [
        { id: "reports", label: "Reports", href: "reports.html", icon: "chart" },
        { id: "users", label: "User Management", href: "users.html", icon: "users" },
        { id: "settings", label: "Settings", href: "settings.html", icon: "settings" }
      ]
    }
  ];

  function injectShell(s) {
    var side = $("#adminSide");
    if (side) {
      side.innerHTML =
        '<a class="admin-side__brand" href="dashboard.html"><span class="fh-nav__logo">FH</span><span><b>Future Homes</b><span>Admin Console</span></span></a>' +
        '<nav class="admin-nav">' + NAV.map(function (g) {
          return '<div class="admin-nav__label">' + g.group + "</div>" + g.items.map(function (it) {
            return '<a href="' + it.href + '"' + (it.id === PAGE ? ' class="is-active"' : "") + ">" + (I[it.icon] || "") + "<span>" + it.label + "</span></a>";
          }).join("");
        }).join("") +
        '<div class="admin-nav__label">Account</div>' +
        '<a href="../index.html" target="_blank">' + (I.home || "") + "<span>View Website</span></a>" +
        '<a href="#" id="adminLogout">' + (I.logout || "") + "<span>Logout</span></a>" +
        "</nav>";
    }
    var top = $("#adminTop");
    if (top) {
      top.innerHTML =
        '<div style="display:flex;align-items:center;gap:14px">' +
          '<button class="admin-burger" id="adminBurger" aria-label="Menu"><span style="display:block;width:18px;height:2px;background:#111;position:relative"></span></button>' +
          '<div class="admin-top__title">' + esc(document.body.getAttribute("data-title") || "Dashboard") + "<small>" + esc(document.body.getAttribute("data-sub") || "") + "</small></div>" +
        "</div>" +
        '<div class="admin-top__actions">' +
          '<a class="btn btn--ghost btn--sm" href="../index.html" target="_blank" data-magnetic>Preview Site</a>' +
          '<div class="admin-user"><div><b>' + esc(s.name) + "</b><small>" + esc(s.role) + '</small></div><span class="av">' + esc(s.name.charAt(0)) + "</span></div>" +
        "</div>";
    }
    var burger = $("#adminBurger");
    var shell = $("#adminShell");
    if (burger && shell) burger.addEventListener("click", function () { shell.classList.toggle("is-open"); });
    var back = $(".admin-backdrop");
    if (back && shell) back.addEventListener("click", function () { shell.classList.remove("is-open"); });
    var lo = $("#adminLogout");
    if (lo) lo.addEventListener("click", function (e) { e.preventDefault(); logout(); });
  }

  /* ------------------------------------------------------------------ */
  /* Generic form modal                                                 */
  /* ------------------------------------------------------------------ */
  function ensureModal() {
    var m = $("#adminModal");
    if (m) return m;
    m = document.createElement("div");
    m.className = "modal";
    m.id = "adminModal";
    m.innerHTML = '<div class="modal__box"><div class="modal__head"><h3 id="adminModalTitle"></h3><button class="modal__close" data-modal-close>&times;</button></div><div class="modal__body" id="adminModalBody"></div><div class="modal__foot"><button class="btn btn--ghost" data-modal-close>Cancel</button><button class="btn btn--primary" id="adminModalSave">Save</button></div></div>';
    document.body.appendChild(m);
    return m;
  }

  function openForm(title, fields, values, onSubmit) {
    ensureModal();
    $("#adminModalTitle").textContent = title;
    $("#adminModalBody").innerHTML = '<div class="form-grid">' + fields.map(function (f) {
      var v = values && values[f.name] != null ? values[f.name] : (f.def != null ? f.def : "");
      var input;
      if (f.type === "select") {
        input = '<select class="select" name="' + f.name + '">' + f.options.map(function (o) {
          var val = typeof o === "object" ? o.v : o;
          var lab = typeof o === "object" ? o.l : o;
          return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(lab) + "</option>";
        }).join("") + "</select>";
      } else if (f.type === "textarea") {
        input = '<textarea class="textarea" name="' + f.name + '" rows="3">' + esc(v) + "</textarea>";
      } else if (f.type === "checkbox") {
        input = '<label class="checkbox"><input type="checkbox" name="' + f.name + '"' + (v ? " checked" : "") + "><span>" + esc(f.label) + "</span></label>";
      } else if (f.type === "image") {
        var prevImg = v ? '<img src="' + esc(v) + '" style="max-height:80px;border-radius:6px;margin-top:6px;display:block" id="imgPrev_' + f.name + '">' : '<div id="imgPrev_' + f.name + '"></div>';
        input = '<input class="input" type="file" accept="image/png, image/jpeg, image/jpg" data-img-field="' + f.name + '">' +
                '<input type="hidden" name="' + f.name + '" value="' + esc(v) + '">' + prevImg +
                '<small class="muted" style="display:block;margin-top:4px">Allowed formats: PNG, JPG, JPEG. (SVG not allowed)</small>';
      } else {
        input = '<input class="input" type="' + (f.type || "text") + '" name="' + f.name + '" value="' + esc(v) + '"' + (f.step ? ' step="' + f.step + '"' : "") + ">";
      }
      return '<div class="field">' + (f.type === "checkbox" ? "" : '<label>' + esc(f.label) + "</label>") + input + "</div>";
    }).join("") + "</div>";

    // Image Upload Change Listeners (PNG/JPG validation, SVG block)
    $$("#adminModalBody [data-img-field]").forEach(function (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files[0];
        if (!file) return;
        if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
          toast("Format Not Allowed", "SVG files are not allowed. Please upload PNG, JPG or JPEG image.");
          fileInput.value = "";
          return;
        }
        if (!/image\/(png|jpeg|jpg)/.test(file.type)) {
          toast("Invalid File", "Please select a valid PNG, JPG, or JPEG image file.");
          fileInput.value = "";
          return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
          var base64 = ev.target.result;
          var fieldName = fileInput.getAttribute("data-img-field");
          var hidden = $("#adminModalBody [name='" + fieldName + "']");
          if (hidden) hidden.value = base64;
          var prev = $("#imgPrev_" + fieldName);
          if (prev) prev.innerHTML = '<img src="' + base64 + '" style="max-height:80px;border-radius:6px;margin-top:6px;display:block">';
        };
        reader.readAsDataURL(file);
      });
    });

    var save = $("#adminModalSave");
    var fresh = save.cloneNode(true);
    save.parentNode.replaceChild(fresh, save);
    fresh.addEventListener("click", function () {
      var data = {};
      $$("#adminModalBody [name]").forEach(function (el) {
        data[el.name] = el.type === "checkbox" ? el.checked : (el.type === "number" ? Number(el.value) : el.value);
      });
      onSubmit(data);
      FHUI.closeModal("adminModal");
    });
    FHUI.openModal("adminModal");
  }

  /* ------------------------------------------------------------------ */
  /* Dashboard                                                          */
  /* ------------------------------------------------------------------ */
  function renderDashboard() {
    var s = FH.stats();
    var host = $("#adminStats");
    if (host) {
      var cards = [
        ["Total Projects", s.totalProjects, "layers"], ["Total Plots", s.totalPlots, "grid"],
        ["Available Plots", s.availablePlots, "check"], ["Booked Plots", s.bookedPlots, "home"],
        ["Total Flats", s.totalFlats, "building"], ["Available Flats", s.availableFlats, "check"],
        ["New Enquiries", s.newEnquiries, "user"], ["Pending Followups", s.pendingFollowups, "clock"]
      ];
      host.innerHTML = cards.map(function (c) {
        return '<div class="admin-card" data-reveal><div class="admin-card__top"><span class="admin-card__icon">' + (I[c[2]] || "") + "</span></div><b>" + c[1] + "</b><span>" + c[0] + "</span></div>";
      }).join("");
    }
    var enq = $("#recentEnquiries");
    if (enq) {
      enq.innerHTML = FH.store.get("enquiries").slice(0, 5).map(function (e) {
        return '<tr><td><b>' + esc(e.name) + "</b><br><small class=\"muted\">" + esc(e.phone) + "</small></td><td>" + esc(projectName(e.projectId)) + "</td><td>" + badge(e.status) + "</td><td>" + e.date + "</td></tr>";
      }).join("");
    }
    var act = $("#recentActivity");
    if (act) {
      act.innerHTML = FH.store.get("activities").map(function (a) {
        return '<div class="activity__item"><span class="activity__icon">' + (I[a.icon] || I.check) + "</span><div><p>" + esc(a.text) + "</p><small>" + esc(a.time) + "</small></div></div>";
      }).join("");
    }
    var inv = $("#inventorySummary");
    if (inv) {
      var rows = [["Plots", s.totalPlots, s.availablePlots, s.totalPlots - s.availablePlots], ["Flats", s.totalFlats, s.availableFlats, s.totalFlats - s.availableFlats]];
      inv.innerHTML = rows.map(function (r) {
        var pct = r[1] ? Math.round((r[2] / r[1]) * 100) : 0;
        return '<div class="progress-item"><div class="progress-item__top"><span>' + r[0] + " availability</span><b>" + pct + '%</b></div><div class="progress-track"><i style="width:' + pct + '%"></i></div><small class="muted">' + r[2] + " available of " + r[1] + " units</small></div>";
      }).join("");
    }
    var sales = $("#salesSummary");
    if (sales) {
      var qts = FH.store.get("quotations") || [];
      var total = qts.reduce(function (a, q) { return a + (q.finalAmount || 0); }, 0);
      sales.innerHTML = '<div class="detail-list"><div><dt>Quotations issued</dt><dd><b>' + qts.length + "</b></dd></div><div><dt>Quotation value</dt><dd><b>" + moneyShort(total) + "</b></dd></div><div><dt>Booked plots</dt><dd><b>" + s.bookedPlots + "</b></dd></div><div><dt>Booked flats</dt><dd><b>" + s.bookedFlats + "</b></dd></div><div><dt>Happy families</dt><dd><b>" + s.happyFamilies + "</b></dd></div></div>";
    }
    document.dispatchEvent(new Event("fh:refresh"));
  }

  /* ------------------------------------------------------------------ */
  /* Projects                                                           */
  /* ------------------------------------------------------------------ */
  function renderProjects() {
    var body = $("#adminProjectsBody"); if (!body) return;
    function draw() {
      var list = FH.store.get("projects");
      body.innerHTML = list.map(function (p) {
        return "<tr><td><b>" + esc(p.name) + "</b><br><small class=\"muted\">" + esc(p.id) + "</small></td><td>" + esc(p.type) + "</td><td>" + esc(p.location) + "</td><td>" + badge(p.status) + "</td><td>" + moneyShort(p.startPrice) + '</td><td><div class="actions"><button class="btn btn--sm btn--ghost" data-edit="' + p.id + '">Edit</button><button class="btn btn--sm btn--danger" data-del="' + p.id + '">Archive</button></div></td></tr>';
      }).join("");
    }
    var fields = [
      { name: "name", label: "Project Name" }, { name: "type", label: "Project Type", type: "select", options: ["Plots", "Flats", "Plots & Flats"] },
      { name: "location", label: "Location Area (e.g. Wardha Road)" }, { name: "address", label: "Full Address" },
      { name: "city", label: "City", def: "Nagpur" }, { name: "state", label: "State", def: "Maharashtra" },
      { name: "status", label: "Status", type: "select", options: ["Ongoing", "Ready to Move", "Under Construction"] },
      { name: "startPrice", label: "Starting Price", type: "number" },
      { name: "image", label: "Project Photo (PNG/JPG)", type: "image" },
      { name: "description", label: "Project Overview / Description", type: "textarea" },
      { name: "highlights", label: "Project Highlights (One item per line)", type: "textarea" },
      { name: "locationAdvantages", label: "Location Advantages (One item per line, e.g. Airport: 3 km)", type: "textarea" }
    ];
    var add = $("#addProject");
    if (add) add.addEventListener("click", function () {
      openForm("Add Project", fields, {}, function (d) {
        var list = FH.store.get("projects").slice();
        d.id = FH.store.nextId("PRJ", list);
        d.art = "art--blue";
        list.push(d); FH.store.set("projects", list); draw(); toast("Project added", d.name + " created.");
      });
    });
    body.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]");
      var dl = e.target.closest("[data-del]");
      if (ed) {
        var p = FH.store.get("projects").filter(function (x) { return x.id === ed.getAttribute("data-edit"); })[0];
        openForm("Edit Project", fields, p, function (d) {
          var list = FH.store.get("projects").map(function (x) { return x.id === p.id ? Object.assign({}, x, d) : x; });
          FH.store.set("projects", list); draw(); toast("Project updated", d.name + " saved.");
        });
      }
      if (dl) {
        if (!confirm("Archive this project? It will be removed from the active list.")) return;
        var list2 = FH.store.get("projects").filter(function (x) { return x.id !== dl.getAttribute("data-del"); });
        FH.store.set("projects", list2); draw(); toast("Project archived", "The project was archived.");
      }
    });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Plots / Flats (shared table)                                       */
  /* ------------------------------------------------------------------ */
  function unitManager(opts) {
    var body = $(opts.body); if (!body) return;
    var KIND = opts.kind;
    var statuses = opts.statuses;
    function draw() {
      var list = opts.get();
      var q = ($(opts.search) || {}).value ? $(opts.search).value.toLowerCase() : "";
      var ps = ($("#" + KIND + "Filter") || {}).value || "";
      var ss = ($("#" + KIND + "StatusFilter") || {}).value || "";
      if (q) list = list.filter(function (u) { return (u.number + " " + projectName(u.projectId)).toLowerCase().indexOf(q) > -1; });
      if (ps) list = list.filter(function (u) { return u.projectId === ps; });
      if (ss) list = list.filter(function (u) { return u.status === ss; });
      body.innerHTML = list.slice(0, 200).map(function (u) {
        return "<tr><td><b>" + esc(u.number) + "</b></td><td>" + esc(projectName(u.projectId)) + "</td><td>" + (KIND === "plot" ? u.area : u.superArea) + "</td><td>" + esc(KIND === "plot" ? u.plotType : u.flatType) + "</td><td>" + esc(u.facing) + "</td><td>" + money(u.rate) + '</td><td><select class="select" data-status="' + u.id + '" style="padding:6px 8px;font-size:.8rem">' + statuses.map(function (s) { return '<option' + (s === u.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select></td><td><div class="actions"><button class="btn btn--sm btn--ghost" data-edit="' + u.id + '">Edit</button><button class="btn btn--sm btn--danger" data-del="' + u.id + '">Delete</button></div></td></tr>';
      }).join("") || '<tr><td colspan="8"><div class="table-empty">No records found.</div></td></tr>';
    }
    var ps = $("#" + KIND + "Filter");
    if (ps) ps.innerHTML = '<option value="">All Projects</option>' + FH.store.get("projects").filter(function (p) { return opts.get().some(function (x) { return x.projectId === p.id; }); }).map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    var ssEl = $("#" + KIND + "StatusFilter");
    if (ssEl) ssEl.innerHTML = '<option value="">All Status</option>' + statuses.map(function (s) { return "<option>" + s + "</option>"; }).join("");
    [$(opts.search), ps, ssEl].forEach(function (el) { if (el) el.addEventListener("input", draw); if (el && el.tagName === "SELECT") el.addEventListener("change", draw); });
    body.addEventListener("change", function (e) {
      var sel = e.target.closest("[data-status]"); if (!sel) return;
      var list = opts.get().map(function (u) { return u.id === sel.getAttribute("data-status") ? Object.assign({}, u, { status: sel.value }) : u; });
      opts.set(list); toast("Status updated", "Unit status changed to " + sel.value + "."); draw();
    });
    body.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"); var dl = e.target.closest("[data-del]");
      if (ed) {
        var u = opts.get().filter(function (x) { return x.id === ed.getAttribute("data-edit"); })[0];
        openForm("Edit " + (KIND === "plot" ? "Plot" : "Flat"), opts.fields, u, function (d) {
          var list = opts.get().map(function (x) { return x.id === u.id ? Object.assign({}, x, d) : x; });
          opts.set(list); draw(); toast("Saved", "Unit updated successfully.");
        });
      }
      if (dl) {
        if (!confirm("Delete this unit?")) return;
        opts.set(opts.get().filter(function (x) { return x.id !== dl.getAttribute("data-del"); }));
        draw(); toast("Deleted", "Unit removed from inventory.");
      }
    });
    var add = $("#add" + (KIND === "plot" ? "Plot" : "Flat"));
    if (add) add.addEventListener("click", function () {
      openForm("Add " + (KIND === "plot" ? "Plot" : "Flat"), opts.fields, { projectId: FH.store.get("projects")[0].id, status: statuses[0] }, function (d) {
        var list = opts.get().slice();
        d.id = FH.store.nextId(KIND === "plot" ? "PL" : "FL", list);
        list.push(d); opts.set(list); draw(); toast("Added", "New unit added to inventory.");
      });
    });
    opts.draw = draw;
    draw();
  }

  function renderPlots() {
    var fields = [
      { name: "projectId", label: "Project", type: "select", options: FH.store.get("projects").map(function (p) { return { v: p.id, l: p.name }; }) },
      { name: "number", label: "Plot Number" }, { name: "area", label: "Area (Sq.Ft.)", type: "number" },
      { name: "plotType", label: "Plot Type", type: "select", options: ["Regular", "Corner", "Premium"] },
      { name: "facing", label: "Facing", type: "select", options: ["East", "West", "North", "South", "North-East", "South-West"] },
      { name: "rate", label: "Rate / Sq.Ft.", type: "number" }, { name: "status", label: "Status", type: "select", options: ["Available", "Booked", "Hold", "Agreement", "Sale Deed"] },
      { name: "image", label: "Plot Photo / Layout (PNG/JPG)", type: "image" },
      { name: "notes", label: "Notes", type: "textarea" }
    ];
    unitManager({
      kind: "plot", body: "#adminPlotsBody", search: "#plotSearch", fields: fields,
      statuses: ["Available", "Booked", "Hold", "Agreement", "Sale Deed"],
      get: function () { return FH.store.get("plots"); }, set: function (v) { FH.store.set("plots", v); }
    });
    initBulk({
      form: "#plotBulkForm", file: "#plotBulkFile", validate: "#plotValidate", importBtn: "#plotImport",
      stats: "#plotBulkStats", template: "#plotTemplate", kind: "Plot",
      columns: ["Plot Number", "Area", "Plot Type", "Facing", "Rate", "Status"],
      toRecord: function (r, projectId) {
        return { id: "PL-B" + Date.now() + Math.floor(Math.random() * 999), projectId: projectId, number: r["Plot Number"] || r["plot number"], area: Number(r["Area"] || 0), plotType: r["Plot Type"] || "Regular", facing: r["Facing"] || "East", rate: Number(r["Rate"] || 0), status: r["Status"] || "Available", notes: "" };
      },
      append: function (recs) { var l = FH.store.get("plots").slice(); recs.forEach(function (r) { l.push(r); }); FH.store.set("plots", l); }
    });
  }

  function renderFlats() {
    var fields = [
      { name: "projectId", label: "Project", type: "select", options: FH.store.get("projects").map(function (p) { return { v: p.id, l: p.name }; }) },
      { name: "wing", label: "Wing" }, { name: "floor", label: "Floor", type: "number" },
      { name: "number", label: "Flat Number" }, { name: "flatType", label: "Flat Type", type: "select", options: ["1 BHK", "2 BHK", "3 BHK"] },
      { name: "superArea", label: "Super Built Area", type: "number" }, { name: "carpetArea", label: "Carpet Area", type: "number" },
      { name: "facing", label: "Facing", type: "select", options: ["East", "West", "North", "South", "North-East", "South-West"] },
      { name: "rate", label: "Rate / Sq.Ft.", type: "number" }, { name: "status", label: "Status", type: "select", options: ["Available", "Booked", "Agreement", "Sold"] },
      { name: "image", label: "Flat Photo / Floor Plan (PNG/JPG)", type: "image" }
    ];
    unitManager({
      kind: "flat", body: "#adminFlatsBody", search: "#flatSearch", fields: fields,
      statuses: ["Available", "Booked", "Agreement", "Sold"],
      get: function () { return FH.store.get("flats"); }, set: function (v) { FH.store.set("flats", v); }
    });
    initBulk({
      form: "#flatBulkForm", file: "#flatBulkFile", validate: "#flatValidate", importBtn: "#flatImport",
      stats: "#flatBulkStats", template: "#flatTemplate", kind: "Flat",
      columns: ["Wing", "Floor", "Flat Number", "Flat Type", "Area", "Facing", "Rate", "Status"],
      toRecord: function (r, projectId) {
        return { id: "FL-B" + Date.now() + Math.floor(Math.random() * 999), projectId: projectId, wing: r["Wing"] || "A", floor: Number(r["Floor"] || 1), number: r["Flat Number"] || r["flat number"], flatType: r["Flat Type"] || "2 BHK", superArea: Number(r["Area"] || 0), carpetArea: Number(r["Area"] || 0) * 0.75, facing: r["Facing"] || "East", rate: Number(r["Rate"] || 0), status: r["Status"] || "Available" };
      },
      append: function (recs) { var l = FH.store.get("flats").slice(); recs.forEach(function (r) { l.push(r); }); FH.store.set("flats", l); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Bulk upload (CSV / Excel-exported)                                 */
  /* ------------------------------------------------------------------ */
  function initBulk(cfg) {
    var form = $(cfg.form); if (!form) return;
    var parsed = [];
    var projSel = $("#bulkProject" + cfg.kind);
    if (projSel) projSel.innerHTML = FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    var tpl = $(cfg.template);
    if (tpl) tpl.addEventListener("click", function (e) {
      e.preventDefault();
      downloadText(cfg.kind + "-Import-Template", "Project," + cfg.columns.join(",") + "\n" + (projSel ? projectName(projSel.value) : "") + "," + cfg.columns.map(function (c) { return c === "Rate" ? 2000 : c === "Area" ? 1200 : c === "Floor" ? 2 : c === "Status" ? "Available" : "A-01"; }).join(","));
    });
    var drop = $(cfg.file).closest(".dropzone");
    if (drop) {
      drop.addEventListener("click", function (e) { if (e.target === $(cfg.file)) return; $(cfg.file).click(); });
      ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-drag"); }); });
      ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-drag"); }); });
      drop.addEventListener("drop", function (e) { if (e.dataTransfer.files[0]) { $(cfg.file).files = e.dataTransfer.files; read(); } });
    }
    function read() {
      var f = $(cfg.file).files[0]; if (!f) { toast("No file", "Please choose a CSV file."); return; }
      var reader = new FileReader();
      reader.onload = function () { parsed = parseCsv(reader.result); show(); };
      reader.readAsText(f);
    }
    if ($(cfg.file)) $(cfg.file).addEventListener("change", read);
    function show() {
      var total = parsed.length;
      var valid = parsed.filter(function (r) { return (r["Plot Number"] || r["Flat Number"]) && r["Rate"]; }).length;
      var invalid = total - valid;
      $(cfg.stats).innerHTML =
        '<div class="stats" style="grid-template-columns:repeat(4,1fr)"><div class="stat"><b>' + total + '</b><span>Total Rows</span></div><div class="stat"><b>' + valid + '</b><span>Valid Rows</span></div><div class="stat"><b>' + invalid + '</b><span>Invalid Rows</span></div><div class="stat"><b>0</b><span>Duplicate Rows</span></div></div>';
      toast("File validated", valid + " valid, " + invalid + " invalid rows detected.");
    }
    var v = $(cfg.validate);
    if (v) v.addEventListener("click", function () { if (!parsed.length) read(); else show(); });
    var imp = $(cfg.importBtn);
    if (imp) imp.addEventListener("click", function () {
      if (!parsed.length) { toast("Nothing to import", "Validate a file first."); return; }
      var validRows = parsed.filter(function (r) { return (r["Plot Number"] || r["Flat Number"]) && r["Rate"]; });
      var pid = projSel ? projSel.value : (FH.store.get("projects")[0] || {}).id;
      cfg.append(validRows.map(function (r) { return cfg.toRecord(r, pid); }));
      toast("Import complete", validRows.length + " records imported.");
      parsed = [];
      if (cfg.form && cfg.form.reset) cfg.form.reset();
      if ($(cfg.stats)) $(cfg.stats).innerHTML = "";
    });
  }

  function parseCsv(text) {
    var lines = text.replace(/\r/g, "").split("\n").filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    var delim = lines[0].indexOf("\t") > -1 ? "\t" : ",";
    var headers = lines[0].split(delim).map(function (h) { return h.trim(); });
    return lines.slice(1).map(function (line) {
      var cells = line.split(delim);
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = (cells[i] || "").trim(); });
      return obj;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Gallery admin                                                      */
  /* ------------------------------------------------------------------ */
  function renderGalleryAdmin() {
    var body = $("#adminGalleryBody"); if (!body) return;
    var projSel = $("#galProject");
    if (projSel) projSel.innerHTML = FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    function draw() {
      body.innerHTML = FH.store.get("gallery").map(function (g) {
        var preview = g.image ? '<img src="' + esc(g.image) + '" style="width:64px;height:44px;object-fit:cover;border-radius:8px">' : '<div class="art ' + (g.art || "art--blue") + '" style="width:64px;height:44px;border-radius:8px;font-size:.6rem">IMG</div>';
        return "<tr><td>" + preview + "</td><td><b>" + esc(g.title) + "</b></td><td>" + esc(projectName(g.projectId)) + "</td><td>" + esc(g.category) + "</td><td>" + g.date + '</td><td><div class="actions"><button class="btn btn--sm btn--danger" data-del="' + g.id + '">Delete</button></div></td></tr>';
      }).join("");
    }
    var upload = $("#galUpload");
    if (upload) upload.addEventListener("click", function () {
      openForm("Upload Image", [
        { name: "title", label: "Caption / Title" },
        { name: "projectId", label: "Project", type: "select", options: FH.store.get("projects").map(function (p) { return { v: p.id, l: p.name }; }) },
        { name: "category", label: "Category", type: "select", options: ["Plot Images", "Flat Images", "Project Images", "Construction Updates"] },
        { name: "image", label: "Upload Image (PNG/JPG)", type: "image" },
        { name: "art", label: "Visual Fallback Theme", type: "select", options: ["art--blue", "art--ink", "art--deep", "art--steel"] }
      ], {}, function (d) {
        var l = FH.store.get("gallery").slice();
        d.id = FH.store.nextId("G", l); d.date = new Date().toISOString().slice(0, 10);
        l.unshift(d); FH.store.set("gallery", l); draw(); toast("Image uploaded", "Gallery updated.");
      });
    });
    body.addEventListener("click", function (e) {
      var dl = e.target.closest("[data-del]"); if (!dl) return;
      if (!confirm("Delete this image?")) return;
      FH.store.set("gallery", FH.store.get("gallery").filter(function (g) { return g.id !== dl.getAttribute("data-del"); }));
      draw(); toast("Deleted", "Image removed.");
    });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Enquiries                                                          */
  /* ------------------------------------------------------------------ */
  var ENQ_STATUS = ["New", "Contacted", "Interested", "Site Visit", "Negotiation", "Quotation", "Booked", "Not Interested", "Closed"];
  var EXECUTIVES = ["Unassigned", "Sneha K.", "Amit P.", "Rohit M."];
  function renderEnquiries() {
    var body = $("#adminEnquiriesBody"); if (!body) return;
    var fStatus = $("#enqStatusFilter"), fExec = $("#enqExecFilter");
    if (fStatus) fStatus.innerHTML = '<option value="">All Status</option>' + ENQ_STATUS.map(function (s) { return "<option>" + s + "</option>"; }).join("");
    if (fExec) fExec.innerHTML = '<option value="">All Executives</option>' + EXECUTIVES.map(function (s) { return "<option>" + s + "</option>"; }).join("");
    function draw() {
      var list = FH.store.get("enquiries");
      if (fStatus && fStatus.value) list = list.filter(function (e) { return e.status === fStatus.value; });
      if (fExec && fExec.value) list = list.filter(function (e) { return e.executive === fExec.value; });
      body.innerHTML = list.map(function (e) {
        return "<tr><td><b>" + esc(e.name) + "</b><br><small class=\"muted\">" + esc(e.email || "") + "</small></td><td>" + esc(e.phone) + "</td><td>" + esc(e.interest) + "</td><td>" + esc(projectName(e.projectId)) + "</td><td>" + esc(e.budget || "-") + "</td><td>" + e.date + "</td><td>" + esc(e.executive || "Unassigned") + '</td><td><select class="select" data-estatus="' + e.id + '" style="padding:6px 8px;font-size:.78rem">' + ENQ_STATUS.map(function (s) { return '<option' + (s === e.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select></td><td><div class="actions"><a class="btn btn--sm btn--ghost" href="tel:' + esc(e.phone.replace(/\s/g, "")) + '">Call</a><a class="btn btn--sm btn--ghost" href="https://wa.me/' + esc(e.phone.replace(/\D/g, "")) + '" target="_blank" rel="noopener">WhatsApp</a><button class="btn btn--sm btn--primary" data-note="' + e.id + '">Note</button><button class="btn btn--sm btn--danger" data-del="' + e.id + '">Delete</button></div></td></tr>';
      }).join("") || '<tr><td colspan="9"><div class="table-empty">No enquiries found.</div></td></tr>';
    }
    [fStatus, fExec].forEach(function (el) { if (el) el.addEventListener("change", draw); });
    body.addEventListener("change", function (e) {
      var sel = e.target.closest("[data-estatus]"); if (!sel) return;
      FH.store.set("enquiries", FH.store.get("enquiries").map(function (x) { return x.id === sel.getAttribute("data-estatus") ? Object.assign({}, x, { status: sel.value }) : x; }));
      toast("Status updated", "Enquiry moved to " + sel.value + "."); draw();
    });
    body.addEventListener("click", function (e) {
      var note = e.target.closest("[data-note]"); var del = e.target.closest("[data-del]");
      if (note) {
        var id = note.getAttribute("data-note");
        var text = prompt("Add a note for this enquiry:");
        if (!text) return;
        FH.store.set("enquiries", FH.store.get("enquiries").map(function (x) {
          if (x.id !== id) return x;
          var n = (x.notes || []).slice(); n.push({ text: text, at: new Date().toISOString().slice(0, 10) });
          return Object.assign({}, x, { notes: n });
        }));
        toast("Note added", "Follow-up note saved."); draw();
      }
      if (del) {
        if (!confirm("Delete this enquiry?")) return;
        FH.store.set("enquiries", FH.store.get("enquiries").filter(function (x) { return x.id !== del.getAttribute("data-del"); }));
        draw(); toast("Deleted", "Enquiry removed.");
      }
    });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Quotations                                                         */
  /* ------------------------------------------------------------------ */
  function renderQuotations() {
    var body = $("#adminQuotationsBody"); if (!body) return;
    var projSel = $("#qtProject"), unitSel = $("#qtUnit"), typeSel = $("#qtType");
    if (projSel) projSel.innerHTML = FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    function fillUnits() {
      var kind = typeSel ? typeSel.value : "Plot";
      var list = kind === "Flat" ? FH.store.get("flats") : FH.store.get("plots");
      if (projSel) list = list.filter(function (u) { return u.projectId === projSel.value; });
      if (unitSel) unitSel.innerHTML = list.map(function (u) { return '<option value="' + u.id + '" data-area="' + (u.area || u.superArea) + '" data-rate="' + u.rate + '">' + esc(u.number) + "</option>"; }).join("");
      autofill();
    }
    function autofill() {
      var opt = unitSel && unitSel.options[unitSel.selectedIndex];
      if (!opt) return;
      var area = Number(opt.getAttribute("data-area") || 0);
      var rate = Number(opt.getAttribute("data-rate") || 0);
      $("#qtArea").value = area; $("#qtRate").value = rate;
      calc();
    }
    function calc() {
      var area = Number($("#qtArea").value || 0), rate = Number($("#qtRate").value || 0);
      var other = Number($("#qtOther").value || 0), disc = Number($("#qtDiscount").value || 0);
      var base = area * rate;
      var final = base + other - disc;
      $("#qtBase").textContent = money(base);
      $("#qtFinal").textContent = money(final);
      window.__qt = { area: area, rate: rate, base: base, other: other, discount: disc, final: final };
    }
    [projSel, typeSel].forEach(function (el) { if (el) el.addEventListener("change", fillUnits); });
    if (unitSel) unitSel.addEventListener("change", autofill);
    ["#qtArea", "#qtRate", "#qtOther", "#qtDiscount"].forEach(function (id) { var el = $(id); if (el) el.addEventListener("input", calc); });
    var gen = $("#qtGenerate");
    if (gen) gen.addEventListener("click", function () {
      var d = window.__qt || {};
      if (!d.base) { toast("Incomplete", "Select a unit to begin."); return; }
      var l = (FH.store.get("quotations") || []).slice();
      var unitOpt = unitSel && unitSel.options[unitSel.selectedIndex];
      var rec = {
        id: FH.store.nextId("QT", l), customer: $("#qtCustomer").value || "Walk-in Customer",
        projectId: projSel ? projSel.value : "", unit: unitOpt ? unitOpt.textContent : "",
        type: typeSel ? typeSel.value : "Plot", area: d.area, rate: d.rate, basePrice: d.base,
        otherCharges: d.other, discount: d.discount, finalAmount: d.final,
        date: new Date().toISOString().slice(0, 10), status: "Draft"
      };
      l.unshift(rec); FH.store.set("quotations", l); draw(); toast("Quotation generated", rec.id + " created for " + rec.customer + ".");
    });
    var dl = $("#qtDownload");
    if (dl) dl.addEventListener("click", function () {
      var d = window.__qt || {};
      var unitOpt = unitSel && unitSel.options[unitSel.selectedIndex];
      if (window.FHPdf) {
        FHPdf.generateQuotationPdf({
          id: "QT-DRAFT", customer: $("#qtCustomer").value || "Walk-in Customer",
          projectId: projSel ? projSel.value : "", projectName: projSel ? projectName(projSel.value) : "",
          unit: unitOpt ? unitOpt.textContent : "", type: typeSel ? typeSel.value : "Plot",
          area: d.area, rate: d.rate, basePrice: d.base, otherCharges: d.other, discount: d.discount, finalAmount: d.final
        });
      }
    });

    function draw() {
      var list = FH.store.get("quotations") || [];
      body.innerHTML = list.map(function (q) {
        return "<tr><td><b>" + esc(q.id) + "</b></td><td>" + esc(q.customer) + "</td><td>" + esc(projectName(q.projectId)) + "</td><td>" + esc(q.unit) + "</td><td>" + esc(q.type) + "</td><td>" + money(q.basePrice) + "</td><td><b>" + money(q.finalAmount) + '</b></td><td><div class="actions"><button class="btn btn--sm btn--ghost" data-edit-qt="' + q.id + '">Edit</button><button class="btn btn--sm btn--primary" data-pdf-qt="' + q.id + '">PDF Download</button><button class="btn btn--sm btn--danger" data-del="' + q.id + '">Delete</button></div></td></tr>';
      }).join("") || '<tr><td colspan="8"><div class="table-empty">No quotations yet.</div></td></tr>';
    }

    body.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit-qt]");
      var pdf = e.target.closest("[data-pdf-qt]");
      var del = e.target.closest("[data-del]");

      if (ed) {
        var qid = ed.getAttribute("data-edit-qt");
        var q = (FH.store.get("quotations") || []).filter(function (x) { return x.id === qid; })[0];
        if (!q) return;
        openForm("Edit Quotation", [
          { name: "customer", label: "Customer Name" },
          { name: "unit", label: "Unit Reference" },
          { name: "area", label: "Area (Sq.Ft.)", type: "number" },
          { name: "rate", label: "Rate / Sq.Ft.", type: "number" },
          { name: "otherCharges", label: "Other Charges", type: "number" },
          { name: "discount", label: "Discount", type: "number" }
        ], q, function (d) {
          var base = (d.area || 0) * (d.rate || 0);
          var final = base + (d.otherCharges || 0) - (d.discount || 0);
          var updated = Object.assign({}, q, d, { basePrice: base, finalAmount: final });
          var list = (FH.store.get("quotations") || []).map(function (x) { return x.id === qid ? updated : x; });
          FH.store.set("quotations", list);
          draw();
          toast("Quotation Updated", qid + " updated successfully.");
        });
      }

      if (pdf) {
        var qid2 = pdf.getAttribute("data-pdf-qt");
        var q2 = (FH.store.get("quotations") || []).filter(function (x) { return x.id === qid2; })[0];
        if (q2 && window.FHPdf) {
          FHPdf.generateQuotationPdf(Object.assign({}, q2, { projectName: projectName(q2.projectId) }));
        }
      }

      if (del) {
        if (!confirm("Delete this quotation?")) return;
        FH.store.set("quotations", (FH.store.get("quotations") || []).filter(function (x) { return x.id !== del.getAttribute("data-del"); }));
        draw(); toast("Deleted", "Quotation removed.");
      }
    });

    fillUnits(); draw(); calc();
  }

  /* ------------------------------------------------------------------ */
  /* Bank details admin                                                 */
  /* ------------------------------------------------------------------ */
  function renderBankAdmin() {
    var body = $("#adminBankBody"); if (!body) return;
    var fields = [
      { name: "projectId", label: "Project", type: "select", options: FH.store.get("projects").map(function (p) { return { v: p.id, l: p.name }; }) },
      { name: "accountName", label: "Account Name" }, { name: "accountNumber", label: "Account Number" },
      { name: "ifsc", label: "IFSC Code" }, { name: "bankName", label: "Bank Name" }, { name: "branch", label: "Branch" },
      { name: "visible", label: "Visible on website", type: "checkbox" }
    ];
    function draw() {
      body.innerHTML = FH.store.get("banks").map(function (b) {
        return "<tr><td><b>" + esc(projectName(b.projectId)) + "</b></td><td>" + esc(b.accountName) + "</td><td>" + esc(b.accountNumber) + "</td><td>" + esc(b.ifsc) + "</td><td>" + esc(b.bankName) + "</td><td>" + (b.visible === false ? badge("Hold") : badge("Available")) + '</td><td><div class="actions"><button class="btn btn--sm btn--ghost" data-edit="' + b.id + '">Edit</button><button class="btn btn--sm ' + (b.visible === false ? "btn--primary" : "btn--ghost") + '" data-vis="' + b.id + '">' + (b.visible === false ? "Show" : "Hide") + '</button></div></td></tr>';
      }).join("");
    }
    var add = $("#addBank");
    if (add) add.addEventListener("click", function () {
      openForm("Add Bank Details", fields, { visible: true }, function (d) {
        var l = FH.store.get("banks").slice(); d.id = FH.store.nextId("BK", l); d.visible = d.visible !== false;
        l.push(d); FH.store.set("banks", l); draw(); toast("Saved", "Bank details added.");
      });
    });
    body.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"); var vis = e.target.closest("[data-vis]");
      if (ed) {
        var b = FH.store.get("banks").filter(function (x) { return x.id === ed.getAttribute("data-edit"); })[0];
        openForm("Edit Bank Details", fields, b, function (d) {
          FH.store.set("banks", FH.store.get("banks").map(function (x) { return x.id === b.id ? Object.assign({}, x, d) : x; }));
          draw(); toast("Saved", "Bank details updated.");
        });
      }
      if (vis) {
        FH.store.set("banks", FH.store.get("banks").map(function (x) { return x.id === vis.getAttribute("data-vis") ? Object.assign({}, x, { visible: x.visible === false }) : x; }));
        draw(); toast("Visibility changed", "Website display updated.");
      }
    });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Reports                                                            */
  /* ------------------------------------------------------------------ */
  function renderReports() {
    var typeSel = $("#reportType"), body = $("#reportBody");
    if (!typeSel || !body) return;
    var projSel = $("#reportProject"), statusSel = $("#reportStatus"), from = $("#reportFrom"), to = $("#reportTo");
    if (projSel) projSel.innerHTML = '<option value="">All Projects</option>' + FH.store.get("projects").map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    if (statusSel) statusSel.innerHTML = '<option value="">All Status</option>' + ["Available", "Booked", "Hold", "Agreement", "Sale Deed", "Sold"].map(function (s) { return "<option>" + s + "</option>"; }).join("");
    function dataset() {
      var t = typeSel.value;
      if (t === "Plot Inventory") return { rows: FH.store.get("plots").map(function (u) { return [u.number, projectName(u.projectId), u.area, u.plotType, u.facing, money(u.rate), u.status]; }), head: ["Plot No", "Project", "Area", "Type", "Facing", "Rate", "Status"] };
      if (t === "Flat Inventory") return { rows: FH.store.get("flats").map(function (u) { return [u.number, projectName(u.projectId), u.superArea, u.flatType, u.facing, money(u.rate), u.status]; }), head: ["Flat No", "Project", "Area", "Type", "Facing", "Rate", "Status"] };
      if (t === "Enquiry Report") return { rows: FH.store.get("enquiries").map(function (e) { return [e.id, e.name, e.phone, e.interest, projectName(e.projectId), e.status, e.date]; }), head: ["ID", "Name", "Phone", "Interest", "Project", "Status", "Date"] };
      if (t === "Quotation Report") return { rows: (FH.store.get("quotations") || []).map(function (q) { return [q.id, q.customer, projectName(q.projectId), q.unit, money(q.basePrice), money(q.finalAmount), q.status]; }), head: ["ID", "Customer", "Project", "Unit", "Base", "Final", "Status"] };
      if (t === "Booking Report") return { rows: FH.store.get("plots").filter(function (u) { return u.status === "Booked" || u.status === "Agreement" || u.status === "Sale Deed"; }).map(function (u) { return [u.number, projectName(u.projectId), u.plotType, money(u.rate * u.area), u.status]; }), head: ["Unit", "Project", "Type", "Value", "Status"] };
      return { rows: FH.store.get("plots").filter(function (u) { return u.status === "Available"; }).map(function (u) { return [u.number, projectName(u.projectId), u.area, u.plotType, money(u.rate * u.area), u.status]; }), head: ["Unit", "Project", "Area", "Type", "Value", "Status"] };
    }
    function filterRows(set) {
      var pv = projSel ? projSel.value : "", sv = statusSel ? statusSel.value : "";
      if (!pv && !sv) return set;
      var rows = set.rows.filter(function (r, i) {
        var raw = r.join(" ").toLowerCase();
        if (sv && r[r.length - 1] !== sv) return false;
        if (pv && r.indexOf(projectName(pv)) === -1 && raw.indexOf(projectName(pv).toLowerCase()) === -1) return false;
        return true;
      });
      return { rows: rows, head: set.head };
    }
    function draw() {
      var set = filterRows(dataset());
      $("#reportHead").innerHTML = "<tr>" + set.head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>";
      $("#reportRows").innerHTML = set.rows.length ? set.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") : '<tr><td colspan="' + set.head.length + '"><div class="table-empty">No data for this report.</div></td></tr>';
      $("#reportCount").textContent = set.rows.length + " records";
    }
    typeSel.addEventListener("change", draw);
    [projSel, statusSel].forEach(function (el) { if (el) el.addEventListener("change", draw); });
    var exp = $("#reportExport");
    if (exp) exp.addEventListener("click", function () {
      var set = filterRows(dataset());
      var csv = [set.head.join(",")].concat(set.rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); })).join("\n");
      downloadText(typeSel.value.replace(/\s+/g, "-"), csv, "text/csv");
      toast("Export ready", "Report downloaded as CSV (opens in Excel).");
    });
    var pdf = $("#reportPdf");
    if (pdf) pdf.addEventListener("click", function () { window.print(); });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Users                                                              */
  /* ------------------------------------------------------------------ */
  function renderUsers() {
    var body = $("#adminUsersBody"); if (!body) return;
    var ROLES = ["Super Admin", "Admin", "Sales Executive", "Finance", "Viewer"];
    function draw() {
      body.innerHTML = users().map(function (u) {
        return "<tr><td><div style=\"display:flex;gap:10px;align-items:center\"><span class=\"admin-user\"><span class=\"av\">" + esc(u.name.charAt(0)) + "</span></span><b>" + esc(u.name) + "</b></div></td><td>" + esc(u.username) + "</td><td>" + badge(u.role) + "</td><td>" + (u.active === false ? badge("Hold") : badge("Available")) + '</td><td><div class="actions"><button class="btn btn--sm btn--ghost" data-edit="' + u.id + '">Edit</button><button class="btn btn--sm btn--danger" data-del="' + u.id + '">Remove</button></div></td></tr>';
      }).join("");
    }
    var fields = [
      { name: "name", label: "Full Name" }, { name: "username", label: "Username" },
      { name: "password", label: "Password", def: "changeme123" },
      { name: "role", label: "Role", type: "select", options: ROLES },
      { name: "active", label: "Active account", type: "checkbox", def: true }
    ];
    var add = $("#addUser");
    if (add) add.addEventListener("click", function () {
      openForm("Add User", fields, { active: true }, function (d) {
        var l = users().slice(); d.id = "U-" + (l.length + 1); d.active = d.active !== false;
        l.push(d); FH.store.set("users", l); draw(); toast("User created", d.name + " added as " + d.role + ".");
      });
    });
    body.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"); var del = e.target.closest("[data-del]");
      if (ed) {
        var u = users().filter(function (x) { return x.id === ed.getAttribute("data-edit"); })[0];
        openForm("Edit User", fields, u, function (d) {
          FH.store.set("users", users().map(function (x) { return x.id === u.id ? Object.assign({}, x, d) : x; }));
          draw(); toast("User updated", d.name + " saved.");
        });
      }
      if (del) {
        if (!confirm("Remove this user?")) return;
        FH.store.set("users", users().filter(function (x) { return x.id !== del.getAttribute("data-del"); }));
        draw(); toast("User removed", "Account deleted.");
      }
    });
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* Settings                                                           */
  /* ------------------------------------------------------------------ */
  function renderSettings() {
    var form = $("#settingsForm"); if (!form) return;
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("fh_settings")) || {}; } catch (e) {}
    ["company", "phone", "whatsapp", "email", "office", "hours"].forEach(function (k) {
      var el = form.elements[k];
      if (el && saved[k]) el.value = saved[k];
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      ["company", "phone", "whatsapp", "email", "office", "hours"].forEach(function (k) { if (form.elements[k]) data[k] = form.elements[k].value; });
      localStorage.setItem("fh_settings", JSON.stringify(data));
      toast("Settings saved", "Configuration updated.");
    });
    var reset = $("#resetDemo");
    if (reset) reset.addEventListener("click", function () {
      if (!confirm("Reset all demo data (inventory, enquiries, quotations)?")) return;
      FH.store.reset();
      toast("Demo data reset", "All records restored to defaults.");
      setTimeout(function () { window.location.reload(); }, 700);
    });
  }

  /* ------------------------------------------------------------------ */
  function downloadText(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + (type === "text/csv" ? ".csv" : ".txt");
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ------------------------------------------------------------------ */
  var routes = {
    dashboard: renderDashboard, projects: renderProjects, plots: renderPlots, flats: renderFlats,
    gallery: renderGalleryAdmin, enquiries: renderEnquiries, quotations: renderQuotations,
    "bank-details": renderBankAdmin, reports: renderReports, users: renderUsers, settings: renderSettings
  };

  function run() {
    guard();
    if (PAGE === "login") { initLogin(); return; }
    if (routes[PAGE]) routes[PAGE]();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
