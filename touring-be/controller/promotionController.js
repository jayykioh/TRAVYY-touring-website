const Promotion = require("../models/Promotion");

// [ADMIN] Tạo promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion({
      ...req.body,
      createdBy: req.userId,
    });
    await promotion.save();
    
    res.status(201).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Lấy danh sách promotions
exports.getPromotions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const promotions = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Promotion.countDocuments(filter);

    res.json({
      success: true,
      data: promotions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Cập nhật promotion
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Xóa promotion
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.json({
      success: true,
      message: "Promotion deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [USER] Validate mã promotion
exports.validatePromotion = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const userId = req.userId || req.user?.sub || req.user?._id; // Get user from auth middleware

    console.log("🎫 validatePromotion - code:", code, "totalAmount:", totalAmount, "userId:", userId);

    const promotion = await Promotion.findOne({ 
      code: code.toUpperCase() 
    });

    if (!promotion) {
      console.log("❌ Promotion not found:", code);
      return res.status(404).json({
        valid: false,
        message: "Mã không tồn tại",
      });
    }

    console.log("✅ Found promotion:", { 
      code: promotion.code, 
      status: promotion.status, 
      startDate: promotion.startDate, 
      endDate: promotion.endDate,
      usageCount: promotion.usageCount,
      usageLimit: promotion.usageLimit
    });

    const now = new Date();
    
    if (promotion.status !== "active") {
      console.log("❌ Promotion not active");
      return res.json({
        valid: false,
        message: "Mã không khả dụng",
      });
    }

    if (now < promotion.startDate || now > promotion.endDate) {
      console.log("❌ Promotion expired or not started");
      return res.json({
        valid: false,
        message: "Mã đã hết hạn hoặc chưa có hiệu lực",
      });
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      console.log("❌ Promotion usage limit reached");
      return res.json({
        valid: false,
        message: "Mã đã hết lượt sử dụng",
      });
    }

    // ✅ Check if user already used this promotion
    if (userId) {
      const User = require("../models/Users");
      const user = await User.findById(userId).select("usedPromotions");
      
      if (user && user.usedPromotions && user.usedPromotions.length > 0) {
        const hasUsed = user.usedPromotions.some(
          p => p.promotionId?.toString() === promotion._id.toString()
        );
        
        if (hasUsed) {
          console.log("❌ User already used this promotion");
          return res.json({
            valid: false,
            message: "Bạn đã sử dụng mã này rồi",
          });
        }
      }
    }

    if (totalAmount < promotion.minOrderValue) {
      console.log("❌ Total amount too low:", totalAmount, "< min:", promotion.minOrderValue);
      return res.json({
        valid: false,
        message: `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString()}đ`,
      });
    }

    const discount = promotion.calculateDiscount(totalAmount);
    console.log("✅ Promotion valid! Discount:", discount);

    res.json({
      valid: true,
      promotion: {
        _id: promotion._id,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
      },
      discount,
      finalTotal: totalAmount - discount,
    });
  } catch (error) {
    console.error("❌ validatePromotion error:", error);
    res.status(500).json({
      valid: false,
      message: error.message,
    });
  }
};

// [USER] Lấy promotions đang active (excluding already used by current user)
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.userId || req.user?.sub || req.user?._id; // from optionalAuth middleware

    console.log("🎫 getActivePromotions - userId:", userId);

    // Tìm tất cả promotions đang active
    let promotions = await Promotion.find({
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select("-createdBy -usageCount")
      .limit(20);

    console.log("📋 Total active promotions found:", promotions.length);

    // Nếu user đã đăng nhập, loại bỏ các promotion đã sử dụng
    if (userId) {
      const User = require("../models/Users");
      const user = await User.findById(userId).select("usedPromotions");
      
      if (user && user.usedPromotions && user.usedPromotions.length > 0) {
        const usedPromotionIds = user.usedPromotions.map(p => p.promotionId?.toString());
        console.log("🚫 User used promotions:", usedPromotionIds);
        
        const beforeFilter = promotions.length;
        promotions = promotions.filter(promo => 
          !usedPromotionIds.includes(promo._id.toString())
        );
        console.log(`✂️ Filtered: ${beforeFilter} -> ${promotions.length} (removed ${beforeFilter - promotions.length} used)`);
      } else {
        console.log("✅ User has no used promotions");
      }
    } else {
      console.log("👤 No userId - showing all active promotions");
    }

    res.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error("❌ getActivePromotions error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
