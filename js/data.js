/* =====================================================================
   Future Homes Infra - Data Layer
   ---------------------------------------------------------------------
   Presentation only. All reads go through FH.* accessors so that the
   demo store below can be swapped for a real CRM API later by setting
   FH.api.baseUrl. Admin edits persist to localStorage and are layered
   on top of the seed data, so public pages reflect admin changes.
   ===================================================================== */
window.FH = (function () {
  "use strict";

  var CONFIG = {
    brand: "Future Homes Infra",
    tagline: "Building Better Tomorrow",
    heroLine: "More Than Property. A Better Future.",
    phone: "+91 98765 43210",
    phoneRaw: "919876543210",
    whatsapp: "919876543210",
    email: "sales@futurehomesinfra.in",
    office: "Future Homes Infra Corporate Office, Main Road, Nagpur, Maharashtra 440001",
    hours: "Mon - Sat : 10:00 AM - 7:00 PM",
    social: {
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/",
      google: "https://g.page/"
    },
    currency: "\u20B9"
  };

  /* ---- API placeholder -------------------------------------------------
     In production this base URL is the CRM backend. While it is empty the
     store serves demo data so the prototype works fully offline. */
  var API_BASE = "";

  var KEY = "fh_infra_store_v1";

  /* ---- Seed inventory -------------------------------------------------- */
  var projects = [
    {
      id: "PRJ-01",
      name: "Narmada Residency",
      type: "Plots & Flats",
      location: "Wardha Road",
      city: "Nagpur",
      state: "Maharashtra",
      status: "Ongoing",
      startPrice: 1250000,
      address: "Wardha Road, Near Airport, Nagpur",
      art: "art--blue",
      description: "Narmada Residency is an ongoing premium residential development located at Wardha Road, Near Airport, Nagpur, offering plots & flats with clear land titles and modern infrastructure.",
      highlights: "Clear and verified land title\nGated layout with internal concrete roads\nWater, electricity and drainage ready\nLandscaped gardens and open spaces\nClose to schools, hospitals and highways",
      locationAdvantages: "Nagpur Airport: Within 3 km\nMetro Station: Within 2 km\nSchools & Colleges: Within 2-5 km\nHospitals: Within 3 km\nHighway Access: Direct connectivity",
      totalPlots: 60, totalFlats: 48, availablePlots: 0, availableFlats: 0
    },
    {
      id: "PRJ-02",
      name: "Godavari Greens",
      type: "Plots",
      location: "Amravati Road",
      city: "Nagpur",
      state: "Maharashtra",
      status: "Ready to Move",
      startPrice: 950000,
      address: "Amravati Road, Wadi, Nagpur",
      art: "art--deep",
      description: "Godavari Greens offers ready-to-move residential plots situated along Amravati Road, Wadi, Nagpur. Designed with wide internal roads, avenue trees, and immediate electrification.",
      highlights: "NMRDA sanctioned township layout\nImmediate possession and registration\n24x7 security gate and boundary wall\nChildren play park and jogging track",
      locationAdvantages: "Amravati National Highway: Direct connectivity\nMarket & Shops: Within 1 km\nSchools: Within 3 km\nRailway Station: Within 10 km",
      totalPlots: 48, totalFlats: 0, availablePlots: 0, availableFlats: 0
    },
    {
      id: "PRJ-03",
      name: "Tapti Heights",
      type: "Flats",
      location: "Kamptee Road",
      city: "Nagpur",
      state: "Maharashtra",
      status: "Under Construction",
      startPrice: 2850000,
      address: "Kamptee Road, Indora, Nagpur",
      art: "art--steel",
      description: "Tapti Heights is a modern high-rise residential flat complex on Kamptee Road offering spacious 1, 2 and 3 BHK luxury apartments with premium fittings and rooftop amenities.",
      highlights: "Earthquake resistant R.C.C structure\nCovered car parking for every flat\nAutomatic elevators with power backup\nClubhouse with indoor games",
      locationAdvantages: "Kamptee Road Main Square: 500 meters\nMetro Station: 1 km\nShopping Malls: Within 2 km\nHospitals: Within 1.5 km",
      totalPlots: 0, totalFlats: 72, availablePlots: 0, availableFlats: 0
    },
    {
      id: "PRJ-04",
      name: "Wainganga Enclave",
      type: "Plots",
      location: "Hingna Road",
      city: "Nagpur",
      state: "Maharashtra",
      status: "Ongoing",
      startPrice: 1100000,
      address: "Hingna Road, Wanadongri, Nagpur",
      art: "art--ink",
      description: "Wainganga Enclave is an ongoing plotting project located close to Hingna MIDC and educational hubs, providing serene green living with high investment return potential.",
      highlights: "RL sanctioned layout plots\nPopulated neighborhood with high appreciation\nDemarcated plot boundaries\nClear search report available",
      locationAdvantages: "Hingna MIDC: 2 km\nEngineering Colleges: Within 3 km\nHospital: 2.5 km\nBus Depot: 1 km",
      totalPlots: 54, totalFlats: 0, availablePlots: 0, availableFlats: 0
    },
    {
      id: "PRJ-05",
      name: "Krishna Villas",
      type: "Plots & Flats",
      location: "Besa Road",
      city: "Nagpur",
      state: "Maharashtra",
      status: "Ready to Move",
      startPrice: 1650000,
      address: "Besa Road, Manish Nagar, Nagpur",
      art: "art--blue",
      description: "Krishna Villas offers ready-to-move plots and premium apartments in the prime residential corridor of Besa-Manish Nagar, Nagpur.",
      highlights: "Prime location near Manish Nagar flyover\nHigh-density residential hub\nAll essential utilities connected\nReady for immediate construction",
      locationAdvantages: "Manish Nagar Market: 1 km\nNagpur Airport: 4 km\nMetro Station: 2 km\nReputed Schools: Within 1.5 km",
      totalPlots: 36, totalFlats: 36, availablePlots: 0, availableFlats: 0
    }
  ];

  var PLOT_STATUSES = ["Available", "Booked", "Hold", "Agreement", "Sale Deed"];
  var FLAT_STATUSES = ["Available", "Booked", "Agreement", "Sold"];
  var FACINGS = ["East", "West", "North", "South", "North-East", "South-West"];

  function seedPlots() {
    var out = [];
    var perProject = { "PRJ-01": 30, "PRJ-02": 24, "PRJ-04": 27, "PRJ-05": 18 };
    Object.keys(perProject).forEach(function (pid) {
      var n = perProject[pid];
      for (var i = 1; i <= n; i++) {
        var alpha = i <= Math.ceil(n / 3) ? "A" : i <= Math.ceil((2 * n) / 3) ? "B" : "C";
        var num = alpha + "-" + String(((i - 1) % Math.ceil(n / 3)) + 1).padStart(2, "0");
        var status = PLOT_STATUSES[(i * 3 + pid.charCodeAt(5)) % PLOT_STATUSES.length];
        out.push({
          id: pid + "-PL-" + i,
          projectId: pid,
          number: num,
          area: 1000 + ((i * 137) % 9) * 150,
          plotType: i % 7 === 0 ? "Corner" : i % 5 === 0 ? "Premium" : "Regular",
          facing: FACINGS[(i * 2) % FACINGS.length],
          rate: 1800 + ((i * 53) % 7) * 100,
          status: status,
          notes: ""
        });
      }
    });
    return out;
  }

  function seedFlats() {
    var out = [];
    var perProject = { "PRJ-01": 24, "PRJ-03": 36, "PRJ-05": 18 };
    Object.keys(perProject).forEach(function (pid) {
      var n = perProject[pid];
      for (var i = 1; i <= n; i++) {
        var wing = i % 2 === 0 ? "A" : "B";
        var floor = Math.ceil(i / 4);
        var num = wing + "-" + (floor < 10 ? "0" + floor : floor) + "0" + ((i % 4) + 1);
        var status = FLAT_STATUSES[(i + pid.charCodeAt(5)) % FLAT_STATUSES.length];
        out.push({
          id: pid + "-FL-" + i,
          projectId: pid,
          wing: wing,
          floor: floor,
          number: num,
          flatType: i % 4 === 0 ? "3 BHK" : i % 3 === 0 ? "2 BHK" : "1 BHK",
          superArea: 650 + ((i * 71) % 6) * 120,
          carpetArea: 480 + ((i * 61) % 6) * 100,
          facing: FACINGS[(i * 3) % FACINGS.length],
          rate: 4200 + ((i * 43) % 6) * 150,
          status: status
        });
      }
    });
    return out;
  }

  var gallery = [
    { id: "G-01", projectId: "PRJ-01", category: "Project Images", title: "Narmada Residency Entrance", date: "2026-01-12", art: "art--blue" },
    { id: "G-02", projectId: "PRJ-01", category: "Plot Images", title: "Plot Layout Phase A", date: "2026-01-18", art: "art--ink" },
    { id: "G-03", projectId: "PRJ-01", category: "Flat Images", title: "3 BHK Living Room", date: "2026-02-02", art: "art--steel" },
    { id: "G-04", projectId: "PRJ-02", category: "Construction Updates", title: "Road Work Progress", date: "2026-02-10", art: "art--deep" },
    { id: "G-05", projectId: "PRJ-02", category: "Plot Images", title: "Corner Plot View", date: "2026-02-15", art: "art--ink" },
    { id: "G-06", projectId: "PRJ-03", category: "Project Images", title: "Tapti Heights Tower", date: "2026-02-20", art: "art--steel" },
    { id: "G-07", projectId: "PRJ-03", category: "Flat Images", title: "Sample Flat Kitchen", date: "2026-03-01", art: "art--blue" },
    { id: "G-08", projectId: "PRJ-04", category: "Construction Updates", title: "Boundary Wall Complete", date: "2026-03-06", art: "art--deep" },
    { id: "G-09", projectId: "PRJ-05", category: "Project Images", title: "Krishna Villas Clubhouse", date: "2026-03-12", art: "art--blue" },
    { id: "G-10", projectId: "PRJ-05", category: "Plot Images", title: "Villa Plot Grid", date: "2026-03-18", art: "art--ink" },
    { id: "G-11", projectId: "PRJ-03", category: "Construction Updates", title: "Slab Casting Floor 5", date: "2026-03-22", art: "art--steel" },
    { id: "G-12", projectId: "PRJ-01", category: "Project Images", title: "Amenities Garden", date: "2026-03-28", art: "art--deep" }
  ];

  var banks = [
    { id: "BK-01", projectId: "PRJ-01", accountName: "Future Homes Infra - Narmada Residency", accountNumber: "5010 2345 6789", ifsc: "HDFC0001234", bankName: "HDFC Bank", branch: "Wardha Road, Nagpur", visible: true },
    { id: "BK-02", projectId: "PRJ-02", accountName: "Future Homes Infra - Godavari Greens", accountNumber: "5020 9876 5432", ifsc: "ICIC0005678", bankName: "ICICI Bank", branch: "Amravati Road, Nagpur", visible: true },
    { id: "BK-03", projectId: "PRJ-03", accountName: "Future Homes Infra - Tapti Heights", accountNumber: "5030 1122 3344", ifsc: "SBIN0012345", bankName: "State Bank of India", branch: "Kamptee Road, Nagpur", visible: true },
    { id: "BK-04", projectId: "PRJ-04", accountName: "Future Homes Infra - Wainganga Enclave", accountNumber: "5040 5566 7788", ifsc: "AXIS0009876", bankName: "Axis Bank", branch: "Hingna Road, Nagpur", visible: false }
  ];

  var enquiries = [
    { id: "ENQ-1001", name: "Rahul Deshmukh", phone: "+91 90000 11111", email: "rahul@example.com", interest: "Plot", projectId: "PRJ-01", budget: "10L - 20L", message: "Looking for a corner plot.", date: "2026-03-20", executive: "Sneha K.", status: "New", notes: [] },
    { id: "ENQ-1002", name: "Priya Sharma", phone: "+91 90000 22222", email: "priya@example.com", interest: "Flat", projectId: "PRJ-03", budget: "30L - 50L", message: "2 BHK on higher floor.", date: "2026-03-21", executive: "Amit P.", status: "Contacted", notes: [] },
    { id: "ENQ-1003", name: "Imran Sheikh", phone: "+91 90000 33333", email: "imran@example.com", interest: "Plot", projectId: "PRJ-02", budget: "Below 10L", message: "Site visit this weekend.", date: "2026-03-22", executive: "Sneha K.", status: "Site Visit", notes: [] },
    { id: "ENQ-1004", name: "Kavita Rane", phone: "+91 90000 44444", email: "kavita@example.com", interest: "Flat", projectId: "PRJ-05", budget: "20L - 30L", message: "Interested in ready possession.", date: "2026-03-23", executive: "Amit P.", status: "Interested", notes: [] },
    { id: "ENQ-1005", name: "Sandeep Yadav", phone: "+91 90000 55555", email: "sandeep@example.com", interest: "Plot", projectId: "PRJ-04", budget: "10L - 20L", message: "Need quotation for 2 plots.", date: "2026-03-24", executive: "Rohit M.", status: "Quotation", notes: [] },
    { id: "ENQ-1006", name: "Neha Kulkarni", phone: "+91 90000 66666", email: "neha@example.com", interest: "Flat", projectId: "PRJ-01", budget: "30L - 50L", message: "Wants east facing.", date: "2026-03-25", executive: "Sneha K.", status: "Negotiation", notes: [] },
    { id: "ENQ-1007", name: "Vikram Singh", phone: "+91 90000 77777", email: "vikram@example.com", interest: "Plot", projectId: "PRJ-05", budget: "Above 50L", message: "Investment purpose.", date: "2026-03-26", executive: "Rohit M.", status: "Booked", notes: [] },
    { id: "ENQ-1008", name: "Anita Joshi", phone: "+91 90000 88888", email: "anita@example.com", interest: "Flat", projectId: "PRJ-03", budget: "20L - 30L", message: "Just exploring.", date: "2026-03-27", executive: "Amit P.", status: "Not Interested", notes: [] }
  ];

  var quotations = [
    { id: "QT-2001", customer: "Sandeep Yadav", projectId: "PRJ-04", unit: "A-12", type: "Plot", area: 1600, rate: 2200, basePrice: 3520000, otherCharges: 120000, discount: 50000, finalAmount: 3590000, date: "2026-03-24", status: "Sent" },
    { id: "QT-2002", customer: "Neha Kulkarni", projectId: "PRJ-01", unit: "A-0402", type: "Flat", area: 890, rate: 4800, basePrice: 4272000, otherCharges: 180000, discount: 72000, finalAmount: 4380000, date: "2026-03-25", status: "Draft" }
  ];

  var activities = [
    { id: "AC-1", icon: "user", text: "New enquiry received from Rahul Deshmukh", time: "12 min ago" },
    { id: "AC-2", icon: "home", text: "Plot A-12 in Wainganga Enclave marked Hold", time: "48 min ago" },
    { id: "AC-3", icon: "file", text: "Quotation QT-2002 generated by Amit P.", time: "2 hours ago" },
    { id: "AC-4", icon: "check", text: "Flat B-0403 booking confirmed in Tapti Heights", time: "5 hours ago" },
    { id: "AC-5", icon: "image", text: "6 construction images uploaded to Tapti Heights", time: "Yesterday" }
  ];

  var seed = {
    projects: projects,
    plots: seedPlots(),
    flats: seedFlats(),
    gallery: gallery,
    banks: banks,
    enquiries: enquiries,
    quotations: quotations,
    activities: activities
  };

  /* ---- Store (localStorage overlay) ----------------------------------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeStore(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  var overrides = readStore();

  function set(key, arr) { overrides[key] = arr; writeStore(overrides); }
  function get(key) { return overrides[key] || seed[key]; }
  function resetAll() { overrides = {}; writeStore(overrides); }

  /* ---- Derived helpers ------------------------------------------------- */
  function projectName(id) {
    var p = projects.concat(get("projects")).filter(function (x) { return x.id === id; })[0];
    return p ? p.name : id;
  }

  function stats() {
    var pl = get("plots"), fl = get("flats"), pj = get("projects"), en = get("enquiries");
    var availPlots = pl.filter(function (p) { return p.status === "Available"; }).length;
    var availFlats = fl.filter(function (f) { return f.status === "Available"; }).length;
    return {
      totalProjects: pj.length,
      totalPlots: pl.length,
      availablePlots: availPlots,
      bookedPlots: pl.filter(function (p) { return p.status === "Booked"; }).length,
      agreementPlots: pl.filter(function (p) { return p.status === "Agreement"; }).length,
      saleDeedPlots: pl.filter(function (p) { return p.status === "Sale Deed"; }).length,
      holdPlots: pl.filter(function (p) { return p.status === "Hold"; }).length,
      totalFlats: fl.length,
      availableFlats: availFlats,
      bookedFlats: fl.filter(function (f) { return f.status === "Booked"; }).length,
      agreementFlats: fl.filter(function (f) { return f.status === "Agreement"; }).length,
      soldFlats: fl.filter(function (f) { return f.status === "Sold"; }).length,
      newEnquiries: en.filter(function (e) { return e.status === "New"; }).length,
      pendingFollowups: en.filter(function (e) { return e.status !== "Booked" && e.status !== "Closed" && e.status !== "Not Interested"; }).length,
      happyFamilies: pl.filter(function (p) { return p.status === "Sale Deed"; }).length + fl.filter(function (f) { return f.status === "Sold"; }).length + 1240
    };
  }

  function nextId(prefix, arr) {
    var max = 0;
    arr.forEach(function (r) {
      var n = parseInt(String(r.id).replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return prefix + "-" + (max + 1);
  }

  /* ---- Minimal API shim ------------------------------------------------ */
  function apiRequest(path, options) {
    if (!API_BASE) return Promise.reject(new Error("API not configured"));
    return fetch(API_BASE + path, Object.assign({
      headers: { "Content-Type": "application/json" }
    }, options || {})).then(function (r) {
      if (!r.ok) throw new Error("Request failed: " + r.status);
      return r.json();
    });
  }

  return {
    CONFIG: CONFIG,
    api: { baseUrl: API_BASE, request: apiRequest },
    store: { get: get, set: set, reset: resetAll, nextId: nextId },
    projectName: projectName,
    stats: stats
  };
})();
