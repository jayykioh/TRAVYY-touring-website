import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth/context';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const auth = useAuth();

  useEffect(() => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  // Socket.IO server should be the API host root. Some envs set VITE_API_URL to
  // include a path like '/api' (e.g. 'http://localhost:4000/api') which makes
  // socket.io attempt to connect to an invalid namespace (resulting in
  // "Invalid namespace"). Strip any trailing '/api' segment to get the host.
  const socketUrl = API_URL.replace(/\/api\/?$/, '');

    // If there is an existing socket, disconnect it before creating a new one
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {
        console.warn('[SocketProvider] previous socket disconnect failed', err?.message || err);
      }
      socketRef.current = null;
    }

    // Include token in auth handshake if available. Sanitize common invalid string values.
    let token = auth?.accessToken || localStorage.getItem('accessToken') || null;
    if (token === 'null' || token === 'undefined') token = null;

    console.log('[SocketProvider] Connecting to socket:', { 
      API_URL, 
      hasToken: !!token, 
      tokenPreview: token ? token.slice(0, 20) + '...' : 'none',
      authAccessToken: !!auth?.accessToken,
      localStorageToken: !!localStorage.getItem('accessToken')
    });

    const socket = io(socketUrl, {
      withCredentials: true,
      // Use polling first to allow a stable handshake in environments where
      // websocket upgrades can be blocked or proxied. Polling will then
      // upgrade to websocket when possible.
      transports: ['polling', 'websocket'],
      // Ensure we talk to the server's default Socket.IO path
      path: '/socket.io',
      auth: token ? { token } : undefined,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      // Force new connection object to avoid reusing a stale manager
      forceNew: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      console.info('[SocketProvider] ✅ connected successfully');
      setConnected(true);
    };
    const onDisconnect = (reason) => {
      console.info('[SocketProvider] ⚠️ disconnected, reason:', reason);
      setConnected(false);
    };
    const onConnectError = (err) => {
      console.warn('[SocketProvider] ❌ connect error:', err?.message || err?.data?.message || JSON.stringify(err));
    };

    // Additional engine-level error logging for deeper diagnostics
    const onError = (err) => {
      try {
        console.error('[SocketProvider] engine error:', err && (err.message || JSON.stringify(err)));
      } catch {
        console.error('[SocketProvider] engine error (stringify failed)');
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
  socket.io && socket.io.on && socket.io.on('error', onError);
  socket.io && socket.io.on && socket.io.on('reconnect_attempt', (attempt) => console.info('[SocketProvider] reconnect attempt', attempt));

    return () => {
      try {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.io && socket.io.off && socket.io.off('error', onError);
        socket.disconnect();
      } catch (err) {
        console.warn('[SocketProvider] disconnect error', err?.message || err);
      }
    };
  }, [auth?.accessToken]);

  // When the socket is available and the authenticated user is known,
  // automatically join the `user-<id>` room so server emits targeted to
  // the user's personal room (e.g., paymentSuccessful) are received.
  useEffect(() => {
    const s = socketRef.current;
    const userId = auth?.user?._id || auth?.user?.id;
    if (!s || !userId) return;

    // Only attempt to join after connected
    if (s.connected) {
      try {
        s.emit('joinRoom', `user-${userId}`);
        console.info('[SocketProvider] joined user room', `user-${userId}`);
      } catch (err) {
        console.warn('[SocketProvider] failed to join user room', err?.message || err);
      }
    } else {
      // If not connected yet, wait for connect then join once
      const onConnectJoin = () => {
        try {
          s.emit('joinRoom', `user-${userId}`);
          console.info('[SocketProvider] joined user room on connect', `user-${userId}`);
        } catch (err) {
          console.warn('[SocketProvider] failed to join user room on connect', err?.message || err);
        }
      };
      s.on('connect', onConnectJoin);
      return () => s.off('connect', onConnectJoin);
    }
  }, [auth?.user?._id, auth?.user?.id]);

  const emit = useCallback((event, ...args) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit(event, ...args);
  }, []);

  const on = useCallback((event, cb) => {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on(event, cb);
    return () => s.off(event, cb);
  }, []);

  const joinRoom = useCallback((room) => {
    const s = socketRef.current;
    if (!s || !room) return;
    s.emit('joinRoom', room);
  }, []);

  const leaveRoom = useCallback((room) => {
    const s = socketRef.current;
    if (!s || !room) return;
    s.emit('leaveRoom', room);
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    emit,
    on,
    joinRoom,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;
