'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ChatSessions } from '@/components/chat/chat-sessions';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { useChat } from '@/lib/hooks/use-chat';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuth();
  const {
    currentSession,
    sessions,
    messages,
    isConnected,
    createSession,
    sendMessage,
    switchSession,
    deleteSession,
    loadSessions,
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const result = await createSession();
      if (result.success) {
        toast.success('New chat session created');
      } else {
        toast.error(result.error || 'Failed to create session');
      }
    } catch (error) {
      toast.error('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession) {
      toast.error('Please select a chat session first');
      return;
    }

    try {
      const result = await sendMessage({
        sessionId: currentSession.id,
        message: content,
        userId: user?.id || '',
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await switchSession(sessionId);
    } catch (error) {
      toast.error('Failed to switch session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const result = await deleteSession(sessionId);
      if (result.success) {
        toast.success('Session deleted');
      } else {
        toast.error(result.error || 'Failed to delete session');
      }
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Chat Sessions Sidebar */}
        <div className="lg:col-span-1">
          <ChatSessions
            sessions={sessions}
            currentSessionId={currentSession?.id}
            onSelectSession={handleSelectSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            className="h-full"
          />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Assistant
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Messages */}
              <Card className="flex-1 mb-4 overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div className="h-full overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                        <p className="text-muted-foreground">
                          Ask me anything about your analytics data, trends, or insights.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {messages.map((message) => (
                          <ChatMessage
                            key={message.id}
                            message={message}
                          />
                        ))}
                        {isLoading && (
                          <div className="flex items-center gap-2 p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={!isConnected || isLoading}
                placeholder="Ask me about your analytics..."
              />
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
                <p className="text-muted-foreground mb-4">
                  Choose an existing chat or start a new conversation.
                </p>
                <Button onClick={handleCreateSession} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  Start New Chat
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
