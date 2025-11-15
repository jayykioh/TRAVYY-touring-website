const TourRequestChat = require('../models/TourRequestChat');
const TourCustomRequest = require('../models/TourCustomRequest');
const Itinerary = require('../models/Itinerary');
const User = require('../models/Users');
const Guide = require('../models/guide/Guide');
const Notification = require('../models/Notification');
const GuideNotification = require('../models/guide/GuideNotification');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// Helper to get user ID and role
function getUserContext(user) {
  return {
    userId: user?.id?.toString()
         || user?._id?.toString()
         || user?.sub?.toString(),

    role: user?.role === 'TourGuide' ? 'guide' : 'user'
  };
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

// Helper to check chat access
function checkChatAccess(requestData, userId, role) {
  if (!requestData || !userId) return false;
  
  if (requestData.type === 'Itinerary') {
    const itinerary = requestData.request;
    return (
      (requestData.userId && requestData.userId.toString() === userId) || // Traveller who created
      (requestData.guideId && requestData.guideId.toString() === userId) || // Guide who accepted
      (role === 'guide' && itinerary.tourGuideRequest?.status === 'pending') // Any guide for pending requests
    );
  } else {
    // TourCustomRequest - must be assigned guide or traveller
    return (
      (requestData.userId && requestData.userId.toString() === userId) ||
      (requestData.guideId && requestData.guideId.toString() === userId)
    );
  }
}

// Get chat history for a tour request
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log('[Chat] getChatHistory called:', {
      requestId,
      userId,
      role,
      page,
      limit
    });

    // Verify user has access to this request
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      console.log('[Chat] Tour request not found:', requestId);
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    // Check access rights
    if (!checkChatAccess(requestData, userId, role)) {
      console.log('[Chat] Access denied:', { userId, role, requestData: requestData.type });
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

    console.log('[Chat] Messages retrieved:', {
      count: messages.length,
      reversed: messages.length
    });

    // Get unread count
    const unreadCount = await TourRequestChat.getUnreadCount(requestId, userId, role);

    // Get total message count
    const totalCount = await TourRequestChat.countDocuments({
      tourRequestId: requestId,
      isDeleted: false
    });

    console.log('[Chat] Chat stats:', {
      totalMessages: totalCount,
      unreadCount,
      currentPage: parseInt(page)
    });

    // Get request details (tour info, pricing, etc.)
    let tourRequest = null;
    if (requestData.type === 'TourCustomRequest') {
      const req = await TourCustomRequest.findById(requestId)
        .select('userId guideId status initialBudget priceOffers finalPrice agreement minPrice tourDetails numberOfGuests')
        .lean();
      
      if (req) {
        // Get latest offer
        const latestOffer = req.priceOffers && req.priceOffers.length > 0 
          ? req.priceOffers[req.priceOffers.length - 1] 
          : null;
        
        tourRequest = {
          _id: req._id,
          status: req.status,
          initialBudget: req.initialBudget,
          latestOffer: latestOffer,
          finalPrice: req.finalPrice,
          agreement: req.agreement,
          minPrice: req.minPrice,
          tourDetails: req.tourDetails,
          numberOfGuests: req.numberOfGuests
        };
        
        console.log('[Chat] TourCustomRequest details loaded:', {
          hasInitialBudget: !!tourRequest.initialBudget,
          hasLatestOffer: !!tourRequest.latestOffer,
          hasMinPrice: !!tourRequest.minPrice,
          hasTourDetails: !!tourRequest.tourDetails,
          tourDetailsItems: tourRequest.tourDetails?.items?.length || 0
        });
      }
    } else if (requestData.type === 'Itinerary') {
      const itinerary = await Itinerary.findById(requestId)
        .select('status name items numberOfGuests startDate')
        .lean();
      
      if (itinerary) {
        tourRequest = {
          _id: itinerary._id,
          status: itinerary.status,
          tourDetails: {
            items: itinerary.items || [],
            numberOfGuests: itinerary.numberOfGuests
          },
          numberOfGuests: itinerary.numberOfGuests
        };
        
        console.log('[Chat] Itinerary details loaded:', {
          tourDetailsItems: tourRequest.tourDetails?.items?.length || 0
        });
      }
    }

    console.log('[Chat] Returning tourRequest:', {
      hasTourRequest: !!tourRequest,
      tourRequestType: requestData.type
    });

    res.json({
      success: true,
      messages: messages.map(m => m.toObject()).reverse(), // Show oldest first
      tourRequest: tourRequest,
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
    
    console.log('===== [Chat.sendMessage] START =====');
    console.log('[Chat] sendMessage called:', {
      requestId,
      userId,
      role,
      hasContent: !!(content || message),
      contentLength: content?.length || message?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Support both 'content' and 'message' field names
    const messageContent = content || message;

    if (!messageContent || messageContent.trim().length === 0) {
      console.log('[Chat] Empty message content');
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Verify user has access
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      console.log('[Chat] ⚠️ Tour request not found:', requestId);
      console.log('[Chat] Available data - userId:', userId, 'role:', role);
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }
    
    console.log('[Chat] ✅ Tour request found:', { type: requestData.type, hasUserId: !!requestData.userId, hasGuideId: !!requestData.guideId });

    // Check access rights (same logic as getChatHistory)
    if (!checkChatAccess(requestData, userId, role)) {
      console.log('[Chat] ⚠️ ACCESS DENIED:', { 
        userId, 
        role, 
        requestType: requestData.type,
        requestUserId: requestData.userId?.toString(),
        requestGuideId: requestData.guideId?.toString(),
        currentUserId: userId
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    console.log('[Chat] ✅ Access granted');

    // Get sender name
    const senderUser = await User.findById(userId).select('name');
    console.log('[Chat] Sender:', { userId, name: senderUser?.name, role });

    // Create message
    const chatMessage = new TourRequestChat({
      tourRequestId: requestId,
     sender: {
  userId: userId?.toString(),
  role,
  name: senderUser?.name || 'Unknown'
},
      messageType: 'text',
      content: messageContent.trim(),
      replyTo: replyTo || null
    });

    await chatMessage.save();
    // Populate sender.userId with full user data including _id
    await chatMessage.populate({
      path: 'sender.userId',
      select: '_id name avatar email'
    });
    
    console.log('[Chat] Message saved and populated:', {
      messageId: chatMessage._id,
      sender: {
        userId: chatMessage.sender.userId,
        role: chatMessage.sender.role,
        name: chatMessage.sender.name
      },
      content: chatMessage.content
    });

    // Add to TourCustomRequest messages if applicable (backward compatibility)
    if (requestData.type === 'TourCustomRequest') {
      await requestData.request.addMessage(role, messageContent.trim());
    }

    // Notify the other party
    const recipientId = role === 'user' ? requestData.guideId : requestData.userId;
    const recipientRole = role === 'user' ? 'guide' : 'user';
    
    console.log('[Chat] Notifying recipient:', {
      recipientId,
      recipientRole,
      senderName: senderUser.name
    });

    if (recipientId) {
      try {
        if (recipientRole === 'guide') {
          // recipientId may be a User._id stored on requestData.guideId; find Guide profile
          const guideProfile = await Guide.findOne({ userId: recipientId });
          if (guideProfile) {
            await GuideNotification.create({
              guideId: guideProfile._id,
              notificationId: `guide-${guideProfile._id}-${Date.now()}`,
              type: 'new_message',
              title: 'New Message',
              message: `${senderUser.name}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
              tourId: requestId,
              relatedId: requestId,
              relatedModel: 'TourCustomRequest',
              priority: 'medium'
            });
            console.log('[Chat] GuideNotification created for guide:', guideProfile._id);
          } else {
            console.log('[Chat] Guide profile not found for userId:', recipientId);
          }
        } else {
          // Get recipient user email
          const recipientUser = await User.findById(recipientId).select('email name');
          await Notification.create({
            userId: recipientId,
            recipientEmail: recipientUser.email,
            recipientName: recipientUser.name,
            type: 'new_message',
            title: 'New Message from Guide',
            message: `${senderUser.name}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
            relatedId: requestId,
            relatedModel: requestData.type
          });
          console.log('[Chat] Notification created for user:', recipientId);
        }
      } catch (notifError) {
        console.error('[Chat] Error creating notification:', notifError);
      }
    }

    // Emit standardized newMessage event to chat room
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) {
        // Convert to plain object to ensure nested populated fields are included
        const messageObj = chatMessage.toObject();
        io.to(`chat-${requestId}`).emit('newMessage', messageObj);
        // Also notify the recipient's user room
        if (recipientId) {
          try {
            io.to(`user-${recipientId}`).emit('newMessage', messageObj);
          } catch (e) {
            console.warn('[Chat] emit newMessage to user room failed', e && e.message);
          }
        }
      }
    } catch (emitErr) {
      console.warn('[Chat] socket emit newMessage failed', emitErr && emitErr.message);
    }

    // Convert to plain object for response to ensure nested fields are serialized
    const messageObj = chatMessage.toObject();
    res.json({
      success: true,
      message: messageObj,
      messageId: chatMessage._id
    });
    console.log('===== [Chat.sendMessage] SUCCESS =====');

  } catch (error) {
    console.error('===== [Chat.sendMessage] ERROR =====');
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

    if (!checkChatAccess(requestData, userId, role)) {
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
  userId: userId?.toString(),
  role,
  name: senderUser?.name || 'Unknown'
},

      messageType: 'file',
      content: content || `Sent ${files.length} file(s)`,
      attachments
    });

    await chatMessage.save();
    // Populate sender.userId with full user data including _id
    await chatMessage.populate({
      path: 'sender.userId',
      select: '_id name avatar email'
    });

    // Notify the other party
    const recipientId = role === 'user' ? requestData.guideId : requestData.userId;
    const recipientRole = role === 'user' ? 'guide' : 'user';

    if (recipientId) {
      try {
        const notifMessage = `${senderUser.name} sent ${files.length} file(s)`;
        if (recipientRole === 'guide') {
          const guideProfile = await Guide.findOne({ userId: recipientId });
          if (guideProfile) {
            await GuideNotification.create({
              guideId: guideProfile._id,
              notificationId: `guide-${guideProfile._id}-${Date.now()}`,
              type: 'new_message',
              title: 'New File(s)',
              message: notifMessage,
              tourId: requestId,
              relatedId: requestId,
              relatedModel: 'TourCustomRequest',
              priority: 'medium'
            });
          }
        } else {
          const recipientUser = await User.findById(recipientId).select('email name');
          await Notification.create({
            userId: recipientId,
            recipientEmail: recipientUser.email,
            recipientName: recipientUser.name,
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
      message: chatMessage.toObject(),
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

    if (!checkChatAccess(requestData, userId, role)) {
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

    console.log('[Chat] markAsRead called:', { userId, role, requestId, messageIds });

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found'
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

    if (!checkChatAccess(requestData, userId, role)) {
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

    console.log('[Chat] marked as read, unreadCount:', unreadCount);

    // Emit unread count update to socket room
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) {
        io.to(`chat-${requestId}`).emit('messagesRead', { requestId, userId, unreadCount });
      }
    } catch (emitErr) {
      console.error('[Chat] Error emitting messagesRead via HTTP:', emitErr);
    }

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

    if (!checkChatAccess(requestData, userId, role)) {
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

    // Emit update via socket
    try {
      const io = (req && req.app && req.app.get && req.app.get('io')) || null;
      if (io) {
        io.to(`chat-${message.tourRequestId}`).emit('messageUpdated', message);
      }
    } catch (e) {
      console.warn('[Chat] socket emit messageUpdated failed', e && e.message);
    }

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

    // Emit deletion via socket
    try {
      const io = (req && req.app && req.app.get && req.app.get('io')) || null;
      if (io) {
        io.to(`chat-${message.tourRequestId}`).emit('messageDeleted', { messageId });
      }
    } catch (e) {
      console.warn('[Chat] socket emit messageDeleted failed', e && e.message);
    }

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

// Set minimum price for tour request (guide only)
exports.setMinPrice = async (req, res) => {
  try {
    const { userId, role } = getUserContext(req.user);
    const { requestId } = req.params;
    const { amount, currency = 'VND' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid minimum price is required'
      });
    }

    // Only guide can set min price
    if (role !== 'guide') {
      return res.status(403).json({
        success: false,
        error: 'Only guide can set minimum price'
      });
    }

    // Find tour request
    const requestData = await findTourRequest(requestId);
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    // Verify guide owns this request
    if (!requestData.guideId || requestData.guideId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not the assigned guide for this request'
      });
    }

    // Update min price
    await TourCustomRequest.findByIdAndUpdate(
      requestId,
      {
        $set: {
          'minPrice.amount': amount,
          'minPrice.currency': currency,
          'minPrice.setBy': 'guide',
          'minPrice.setAt': new Date()
        }
      },
      { new: true }
    );

    console.log('[Chat] Min price set:', { requestId, userId, amount, currency });

    // Notify traveller via socket
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) {
        io.to(`chat-${requestId}`).emit('minPriceUpdated', {
          requestId,
          minPrice: { amount, currency },
          setAt: new Date()
        });
        if (requestData.userId) {
          io.to(`user-${requestData.userId}`).emit('minPriceUpdated', {
            requestId,
            minPrice: { amount, currency },
            setAt: new Date()
          });
        }
      }
    } catch (emitErr) {
      console.warn('[Chat] socket emit minPriceUpdated failed', emitErr && emitErr.message);
    }

    res.json({
      success: true,
      message: 'Minimum price set successfully',
      minPrice: { amount, currency }
    });

  } catch (error) {
    console.error('[Chat] Error setting min price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
