const mongoose = require('mongoose');
const TourRequestChat = require('../models/TourRequestChat');

/**
 * Setup chat socket handlers and a DB watcher to emit real-time messages.
 * - Listens for clients joining/leaving rooms named by tourRequestId
 * - Emits `newMessage` when a chat document is inserted
 * - Emits `messageUpdated` on updates (edited/read)
 *
 * If MongoDB change streams are not available (standalone server),
 * falls back to a lightweight polling loop as a last resort.
 */
module.exports = function setupChatSocket(io) {
  if (!io) return;

  // Load jwt verifier to validate handshake token
  const { verifyAccess } = require('../utils/jwt');

  io.on('connection', (socket) => {
    // Debug: log socket connection
    console.log('[chatSocket] ✅ New socket connection:', {
      id: socket.id,
      hasAuth: !!socket.handshake?.auth,
      hasToken: !!socket.handshake?.auth?.token
    });

    // try to authenticate socket based on handshake auth token
    try {
      const token = socket.handshake?.auth?.token ||
        (socket.handshake?.headers && socket.handshake.headers.authorization &&
          socket.handshake.headers.authorization.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : null);

      if (token) {
        try {
          const payload = verifyAccess(token);
          socket.user = payload || {};
          socket.userId = payload && (payload.sub || payload.id || payload._id);
          console.log('[chatSocket] ✅ Token authenticated for user:', socket.userId);
        } catch (e) {
          // invalid token - leave socket.user undefined but keep connection
          console.warn('[chatSocket] ⚠️ invalid socket token', e && e.message);
        }
      } else {
        console.log('[chatSocket] ⚠️ No token provided in handshake');
      }
    } catch (e) {
      console.warn('[chatSocket] ⚠️ handshake auth parse failed', e && e.message);
    }

    socket.once('disconnect', () => {
      // automatic leave on disconnect
    });

    // client should join a room for a specific tour request or their user room
    socket.on('joinRoom', (payload) => {
      try {
        const room = typeof payload === 'string' ? payload : payload?.requestId;
        if (!room) return;

        const roomStr = room.toString();

        // If joining a user room, ensure the socket is that user
        if (roomStr.startsWith('user-')) {
          const uid = roomStr.slice(5);
          if (!socket.userId || uid !== socket.userId.toString()) {
            console.warn('[chatSocket] joinRoom denied for user room', { requested: uid, socketUser: socket.userId });
            return;
          }
        }

        // For chat rooms we allow join but prefer server-side access checks at action time
        socket.join(roomStr);
      } catch (e) {
        console.warn('[chatSocket] joinRoom error', e && e.message);
      }
    });

    socket.on('leaveRoom', (payload) => {
      try {
        const room = typeof payload === 'string' ? payload : payload?.requestId;
        if (room) socket.leave(room.toString());
      } catch (e) {
        console.warn('[chatSocket] leaveRoom error', e && e.message);
      }
    });

    // lightweight typing indicator proxy
    socket.on('typing', (payload) => {
      try {
        const room = payload?.requestId;
        if (room) socket.to(room.toString()).emit('typing', payload);
      } catch (e) {
        console.warn('[chatSocket] typing error', e && e.message);
      }
    });

    // Forward client-side messagesRead events into the chat room so other clients
    // can react immediately when a client marks messages as read without calling
    // the HTTP endpoint. Only accept if socket is authenticated.
    socket.on('messagesRead', (payload) => {
      try {
        const requestId = payload?.requestId;
        if (!requestId) return;
        // require authenticated socket to avoid spoofing
        if (!socket.userId) {
          console.warn('[chatSocket] messagesRead ignored from unauthenticated socket');
          return;
        }
        const room = `chat-${requestId}`;
        // Broadcast to everyone in the chat room
        io.to(room).emit('messagesRead', Object.assign({}, payload, { userId: socket.userId }));
      } catch (e) {
        console.warn('[chatSocket] messagesRead forward error', e && e.message);
      }
    });
  });

  // Start watching the chat collection for inserts/updates
  const collectionName = TourRequestChat.collection.collectionName; // usually 'tourrequestchats'

  const startChangeStream = () => {
    try {
      const coll = mongoose.connection.db.collection(collectionName);
      const changeStream = coll.watch([
        { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }
      ], { fullDocument: 'updateLookup' });

      changeStream.on('change', (change) => {
        try {
          const doc = change.fullDocument;
          if (!doc) return;
          const room = `chat-${doc.tourRequestId?.toString()}`;

          if (change.operationType === 'insert') {
            io.to(room).emit('newMessage', doc);
          } else if (change.operationType === 'update' || change.operationType === 'replace') {
            io.to(room).emit('messageUpdated', doc);
          }
        } catch (e) {
          console.error('[chatSocket] change handling error', e && e.stack ? e.stack : e);
        }
      });

      changeStream.on('error', (err) => {
        console.warn('[chatSocket] changeStream error, falling back to polling:', err && err.message);
        changeStream.close().catch(() => {});
        startPollingFallback();
      });

      console.log('[chatSocket] Change stream started on', collectionName);
    } catch (err) {
      console.warn('[chatSocket] changeStream not available, using polling fallback:', err && err.message);
      startPollingFallback();
    }
  };

  // Fallback polling: check last message timestamp every N seconds
  let pollingInterval = null;
  const startPollingFallback = () => {
    if (pollingInterval) return;
    let lastSeen = new Date(0);
    pollingInterval = setInterval(async () => {
      try {
        const docs = await TourRequestChat.find({ createdAt: { $gt: lastSeen } })
          .sort({ createdAt: 1 })
          .lean()
          .limit(100);

        if (docs && docs.length) {
          for (const doc of docs) {
            const room = `chat-${doc.tourRequestId?.toString()}`;
            io.to(room).emit('newMessage', doc);
            if (doc.createdAt && doc.createdAt > lastSeen) lastSeen = doc.createdAt;
          }
        }
      } catch (e) {
        console.warn('[chatSocket] polling error', e && e.message);
      }
    }, 3000);
    console.log('[chatSocket] Polling fallback started (every 3s)');
  };

  // Kick off change stream (or fallback)
  startChangeStream();
};
