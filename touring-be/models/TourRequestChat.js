const mongoose = require('mongoose');

// File attachment schema
const FileAttachmentSchema = new mongoose.Schema({
  filename: { 
    type: String, 
    required: true 
  },
  originalName: String,
  mimetype: String,
  size: Number,
  url: String, // For GridFS or cloud storage
  fileId: mongoose.Schema.Types.ObjectId, // GridFS file ID
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Chat message schema with full features
const ChatMessageSchema = new mongoose.Schema({
  tourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourCustomRequest',
    required: true,
    index: true
  },
  
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'guide'],
      required: true
    },
    name: String
  },
  
  messageType: {
    type: String,
    enum: ['text', 'file', 'system', 'offer', 'agreement'],
    default: 'text'
  },
  
  content: {
    type: String,
    maxlength: 2000
  },
  
  // For file messages
  attachments: [FileAttachmentSchema],
  
  // For offer messages
  offerDetails: {
    amount: Number,
    currency: String,
    description: String
  },
  
  // For agreement messages
  agreementDetails: {
    action: String, // 'agreed', 'proposed', 'modified'
    terms: Object
  },
  
  // Message metadata
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourRequestChat'
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message preview
ChatMessageSchema.virtual('preview').get(function() {
  if (this.messageType === 'text') {
    return this.content?.substring(0, 100) || '';
  }
  if (this.messageType === 'file') {
    return `📎 ${this.attachments?.length || 0} file(s)`;
  }
  if (this.messageType === 'offer') {
    return `💰 Offer: ${this.offerDetails?.amount?.toLocaleString()} ${this.offerDetails?.currency}`;
  }
  if (this.messageType === 'agreement') {
    return `✅ Agreement: ${this.agreementDetails?.action}`;
  }
  return 'System message';
});

// Instance method to mark as read
ChatMessageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to edit message
ChatMessageSchema.methods.editContent = function(newContent) {
  if (this.messageType !== 'text') {
    throw new Error('Only text messages can be edited');
  }
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Instance method to soft delete
ChatMessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get chat history
ChatMessageSchema.statics.getChatHistory = function(tourRequestId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    tourRequestId,
    isDeleted: false
  })
    .populate('sender.userId', 'name avatar email')
    .populate('replyTo', 'content messageType sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread count for user
ChatMessageSchema.statics.getUnreadCount = function(tourRequestId, userId, role) {
  return this.countDocuments({
    tourRequestId,
    'sender.userId': { $ne: userId },
    'sender.role': { $ne: role },
    isRead: false,
    isDeleted: false
  });
};

// Static method to mark all messages as read
ChatMessageSchema.statics.markAllAsRead = async function(tourRequestId, userId, role) {
  const result = await this.updateMany(
    {
      tourRequestId,
      'sender.userId': { $ne: userId },
      'sender.role': { $ne: role },
      isRead: false,
      isDeleted: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  return result;
};

// Indexes for efficient querying
ChatMessageSchema.index({ tourRequestId: 1, createdAt: -1 });
ChatMessageSchema.index({ 'sender.userId': 1, createdAt: -1 });
ChatMessageSchema.index({ tourRequestId: 1, isRead: 1 });
ChatMessageSchema.index({ tourRequestId: 1, messageType: 1 });

const TourRequestChat = mongoose.model('TourRequestChat', ChatMessageSchema);

module.exports = TourRequestChat;
