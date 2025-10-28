// routes/admin/agency.routes.js
const express = require("express");
const router = express.Router();
const { verifyAdminToken } = require("../../middlewares/authJwt");
const agencyController = require("../../controller/admin/admin.agency.controller");

/**
 * Travel Agency Admin Routes
 * Base: /api/admin/agencies
 * All routes protected by verifyAdminToken middleware
 */

// Apply admin auth middleware to all routes
router.use(verifyAdminToken);

// Agency management
router.get("/", agencyController.getAllAgencies);
router.get("/stats", agencyController.getAgencyStats);
router.get("/:id", agencyController.getAgencyById);
router.post("/", agencyController.createAgency);
router.put("/:id", agencyController.updateAgency);
router.delete("/:id", agencyController.deleteAgency);

// Employee management within agency
router.post("/:id/employees", agencyController.addEmployee);
router.put("/:id/employees/:employeeId", agencyController.updateEmployee);
router.delete("/:id/employees/:employeeId", agencyController.removeEmployee);

module.exports = router;
