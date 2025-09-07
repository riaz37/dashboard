'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/lib/store';
import { useAnalyticsStore } from '@/lib/store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function useWebSocket(): {
  socket: Socket | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
} {
  const socketRef = useRef<Socket | null>(null);
  const { setConnected } = useChatStore();
  const { addAnalyticsData } = useAnalyticsStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Analytics events
    socketRef.current.on('analytics:data', (data) => {
      console.log('New analytics data:', data);
      addAnalyticsData(data);
    });

    socketRef.current.on('analytics:update', (data) => {
      console.log('Analytics update:', data);
      // Handle real-time analytics updates
    });

    // Chat events
    socketRef.current.on('chat:message', (message) => {
      console.log('New chat message:', message);
      const { addMessage } = useChatStore.getState();
      addMessage(message.sessionId, message);
    });

    socketRef.current.on('chat:typing', (data) => {
      console.log('User typing:', data);
      // Handle typing indicators
    });

    socketRef.current.on('chat:stop-typing', (data) => {
      console.log('User stopped typing:', data);
      // Handle stop typing indicators
    });
  }, [setConnected, addAnalyticsData]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    emit('join-room', { room });
  }, [emit]);

  const leaveRoom = useCallback((room: string) => {
    emit('leave-room', { room });
  }, [emit]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
  };
}
