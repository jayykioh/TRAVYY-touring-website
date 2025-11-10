const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    guideId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    firstName: String,
    avatar: String,
    email: { type: String, required: true },
    phone: String,
    
    // ========== Location & Coverage Area ==========
    location: String, // Primary location (city/province)
    coverageAreas: [{ // Areas where guide can provide services
      type: String, // Province/City names
    }],
    provinceId: String, // For filtering by province
    
    // ========== Certifications & Documents ==========
    certifications: [{
      name: String, // Certificate name
      issuer: String, // Issuing organization
      issueDate: Date,
      expiryDate: Date,
      documentUrl: String, // S3 URL or MongoDB binary
      verified: { type: Boolean, default: false }, // Admin verified
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    licenseNumber: String, // Tour guide license number
    licenseVerified: { type: Boolean, default: false },
    
    // ========== Profile Status ==========
    profileComplete: { type: Boolean, default: false }, // All required fields filled
    isVerified: { type: Boolean, default: false }, // Admin verified
    verificationStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "incomplete"],
      default: "incomplete"
    },
    
    experience: String,
    languages: [String],
    rating: { type: Number, default: 0 },
    totalTours: { type: Number, default: 0 },
    toursConducted: { type: Number, default: 0 },
    responseTime: String,
    availability: { type: String, enum: ["Available", "Busy", "Offline"], default: "Available" },
    specialties: [String],
    joinedDate: Date,
    bio: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User model
  },
  { timestamps: true }
);

// Index for location-based queries
guideSchema.index({ provinceId: 1, availability: 1 });
guideSchema.index({ coverageAreas: 1, availability: 1 });
guideSchema.index({ isVerified: 1, profileComplete: 1 });

// Method to check if profile is complete
guideSchema.methods.checkProfileComplete = function() {
  const required = [
    this.name,
    this.phone,
    this.location,
    this.bio,
    this.coverageAreas && this.coverageAreas.length > 0,
    this.languages && this.languages.length > 0,
    this.specialties && this.specialties.length > 0,
    this.certifications && this.certifications.length > 0,
    this.licenseNumber
  ];
  
  this.profileComplete = required.every(field => !!field);
  return this.profileComplete;
};

module.exports = mongoose.model("Guide", guideSchema);