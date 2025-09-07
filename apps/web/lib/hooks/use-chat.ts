'use client';

import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store';
import { ChatBusinessService } from '../services/chat.service';
import { SendMessageDto } from '@repo/types';

export function useChat() {
  const {
    currentSession,
    sessions,
    messages,
    isConnected,
    setCurrentSession,
    setSessions,
    addMessage,
    setMessages,
    setConnected,
    clearMessages,
  } = useChatStore();

  const loadSessions = useCallback(async () => {
    const result = await ChatBusinessService.loadSessions();
    return result;
  }, []);

  const createSession = useCallback(async () => {
    const result = await ChatBusinessService.createSession();
    return result;
  }, []);

  const sendMessage = useCallback(async (data: SendMessageDto) => {
    const result = await ChatBusinessService.sendMessage(data);
    return result;
  }, []);

  const loadHistory = useCallback(async (sessionId: string, limit?: number) => {
    const result = await ChatBusinessService.loadHistory(sessionId, limit);
    return result;
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    const result = await ChatBusinessService.switchSession(sessionId);
    return result;
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    const result = await ChatBusinessService.deleteSession(sessionId);
    return result;
  }, []);

  const clearSessionMessages = useCallback((sessionId: string) => {
    ChatBusinessService.clearSessionMessages(sessionId);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Get current session messages
  const currentMessages = currentSession ? messages[currentSession.id] || [] : [];

  return {
    currentSession,
    sessions,
    messages: currentMessages,
    isConnected,
    loadSessions,
    createSession,
    sendMessage,
    loadHistory,
    switchSession,
    deleteSession,
    clearSessionMessages,
    setConnected,
    // Utility functions
    formatMessageTime: ChatBusinessService.formatMessageTime,
  };
}
