const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const rolesMiddleware = require("../middlewares/roles.middleware");

// Report endpoints
router.get("/portfolio", authenticate, ctrl.portfolio);
router.get("/collections", authenticate, ctrl.collection);
router.get("/aging", authenticate, ctrl.aging);
router.get("/disbursement", authenticate, ctrl.disbursement);
router.get("/branch", authenticate, ctrl.branchPerformance);
router.get("/agents", authenticate, ctrl.agentPerformance);
router.get("/legal", authenticate, ctrl.legal);

// Export endpoints
router.get("/export", authenticate, ctrl.export);
router.get("/export-csv", authenticate, ctrl.exportCsv);
router.get("/export-pdf", authenticate, ctrl.exportPdf);

// Scheduled reports
router.post("/send-scheduled", authenticate, rolesMiddleware(['ADMIN', 'MANAGER']), ctrl.sendScheduled);

module.exports = router;