import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../auth/context';

// Minimal shim hook for tour request chat used by UI components.
// This implementation is intentionally simple: it provides the
// same shape the components expect so the dev server can run.
export function useTourRequestChat(requestId, apiBase = '/api/tour-requests') {
  const [messages, setMessages] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const mountedRef = useRef(true);
  const typingTimerRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const socket = useSocket();
  const { withAuth, user } = useAuth() || {};

  // Helper to fetch request details and initial messages
  const loadRequest = useCallback(async () => {
    if (!requestId || !withAuth) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await withAuth(`${apiBase}/${requestId}`);
      if (!mountedRef.current) return;
      // API returns { success: true, tourRequest } in some guide endpoints
      const details = data?.tourRequest || data?.tourRequest || data || null;
      setRequestDetails(details);
      // messages may be under details.messages or messages property
      const msgs = details?.messages || data?.messages || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
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
  }, [requestId, apiBase, withAuth]);

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

    const room = `chat-${requestId}`;
    // join the room for this request
    socket.joinRoom?.(room);

    const offNew = socket.on?.('newMessage', (doc) => {
      if (!doc) return;
      // Only accept messages for this requestId
      const docRoom = doc?.tourRequestId ? `chat-${doc.tourRequestId}` : null;
      if (docRoom && docRoom !== room) return;
      setMessages((prev) => {
        // ignore duplicate messages (by _id)
        if (prev.some((m) => m._id === doc._id)) return prev;
        return [...prev, doc];
      });
    });

    const offUpdated = socket.on?.('messageUpdated', (doc) => {
      if (!doc) return;
      setMessages((prev) => prev.map((m) => (m._id === doc._id ? doc : m)));
    });

    const offTyping = socket.on?.('typing', (payload) => {
      if (!payload || payload.requestId !== requestId) return;
      const uid = payload.userId || payload.id || 'other';
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (payload.isTyping) next.add(uid);
        else next.delete(uid);
        return next;
      });
    });

    // Re-join room on socket reconnects
    const offConnect = socket.on?.('connect', () => {
      socket.joinRoom?.(room);
    });

    return () => {
      socket.leaveRoom?.(room);
      if (offNew) offNew();
      if (offUpdated) offUpdated();
      if (offTyping) offTyping();
      if (offConnect) offConnect();
    };
  }, [socket, requestId]);

  // Send message via API (server will persist and socket will broadcast)
  const sendMessage = useCallback(async (text) => {
    if (!text || !withAuth || !requestId) return false;
    setSending(true);
    try {
      // Optimistic update: add message immediately so traveller sees it
      const optimistic = {
        _id: `local-${Date.now()}`,
        content: text,
        sender: { role: user?.role || 'traveller', userId: user?.id || user?.sub || 'local', name: user?.name || 'You' },
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, optimistic]);

      // Try to send to server, but don't fail if API returns error
      // Traveller can still chat locally; socket may deliver it when reconnected
      try {
        const res = await withAuth(`${apiBase}/${requestId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });

        // server may return updated messages; if so, replace
        if (res?.messages && Array.isArray(res.messages)) {
          setMessages(res.messages);
        }
      } catch (apiErr) {
        // API failed, but optimistic message is already in state
        // Traveller still sees their message, socket may sync later
        console.warn('[useTourRequestChat] sendMessage API failed (using optimistic)', apiErr?.message);
      }

      // emit typing stop
      socket?.emit && socket.emit('typing', { requestId, isTyping: false, userId: user?.id });

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
  }, [withAuth, requestId, apiBase]);

  const agreeToTerms = useCallback(async (terms = {}) => {
    if (!withAuth || !requestId) return false;
    try {
      const res = await withAuth(`${apiBase}/${requestId}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms }),
      });
      if (res?.tourRequest) setRequestDetails(res.tourRequest);
      return res?.success ?? true;
    } catch (err) {
      console.error('[useTourRequestChat] agreeToTerms error', err?.message || err);
      return false;
    }
  }, [withAuth, requestId, apiBase]);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (!socket || !requestId) return;

    const emitTyping = (flag) => {
      socket.emit('typing', { requestId, isTyping: flag, userId: user?.id || user?.sub, name: user?.name });
      // update local typing set for immediate UI feedback
      setTypingUsers((prev) => {
        const next = new Set(prev);
        const id = user?.id || user?.sub || 'me';
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
    sendMessage,
    sendOffer,
    agreeToTerms,
    sendTypingIndicator,
  };
}

export default useTourRequestChat;
