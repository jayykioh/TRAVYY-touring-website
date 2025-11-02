// controller/admin/admin.agency.controller.js
const TravelAgency = require("../../models/agency/TravelAgency");

/**
 * Get all travel agencies
 */
exports.getAllAgencies = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    // Search by name, contact, phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const agencies = await TravelAgency.find(filter).sort({ createdAt: -1 });

    // Calculate statistics for each agency
    const agenciesWithStats = agencies.map((agency) => {
      const employees = agency.employees || [];

      const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "active").length,
        totalTours: employees.reduce(
          (sum, e) => sum + (e.stats?.tours || 0),
          0
        ),
        completedTours: employees.reduce(
          (sum, e) => sum + (e.stats?.completed || 0),
          0
        ),
        totalRevenue: employees.reduce(
          (sum, e) => sum + (e.stats?.revenue || 0),
          0
        ),
        averageRating:
          employees.length > 0
            ? (
                employees.reduce((sum, e) => sum + (e.rating || 0), 0) /
                employees.length
              ).toFixed(1)
            : 0,
      };

      return {
        ...agency.toObject(),
        stats,
      };
    });

    res.json({
      success: true,
      data: agenciesWithStats,
    });
  } catch (error) {
    console.error("❌ Get all agencies error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get agency by ID
 */
exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await TravelAgency.findById(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    // Calculate statistics
    const employees = agency.employees || [];
    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      totalTours: employees.reduce((sum, e) => sum + (e.stats?.tours || 0), 0),
      completedTours: employees.reduce(
        (sum, e) => sum + (e.stats?.completed || 0),
        0
      ),
      totalRevenue: employees.reduce(
        (sum, e) => sum + (e.stats?.revenue || 0),
        0
      ),
      averageRating:
        employees.length > 0
          ? (
              employees.reduce((sum, e) => sum + (e.rating || 0), 0) /
              employees.length
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      data: {
        ...agency.toObject(),
        stats,
      },
    });
  } catch (error) {
    console.error("❌ Get agency by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new agency
 */
exports.createAgency = async (req, res) => {
  try {
    const agencyData = req.body;

    const agency = new TravelAgency(agencyData);
    await agency.save();

    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      data: agency,
    });
  } catch (error) {
    console.error("❌ Create agency error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update agency
 */
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const agency = await TravelAgency.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    res.json({
      success: true,
      message: "Agency updated successfully",
      data: agency,
    });
  } catch (error) {
    console.error("❌ Update agency error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete agency
 */
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await TravelAgency.findByIdAndDelete(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    res.json({
      success: true,
      message: "Agency deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete agency error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add employee to agency
 */
exports.addEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeData = req.body;

    const agency = await TravelAgency.findById(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    agency.employees.push(employeeData);
    await agency.save();

    res.json({
      success: true,
      message: "Employee added successfully",
      data: agency,
    });
  } catch (error) {
    console.error("❌ Add employee error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update employee in agency
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    const updateData = req.body;

    const agency = await TravelAgency.findById(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    const employeeIndex = agency.employees.findIndex(
      (e) => e.employeeId.toString() === employeeId
    );

    if (employeeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update employee data
    agency.employees[employeeIndex] = {
      ...agency.employees[employeeIndex].toObject(),
      ...updateData,
    };

    await agency.save();

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: agency,
    });
  } catch (error) {
    console.error("❌ Update employee error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Remove employee from agency
 */
exports.removeEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;

    const agency = await TravelAgency.findById(id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    agency.employees = agency.employees.filter(
      (e) => e.employeeId.toString() !== employeeId
    );

    await agency.save();

    res.json({
      success: true,
      message: "Employee removed successfully",
      data: agency,
    });
  } catch (error) {
    console.error("❌ Remove employee error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get agency statistics
 */
exports.getAgencyStats = async (req, res) => {
  try {
    const totalAgencies = await TravelAgency.countDocuments();

    const agencies = await TravelAgency.find();

    let totalEmployees = 0;
    let totalRevenue = 0;
    let totalTours = 0;

    agencies.forEach((agency) => {
      const employees = agency.employees || [];
      totalEmployees += employees.length;
      totalRevenue += employees.reduce(
        (sum, e) => sum + (e.stats?.revenue || 0),
        0
      );
      totalTours += employees.reduce(
        (sum, e) => sum + (e.stats?.tours || 0),
        0
      );
    });

    res.json({
      success: true,
      data: {
        totalAgencies,
        totalEmployees,
        totalRevenue,
        totalTours,
      },
    });
  } catch (error) {
    console.error("❌ Get agency stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
