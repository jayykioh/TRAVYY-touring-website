const express = require('express');
const router = express.Router();
const authJwt = require('../middlewares/authJwt');
const multer = require('multer');
const chatController = require('../controller/chatController');

// Setup multer for file uploads (up to 5 files, 10MB each)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files per message
  },
  fileFilter: (_, file, cb) => {
    // Allow common file types
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF, images, and documents allowed.'));
    }
    cb(null, true);
  },
});

// All routes require authentication
router.use(authJwt);

// Get chat history for a tour request
router.get('/:requestId/messages', chatController.getChatHistory);

// Send a text message
router.post('/:requestId/message', chatController.sendMessage);

// Send message with file attachment(s)
router.post('/:requestId/file', upload.array('files', 5), chatController.sendFileMessage);

// Download file attachment
router.get('/:requestId/file/:fileId', chatController.downloadFile);

// Mark messages as read
router.post('/:requestId/read', chatController.markAsRead);

// Get unread message count
router.get('/:requestId/unread', chatController.getUnreadCount);

// Edit a message
router.patch('/message/:messageId', chatController.editMessage);

// Delete a message
router.delete('/message/:messageId', chatController.deleteMessage);

module.exports = router;
