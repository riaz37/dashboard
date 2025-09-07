'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    sessionId: string;
  };
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          'text-xs',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'flex-1 space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'flex items-center gap-2',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <Badge variant="outline" className="text-xs">
            {formatRelativeTime(message.timestamp)}
          </Badge>
        </div>

        <Card className={cn(
          'max-w-[80%]',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
