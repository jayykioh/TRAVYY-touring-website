const TourRequestChat = require('../models/TourRequestChat');
const TourCustomRequest = require('../models/TourCustomRequest');
const Itinerary = require('../models/Itinerary');
const User = require('../models/Users');
const Notification = require('../models/Notification');
const GuideNotification = require('../models/guide/GuideNotification');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// Helper to get user ID and role
function getUserContext(user) {
  const userId = user?.sub || user?._id || user?.id;
  const role = user?.role === 'TourGuide' ? 'guide' : 'user';
  return { userId, role };
}

// Helper to find tour request from either TourCustomRequest or Itinerary
async function findTourRequest(requestId) {
  // Try TourCustomRequest first
  let tourRequest = await TourCustomRequest.findById(requestId);
  if (tourRequest) {
    return {
      type: 'TourCustomRequest',
      request: tourRequest,
      userId: tourRequest.userId,
      guideId: tourRequest.guideId
    };
  }
  
  // Try Itinerary
  const itinerary = await Itinerary.findById(requestId);
  if (itinerary) {
    return {
      type: 'Itinerary',
      request: itinerary,
      userId: itinerary.userId,
      guideId: itinerary.tourGuideRequest?.guideId
    };
  }
  
  return null;
}

// Get chat history for a tour request
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this request
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    // Check access rights
    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this chat'
      });
    }

    // Get chat messages
    const messages = await TourRequestChat.getChatHistory(
      requestId,
      parseInt(page),
      parseInt(limit)
    );

    // Get unread count
    const unreadCount = await TourRequestChat.getUnreadCount(requestId, userId, role);

    // Get total message count
    const totalCount = await TourRequestChat.countDocuments({
      tourRequestId: requestId,
      isDeleted: false
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      unreadCount,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('[Chat] Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send a text message
exports.sendMessage = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { content, message, replyTo } = req.body;
    
    // Support both 'content' and 'message' field names
    const messageContent = content || message;

    if (!messageContent || messageContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Verify user has access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get sender name
    const senderUser = await User.findById(userId).select('name');

    // Create message
    const chatMessage = new TourRequestChat({
      tourRequestId: requestId,
      sender: {
        userId,
        role,
        name: senderUser.name
      },
      messageType: 'text',
      content: messageContent.trim(),
      replyTo: replyTo || null
    });

    await chatMessage.save();
    await chatMessage.populate('sender.userId', 'name avatar email');

    // Add to TourCustomRequest messages if applicable (backward compatibility)
    if (requestData.type === 'TourCustomRequest') {
      await requestData.request.addMessage(role, messageContent.trim());
    }

    // Notify the other party
    const recipientId = role === 'user' ? requestData.guideId : requestData.userId;
    const recipientRole = role === 'user' ? 'guide' : 'user';

    if (recipientId) {
      try {
        if (recipientRole === 'guide') {
          await GuideNotification.create({
            guideId: recipientId,
            notificationId: `guide-${recipientId}-${Date.now()}`,
            type: 'new_message',
            title: 'New Message',
            message: `${senderUser.name}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
            tourId: requestId,
            priority: 'medium'
          });
        } else {
          await Notification.create({
            userId: recipientId,
            type: 'new_message',
            title: 'New Message from Guide',
            message: `${senderUser.name}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
            relatedId: requestId,
            relatedModel: requestData.type
          });
        }
      } catch (notifError) {
        console.error('[Chat] Error creating notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: chatMessage,
      messageId: chatMessage._id
    });

  } catch (error) {
    console.error('[Chat] Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send message with file attachment
exports.sendFileMessage = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { content } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one file is required'
      });
    }

    // Verify access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get sender name
    const senderUser = await User.findById(userId).select('name');

    // Setup GridFS for file storage
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'chat_files' });

    // Upload files to GridFS
    const attachments = [];
    for (const file of files) {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: {
          tourRequestId: requestId,
          uploadedBy: userId,
          role: role
        }
      });

      await new Promise((resolve, reject) => {
        uploadStream.end(file.buffer, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      attachments.push({
        filename: file.originalname,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileId: uploadStream.id,
        url: `/api/chat/${requestId}/file/${uploadStream.id}`
      });
    }

    // Create message
    const chatMessage = new TourRequestChat({
      tourRequestId: requestId,
      sender: {
        userId,
        role,
        name: senderUser.name
      },
      messageType: 'file',
      content: content || `Sent ${files.length} file(s)`,
      attachments
    });

    await chatMessage.save();
    await chatMessage.populate('sender.userId', 'name avatar email');

    // Notify the other party
    const recipientId = role === 'user' ? requestData.guideId : requestData.userId;
    const recipientRole = role === 'user' ? 'guide' : 'user';

    if (recipientId) {
      try {
        const notifMessage = `${senderUser.name} sent ${files.length} file(s)`;
        if (recipientRole === 'guide') {
          await GuideNotification.create({
            guideId: recipientId,
            notificationId: `guide-${recipientId}-${Date.now()}`,
            type: 'new_message',
            title: 'New File(s)',
            message: notifMessage,
            tourId: requestId,
            priority: 'medium'
          });
        } else {
          await Notification.create({
            userId: recipientId,
            type: 'new_message',
            title: 'New File(s) from Guide',
            message: notifMessage,
            relatedId: requestId,
            relatedModel: requestData.type
          });
        }
      } catch (notifError) {
        console.error('[Chat] Error creating notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: chatMessage,
      messageId: chatMessage._id
    });

  } catch (error) {
    console.error('[Chat] Error sending file message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Download file attachment
exports.downloadFile = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId, fileId } = req.params;

    // Verify access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get file from GridFS
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'chat_files' });

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    downloadStream.on('error', (error) => {
      console.error('[Chat] File download error:', error);
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    });

    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error('[Chat] Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { messageIds } = req.body;

    // Verify access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Mark specific messages or all messages as read
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      await TourRequestChat.updateMany(
        {
          _id: { $in: messageIds },
          tourRequestId: requestId,
          'sender.userId': { $ne: userId },
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );
    } else {
      // Mark all unread messages as read
      await TourRequestChat.markAllAsRead(requestId, userId, role);
    }

    const unreadCount = await TourRequestChat.getUnreadCount(requestId, userId, role);

    res.json({
      success: true,
      unreadCount,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('[Chat] Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;

    // Verify access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    const hasAccess = 
      requestData.userId.toString() === userId ||
      (requestData.guideId && requestData.guideId.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const unreadCount = await TourRequestChat.getUnreadCount(requestId, userId, role);

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('[Chat] Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { userId } = getUserContext(req.user);
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    const message = await TourRequestChat.findOne({
      _id: messageId,
      'sender.userId': userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you do not have permission to edit'
      });
    }

    await message.editContent(content.trim());
    await message.populate('sender.userId', 'name avatar email');

    res.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('[Chat] Error editing message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { userId } = getUserContext(req.user);
    const { messageId } = req.params;

    const message = await TourRequestChat.findOne({
      _id: messageId,
      'sender.userId': userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you do not have permission to delete'
      });
    }

    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('[Chat] Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
