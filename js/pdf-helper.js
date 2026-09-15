/* =====================================================================
   Future Homes Infra - PDF Helper Utility
   Multicolor PDF generator for EMI Calculations & Property Quotations.
   ===================================================================== */
window.FHPdf = (function () {
  "use strict";

  function formatMoney(n) {
    return "Rs. " + Number(n || 0).toLocaleString("en-IN");
  }

  function downloadPdfFromCanvas(canvas, filename) {
    var imgData = canvas.toDataURL("image/png");
    var imgWidth = 210; // A4 size in mm
    var pageHeight = 297;
    var imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    if (window.jspdf && window.jspdf.jsPDF) {
      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(filename);
    } else {
      // Fallback if jsPDF CDN is blocked: trigger print/download window or canvas download
      var pdfWindow = window.open("", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(
          '<html><head><title>' + filename + '</title><style>body{margin:0;display:flex;justify-content:center;background:#f4f6f8;}img{max-width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.15);}</style></head><body><img src="' + imgData + '"/></body></html>'
        );
        pdfWindow.document.close();
        setTimeout(function () { pdfWindow.print(); }, 500);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* EMI Calculator PDF Generator (Multicolor)                         */
  /* ------------------------------------------------------------------ */
  function generateEmiPdf(data) {
    var canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    var ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner (Deep Blue)
    var grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "#0B2A5B");
    grad.addColorStop(1, "#146BFF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 180);

    // Brand Logo & Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px Sora, sans-serif";
    ctx.fillText("FUTURE HOMES INFRA", 60, 80);

    ctx.font = "20px Sora, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("Building Better Tomorrow  |  Home Loan EMI Summary", 60, 122);

    ctx.font = "bold 22px Sora, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(new Date().toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' }), canvas.width - 60, 80);
    ctx.textAlign = "left";

    var y = 240;

    // Title Section
    ctx.fillStyle = "#080A0D";
    ctx.font = "bold 32px Sora, sans-serif";
    ctx.fillText("EMI & Loan Breakdown Statement", 60, y);

    ctx.fillStyle = "#64748B";
    ctx.font = "18px Sora, sans-serif";
    ctx.fillText("Detailed estimate of monthly outflow and total interest payable.", 60, y + 32);

    y += 80;

    // Key Input Metrics Cards (4 Grid Boxes)
    var cards = [
      { label: "PROPERTY VALUE", val: formatMoney(data.value), color: "#0B2A5B" },
      { label: "DOWN PAYMENT", val: formatMoney(data.down), color: "#475569" },
      { label: "LOAN AMOUNT", val: formatMoney(data.principal), color: "#146BFF" },
      { label: "INTEREST RATE", val: data.rate + "% p.a.", color: "#059669" }
    ];

    var boxW = 255;
    var boxH = 110;
    var gap = 20;

    cards.forEach(function (c, i) {
      var bx = 60 + i * (boxW + gap);
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.roundRect(bx, y, boxW, boxH, 12);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#E2E8F0";
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 13px Sora, sans-serif";
      ctx.fillText(c.label, bx + 20, y + 38);

      ctx.fillStyle = c.color;
      ctx.font = "bold 22px Sora, sans-serif";
      ctx.fillText(c.val, bx + 20, y + 80);
    });

    y += boxH + 40;

    // Tenure Card (Highlighted Years & Total Months)
    var tenureYears = data.tenure;
    var tenureMonths = tenureYears * 12;

    ctx.fillStyle = "#EFF6FF";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 90, 12);
    ctx.fill();
    ctx.strokeStyle = "#BFDBFE";
    ctx.stroke();

    ctx.fillStyle = "#1E40AF";
    ctx.font = "bold 16px Sora, sans-serif";
    ctx.fillText("LOAN TENURE & DURATION:", 85, y + 38);

    ctx.fillStyle = "#1D4ED8";
    ctx.font = "bold 26px Sora, sans-serif";
    ctx.fillText(tenureYears + " Years  (" + tenureMonths + " Total Months)", 85, y + 72);

    y += 130;

    // Highlight Box: Monthly EMI (Big Royal Blue Card)
    ctx.fillStyle = "#146BFF";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 150, 16);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Sora, sans-serif";
    ctx.fillText("ESTIMATED MONTHLY EMI", 90, y + 52);

    ctx.font = "bold 52px Sora, sans-serif";
    ctx.fillText(formatMoney(Math.round(data.emi)), 90, y + 116);

    ctx.textAlign = "right";
    ctx.font = "16px Sora, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("Fixed monthly installment", canvas.width - 90, y + 88);
    ctx.textAlign = "left";

    y += 190;

    // Financial Breakdown Table Header
    ctx.fillStyle = "#0B2A5B";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 50, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Sora, sans-serif";
    ctx.fillText("Loan Summary Particulars", 90, y + 32);
    ctx.textAlign = "right";
    ctx.fillText("Amount (INR)", canvas.width - 90, y + 32);
    ctx.textAlign = "left";

    y += 50;

    var rows = [
      ["Principal Loan Amount", formatMoney(Math.round(data.principal)), "#1E293B"],
      ["Total Interest Payable (" + data.rate + "% over " + tenureYears + " yrs)", formatMoney(Math.round(data.totalInt)), "#D97706"],
      ["Total Payment (Principal + Interest)", formatMoney(Math.round(data.totalPay)), "#059669"]
    ];

    rows.forEach(function (r, idx) {
      ctx.fillStyle = idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      ctx.fillRect(60, y, canvas.width - 120, 60);
      ctx.strokeStyle = "#E2E8F0";
      ctx.strokeRect(60, y, canvas.width - 120, 60);

      ctx.fillStyle = "#334155";
      ctx.font = "18px Sora, sans-serif";
      ctx.fillText(r[0], 90, y + 36);

      ctx.textAlign = "right";
      ctx.fillStyle = r[2];
      ctx.font = "bold 20px Sora, sans-serif";
      ctx.fillText(r[1], canvas.width - 90, y + 36);
      ctx.textAlign = "left";

      y += 60;
    });

    y += 60;

    // Footer & Disclaimer
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(60, y, canvas.width - 120, 2);

    y += 35;
    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px Sora, sans-serif";
    ctx.fillText("Note: This is an indicative estimate. Actual loan terms, processing fees, and rates subject to bank approval.", 60, y);
    ctx.fillText("Future Homes Infra  |  Email: sales@futurehomesinfra.in  |  Phone: +91 98765 43210", 60, y + 26);

    downloadPdfFromCanvas(canvas, "Future_Homes_EMI_Calculation.pdf");
  }

  /* ------------------------------------------------------------------ */
  /* Quotation PDF Generator (Multicolor)                             */
  /* ------------------------------------------------------------------ */
  function generateQuotationPdf(data) {
    var canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    var ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner (Deep Blue)
    var grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "#0B2A5B");
    grad.addColorStop(1, "#146BFF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 180);

    // Brand Logo & Header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px Sora, sans-serif";
    ctx.fillText("FUTURE HOMES INFRA", 60, 80);

    ctx.font = "20px Sora, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("Building Better Tomorrow  |  Official Price Quotation", 60, 122);

    ctx.textAlign = "right";
    ctx.font = "bold 26px Sora, sans-serif";
    ctx.fillText("REF: " + (data.id || "QT-DRAFT"), canvas.width - 60, 80);
    ctx.font = "18px Sora, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("Date: " + (data.date || new Date().toISOString().slice(0, 10)), canvas.width - 60, 120);
    ctx.textAlign = "left";

    var y = 240;

    // Customer & Unit Information Cards (2 Side-by-Side Boxes)
    var boxW = 520;
    var boxH = 150;

    // Customer Box
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.roundRect(60, y, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = "#E2E8F0";
    ctx.stroke();

    ctx.fillStyle = "#146BFF";
    ctx.font = "bold 15px Sora, sans-serif";
    ctx.fillText("CUSTOMER DETAILS", 85, y + 36);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 24px Sora, sans-serif";
    ctx.fillText(data.customer || "Walk-in Customer", 85, y + 76);

    ctx.fillStyle = "#64748B";
    ctx.font = "16px Sora, sans-serif";
    ctx.fillText("Quotation Request", 85, y + 110);

    // Unit Box
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.roundRect(620, y, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = "#E2E8F0";
    ctx.stroke();

    ctx.fillStyle = "#146BFF";
    ctx.font = "bold 15px Sora, sans-serif";
    ctx.fillText("PROPERTY UNIT SUMMARY", 645, y + 36);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 24px Sora, sans-serif";
    ctx.fillText(data.unit ? (data.type + " " + data.unit) : (data.type || "Property Unit"), 645, y + 76);

    ctx.fillStyle = "#64748B";
    ctx.font = "16px Sora, sans-serif";
    ctx.fillText("Project: " + (data.projectName || data.projectId || "Selected Project"), 645, y + 110);

    y += boxH + 50;

    // Pricing Table Header
    ctx.fillStyle = "#0B2A5B";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 50, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Sora, sans-serif";
    ctx.fillText("Item Description / Parameter", 90, y + 32);
    ctx.textAlign = "right";
    ctx.fillText("Value / Price", canvas.width - 90, y + 32);
    ctx.textAlign = "left";

    y += 50;

    var rows = [
      ["Unit Area (Sq.Ft.)", (data.area || 0) + " Sq.Ft.", "#1E293B"],
      ["Base Rate / Sq.Ft.", formatMoney(data.rate) + " / Sq.Ft.", "#1E293B"],
      ["Base Property Price", formatMoney(data.basePrice || ((data.area || 0) * (data.rate || 0))), "#0B2A5B"],
      ["Development & Other Charges", formatMoney(data.otherCharges || 0), "#475569"],
      ["Discount / Concession (-)", "- " + formatMoney(data.discount || 0), "#D97706"]
    ];

    rows.forEach(function (r, idx) {
      ctx.fillStyle = idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      ctx.fillRect(60, y, canvas.width - 120, 56);
      ctx.strokeStyle = "#E2E8F0";
      ctx.strokeRect(60, y, canvas.width - 120, 56);

      ctx.fillStyle = "#334155";
      ctx.font = "18px Sora, sans-serif";
      ctx.fillText(r[0], 90, y + 34);

      ctx.textAlign = "right";
      ctx.fillStyle = r[2];
      ctx.font = "bold 19px Sora, sans-serif";
      ctx.fillText(r[1], canvas.width - 90, y + 34);
      ctx.textAlign = "left";

      y += 56;
    });

    y += 20;

    // Final Total Highlight Banner (Royal Blue)
    var finalAmt = data.finalAmount || ((data.basePrice || 0) + (data.otherCharges || 0) - (data.discount || 0));
    ctx.fillStyle = "#146BFF";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 110, 14);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Sora, sans-serif";
    ctx.fillText("FINAL OFFER PRICE (ALL INCLUSIVE)", 90, y + 42);

    ctx.font = "bold 44px Sora, sans-serif";
    ctx.fillText(formatMoney(finalAmt), 90, y + 92);

    y += 160;

    // Terms & Conditions Box
    ctx.fillStyle = "#F1F5F9";
    ctx.beginPath();
    ctx.roundRect(60, y, canvas.width - 120, 140, 10);
    ctx.fill();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 15px Sora, sans-serif";
    ctx.fillText("TERMS & CONDITIONS:", 85, y + 34);

    ctx.font = "14px Sora, sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("1. Quotation valid for 15 days from issue date.", 85, y + 64);
    ctx.fillText("2. Statutory taxes, stamp duty, and registration fees applicable at actuals.", 85, y + 88);
    ctx.fillText("3. Booking subject to unit availability at the time of token payment.", 85, y + 112);

    y += 180;

    // Signatures
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(360, y);
    ctx.moveTo(canvas.width - 360, y); ctx.lineTo(canvas.width - 60, y);
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "bold 15px Sora, sans-serif";
    ctx.fillText("Customer Acceptance Signature", 60, y + 28);

    ctx.textAlign = "right";
    ctx.fillText("Authorized Sales Representative", canvas.width - 60, y + 28);
    ctx.textAlign = "left";

    downloadPdfFromCanvas(canvas, "Quotation_" + (data.id || "Draft") + ".pdf");
  }

  return {
    generateEmiPdf: generateEmiPdf,
    generateQuotationPdf: generateQuotationPdf
  };
})();
