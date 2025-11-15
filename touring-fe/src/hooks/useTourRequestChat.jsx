import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../auth/context';

// Minimal shim hook for tour request chat used by UI components.
// This implementation is intentionally simple: it provides the
// same shape the components expect so the dev server can run.
export function useTourRequestChat(requestId, apiBase = '/api/chat') {
  const [messages, setMessages] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketError, setSocketError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const mountedRef = useRef(true);
  const typingTimerRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const socket = useSocket();
  const { withAuth, user, booting, accessToken } = useAuth() || {};

  // Helper to fetch request details and initial messages
  const loadRequest = useCallback(async () => {
    // Defensive: don't attempt protected API calls while auth is booting or when
    // we don't have a token. This prevents components from calling APIs with
    // a null token during AuthContext remounts.
    if (!requestId || !withAuth) {
      setLoading(false);
      return;
    }

    if (booting) {
      console.debug('[useTourRequestChat] Delaying loadRequest while auth is booting');
      setLoading(true);
      return;
    }

    if (!accessToken) {
      console.debug('[useTourRequestChat] Skipping loadRequest - no access token');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch messages from TourRequestChat collection
      const response = await withAuth(`${apiBase}/${requestId}/messages?page=1&limit=50`);
      if (!mountedRef.current) return;
      
      const msgs = response?.messages || [];
      console.log('[useTourRequestChat] Loaded messages:', msgs.length, 'messages for requestId:', requestId);
      console.log('[useTourRequestChat] Response keys:', Object.keys(response || {}));
      
      setMessages(Array.isArray(msgs) ? msgs : []);
      setUnreadCount(response?.unreadCount || 0);
      
      // If response includes request details (tour info, pricing), store them
      if (response?.tourRequest) {
        console.log('[useTourRequestChat] Setting requestDetails:', {
          hasTourRequest: !!response.tourRequest,
          keys: Object.keys(response.tourRequest),
          hasTourDetails: !!response.tourRequest.tourDetails,
          tourDetailsItems: response.tourRequest.tourDetails?.items?.length || 0,
          hasMinPrice: !!response.tourRequest.minPrice,
          minPriceAmount: response.tourRequest.minPrice?.amount
        });
        setRequestDetails(response.tourRequest);
      } else {
        console.warn('[useTourRequestChat] No tourRequest in response');
      }
    } catch (err) {
      // Fallback: if API fails (404/error), still allow chat to work locally
      // Messages won't persist but traveller can still type and send via socket
      console.warn('[useTourRequestChat] loadRequest failed (fallback mode):', err?.message || err);
      if (!mountedRef.current) return;
      setRequestDetails(null);
      setMessages([]);
      // Don't throw — let UI render empty state and allow typing
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [requestId, apiBase, withAuth, accessToken, booting]);

  useEffect(() => {
    mountedRef.current = true;
    loadRequest();

    return () => {
      mountedRef.current = false;
    };
  }, [loadRequest]);

  // Socket handlers: join room, listen for newMessage/messageUpdated/typing
  useEffect(() => {
    if (!socket || !requestId) return;

    // Validate requestId is a valid ObjectId (24 hex chars) and not an itineraryId
    const isValidObjectId = /^[a-f\d]{24}$/i.test(requestId);
    if (!isValidObjectId) {
      console.warn('[useTourRequestChat] Invalid requestId format, skipping socket setup:', requestId);
      return;
    }

    const room = `chat-${requestId}`;
    // join the room for this request
    socket.joinRoom?.(room);
    console.log('[useTourRequestChat] Joined room:', room);

    const offNew = socket.on?.('newMessage', (doc) => {
      if (!doc) {
        console.warn('[useTourRequestChat] Received empty newMessage');
        return;
      }
      // Only accept messages for this requestId
      const docRoom = doc?.tourRequestId ? `chat-${doc.tourRequestId}` : null;
      if (docRoom && docRoom !== room) {
        console.log('[useTourRequestChat] Message for different room:', docRoom, 'current:', room);
        return;
      }
      
      console.log('[useTourRequestChat] newMessage received:', {
        messageId: doc._id,
        content: doc.content?.substring(0, 50),
        sender: doc.sender?.role,
        senderUserId: doc.sender?.userId,
        requestId: doc.tourRequestId,
        createdAt: doc.createdAt
      });
      
      setMessages((prev) => {
        // Deduplication: check by multiple fields to catch duplicates from different sources
        const isDuplicate = prev.some((m) => {
          // By exact _id
          if (m._id === doc._id && !m._id.toString().startsWith('local-')) return true;
          // By content + sender + timestamp (for when IDs might differ)
          if (m.content === doc.content && 
              m.sender?.role === doc.sender?.role && 
              m.createdAt === doc.createdAt) return true;
          return false;
        });
        
        if (isDuplicate) {
          console.log('[useTourRequestChat] Duplicate message ignored:', doc._id);
          return prev;
        }
        
        // Remove optimistic message if this is the real version
        let updated = prev.filter((m) => {
          // Remove optimistic message that matches this real message
          if (m._id.toString().startsWith('local-') && 
              m.content === doc.content && 
              m.sender?.role === doc.sender?.role) {
            console.log('[useTourRequestChat] Removing optimistic message:', m._id);
            return false;
          }
          return true;
        });
        
        updated = [...updated, doc];
        console.log('[useTourRequestChat] Message added. Total messages:', updated.length);
        return updated;
      });
    });

    const offUpdated = socket.on?.('messageUpdated', (doc) => {
      if (!doc) return;
      console.log('[useTourRequestChat] messageUpdated received:', doc._id);
      setMessages((prev) => prev.map((m) => (m._id === doc._id ? doc : m)));
    });

    const offTyping = socket.on?.('typing', (payload) => {
      if (!payload || payload.requestId !== requestId) return;
      const uid = payload.userId || payload.id || 'other';
      console.log('[useTourRequestChat] typing indicator:', { uid, isTyping: payload.isTyping });
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (payload.isTyping) next.add(uid);
        else next.delete(uid);
        return next;
      });
    });

    // Listen for agreement completed event
    const offAgreementCompleted = socket.on?.('agreementCompleted', (payload) => {
      if (!payload || payload.requestId !== requestId) return;
      console.log('[useTourRequestChat] agreementCompleted received:', payload);
      
      // Refetch request details to get updated agreement status
      loadRequest();
      
      // Show a notification to user (optional - you can customize this)
      if (payload.message) {
        console.log('[useTourRequestChat] Agreement message:', payload.message);
      }
    });

    // Re-join room on socket reconnects
    const offConnect = socket.on?.('connect', () => {
      console.log('[useTourRequestChat] Socket reconnected, rejoining room:', room);
      setSocketError(null);
      setReconnectAttempts(0);
      socket.joinRoom?.(room);
      // Reload messages on reconnect
      loadRequest();
    });

    // Handle disconnect
    const offDisconnect = socket.on?.('disconnect', (reason) => {
      console.warn('[useTourRequestChat] Socket disconnected:', reason);
      setSocketError('Mất kết nối. Đang thử kết nối lại...');
    });

    // Handle reconnect attempts
    const offReconnectAttempt = socket.on?.('reconnect_attempt', (attempt) => {
      setReconnectAttempts(attempt);
      if (attempt > 5) {
        setSocketError('Không thể kết nối. Vui lòng kiểm tra internet của bạn.');
      }
    });

    // Handle connect_error
    const offConnectError = socket.on?.('connect_error', (error) => {
      console.error('[useTourRequestChat] Socket connect error:', error);
      setSocketError('Lỗi kết nối: ' + (error.message || 'Không xác định'));
    });

    return () => {
      socket.leaveRoom?.(room);
      if (offNew) offNew();
      if (offUpdated) offUpdated();
      if (offTyping) offTyping();
      if (offAgreementCompleted) offAgreementCompleted();
      if (offConnect) offConnect();
      if (offDisconnect) offDisconnect();
      if (offReconnectAttempt) offReconnectAttempt();
      if (offConnectError) offConnectError();
    };
  }, [socket, requestId, loadRequest]);

  // Send message via API (server will persist and socket will broadcast)
  const sendMessage = useCallback(async (text) => {
    if (!text || !withAuth || !requestId) return false;
    setSending(true);
    try {
      // Optimistic update: add message immediately so traveller sees it
      const optimistic = {
        _id: `local-${Date.now()}`,
        content: text,
        sender: { 
          role: user?.role === 'TourGuide' ? 'guide' : 'user', 
          userId: user?._id, 
          name: user?.name || 'You' 
        },
        createdAt: new Date().toISOString(),
      };
      
      console.log('[useTourRequestChat] sendMessage - optimistic update:', optimistic);
      setMessages((m) => [...m, optimistic]);

      // Try to send to server, but don't fail if API returns error
      // Traveller can still chat locally; socket may deliver it when reconnected
      try {
        const res = await withAuth(`${apiBase}/${requestId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });

        console.log('[useTourRequestChat] sendMessage API response:', {
          success: res?.success,
          messageId: res?.message?._id,
          content: res?.message?.content?.substring(0, 50)
        });

        // Server returns { message, messageId, success }
        // Replace optimistic message with real one if available
        if (res?.message) {
          setMessages((prev) => {
            const updated = prev.map((m) => 
              m._id === optimistic._id ? res.message : m
            );
            console.log('[useTourRequestChat] Replaced optimistic message:', res.message._id);
            return updated;
          });
        }
      } catch (apiErr) {
        // API failed, but optimistic message is already in state
        // Traveller still sees their message, socket may sync later
        console.warn('[useTourRequestChat] sendMessage API failed (using optimistic)', apiErr?.message || apiErr);
      }

      // emit typing stop
      socket?.emit && socket.emit('typing', { requestId, isTyping: false, userId: user?._id });

      return true;
    } catch (err) {
      console.error('[useTourRequestChat] sendMessage error', err?.message || err);
      return false;
    } finally {
      setSending(false);
    }
  }, [withAuth, requestId, apiBase, socket, user]);

  const sendOffer = useCallback(async (amountOrObj, message = '') => {
    if (!withAuth || !requestId) return false;
    try {
      let amount = amountOrObj;
      let msg = message;
      if (typeof amountOrObj === 'object' && amountOrObj !== null) {
        amount = amountOrObj.amount || 0;
        msg = amountOrObj.message || amountOrObj.note || '';
      }

      // Validate against minPrice
      if (requestDetails?.minPrice?.amount && amount < requestDetails.minPrice.amount) {
        console.error('[useTourRequestChat] Offer below minPrice:', { amount, minPrice: requestDetails.minPrice.amount });
        throw new Error(`Giá đề xuất phải >= ${requestDetails.minPrice.amount.toLocaleString('vi-VN')} VND (giá tối thiểu của guide)`);
      }

      const res = await withAuth(`${apiBase}/${requestId}/counter-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, message: msg }),
      });
      // update request details if returned
      if (res?.tourRequest) setRequestDetails(res.tourRequest);
      return res?.success ?? true;
    } catch (err) {
      console.error('[useTourRequestChat] sendOffer error', err?.message || err);
      return false;
    }
  }, [withAuth, requestId, apiBase, requestDetails?.minPrice?.amount]);

  const agreeToTerms = useCallback(async (terms = {}) => {
    if (!withAuth || !requestId) return false;
    try {
      const res = await withAuth(`${apiBase}/${requestId}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms }),
      });
      if (res?.tourRequest) {
        setRequestDetails(res.tourRequest);
        console.log('[useTourRequestChat] Agreement updated:', {
          userAgreed: res.tourRequest.agreement?.userAgreed,
          guideAgreed: res.tourRequest.agreement?.guideAgreed,
          bothAgreed: res.bothAgreed
        });
      }
      return res?.success ?? true;
    } catch (err) {
      console.error('[useTourRequestChat] agreeToTerms error', err?.message || err);
      return false;
    }
  }, [withAuth, requestId, apiBase]);

  const editMessage = useCallback(async (messageId, newContent) => {
    if (!newContent || !withAuth || !requestId) return false;
    setSending(true);
    try {
      const res = await withAuth(`${apiBase}/${requestId}/message/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      
      if (res?.message) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? res.message : m)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useTourRequestChat] editMessage error', err?.message || err);
      return false;
    } finally {
      setSending(false);
    }
  }, [withAuth, requestId, apiBase]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!withAuth || !requestId) return false;
    try {
      await withAuth(`${apiBase}/${requestId}/message/${messageId}`, {
        method: 'DELETE',
      });
      
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      return true;
    } catch (err) {
      console.error('[useTourRequestChat] deleteMessage error', err?.message || err);
      return false;
    }
  }, [withAuth, requestId, apiBase]);

  const sendFileMessage = useCallback(async (text, files) => {
    if (!files || files.length === 0 || !withAuth || !requestId) return false;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', text || 'File(s)');
      files.forEach((file) => formData.append('files', file));

      const res = await withAuth(`${apiBase}/${requestId}/message`, {
        method: 'POST',
        body: formData,
      });

      if (res?.messages && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
      
      return true;
    } catch (err) {
      console.error('[useTourRequestChat] sendFileMessage error', err?.message || err);
      return false;
    } finally {
      setSending(false);
    }
  }, [withAuth, requestId, apiBase]);

  const setMinPrice = useCallback(async (amount, currency = 'VND') => {
    if (!amount || amount <= 0 || !withAuth || !requestId) return false;
    try {
      const res = await withAuth(`${apiBase}/${requestId}/set-min-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });
      return res?.success ?? true;
    } catch (err) {
      console.error('[useTourRequestChat] setMinPrice error', err?.message || err);
      return false;
    }
  }, [withAuth, requestId, apiBase]);

  // Calculate unread count when messages change
  useEffect(() => {
    const count = messages.filter((m) => {
      // Compare user IDs - handle both ObjectId and string formats
      const senderUserId = m.sender?.userId?._id || m.sender?.userId?.toString() || m.sender?.userId;
      const currentUserId = user?._id?.toString() || user?._id;
      const isFromOther = senderUserId !== currentUserId;
      return isFromOther && !m.isRead;
    }).length;
    setUnreadCount(count);
  }, [messages, user]);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (!socket || !requestId) return;

    const emitTyping = (flag) => {
      socket.emit('typing', { requestId, isTyping: flag, userId: user?._id, name: user?.name });
      // update local typing set for immediate UI feedback
      setTypingUsers((prev) => {
        const next = new Set(prev);
        const id = user?._id || 'me';
        if (flag) next.add(id);
        else next.delete(id);
        return next;
      });
    };

    if (isTyping) {
      if (!isTypingSentRef.current) {
        emitTyping(true);
        isTypingSentRef.current = true;
      }

      // reset stop timer
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        emitTyping(false);
        isTypingSentRef.current = false;
        typingTimerRef.current = null;
      }, 1500);
    } else {
      // explicit stop
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      if (isTypingSentRef.current) {
        emitTyping(false);
        isTypingSentRef.current = false;
      }
    }
  }, [socket, requestId, user]);

  return {
    messages,
    requestDetails,
    loading,
    sending,
    connected: !!socket?.connected,
    typingUsers,
    unreadCount,
    sendMessage,
    sendOffer,
    agreeToTerms,
    sendTypingIndicator,
    editMessage,
    deleteMessage,
    sendFileMessage,
    setMinPrice,
    refetchRequest: loadRequest, // Expose loadRequest so components can refetch
    socketError, // Expose socket error state
    reconnectAttempts // Expose reconnect attempts
  };
}

export default useTourRequestChat;
