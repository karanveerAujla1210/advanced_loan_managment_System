const xlsx = require("xlsx");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");
const reportService = require("../services/report.service");
const { sendReportEmail } = require("../cron/reports.cron");

function sendXlsx(res, workbookBuffer, filename) {
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(workbookBuffer);
}

function sendCsv(res, csvString, filename) {
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
  res.setHeader("Content-Type", "text/csv");
  res.send(csvString);
}

function jsonToXlsxBuffer(json, sheetName = "Sheet1") {
  const ws = xlsx.utils.json_to_sheet(json);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  return xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
}

async function generatePdfBuffer(title, headers, rows) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    const buffers = [];
    doc.on("data", (d) => buffers.push(d));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    
    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown(0.4);
    doc.fontSize(10);

    headers.forEach((h, i) => {
      doc.text(String(h).toUpperCase(), { continued: i !== headers.length - 1, width: 120 });
    });
    doc.moveDown(0.3);

    rows.forEach((r) => {
      headers.forEach((h, i) => {
        const val = r[h] === undefined ? "" : String(r[h]);
        doc.text(val, { continued: i !== headers.length - 1, width: 120 });
      });
      doc.moveDown(0.2);
    });

    doc.end();
  });
}

module.exports = {
  async portfolio(req, res) {
    try {
      const { branch, from, to } = req.query;
      const data = await reportService.portfolioSummary({ branch, from, to });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async collection(req, res) {
    try {
      const { branch, from, to, agent } = req.query;
      const data = await reportService.collectionReport({ branch, from, to, agent });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async aging(req, res) {
    try {
      const { branch, bucket } = req.query;
      const data = await reportService.agingReport({ branch, bucket });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async disbursement(req, res) {
    try {
      const { branch, from, to } = req.query;
      const data = await reportService.disbursementReport({ branch, from, to });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async branchPerformance(req, res) {
    try {
      const { branch, from, to } = req.query;
      const data = await reportService.branchPerformance({ branch, from, to });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async agentPerformance(req, res) {
    try {
      const { branch, from, to } = req.query;
      const data = await reportService.agentPerformance({ branch, from, to });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async legal(req, res) {
    try {
      const { branch, from, to } = req.query;
      const data = await reportService.legalReport({ branch, from, to });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async export(req, res) {
    try {
      const { type, branch, from, to } = req.query;
      const rows = await reportService.exportGeneric(type, { branch, from, to });
      const buffer = jsonToXlsxBuffer(rows, type);
      sendXlsx(res, buffer, `${type}_${new Date().toISOString().slice(0,10)}`);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async exportCsv(req, res) {
    try {
      const { type, branch, from, to } = req.query;
      const rows = await reportService.exportGeneric(type, { branch, from, to });
      const ws = xlsx.utils.json_to_sheet(rows);
      const csv = xlsx.utils.sheet_to_csv(ws);
      sendCsv(res, csv, `${type}_${new Date().toISOString().slice(0,10)}`);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async exportPdf(req, res) {
    try {
      const { type, branch, from, to } = req.query;
      const rows = await reportService.exportGeneric(type, { branch, from, to });
      const headers = rows.length ? Object.keys(rows[0]).slice(0, 6) : ["NoData"];
      const buf = await generatePdfBuffer(`${type} report`, headers, rows.slice(0, 100));
      res.setHeader("Content-Disposition", `attachment; filename=${type}.pdf`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(buf);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async sendScheduled(req, res) {
    try {
      const { type, emails = [], branch, from, to } = req.body;
      const rows = await reportService.exportGeneric(type, { branch, from, to });
      const buffer = jsonToXlsxBuffer(rows, type);
      
      await sendReportEmail({
        to: emails,
        subject: `Scheduled Report: ${type}`,
        text: `Attached ${type} report`,
        attachment: { filename: `${type}.xlsx`, content: buffer }
      });
      
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};