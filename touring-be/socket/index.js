const mongoose = require('mongoose');
const setupChatSocket = require('./chatSocket');
const PaymentSession = require('../models/PaymentSession');
const Booking = require('../models/Bookings');
const TourCustomRequest = require('../models/TourCustomRequest');
const Notification = require('../models/Notification');

module.exports = function setupSockets(io) {
  if (!io) return;

  // Chat socket handlers + changeStream watcher
  try {
    setupChatSocket(io);
  } catch (e) {
    console.warn('[sockets] chatSocket setup failed', e && e.message);
  }

  // Generic watcher helper
  const watchCollection = (model, opts = {}) => {
    try {
      const coll = mongoose.connection.db.collection(model.collection.collectionName);
      const changeStream = coll.watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }], { fullDocument: 'updateLookup' });
      changeStream.on('change', (change) => {
        const doc = change.fullDocument;
        if (!doc) return;
        // PaymentSession: emit to room based on orderId and userId
        if (model === PaymentSession) {
          try {
            const orderId = doc.orderId || doc.requestId || (doc.rawCreateResponse && (doc.rawCreateResponse.orderId || doc.rawCreateResponse.id));
            if (orderId) io.to(`payment-${orderId}`).emit('paymentSessionUpdated', doc);
            if (doc.userId) io.to(`user-${doc.userId}`).emit('paymentSessionUpdated', doc);
          } catch (e) { console.warn('[sockets] payment emit failed', e && e.message); }
        }

        // Booking: emit to booking room and user room
        if (model === Booking) {
          try {
            if (doc._id) io.to(`booking-${doc._id}`).emit('bookingUpdated', doc);
            if (doc.userId) io.to(`user-${doc.userId}`).emit('bookingUpdated', doc);
          } catch (e) { console.warn('[sockets] booking emit failed', e && e.message); }
        }

        // TourCustomRequest: emit request updates (agreement/negotiation)
        if (model === TourCustomRequest) {
          try {
            if (doc._id) io.to(`request-${doc._id}`).emit('tourRequestUpdated', doc);
            if (doc._id) io.to(`chat-${doc._id}`).emit('tourRequestUpdated', doc);
            // Also emit a specialized agreementUpdated event if agreement field present
            if (doc.agreement) {
              io.to(`request-${doc._id}`).emit('agreementUpdated', doc.agreement);
              io.to(`chat-${doc._id}`).emit('agreementUpdated', doc.agreement);
            }
            // ✅ NEW: Emit payment update event
            if (doc.paymentStatus === 'paid') {
              io.to(`request-${doc._id}`).emit('paymentUpdated', {
                requestId: doc._id,
                paymentStatus: 'paid',
                bookingId: doc.bookingId
              });
              console.log('[sockets] Emitted paymentUpdated for request', doc._id);
            }
            if (doc.userId) io.to(`user-${doc.userId}`).emit('tourRequestUpdated', doc);
          } catch (e) { console.warn('[sockets] tourRequest emit failed', e && e.message); }
        }

        // Notification: emit to user-specific room on insert
        if (model === Notification) {
          try {
            // notification document should contain userId
            const targetUser = doc.userId || doc.recipientId;
            if (targetUser) io.to(`user-${targetUser}`).emit('notificationCreated', doc);
          } catch (e) { console.warn('[sockets] notification emit failed', e && e.message); }
        }
      });

      changeStream.on('error', (err) => {
        console.warn('[sockets] changeStream error on', model.collection.collectionName, err && err.message);
        // don't crash; keep going
      });

      console.log('[sockets] watching collection', model.collection.collectionName);
    } catch (e) {
      console.warn('[sockets] watchCollection failed for', model && model.modelName, e && e.message);
    }
  };

  // Start watchers
  watchCollection(PaymentSession);
  watchCollection(Booking);
  watchCollection(TourCustomRequest);
  watchCollection(Notification);
};
